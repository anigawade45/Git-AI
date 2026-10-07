import CodeChunk from '../models/CodeChunk.js';
import IndexingJob from '../models/IndexingJob.js';
import Repository from '../models/Repository.js';
import RepositoryManifest from '../models/RepositoryManifest.js';
import { codeChunkingService } from './codeChunkingService.js';
import { embeddingService } from './embeddingService.js';
import { githubService } from './githubService.js';

const safeDecode = (value) => {
  if (!value) return '';
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
};

const BATCH_SIZE = 25;

export const vectorService = {
  flattenTree(nodes = []) {
    const files = [];
    const traverse = (items) => {
      for (const item of items) {
        if (item.type === 'file' || (!item.children && !item.type)) {
          files.push(item);
        }
        if (item.children && item.children.length > 0) {
          traverse(item.children);
        }
      }
    };
    traverse(nodes);
    return files;
  },

  /**
   * Start asynchronous background indexing job (returns QUEUED immediately with jobId)
   */
  async indexRepository({ repositoryId, userId }) {
    if (!repositoryId) throw new Error('repositoryId is required for indexing');
    if (!userId) throw new Error('userId is required for tenant-scoped vector indexing');

    const rawRepoId = safeDecode(repositoryId);
    const { owner, repo } = githubService.parseRepoUrl(rawRepoId);

    // 1. Prevent duplicate concurrent indexing workers for the same repository
    const existingActiveJob = await IndexingJob.findOne({
      repositoryId: rawRepoId,
      userId,
      status: { $in: ['QUEUED', 'SYNCING', 'INDEXING'] },
    });

    if (existingActiveJob) {
      return {
        success: true,
        jobId: existingActiveJob.jobId,
        repositoryId: rawRepoId,
        status: existingActiveJob.status,
        message: `An active indexing job (${existingActiveJob.jobId}) is already in progress for this repository`,
      };
    }

    // 2. Fetch or create tenant-scoped repository record
    let repoRecord = await Repository.findOne({ repoId: rawRepoId, userId });

    if (!repoRecord) {
      const meta = await githubService.getRepoMetadata(owner, repo);
      const defaultBranch = meta.defaultBranch || 'main';
      const tree = await githubService.getRepoTree(owner, repo, defaultBranch);
      repoRecord = await Repository.create({
        repoId: rawRepoId,
        name: meta.name,
        owner: meta.owner,
        url: meta.url,
        description: meta.description,
        language: meta.language,
        defaultBranch,
        status: 'QUEUED',
        indexingError: null,
        files: tree || [],
        userId,
      });
    } else {
      repoRecord.status = 'QUEUED';
      repoRecord.indexingError = null;
      await repoRecord.save();
    }

    // 2. Create IndexingJob observability tracking record
    const jobId = `job_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const jobRecord = await IndexingJob.create({
      jobId,
      userId,
      repositoryId: rawRepoId,
      status: 'QUEUED',
      startedAt: new Date(),
      failedStep: null,
      error: null,
    });

    // 3. Launch background indexing worker asynchronously without awaiting
    this.processIndexingJob({ repositoryId: rawRepoId, userId, owner, repo, jobId }).catch((err) => {
      console.error(`[Background Indexing Job Failure] ${rawRepoId}:`, err.message);
    });

    return {
      success: true,
      jobId,
      repositoryId: rawRepoId,
      status: 'QUEUED',
      message: 'Indexing job created and queued successfully',
    };
  },

  /**
   * Internal Background Worker Execution Lifecycle:
   * QUEUED -> SYNCING (Fetch tree/files) -> INDEXING (Chunk & Embed) -> INDEXED / PARTIAL / FAILED
   */
  async processIndexingJob({ repositoryId, userId, owner, repo, jobId }) {
    const rawRepoId = safeDecode(repositoryId);
    const repoRecord = await Repository.findOne({ repoId: rawRepoId, userId });
    const jobRecord = jobId ? await IndexingJob.findOne({ jobId }) : null;

    if (!repoRecord) return;

    let currentStep = 'FETCH_TREE';
    let embeddingsGeneratedCount = 0;
    const failedFilesList = [];

    try {
      // Step 1: SYNCING - Fetch latest commit SHA and tree from GitHub using actual default branch
      currentStep = 'FETCH_TREE';
      repoRecord.status = 'SYNCING';

      const targetBranch = repoRecord.defaultBranch || (await githubService.getDefaultBranch(owner, repo));
      if (!repoRecord.defaultBranch && targetBranch) {
        repoRecord.defaultBranch = targetBranch;
      }

      const latestCommitSha = await githubService.getLatestCommitSha(owner, repo, targetBranch);
      if (latestCommitSha) {
        repoRecord.commitSha = latestCommitSha;
      }
      await repoRecord.save();

      if (jobRecord) {
        jobRecord.status = 'SYNCING';
        jobRecord.failedStep = currentStep;
        if (latestCommitSha) jobRecord.commitSha = latestCommitSha;
        await jobRecord.save();
      }

      const tree = await githubService.getRepoTree(owner, repo, targetBranch);
      if (tree && tree.length > 0) {
        repoRecord.files = tree;
        await repoRecord.save();
      }

      // Step 2: INDEXING - Calculate all indexable files
      currentStep = 'CHUNK_FILE';
      repoRecord.status = 'INDEXING';
      await repoRecord.save();

      const allFiles = this.flattenTree(repoRecord.files);
      const filesToProcess = allFiles.filter((f) => codeChunkingService.shouldIndexFile(f.path || f.name));

      const existingManifests = await RepositoryManifest.find({ repositoryId: rawRepoId, userId }).lean();
      const manifestMap = new Map(existingManifests.map((m) => [m.filePath, m]));

      repoRecord.indexingProgress = {
        processedFiles: 0,
        totalFiles: filesToProcess.length,
        totalChunks: 0,
        processedChunks: 0,
      };
      await repoRecord.save();

      if (jobRecord) {
        jobRecord.status = 'INDEXING';
        jobRecord.totalFiles = filesToProcess.length;
        jobRecord.failedStep = currentStep;
        await jobRecord.save();
      }

      let totalChunksCount = 0;
      let processedFilesCount = 0;
      let skippedFilesCount = 0;

      // Process all indexable files in dynamic batches of BATCH_SIZE (25)
      for (let i = 0; i < filesToProcess.length; i += BATCH_SIZE) {
        const batch = filesToProcess.slice(i, i + BATCH_SIZE);

        for (const file of batch) {
          const filePath = file.path || file.name;
          const fileSha = file.sha || file.hash || null;
          const cachedManifest = manifestMap.get(filePath);

          const activeModel = repoRecord.activeEmbeddingModel || null;
          const activeDimension = repoRecord.embeddingDimension || 768;

          // 1. FAST MANIFEST CHECK (Verifies fileSha, status, model, and dimension)
          if (
            fileSha &&
            cachedManifest &&
            cachedManifest.fileSha === fileSha &&
            cachedManifest.status === 'INDEXED' &&
            (!activeModel || cachedManifest.embeddingModel === activeModel) &&
            (!activeDimension || cachedManifest.embeddingDimension === activeDimension)
          ) {
            totalChunksCount += cachedManifest.chunkCount || 0;
            processedFilesCount++;

            repoRecord.indexingProgress = {
              processedFiles: processedFilesCount,
              totalFiles: filesToProcess.length,
              totalChunks: totalChunksCount,
              processedChunks: totalChunksCount,
            };
            await repoRecord.save();
            continue;
          }

          // 2. MODIFIED / NEW FILE: Fetch source content if not attached
          currentStep = 'FETCH_CONTENT';
          let content = file.content;
          if (!content) {
            try {
              const raw = await githubService.getRawFileContent(owner, repo, filePath, repoRecord.defaultBranch || null);
              content = raw.content;
            } catch (err) {
              console.warn(`[Vector Indexing Warning] Could not fetch content for ${filePath}: ${err.message}`);
              skippedFilesCount++;
              failedFilesList.push({
                filePath,
                reason: 'Could not fetch raw file content from GitHub',
                error: err.message,
              });
              // Prevent stale chunk retrieval: remove old chunks and manifest for the failed file
              await CodeChunk.deleteMany({ repositoryId: rawRepoId, filePath, userId });
              await RepositoryManifest.deleteOne({ repositoryId: rawRepoId, filePath, userId });
              continue;
            }
          }

          if (!content) {
            skippedFilesCount++;
            failedFilesList.push({
              filePath,
              reason: 'Empty content',
              error: '0 bytes content returned',
            });
            // Prevent stale chunk retrieval: remove old chunks and manifest for empty/unreadable file
            await CodeChunk.deleteMany({ repositoryId: rawRepoId, filePath, userId });
            await RepositoryManifest.deleteOne({ repositoryId: rawRepoId, filePath, userId });
            continue;
          }

          // Chunk source file
          currentStep = 'CHUNK_FILE';
          const chunks = codeChunkingService.chunkFile({
            repositoryId: rawRepoId,
            filePath,
            content,
            language: file.language,
          });

          if (chunks.length === 0) {
            processedFilesCount++;
            continue;
          }

          const currentCommitSha = latestCommitSha || repoRecord.commitSha || null;
          chunks.forEach((c) => {
            if (fileSha) c.fileSha = fileSha;
            if (currentCommitSha) c.commitSha = currentCommitSha;
          });

          const existingChunks = await CodeChunk.find({ repositoryId: rawRepoId, filePath, userId });
          const existingMap = new Map(existingChunks.map((c) => [c.contentHash, c]));

          const newChunks = [];
          const chunksToEmbed = [];

          for (const chunk of chunks) {
            const cached = existingMap.get(chunk.contentHash);
            const modelMatches = !activeModel || cached?.embeddingModel === activeModel;
            const dimMatches = !activeDimension || (cached?.embedding?.length === activeDimension && cached?.embeddingDimension === activeDimension);

            if (cached && cached.embedding?.length > 0 && modelMatches && dimMatches) {
              newChunks.push({
                ...chunk,
                userId,
                commitSha: currentCommitSha,
                embedding: cached.embedding,
                embeddingModel: cached.embeddingModel || activeModel,
                embeddingDimension: cached.embeddingDimension || activeDimension,
              });
            } else {
              chunksToEmbed.push({
                ...chunk,
                commitSha: currentCommitSha,
              });
            }
          }

          // Generate embeddings with strict model & dimension binding to guarantee repository-wide consistency
          currentStep = 'GENERATE_EMBEDDING';
          if (chunksToEmbed.length > 0 && process.env.GEMINI_API_KEY) {
            try {
              const activeModel = repoRecord.activeEmbeddingModel || null;
              const activeDimension = repoRecord.embeddingDimension || 768;

              const embedOptions = {
                model: activeModel || embeddingService.getActiveEmbeddingModel(),
                expectedDimension: activeDimension,
                strictModel: Boolean(activeModel),
                allowFallback: !activeModel,
              };

              const vectors = await embeddingService.generateEmbeddings(chunksToEmbed, embedOptions);
              embeddingsGeneratedCount += vectors.filter((v) => v && v.length > 0).length;

              // Bind operational active embedding model and dimension to repository record on first index run
              if (!repoRecord.activeEmbeddingModel && vectors.model) {
                repoRecord.activeEmbeddingModel = vectors.model;
                repoRecord.embeddingDimension = vectors.dimension || 768;
                await repoRecord.save();
              }

              chunksToEmbed.forEach((c, idx) => {
                newChunks.push({
                  ...c,
                  userId,
                  commitSha: currentCommitSha,
                  embedding: vectors[idx] || [],
                  embeddingModel: vectors.model || repoRecord.activeEmbeddingModel,
                  embeddingDimension: vectors.dimension || repoRecord.embeddingDimension || 768,
                });
              });
            } catch (embedErr) {
              console.warn(`[Embedding Warning] Could not generate embeddings for ${filePath}: ${embedErr.message}`);

              if (embedErr.name === 'EmbeddingQuotaError') {
                throw embedErr;
              }

              skippedFilesCount++;
              failedFilesList.push({
                filePath,
                reason: 'Embedding generation failed',
                error: embedErr.message,
              });

              // Remove stale data so this file cannot appear indexed
              await CodeChunk.deleteMany({ repositoryId: rawRepoId, filePath, userId });
              await RepositoryManifest.deleteOne({ repositoryId: rawRepoId, filePath, userId });
              continue;
            }
          } else if (chunksToEmbed.length > 0) {
            console.warn(`[Embedding Warning] GEMINI_API_KEY missing. Skipping embedding generation for ${filePath}`);
            skippedFilesCount++;
            failedFilesList.push({
              filePath,
              reason: 'Missing GEMINI_API_KEY',
              error: 'GEMINI_API_KEY environment variable is not configured',
            });
            await CodeChunk.deleteMany({ repositoryId: rawRepoId, filePath, userId });
            await RepositoryManifest.deleteOne({ repositoryId: rawRepoId, filePath, userId });
            continue;
          }

          // Hard validation: verify all chunks have valid embeddings matching target dimension
          const targetDimension = repoRecord.embeddingDimension || 768;
          const hasInvalidEmbeddings = newChunks.some(
            (chunk) =>
              !Array.isArray(chunk.embedding) ||
              chunk.embedding.length !== targetDimension
          );

          if (hasInvalidEmbeddings) {
            throw new Error(
              `Embedding validation failed for ${filePath}: one or more chunks have invalid or missing embeddings`
            );
          }

          // Write DB
          currentStep = 'WRITE_DB';
          await CodeChunk.deleteMany({ repositoryId: rawRepoId, filePath, userId });
          if (newChunks.length > 0) {
            await CodeChunk.insertMany(newChunks, { ordered: false });
          }

          // Upsert explicit file manifest record with embedding model and dimension tracking
          await RepositoryManifest.findOneAndUpdate(
            { repositoryId: rawRepoId, userId, filePath },
            {
              repositoryId: rawRepoId,
              userId,
              filePath,
              fileSha: fileSha || null,
              commitSha: currentCommitSha,
              language: file.language || codeChunkingService.detectLanguage(filePath),
              status: 'INDEXED',
              chunkCount: newChunks.length,
              contentHash: codeChunkingService.hashContent(content),
              embeddingModel: repoRecord.activeEmbeddingModel || null,
              embeddingDimension: repoRecord.embeddingDimension || 768,
              indexedAt: new Date(),
            },
            { upsert: true, new: true }
          );

          totalChunksCount += newChunks.length;
          processedFilesCount++;

          repoRecord.indexingProgress = {
            processedFiles: processedFilesCount,
            totalFiles: filesToProcess.length,
            totalChunks: totalChunksCount,
            processedChunks: totalChunksCount,
          };
          await repoRecord.save();

          if (jobRecord) {
            jobRecord.processedFiles = processedFilesCount;
            jobRecord.totalChunks = totalChunksCount;
            jobRecord.processedChunks = totalChunksCount;
            jobRecord.embeddingsGenerated = embeddingsGeneratedCount;
            jobRecord.failedFiles = failedFilesList;
            await jobRecord.save();
          }
        }
      }

      // Step 3: Clean up stale chunks
      const allIndexablePaths = new Set(filesToProcess.map((f) => f.path || f.name));
      const existingFilePaths = await CodeChunk.distinct('filePath', { repositoryId: rawRepoId, userId });
      const stalePaths = existingFilePaths.filter((p) => !allIndexablePaths.has(p));
      if (stalePaths.length > 0) {
        await CodeChunk.deleteMany({ repositoryId: rawRepoId, userId, filePath: { $in: stalePaths } });
        await RepositoryManifest.deleteMany({ repositoryId: rawRepoId, userId, filePath: { $in: stalePaths } });
      }

      const symbolCount = await CodeChunk.countDocuments({
        repositoryId: rawRepoId,
        userId,
        symbolName: { $exists: true, $ne: null },
      });

      // Step 4: Finalize
      const finalStatus =
        skippedFilesCount > 0 && processedFilesCount > 0
          ? 'PARTIAL'
          : processedFilesCount > 0
            ? 'INDEXED'
            : 'FAILED';

      const errorMsg =
        skippedFilesCount > 0
          ? `Indexed ${processedFilesCount} / ${filesToProcess.length} files (${skippedFilesCount} skipped due to API/network errors).`
          : null;

      repoRecord.status = finalStatus;
      repoRecord.indexingError = errorMsg;
      repoRecord.stats = {
        files: processedFilesCount,
        chunks: totalChunksCount,
        functions: symbolCount,
        commits: repoRecord.stats?.commits || 0,
        lastUpdated: 'Just now',
      };
      await repoRecord.save();

      if (jobRecord) {
        jobRecord.status = finalStatus;
        jobRecord.completedAt = new Date();
        jobRecord.processedFiles = processedFilesCount;
        jobRecord.totalFiles = filesToProcess.length;
        jobRecord.processedChunks = totalChunksCount;
        jobRecord.totalChunks = totalChunksCount;
        jobRecord.embeddingsGenerated = embeddingsGeneratedCount;
        jobRecord.failedFiles = failedFilesList;
        jobRecord.error = errorMsg;
        jobRecord.failedStep = null;
        await jobRecord.save();
      }
    } catch (err) {
      repoRecord.status = 'FAILED';
      repoRecord.indexingError = err.message || 'Unknown indexing error';
      await repoRecord.save();

      if (jobRecord) {
        jobRecord.status = 'FAILED';
        jobRecord.completedAt = new Date();
        jobRecord.failedStep = currentStep;
        jobRecord.error = err.message || 'Unknown indexing error';
        jobRecord.failedFiles = failedFilesList;
        await jobRecord.save();
      }

      throw err;
    }
  },

  /**
   * Get indexing status & latest job diagnostic metrics for a repository (tenant-scoped)
   */
  async getIndexingStatus(repositoryId, userId) {
    const rawRepoId = safeDecode(repositoryId);
    if (!userId) {
      return {
        success: false,
        repositoryId: rawRepoId,
        status: 'NOT_INDEXED',
        progress: {
          totalFiles: 0,
          processedFiles: 0,
          totalChunks: 0,
          processedChunks: 0,
        },
        totalChunks: 0,
        totalFiles: 0,
        processedFiles: 0,
      };
    }

    const repoRecord = await Repository.findOne({ repoId: rawRepoId, userId });
    const jobRecord = await IndexingJob.findOne({ repositoryId: rawRepoId, userId }).sort({ createdAt: -1 });
    const chunkCount = await CodeChunk.countDocuments({ repositoryId: rawRepoId, userId });
    const allFiles = repoRecord?.files ? this.flattenTree(repoRecord.files) : [];
    const totalFiles = repoRecord?.indexingProgress?.totalFiles || jobRecord?.totalFiles || allFiles.length;
    const processedFiles = repoRecord?.indexingProgress?.processedFiles || jobRecord?.processedFiles || repoRecord?.stats?.files || (repoRecord?.status === 'INDEXED' ? totalFiles : 0);

    return {
      success: true,
      repositoryId: rawRepoId,
      status: repoRecord?.status || (chunkCount > 0 ? 'INDEXED' : 'NOT_INDEXED'),
      error: repoRecord?.indexingError || jobRecord?.error || null,
      job: jobRecord
        ? {
          jobId: jobRecord.jobId,
          status: jobRecord.status,
          startedAt: jobRecord.startedAt,
          completedAt: jobRecord.completedAt,
          durationMs: jobRecord.completedAt && jobRecord.startedAt
            ? new Date(jobRecord.completedAt) - new Date(jobRecord.startedAt)
            : null,
          totalFiles: jobRecord.totalFiles,
          processedFiles: jobRecord.processedFiles,
          totalChunks: jobRecord.totalChunks,
          processedChunks: jobRecord.processedChunks,
          embeddingsGenerated: jobRecord.embeddingsGenerated,
          failedFiles: jobRecord.failedFiles,
          failedStep: jobRecord.failedStep,
          error: jobRecord.error,
          retryCount: jobRecord.retryCount,
        }
        : null,
      progress: {
        totalFiles,
        processedFiles,
        totalChunks: repoRecord?.stats?.chunks || chunkCount,
        processedChunks: repoRecord?.indexingProgress?.processedChunks || chunkCount,
      },
      totalChunks: repoRecord?.stats?.chunks || chunkCount,
      totalFiles,
      processedFiles,
      lastAnalyzed: repoRecord?.updatedAt || 'Just now',
    };
  },
};
