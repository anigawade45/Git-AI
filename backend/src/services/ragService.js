import CodeChunk from '../models/CodeChunk.js';
import Repository from '../models/Repository.js';
import RepositoryManifest from '../models/RepositoryManifest.js';
import { codeChunkingService } from './codeChunkingService.js';
import { retrievalService } from './retrievalService.js';
import { vectorService } from './vectorService.js';

const MAX_CONTEXT_CHARS = 12000; // ~3000 tokens

const safeDecode = (value) => {
  if (!value) return '';
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
};

export const ragService = {
  /**
   * Strict Source Citation Verification Engine
   * Validates every citation against MongoDB database & repository tree before returning to UI:
   * 1. Belongs to authenticated user (userId match)
   * 2. Belongs to target repository (repositoryId match)
   * 3. File path exists in repository manifest / tree (exact match -> unique basename -> unique suffix match; rejects ambiguity)
   * 4. Line range overlaps actual indexed chunk boundaries in MongoDB
   */
  async validateSourcesAgainstRepo({ repositoryId, userId, sources = [] }) {
    if (!repositoryId || !userId || !Array.isArray(sources) || sources.length === 0) {
      return [];
    }

    const rawRepoId = safeDecode(repositoryId);

    // 1. Fetch active repository file manifests & distinct chunk paths to verify file existence
    const manifests = await RepositoryManifest.find({ repositoryId: rawRepoId, userId }).lean();
    const manifestPathSet = new Set(manifests.map((m) => m.filePath));

    const indexedChunkPaths = await CodeChunk.distinct('filePath', { repositoryId: rawRepoId, userId });
    const validPathSet = new Set([...manifestPathSet, ...indexedChunkPaths]);

    // 2. Pre-resolve matched paths for candidate sources (rejecting ambiguous matches)
    const candidateResolutions = [];
    const resolvedPathsSet = new Set();

    for (const src of sources) {
      if (!src || !src.filePath) continue;

      const cleanPath = String(src.filePath).trim();
      let matchedPath = null;

      if (validPathSet.has(cleanPath)) {
        matchedPath = cleanPath;
      } else {
        const cleanBasename = cleanPath.split('/').pop().toLowerCase();
        const basenameMatches = Array.from(validPathSet).filter(
          (p) => p.split('/').pop().toLowerCase() === cleanBasename
        );

        if (basenameMatches.length === 1) {
          matchedPath = basenameMatches[0];
        } else if (basenameMatches.length === 0) {
          const suffixMatches = Array.from(validPathSet).filter(
            (p) => p.endsWith(cleanPath) || cleanPath.endsWith(p)
          );
          if (suffixMatches.length === 1) {
            matchedPath = suffixMatches[0];
          }
        }
      }

      if (!matchedPath) {
        console.warn(`[Source Validation Warning] Discarding invalid or ambiguous file citation: '${cleanPath}' for repo '${rawRepoId}'`);
        continue;
      }

      candidateResolutions.push({ src, matchedPath });
      resolvedPathsSet.add(matchedPath);
    }

    if (candidateResolutions.length === 0) {
      return [];
    }

    // 3. Performance Optimization: Batch query chunk boundaries for all matched files in a single DB call
    const chunkBounds = await CodeChunk.find({
      repositoryId: rawRepoId,
      userId,
      filePath: { $in: Array.from(resolvedPathsSet) },
    })
      .select('filePath startLine endLine')
      .lean();

    const chunksByFile = new Map();
    chunkBounds.forEach((c) => {
      if (!chunksByFile.has(c.filePath)) {
        chunksByFile.set(c.filePath, []);
      }
      chunksByFile.get(c.filePath).push(c);
    });

    const verifiedSources = [];

    // 4. Validate full line-range coverage for each candidate source
    for (const { src, matchedPath } of candidateResolutions) {
      const fileChunks = chunksByFile.get(matchedPath) || [];

      // Requirement A: Discard if zero indexed chunks exist for this file
      if (fileChunks.length === 0) {
        console.warn(
          `[Source Validation Warning] Discarding citation for file '${matchedPath}': No indexed chunks found in MongoDB for repo '${rawRepoId}'`
        );
        continue;
      }

      const start = Number(src.startLine);
      const end = Number(src.endLine);
      let validStartLine = null;
      let validEndLine = null;

      if (Number.isInteger(start) && start > 0) {
        validStartLine = start;
        validEndLine = Number.isInteger(end) && end >= start ? end : start;

        // Requirement B: Verify full line-range coverage across indexed chunks
        const sortedChunks = fileChunks
          .filter((c) => Number.isInteger(c.startLine) && Number.isInteger(c.endLine))
          .sort((a, b) => a.startLine - b.startLine);

        let coveredUntil = validStartLine;

        for (const chunk of sortedChunks) {
          if (chunk.endLine < coveredUntil) continue;
          if (chunk.startLine > coveredUntil) break; // Gap in line coverage!

          coveredUntil = Math.max(coveredUntil, chunk.endLine + 1);
          if (coveredUntil > validEndLine) break; // Entire range covered!
        }

        const isFullyCovered = coveredUntil > validEndLine;

        if (!isFullyCovered) {
          console.warn(
            `[Source Validation Warning] Discarding citation for file '${matchedPath}': Line range (${validStartLine}-${validEndLine}) is not fully covered by indexed chunks in repo '${rawRepoId}'`
          );
          continue; // DISCARD out-of-bounds or uncovered line range!
        }
      }

      const detectedLang =
        src.language && src.language !== 'plaintext'
          ? src.language
          : codeChunkingService.detectLanguage(matchedPath);

      verifiedSources.push({
        ...src,
        filePath: matchedPath,
        fileName: src.fileName || matchedPath.split('/').pop(),
        startLine: validStartLine,
        endLine: validEndLine,
        language: detectedLang,
        isValidated: true,
      });
    }

    return verifiedSources;
  },

  /**
   * Deduplicate chunks by unique chunk ID or line range key
   */
  deduplicateChunks(chunks = []) {
    const seen = new Set();
    const unique = [];

    for (const chunk of chunks) {
      const key = chunk.id || `${chunk.filePath}:${chunk.startLine}-${chunk.endLine}`;
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(chunk);
      }
    }
    return unique;
  },

  /**
   * Group retrieved chunks by file and merge adjacent or overlapping line ranges
   * Preserves retrieval metadata (vectorScore, keywordScore, finalScore, retrievalMethod)
   */
  groupAndMergeChunks(chunks = []) {
    // 1. Group by filePath
    const fileGroups = new Map();
    for (const chunk of chunks) {
      const path = chunk.filePath;
      if (!fileGroups.has(path)) {
        fileGroups.set(path, []);
      }
      fileGroups.get(path).push(chunk);
    }

    const mergedBlocks = [];

    // 2. Process each file group
    fileGroups.forEach((fileChunks, filePath) => {
      // Sort chunks by startLine ascending
      fileChunks.sort((a, b) => (a.startLine || 0) - (b.startLine || 0));

      const mergedList = [];
      let current = null;

      for (const chunk of fileChunks) {
        if (!current) {
          current = {
            id: chunk.id,
            fileName: chunk.fileName,
            filePath: chunk.filePath,
            language: chunk.language && chunk.language !== 'plaintext' ? chunk.language : codeChunkingService.detectLanguage(chunk.filePath),
            startLine: chunk.startLine,
            endLine: chunk.endLine,
            symbolNames: chunk.symbolName ? [chunk.symbolName] : [],
            symbolType: chunk.symbolType,
            commitSha: chunk.commitSha || null,
            score: chunk.score || 0,
            vectorScore: chunk.vectorScore || 0,
            keywordScore: chunk.keywordScore || 0,
            retrievalMethod: chunk.retrievalMethod || 'hybrid',
            lines: (chunk.content || '').split('\n'),
          };
          continue;
        }

        // Merge adjacent or overlapping chunks (if chunk.startLine <= current.endLine + 2)
        if (chunk.startLine <= current.endLine + 2) {
          const overlapCount = Math.max(0, current.endLine - chunk.startLine + 1);
          const newLines = (chunk.content || '').split('\n');
          const nonOverlappingNewLines = newLines.slice(overlapCount);

          current.lines.push(...nonOverlappingNewLines);
          current.endLine = Math.max(current.endLine, chunk.endLine);
          current.score = Math.min(1.0, Math.max(current.score, chunk.score || 0) * 1.1); // Continuity bonus (clamped to 1.0)
          current.vectorScore = Math.max(current.vectorScore, chunk.vectorScore || 0);
          current.keywordScore = Math.max(current.keywordScore, chunk.keywordScore || 0);

          if (current.vectorScore > 0 && current.keywordScore > 0) current.retrievalMethod = 'hybrid';
          else if (current.vectorScore > 0) current.retrievalMethod = 'vector';
          else if (current.keywordScore > 0) current.retrievalMethod = 'keyword';

          if (chunk.symbolName && !current.symbolNames.includes(chunk.symbolName)) {
            current.symbolNames.push(chunk.symbolName);
          }
        } else {
          current.content = current.lines.join('\n');
          mergedList.push(current);

          current = {
            id: chunk.id,
            fileName: chunk.fileName,
            filePath: chunk.filePath,
            language: chunk.language && chunk.language !== 'plaintext' ? chunk.language : codeChunkingService.detectLanguage(chunk.filePath),
            startLine: chunk.startLine,
            endLine: chunk.endLine,
            symbolNames: chunk.symbolName ? [chunk.symbolName] : [],
            symbolType: chunk.symbolType,
            commitSha: chunk.commitSha || null,
            score: Math.min(1.0, chunk.score || 0),
            vectorScore: chunk.vectorScore || 0,
            keywordScore: chunk.keywordScore || 0,
            retrievalMethod: chunk.retrievalMethod || 'hybrid',
            lines: (chunk.content || '').split('\n'),
          };
        }
      }

      if (current) {
        current.content = current.lines.join('\n');
        mergedList.push(current);
      }

      mergedBlocks.push(...mergedList);
    });

    return mergedBlocks;
  },

  /**
   * Authoritative Repository Manifest & Structure Metadata Builder:
   * Used for repository tree/file count/structure queries instead of RAG candidate chunks.
   * Returns exact physical file path count, unique filenames count, and directory breakdown directly from DB.
   */
  async buildManifestContext({ repositoryId, userId, query }) {
    const rawRepoId = safeDecode(repositoryId);

    // 1. Fetch Repository record from DB for stored stats
    const repoRecord = await Repository.findOne({ repoId: rawRepoId, userId }).lean();

    // 2. Fetch distinct physical file paths indexed in RepositoryManifest & CodeChunk
    const manifests = await RepositoryManifest.find({ repositoryId: rawRepoId, userId }).lean();
    const manifestPaths = manifests.map((m) => m.filePath);
    const chunkPaths = await CodeChunk.distinct('filePath', { repositoryId: rawRepoId, userId });

    const allPathsSet = new Set([...manifestPaths, ...chunkPaths]);
    const allPaths = Array.from(allPathsSet).filter(Boolean).sort();

    const totalPhysicalPaths = allPaths.length > 0 ? allPaths.length : (repoRecord?.stats?.files || 0);

    // Group paths by fileName
    const filesByName = new Map();
    for (const path of allPaths) {
      const fileName = path.split('/').pop();
      if (!filesByName.has(fileName)) {
        filesByName.set(fileName, []);
      }
      filesByName.get(fileName).push(path);
    }

    const uniqueFilenamesCount = filesByName.size;
    const duplicateFilenameGroups = [];

    filesByName.forEach((paths, fileName) => {
      if (paths.length > 1) {
        duplicateFilenameGroups.push({ fileName, paths });
      }
    });

    // Folder breakdown
    const folders = new Map();
    for (const path of allPaths) {
      const parts = path.split('/');
      const folder = parts.length > 1 ? parts.slice(0, -1).join('/') : '(root)';
      folders.set(folder, (folders.get(folder) || 0) + 1);
    }

    let contextText = `AUTHORITATIVE REPOSITORY MANIFEST METADATA (Source of Truth):
Repository ID: ${rawRepoId}
Total Physical File Paths: ${totalPhysicalPaths}
Unique Filenames: ${uniqueFilenamesCount}
Directories Count: ${folders.size}
`;

    if (duplicateFilenameGroups.length > 0) {
      contextText += `\nFiles with Duplicate Filenames Across Directories (${duplicateFilenameGroups.length} unique filenames appearing in multiple physical locations):\n`;
      duplicateFilenameGroups.forEach((group) => {
        contextText += `📄 ${group.fileName} (${group.paths.length} locations):\n`;
        group.paths.forEach((p) => {
          contextText += `   └─ ${p}\n`;
        });
      });
    }

    contextText += `\nDirectory Breakdown:\n`;
    folders.forEach((count, dir) => {
      contextText += `- ${dir}/ (${count} files)\n`;
    });

    contextText += `\nFull Authoritative File Path List (${allPaths.length} physical paths):\n`;
    allPaths.forEach((p) => {
      contextText += `- ${p}\n`;
    });

    const sources = allPaths.map((p, idx) => ({
      rank: idx + 1,
      fileName: p.split('/').pop(),
      filePath: p,
      startLine: null,
      endLine: null,
      language: codeChunkingService.detectLanguage(p),
      symbols: [],
      retrievalMethod: 'manifest',
      vectorScore: 1.0,
      keywordScore: 1.0,
      finalScore: 1.0,
      score: 1.0,
    }));

    return {
      hasContext: true,
      contextText,
      sources,
      status: repoRecord?.status || 'INDEXED',
      retrievedCount: allPaths.length,
      isManifestQuery: true,
    };
  },

  /**
   * Structured RAG Context Construction Pipeline:
   * Retrieved chunks -> Deduplicate -> Group by file -> Merge adjacent -> Rank -> Context Budget -> LLM
   */
  async buildRagContext({ repositoryId, userId, query, filters = {}, topK = 16, maxChars = MAX_CONTEXT_CHARS }) {
    if (!repositoryId || !userId || !query) {
      return {
        hasContext: false,
        contextText: '',
        sources: [],
        status: 'INVALID_REQUEST',
      };
    }

    const rawRepoId = safeDecode(repositoryId);

    // 0. Check query intent: If user asks about repository structure, file counts, or manifest, return authoritative metadata
    const intentInfo = retrievalService.classifyQueryIntent(query);
    if (intentInfo.intent === 'REPO_STRUCTURE' || intentInfo.isManifestQuery) {
      return await this.buildManifestContext({ repositoryId: rawRepoId, userId, query });
    }

    const safeTopK = Math.min(Math.max(Number(topK) || 16, 1), 50);
    const safeMaxChars = Math.min(
      Math.max(Number(maxChars) || MAX_CONTEXT_CHARS, 1000),
      30000
    );

    // 1. Check tenant-scoped indexing status
    const statusResult = await vectorService.getIndexingStatus(rawRepoId, userId);
    if (statusResult.status !== 'INDEXED' && statusResult.status !== 'PARTIAL') {
      return {
        hasContext: false,
        contextText: '',
        sources: [],
        status: statusResult.status,
        message: 'Repository indexing is not complete. Please wait until indexing finishes before using AI codebase search.',
      };
    }

    // 2. Retrieve candidate chunks pool using safeTopK
    const rawChunks = await retrievalService.searchCodebase({
      repositoryId: rawRepoId,
      userId,
      query,
      filters,
      topK: safeTopK,
    });

    if (!rawChunks || rawChunks.length === 0) {
      return {
        hasContext: false,
        contextText: '',
        sources: [],
        status: 'NO_RELEVANT_CONTEXT',
        message: `No relevant code chunks found in repository '${rawRepoId}' matching query: "${query}"`,
      };
    }

    // 3. Deduplicate
    const uniqueChunks = this.deduplicateChunks(rawChunks);

    // 4. Group by File & Merge Adjacent/Overlapping Chunks
    const mergedBlocks = this.groupAndMergeChunks(uniqueChunks);

    // 5. Rank Merged Blocks by Score Descending
    mergedBlocks.sort((a, b) => b.score - a.score);

    // 6. Enforce Context Budget & Format Citations Metadata
    let accumulatedChars = 0;
    const contextBlocks = [];
    const sources = [];

    mergedBlocks.forEach((block, idx) => {
      if (accumulatedChars >= safeMaxChars) return;

      const symbolsText = block.symbolNames && block.symbolNames.length > 0
        ? block.symbolNames.join(', ')
        : 'N/A';

      const commitInfo = block.commitSha ? ` | Commit: ${block.commitSha.substring(0, 7)}` : '';
      const blockHeader = `[Source ${idx + 1}: ${block.filePath} (Lines ${block.startLine}-${block.endLine}${commitInfo})]`;
      const blockBody = `Language: ${block.language || 'plaintext'}\nSymbols: ${symbolsText}\nCode:\n\`\`\`${block.language || ''}\n${block.content}\n\`\`\``;

      const fullBlock = `${blockHeader}\n${blockBody}`;
      if (accumulatedChars + fullBlock.length <= safeMaxChars) {
        contextBlocks.push(fullBlock);
        accumulatedChars += fullBlock.length;

        const clampedScore = Math.min(1.0, Math.max(0, block.score || 0));

        sources.push({
          rank: idx + 1,
          fileName: block.fileName,
          filePath: block.filePath,
          startLine: block.startLine,
          endLine: block.endLine,
          language: block.language,
          commitSha: block.commitSha || null,
          symbols: block.symbolNames,
          retrievalMethod: block.retrievalMethod || 'hybrid',
          vectorScore: parseFloat((Math.min(1.0, block.vectorScore || 0)).toFixed(4)),
          keywordScore: parseFloat((Math.min(1.0, block.keywordScore || 0)).toFixed(4)),
          finalScore: parseFloat(clampedScore.toFixed(4)),
          score: parseFloat(clampedScore.toFixed(4)),
        });
      }
    });

    const contextText = contextBlocks.join('\n\n---\n\n');

    return {
      hasContext: true,
      contextText,
      sources,
      status: statusResult.status || 'INDEXED',
      retrievedCount: sources.length,
    };
  },
};
