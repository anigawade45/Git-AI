import CodeChunk from '../models/CodeChunk.js';
import Repository from '../models/Repository.js';
import { codeChunkingService } from './codeChunkingService.js';
import { embeddingService } from './embeddingService.js';

const safeDecode = (value) => {
  if (!value) return '';
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
};

const QUERY_STOP_WORDS = new Set([
  'a', 'an', 'the', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
  'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'shall', 'should',
  'can', 'could', 'may', 'might', 'must', 'ought', 'i', 'you', 'he', 'she',
  'it', 'we', 'they', 'them', 'their', 'this', 'that', 'these', 'those',
  'my', 'your', 'his', 'her', 'its', 'our', 'in', 'on', 'at', 'to', 'for',
  'from', 'of', 'with', 'by', 'about', 'against', 'between', 'into', 'through',
  'during', 'before', 'after', 'above', 'below', 'up', 'down', 'out', 'off',
  'over', 'under', 'again', 'further', 'then', 'once', 'here', 'there', 'when',
  'where', 'why', 'how', 'all', 'any', 'both', 'each', 'few', 'more', 'most',
  'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so',
  'than', 'too', 'very', 's', 't', 'just', 'don', 'now',
  'repo', 'repository', 'project', 'codebase', 'code', 'file', 'files',
  'implementation', 'implementations', 'implement', 'implemented',
  'contain', 'contains', 'containing', 'find', 'search', 'locate', 'show',
  'get', 'where', 'which', 'what', 'exist', 'exists', 'present',
  'solution', 'solutions', 'answer', 'answers', 'method', 'methods',
  'function', 'functions', 'class', 'classes', 'struct', 'structs',
  'type', 'interface', 'result', 'results', 'output', 'input',
  'example', 'examples', 'demo', 'test', 'tests'
]);

const METHOD_QUALIFIER_KEYWORDS = new Set([
  'brute', 'force', 'hashmap', 'hash', 'map', 'dictionary', 'hashset',
  'recursive', 'recursion', 'iterative', 'iteration', 'loop', 'nested',
  'dp', 'dynamic', 'memoization', 'tabulation',
  'dfs', 'bfs', 'backtracking', 'trie', 'prefix',
  'binary', 'tree', 'heap', 'priority', 'stack', 'queue',
  'pointer', 'two-pointer', 'sliding', 'window', 'greedy',
  'inplace', 'sorting', 'binarysearch'
]);

const METHOD_QUALIFIER_PHRASES = [
  'brute force',
  'brute-force',
  'hash map',
  'hash-map',
  'hashmap',
  'hash set',
  'hashset',
  'binary search',
  'two pointer',
  'two pointers',
  'sliding window',
  'dynamic programming',
  'memoization',
  'tabulation',
  'dfs',
  'bfs',
  'depth first',
  'breadth first',
  'backtracking',
  'trie',
  'prefix tree',
  'priority queue',
  'min heap',
  'max heap',
  'linked list',
  'merge sort',
  'quick sort'
];

export const retrievalService = {
  classifyQueryIntent(query = '') {
    const lower = query.toLowerCase().trim();

    // 0. Authoritative Repository Structure / Manifest / File Count Queries
    if (
      /\b(how many files|file count|total files|number of files|count of files)\b/i.test(lower) ||
      /\b(what files|list files|list all files|show all files|all files in|files in this repo|files in this repository|what files are in)\b/i.test(lower) ||
      /\b(what folders|folder structure|directory structure|directory tree|file tree|repository tree)\b/i.test(lower)
    ) {
      return {
        intent: 'REPO_STRUCTURE',
        isManifestQuery: true,
        wVector: 0,
        wKeyword: 1.0,
        targetTopK: 100,
      };
    }

    // 1. Repository Existence / Capability Lookup
    if (
      /\b(does|do|has|have|can)\b.*\b(repository|repo|project|codebase|app|we|it)\b.*\b(contain|have|include|support|find)\b/i.test(lower) ||
      /\b(is there|are there|does there)\b.*\b(any|a|an)?\s*\b(implementation|code|class|function|method|struct|interface|file)\b/i.test(lower) ||
      /\b(do we have|does it have)\b/i.test(lower)
    ) {
      return {
        intent: 'EXISTENCE',
        wVector: 0.35,
        wKeyword: 0.65,
        targetTopK: 6,
      };
    }

    // 2. File Location & Exact Symbol Lookup
    if (
      /^(where|find|locate|search|which file|what line|show me the code)\b/i.test(lower) ||
      /\b(where is|where are|file location|file path|symbol name|defined|implementation of)\b/i.test(lower)
    ) {
      return {
        intent: 'FILE_LOCATION',
        wVector: 0.25,
        wKeyword: 0.75,
        targetTopK: 6,
        symbolMatchMultiplier: 1.6,
      };
    }

    // 2. Architecture & Data Flow Overview
    if (
      /^(architecture|structure|system design|overview|flow|data flow)\b/i.test(lower) ||
      /\b(how is the project structured|architecture overview|module relationships|component structure)\b/i.test(lower)
    ) {
      return {
        intent: 'ARCHITECTURE',
        wVector: 0.8,
        wKeyword: 0.2,
        targetTopK: 16,
        fileDiversityBoost: true,
      };
    }

    // 3. System Explanation & Concept Walkthrough
    if (
      /^(explain|how does|how do|describe|understand|walkthrough|tell me about)\b/i.test(lower) ||
      /\b(how it works|explanation|how does authentication work|concept)\b/i.test(lower)
    ) {
      return {
        intent: 'EXPLANATION',
        wVector: 0.7,
        wKeyword: 0.3,
        targetTopK: 12,
        fileDiversityBoost: true,
      };
    }

    // 4. Debugging & Error Troubleshooting
    if (
      /\b(error|bug|fix|crash|exception|issue|failed|failing|why is|why does|broken|invalid|401|403|404|500|nullpointer|undefined)\b/i.test(lower)
    ) {
      return {
        intent: 'DEBUGGING',
        wVector: 0.5,
        wKeyword: 0.5,
        targetTopK: 10,
        errorBlockBoost: true,
      };
    }

    // 5. Default General Repository Query
    return {
      intent: 'GENERAL_REPOSITORY',
      wVector: 0.5,
      wKeyword: 0.5,
      targetTopK: 8,
    };
  },

  /**
   * Build MongoDB filter object supporting repository-aware metadata constraints:
   * - language (e.g. 'javascript', 'typescript', 'python')
   * - filePath / folder / pathPrefix (e.g. 'controllers', 'auth/', 'backend/src/services')
   * - symbolType (e.g. 'function', 'class', 'method', 'interface')
   * - symbolName (e.g. 'authenticateUser', 'createToken')
   */
  buildMongoFilter({ repositoryId, userId, filters = {} }) {
    const queryFilter = {
      repositoryId,
      userId,
    };

    if (filters.language) {
      const langStr = String(filters.language).trim();
      queryFilter.language = new RegExp(`^${langStr.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'i');
    }

    if (filters.filePath || filters.folder || filters.pathPrefix) {
      const pathStr = String(filters.filePath || filters.folder || filters.pathPrefix).trim();
      queryFilter.filePath = new RegExp(pathStr.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    }

    if (filters.symbolType) {
      const typeStr = String(filters.symbolType).trim();
      queryFilter.symbolType = new RegExp(`^${typeStr.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'i');
    }

    if (filters.symbolName) {
      const nameStr = String(filters.symbolName).trim();
      queryFilter.symbolName = new RegExp(nameStr.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    }

    return queryFilter;
  },

  /**
   * Extract filter hints from user natural language query if explicit filters are absent
   */
  extractQueryFilterHints(query = '') {
    const hints = {};
    const lower = query.toLowerCase();

    // 1. Language hints
    if (/\b(js|javascript)\b/i.test(lower)) hints.language = 'javascript';
    else if (/\b(ts|typescript)\b/i.test(lower)) hints.language = 'typescript';
    else if (/\b(py|python)\b/i.test(lower)) hints.language = 'python';
    else if (/\b(go|golang)\b/i.test(lower)) hints.language = 'go';

    // 2. Symbol Type hints (distinct function vs method vs class vs interface)
    if (/\b(methods?)\b/i.test(lower)) hints.symbolType = 'method';
    else if (/\b(functions?)\b/i.test(lower)) hints.symbolType = 'function';
    else if (/\b(classes|class)\b/i.test(lower)) hints.symbolType = 'class';
    else if (/\b(interfaces?)\b/i.test(lower)) hints.symbolType = 'interface';

    // 3. Directory / Layer hints
    if (/\b(controllers?)\b/i.test(lower)) hints.filePath = 'controller';
    else if (/\b(services?)\b/i.test(lower)) hints.filePath = 'service';
    else if (/\b(routes?|router)\b/i.test(lower)) hints.filePath = 'route';
    else if (/\b(models?|schemas?)\b/i.test(lower)) hints.filePath = 'model';
    else if (/\b(auth|authentication)\b/i.test(lower)) hints.filePath = 'auth';

    return hints;
  },

  /**
   * Calculate Cosine Similarity between vector embeddings
   */
  calculateCosineSimilarity(vectorA, vectorB) {
    if (!vectorA || !vectorB || vectorA.length === 0 || vectorA.length !== vectorB.length) {
      return 0;
    }

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < vectorA.length; i++) {
      const a = vectorA[i];
      const b = vectorB[i];
      dotProduct += a * b;
      normA += a * a;
      normB += b * b;
    }

    if (normA === 0 || normB === 0) return 0;
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  },

  /**
   * Execute Vector Search Branch:
   * 1. Attempts DB-side $vectorSearch pipeline stage if MongoDB Vector Search index is available.
   * 2. Fallbacks to projected in-memory cosine similarity calculation on standard MongoDB setups.
   */
  async executeVectorSearch({ mongoQuery, queryVector, targetTopK, fallbackChunks = [] }) {
    if (!queryVector || queryVector.length === 0) return [];

    // 1. Attempt MongoDB Atlas $vectorSearch Aggregation Pipeline Stage if enabled
    if (process.env.USE_MONGO_VECTOR_SEARCH === 'true' || process.env.ATLAS_VECTOR_SEARCH === 'true') {
      try {
        const numCandidates = Math.max(100, targetTopK * 10);
        const limit = Math.max(20, targetTopK * 3);

        const vectorPipeline = [
          {
            $vectorSearch: {
              index: 'vector_index',
              path: 'embedding',
              queryVector,
              numCandidates,
              limit,
              filter: mongoQuery,
            },
          },
          {
            $project: {
              filePath: 1,
              fileName: 1,
              language: 1,
              chunkIndex: 1,
              content: 1,
              startLine: 1,
              endLine: 1,
              symbolName: 1,
              symbolType: 1,
              commitSha: 1,
              vectorScore: { $meta: 'vectorSearchScore' },
            },
          },
        ];

        const atlasResults = await CodeChunk.aggregate(vectorPipeline);
        if (atlasResults && atlasResults.length > 0) {
          return atlasResults.map((chunk) => ({
            id: chunk._id.toString(),
            filePath: chunk.filePath,
            fileName: chunk.fileName,
            language: chunk.language,
            chunkIndex: chunk.chunkIndex,
            content: chunk.content,
            startLine: chunk.startLine,
            endLine: chunk.endLine,
            symbolName: chunk.symbolName,
            symbolType: chunk.symbolType,
            commitSha: chunk.commitSha || null,
            vectorScore: parseFloat((chunk.vectorScore || 0).toFixed(4)),
          }));
        }
      } catch (atlasErr) {
        console.warn(`[MongoDB Atlas VectorSearch Failover] ${atlasErr.message}. Falling back to standard query vector scoring.`);
      }
    }

    // 2. Fallback: Memory-protected cosine calculation on candidate pool
    return fallbackChunks
      .map((chunk) => ({
        id: chunk._id.toString(),
        filePath: chunk.filePath,
        fileName: chunk.fileName,
        language: chunk.language,
        chunkIndex: chunk.chunkIndex,
        content: chunk.content,
        startLine: chunk.startLine,
        endLine: chunk.endLine,
        symbolName: chunk.symbolName,
        symbolType: chunk.symbolType,
        commitSha: chunk.commitSha || null,
        vectorScore: chunk.embedding && chunk.embedding.length > 0
          ? this.calculateCosineSimilarity(queryVector, chunk.embedding)
          : 0,
      }))
      .filter((item) => item.vectorScore > 0)
      .sort((a, b) => b.vectorScore - a.vectorScore);
  },

  extractCodeKeywords(query = '') {
    if (!query || typeof query !== 'string') return [];
    const tokens = query.trim().split(/[\s,.:;()'"=`{}#/\\]+/).filter((t) => t.length > 1);
    const filtered = tokens.filter((t) => !QUERY_STOP_WORDS.has(t.toLowerCase()));
    return filtered.length > 0 ? filtered : tokens.filter((t) => t.length > 2);
  },

  /**
   * Keyword Search (Exact Code Identifier Matcher + AST Symbol Rank)
   * Excels at exact code identifiers (e.g. authenticateUser, JWT_SECRET, UserController, createToken)
   */
  calculateKeywordScore(query, chunk) {
    const rawTokens = this.extractCodeKeywords(query);
    if (rawTokens.length === 0) return 0;

    const filePathLower = (chunk.filePath || '').toLowerCase();
    const symbolName = chunk.symbolName || '';
    const symbolNameLower = symbolName.toLowerCase();
    const content = chunk.content || '';
    const contentLower = content.toLowerCase();

    let score = 0;
    let matchedTokenCount = 0;

    rawTokens.forEach((token) => {
      const tokenLower = token.toLowerCase();
      let matched = false;

      // 1. Exact AST Symbol Name Match (highest priority weight)
      if (symbolName === token) {
        score += 12.0;
        matched = true;
      } else if (symbolNameLower === tokenLower) {
        score += 8.0;
        matched = true;
      } else if (symbolNameLower.includes(tokenLower)) {
        score += 4.0;
        matched = true;
      }

      // 2. Exact Identifier Code Match in Content (case-sensitive exact word boundary match)
      const exactCodeRegex = new RegExp(`\\b${token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`);
      if (exactCodeRegex.test(content)) {
        score += 5.0;
        matched = true;
      } else if (contentLower.includes(tokenLower)) {
        score += 2.0;
        matched = true;
      }

      // 3. File Path match
      if (filePathLower.includes(tokenLower)) {
        score += 3.5;
        matched = true;
      }

      if (matched) matchedTokenCount++;
    });

    if (score <= 0 || matchedTokenCount === 0) return 0;

    // Coverage Multiplier: Weight score by the fraction of query keywords present in this chunk
    const coverageRatio = matchedTokenCount / rawTokens.length;
    const finalScore = score * coverageRatio;

    // Normalize keyword score between 0.0 and 1.0 using logistic activation curve (0 if no keyword matched)
    return 1 / (1 + Math.exp(-finalScore / 6.0));
  },

  fuseRanks(vectorRanked = [], keywordRanked = [], k = 60, wVector = 0.5, wKeyword = 0.5) {
    const scoreMap = new Map();
    const chunkMap = new Map();
    const vectorScoreMap = new Map(vectorRanked.map((item) => [item.id, item.vectorScore]));
    const keywordScoreMap = new Map(keywordRanked.map((item) => [item.id, item.keywordScore]));

    vectorRanked.forEach((item, index) => {
      const id = item.id;
      chunkMap.set(id, item);
      const rrf = wVector / (k + (index + 1));
      scoreMap.set(id, (scoreMap.get(id) || 0) + rrf);
    });

    keywordRanked.forEach((item, index) => {
      const id = item.id;
      if (!chunkMap.has(id)) chunkMap.set(id, item);
      const rrf = wKeyword / (k + (index + 1));
      scoreMap.set(id, (scoreMap.get(id) || 0) + rrf);
    });

    const fused = [];
    scoreMap.forEach((fusionScore, id) => {
      const chunk = chunkMap.get(id);
      const vScore = vectorScoreMap.get(id) || 0;
      const kScore = keywordScoreMap.get(id) || 0;

      let method = 'hybrid';
      if (vScore > 0 && kScore === 0) method = 'vector';
      else if (kScore > 0 && vScore === 0) method = 'keyword';

      fused.push({
        ...chunk,
        vectorScore: parseFloat(vScore.toFixed(4)),
        keywordScore: parseFloat(kScore.toFixed(4)),
        fusionScore: parseFloat(fusionScore.toFixed(6)),
        retrievalMethod: method,
      });
    });

    return fused.sort((a, b) => b.fusionScore - a.fusionScore);
  },

  /**
   * Code-Aware Context Re-ranker with Intent-Based Adjustments
   */
  rerankChunks(query, candidates, topK = 8, intentConfig = {}) {
    const rawTokens = this.extractCodeKeywords(query);

    const reranked = candidates.map((chunk) => {
      let score = chunk.fusionScore || 0;

      // 1. Exact Identifier Match Boost (e.g. authenticateUser, JWT_SECRET, UserController)
      if (rawTokens.length > 0) {
        let exactMatches = 0;
        rawTokens.forEach((token) => {
          const exactRegex = new RegExp(`\\b${token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`);
          if (exactRegex.test(chunk.content || '') || chunk.symbolName === token) {
            exactMatches++;
          }
        });
        if (exactMatches > 0) {
          score *= (1 + exactMatches * 0.4);
        }
      }

      // 2. Symbol Type Boost
      if (chunk.symbolType) {
        const type = chunk.symbolType.toLowerCase();
        if (type === 'class' || type === 'interface') score *= 1.30;
        else if (type === 'function' || type === 'method') score *= 1.25;
      }

      // 3. Intent-Specific Custom Boosts
      if (intentConfig.symbolMatchMultiplier && (chunk.symbolName || chunk.symbolType)) {
        score *= intentConfig.symbolMatchMultiplier;
      }

      if (intentConfig.fileDiversityBoost) {
        const isFirstInFile = candidates.findIndex((c) => c.filePath === chunk.filePath) === candidates.indexOf(chunk);
        if (isFirstInFile) score *= 1.25;
      }

      // 4. Penalize test files unless explicitly requested
      const filePathLower = (chunk.filePath || '').toLowerCase();
      const isTestQuery = query.toLowerCase().includes('test') || query.toLowerCase().includes('spec');
      if (!isTestQuery && (filePathLower.includes('.test.') || filePathLower.includes('.spec.') || filePathLower.includes('__tests__'))) {
        score *= 0.6;
      }

      const finalScore = parseFloat(score.toFixed(4));

      return {
        ...chunk,
        score: finalScore,
        finalScore: finalScore,
        intent: intentConfig.intent || 'GENERAL_REPOSITORY',
      };
    });

    return reranked
      .sort((a, b) => b.score - a.score)
      .slice(0, topK);
  },

  /**
   * Hybrid Code Search Entrypoint with Query Intent Classification & Metadata Filters
   */
  async searchCodebase({ repositoryId, userId, query, filters = {}, topK = null }) {
    if (!repositoryId || !userId || !query) return [];

    const rawRepoId = safeDecode(repositoryId);

    // Step 0: Classify User Query Intent
    const intentConfig = this.classifyQueryIntent(query);
    const targetTopK = topK || intentConfig.targetTopK || 8;

    // Check if user provided explicit filters vs query filter hints
    const hasExplicitFilters = Boolean(
      filters &&
      Object.keys(filters).some((key) => {
        const val = filters[key];
        return val !== undefined && val !== null && String(val).trim() !== '';
      })
    );

    const combinedFilters = {
      ...this.extractQueryFilterHints(query),
      ...filters,
    };

    const mongoQuery = this.buildMongoFilter({ repositoryId: rawRepoId, userId, filters: combinedFilters });

    // Performance & Scalability Protection: Select required fields & limit candidate fetch to 1,000 chunks
    const CANDIDATE_CHUNK_LIMIT = 1000;
    let chunks = await CodeChunk.find(mongoQuery)
      .select('filePath fileName language chunkIndex content startLine endLine symbolName symbolType commitSha embedding')
      .limit(CANDIDATE_CHUNK_LIMIT)
      .lean();

    // Fallback ONLY IF zero results occurred without explicit user filters (preserving explicit filter semantics!)
    if (chunks.length === 0 && !hasExplicitFilters && Object.keys(combinedFilters).length > 0) {
      const fallbackQuery = { repositoryId: rawRepoId, userId };
      chunks = await CodeChunk.find(fallbackQuery)
        .select('filePath fileName language chunkIndex content startLine endLine symbolName symbolType commitSha embedding')
        .limit(CANDIDATE_CHUNK_LIMIT)
        .lean();
    }

    if (chunks.length === 0) return [];

    // Step 1: Query Vector Generation for Semantic Similarity using Repository Active Embedding Model
    let queryVector = null;
    if (embeddingService.hasEmbeddingProvider()) {
      try {
        const repoRecord = await Repository.findOne({ repoId: rawRepoId, userId })
          .select('activeEmbeddingModel embeddingDimension')
          .lean();

        const queryEmbedOptions = {
          model: repoRecord?.activeEmbeddingModel || embeddingService.getActiveEmbeddingModel(),
          expectedDimension: repoRecord?.embeddingDimension || 768,
        };

        queryVector = await embeddingService.generateQueryEmbedding(query, queryEmbedOptions);
      } catch (err) {
        console.warn(`[Hybrid Retrieval Warning] Query embedding failed: ${err.message}. Relying on keyword search.`);
      }
    }

    // Step 2A: Vector Search Branch ($vectorSearch Aggregation or Cosine Similarity Fallback)
    const vectorResults = await this.executeVectorSearch({
      mongoQuery,
      queryVector,
      targetTopK,
      fallbackChunks: chunks,
    });

    // Step 2B: Keyword Search Branch (BM25 / Code Identifier Match)
    const keywordResults = chunks
      .map((chunk) => ({
        id: chunk._id.toString(),
        filePath: chunk.filePath,
        fileName: chunk.fileName,
        language: chunk.language,
        chunkIndex: chunk.chunkIndex,
        content: chunk.content,
        startLine: chunk.startLine,
        endLine: chunk.endLine,
        symbolName: chunk.symbolName,
        symbolType: chunk.symbolType,
        commitSha: chunk.commitSha || null,
        keywordScore: this.calculateKeywordScore(query, chunk),
      }))
      .filter((item) => item.keywordScore > 0)
      .sort((a, b) => b.keywordScore - a.keywordScore);

    // Step 3: Intent-Aware RRF Score Fusion
    const candidatePoolSize = Math.max(20, Math.round(targetTopK * 2.5));
    const fusedCandidates = this.fuseRanks(
      vectorResults,
      keywordResults,
      60,
      intentConfig.wVector,
      intentConfig.wKeyword
    ).slice(0, candidatePoolSize);

    const candidatesToRerank = fusedCandidates.length > 0
      ? fusedCandidates
      : (vectorResults.length > 0 ? vectorResults : keywordResults).slice(0, candidatePoolSize);

    // Step 4: Intent-Aware Code Re-ranking
    const primaryTopChunks = this.rerankChunks(query, candidatesToRerank, targetTopK, intentConfig);

    // Step 5: Validate Primary Relevance Gate BEFORE Dependency Expansion
    const relevantPrimaryChunks = primaryTopChunks.filter((chunk) => this.isChunkRelevant(chunk, query, intentConfig));

    if (relevantPrimaryChunks.length === 0) {
      return [];
    }

    // Step 6: Code Relationship Graph Expansion (ONLY from validated relevant primary chunks)
    const expandedDependencies = await this.expandDependencyGraph({
      repositoryId: rawRepoId,
      userId,
      primaryChunks: relevantPrimaryChunks,
      maxExpanded: 4,
    });

    // Step 7: Combine validated primary chunks with validated dependency graph expansion
    const combined = [...relevantPrimaryChunks, ...expandedDependencies];
    let finalRelevantChunks = combined.filter((chunk) => this.isChunkRelevant(chunk, query, intentConfig));

    // Relative Score Cutoff: Filter out weak tail candidates whose score is < 50% of the top match
    if (finalRelevantChunks.length > 1) {
      const topScore = finalRelevantChunks[0].score || finalRelevantChunks[0].finalScore || 0;
      if (topScore > 0) {
        finalRelevantChunks = finalRelevantChunks.filter(
          (c) => (c.score || c.finalScore || 0) >= topScore * 0.50
        );
      }
    }

    // Step 8A: Primary Subject Target Filter
    // Extract subject tokens by excluding standalone algorithm qualifier terms.
    // Preserves problem subject terms (e.g., 'Two' in 'Two Sum').
    const rawTokens = this.extractCodeKeywords(query);
    const standaloneQualifierTerms = new Set([
      'brute', 'force', 'hashmap', 'hash', 'map', 'set', 'hashset', 'binarysearch',
      'sliding', 'window', 'dfs', 'bfs', 'backtrack', 'backtracking', 'dp',
      'memo', 'memoization', 'tabulation', 'heap', 'priorityqueue', 'stack', 'queue'
    ]);

    const subjectTokens = rawTokens.filter((t) => !standaloneQualifierTerms.has(t.toLowerCase()));

    if (subjectTokens.length > 0 && finalRelevantChunks.length > 1) {
      const scoredSubjectChunks = finalRelevantChunks.map((chunk) => {
        const text = `${chunk.filePath || ''} ${chunk.fileName || ''} ${chunk.symbolName || ''} ${chunk.content || ''}`.toLowerCase();
        let matchCount = 0;

        subjectTokens.forEach((st) => {
          const regex = new RegExp(`\\b${st.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
          if (regex.test(text)) {
            matchCount++;
          }
        });

        return { chunk, matchCount };
      });

      const maxMatches = Math.max(...scoredSubjectChunks.map((item) => item.matchCount));
      if (maxMatches > 0) {
        const topSubjectChunks = scoredSubjectChunks
          .filter((item) => item.matchCount === maxMatches)
          .map((item) => item.chunk);

        if (topSubjectChunks.length > 0) {
          finalRelevantChunks = topSubjectChunks;
        }
      }
    }

    // Step 8B: DSA-Aware Confidence Layer (Activates ONLY when query explicitly requests a DSA algorithm/technique)
    const detectedQualifiers = this.detectQueryQualifiers(query);
    if (detectedQualifiers.length > 0 && finalRelevantChunks.length > 1) {
      for (const qualifier of detectedQualifiers) {
        const scoredChunks = finalRelevantChunks
          .map((chunk) => ({
            chunk,
            dsaConfidence: this.calculateDSAConfidence(chunk, qualifier),
          }))
          .filter((item) => item.dsaConfidence >= 0.45)
          .sort((a, b) => b.dsaConfidence - a.dsaConfidence);

        if (scoredChunks.length > 0) {
          finalRelevantChunks = scoredChunks.map((item) => item.chunk);
          break;
        }
      }
    }

    return finalRelevantChunks;
  },

  /**
   * Parse user query to detect array of normalized qualifier types
   */
  detectQueryQualifiers(query = '') {
    if (!query || typeof query !== 'string') return [];
    const lower = query.toLowerCase();
    const qualifiers = new Set();

    if (/\b(brute\s*force|brute-force|brute|naive|nested\s*loop|quadratic|o\(n\^2\)|o\(n2\))\b/i.test(lower)) {
      qualifiers.add('BRUTE_FORCE');
    }
    if (/\b(hash\s*map|hash-map|hashmap|dictionary|dict)\b/i.test(lower)) {
      qualifiers.add('HASHMAP');
    }
    if (/\b(hash\s*set|hash-set|hashset)\b/i.test(lower)) {
      qualifiers.add('HASHSET');
    }
    if (/\b(binary\s*search|binary-search|logarithmic\s*search|o\(log\s*n\))\b/i.test(lower)) {
      qualifiers.add('BINARY_SEARCH');
    }
    if (/\b(two\s*pointers?|two-pointers?|two\s*pointer|two-pointer|two-index)\b/i.test(lower)) {
      qualifiers.add('TWO_POINTER');
    }
    if (/\b(sliding\s*window|sliding-window|window\s*size|subarray\s*window)\b/i.test(lower)) {
      qualifiers.add('SLIDING_WINDOW');
    }
    if (/\b(dfs|depth\s*first|depth-first)\b/i.test(lower)) {
      qualifiers.add('DFS');
    }
    if (/\b(bfs|breadth\s*first|breadth-first)\b/i.test(lower)) {
      qualifiers.add('BFS');
    }
    if (/\b(backtrack|backtracking|back-tracking)\b/i.test(lower)) {
      qualifiers.add('BACKTRACKING');
    }
    if (/\b(dynamic\s*programming|memoization|tabulation|dp)\b/i.test(lower)) {
      qualifiers.add('DP');
    }
    if (/\b(priority\s*queue|priorityqueue|min\s*heap|max\s*heap|heap)\b/i.test(lower)) {
      qualifiers.add('HEAP');
    }
    if (/\b(stack)\b/i.test(lower)) {
      qualifiers.add('STACK');
    }
    if (/\b(queue)\b/i.test(lower)) {
      qualifiers.add('QUEUE');
    }

    return Array.from(qualifiers);
  },

  /**
   * Evaluates DSA algorithm confidence score (0.0 to 1.0) based on code structure & behavior
   */
  calculateDSAConfidence(chunk, qualifier) {
    if (!chunk || !qualifier) return 0;

    const text = `${chunk.filePath || ''} ${chunk.fileName || ''} ${chunk.symbolName || ''} ${chunk.content || ''}`.toLowerCase();
    const content = chunk.content || '';

    switch (qualifier) {
      case 'BRUTE_FORCE':
        return this.scoreBruteForce(content, text);
      case 'HASHMAP':
        return this.scoreHashMap(content, text);
      case 'HASHSET':
        return this.scoreHashSet(content, text);
      case 'BINARY_SEARCH':
        return this.scoreBinarySearch(content, text);
      case 'TWO_POINTER':
        return this.scoreTwoPointer(content, text);
      case 'SLIDING_WINDOW':
        return this.scoreSlidingWindow(content, text);
      case 'DFS':
        return this.scoreDFS(content, text);
      case 'BFS':
        return this.scoreBFS(content, text);
      case 'BACKTRACKING':
        return this.scoreBacktracking(content, text);
      case 'DP':
        return this.scoreDP(content, text);
      case 'HEAP':
        return this.scoreHeap(content, text);
      case 'STACK':
        return this.scoreStack(content, text);
      case 'QUEUE':
        return this.scoreQueue(content, text);
      default:
        return 0;
    }
  },

  scoreBruteForce(content, text) {
    let confidence = 0;

    const hasNestedLoops = /(?:for|while)\s*\([^)]*\)[\s\S]*?(?:for|while)\s*\(/i.test(content);
    if (hasNestedLoops) confidence += 0.45;

    const hasPairIndexAccess = /\[\s*[a-zA-Z0-9_$]+\s*\][\s\S]*?\[\s*[a-zA-Z0-9_$]+\s*\]/i.test(content) &&
      /\b(i|j|k|m|n)\b/i.test(content);
    if (hasPairIndexAccess) confidence += 0.35;

    const hasOptimizedStructure = /\b(hashmap|hashset|map|set|hashtable|dictionary|priorityqueue|heap|dp|memo)\b/i.test(text);
    if (!hasOptimizedStructure) confidence += 0.20;
    else confidence -= 0.30;

    if (/\b(brute|naive)\b/i.test(text)) confidence += 0.20;

    return Math.max(0, Math.min(1.0, confidence));
  },

  scoreHashMap(content, text) {
    let confidence = 0;

    if (/\b(hashmap|hash_map|dictionary|dict)\b/i.test(text)) confidence += 0.30;
    if (/\b(HashMap|Map|Map\.of|new Map|dict\[)\b/i.test(content) || /\bMap\s*</i.test(content)) confidence += 0.40;
    if (/\b(\.put\(|\.get\(|\.containsKey\(|\.has\()\b/i.test(content)) confidence += 0.30;

    return Math.max(0, Math.min(1.0, confidence));
  },

  scoreHashSet(content, text) {
    let confidence = 0;

    if (/\b(hashset|hash_set)\b/i.test(text)) confidence += 0.30;
    if (/\b(HashSet|Set|new Set)\b/i.test(content) || /\bSet\s*</i.test(content)) confidence += 0.40;
    if (/\b(\.add\(|\.contains\(|\.has\()\b/i.test(content)) confidence += 0.30;

    return Math.max(0, Math.min(1.0, confidence));
  },

  scoreBinarySearch(content, text) {
    let confidence = 0;

    if (/\b(binarysearch|binary_search|binary\s*search)\b/i.test(text)) confidence += 0.30;

    const hasMidCalc = /\bmid\s*=|\b(left\s*\+|\slow\s*\+)/i.test(content);
    if (hasMidCalc) confidence += 0.45;

    const hasRangeShrink = /\b(mid\s*\+|\smid\s*-)/i.test(content);
    if (hasRangeShrink) confidence += 0.35;

    if (/\b(left\s*<=\s*right|low\s*<=\s*high)\b/i.test(content)) confidence += 0.20;

    return Math.max(0, Math.min(1.0, confidence));
  },

  scoreTwoPointer(content, text) {
    let confidence = 0;

    if (/\b(twopointer|two_pointer|two\s*pointer)\b/i.test(text)) confidence += 0.30;

    const hasTwoPointers = /\b(left|l)\b[\s\S]*?\b(right|r)\b/i.test(content) ||
      /\b(i|low)\b[\s\S]*?\b(j|high)\b/i.test(content);
    if (hasTwoPointers) confidence += 0.30;

    const hasPointerMoves = /\b(left\+\+|right--|l\+\+|r--)\b/i.test(content);
    if (hasPointerMoves) confidence += 0.45;

    if (/\b(left\s*<\s*right|l\s*<\s*r|low\s*<\s*high)\b/i.test(content)) confidence += 0.25;

    return Math.max(0, Math.min(1.0, confidence));
  },

  scoreSlidingWindow(content, text) {
    let confidence = 0;

    if (/\b(slidingwindow|sliding_window|sliding\s*window)\b/i.test(text)) confidence += 0.30;

    const hasWindowCalc = /\b(right\s*-\s*left|r\s*-\s*l|end\s*-\s*start)\b/i.test(content);
    if (hasWindowCalc) confidence += 0.45;

    const hasWindowVar = /\b(windowSum|minLen|maxLen|maxLength)\b/i.test(content);
    if (hasWindowVar) confidence += 0.35;

    const hasWindowLoop = /\bwhile\s*\([^)]*\)[\s\S]*?\b(left\+\+|l\+\+|start\+\+)/i.test(content);
    if (hasWindowLoop) confidence += 0.30;

    return Math.max(0, Math.min(1.0, confidence));
  },

  scoreDFS(content, text) {
    let confidence = 0;

    if (/\b(dfs|depthfirst|depth_first)\b/i.test(text)) confidence += 0.30;

    const hasDFSName = /\b(dfs|depthFirst)\b/i.test(content);
    if (hasDFSName) confidence += 0.45;

    const hasChildRecursion = /\b(left|right|children|neighbors|adj)\b/i.test(content) && /\b(return|self|this)\b/i.test(content);
    if (hasChildRecursion) confidence += 0.35;

    return Math.max(0, Math.min(1.0, confidence));
  },

  scoreBFS(content, text) {
    let confidence = 0;

    if (/\b(bfs|breadthfirst|breadth_first)\b/i.test(text)) confidence += 0.30;

    const hasQueue = /\b(Queue|LinkedList|ArrayDeque|deque)\b/i.test(content);
    if (hasQueue) confidence += 0.35;

    const hasQueueOps = /\b(poll|shift|popleft|enqueue|dequeue)\b/i.test(content);
    if (hasQueueOps) confidence += 0.45;

    const hasLevelLoop = /\bfor\s*\([^)]*size[^)]*\)/i.test(content);
    if (hasLevelLoop) confidence += 0.20;

    return Math.max(0, Math.min(1.0, confidence));
  },

  scoreBacktracking(content, text) {
    let confidence = 0;

    if (/\b(backtrack|backtracking)\b/i.test(text)) confidence += 0.30;

    const hasChooseRecurseUndo = /\b(add|push)\b[\s\S]*?\b(remove|pop)\b/i.test(content) &&
      /\b(backtrack|helper|solve)\b/i.test(content);
    if (hasChooseRecurseUndo) confidence += 0.70;

    return Math.max(0, Math.min(1.0, confidence));
  },

  scoreDP(content, text) {
    let confidence = 0;

    if (/\b(dp|memo|memoization|tabulation|dynamic_programming)\b/i.test(text)) confidence += 0.30;

    const hasDPTable = /\b(dp|memo)\[/i.test(content) || /\bnew\s+int\[[^\]]+\]\[[^\]]+\]/i.test(content);
    if (hasDPTable) confidence += 0.45;

    const hasStateTransition = /\bMath\.(max|min)\s*\(/i.test(content) && /\b(dp|memo)\[/i.test(content);
    if (hasStateTransition) confidence += 0.45;

    return Math.max(0, Math.min(1.0, confidence));
  },

  scoreHeap(content, text) {
    let confidence = 0;

    if (/\b(heap|priorityqueue|priority_queue)\b/i.test(text)) confidence += 0.30;

    const hasHeapType = /\b(PriorityQueue|minHeap|maxHeap|heapq)\b/i.test(content);
    if (hasHeapType) confidence += 0.45;

    const hasHeapOps = /\b(poll|peek|offer|heappush|heappop)\b/i.test(content);
    if (hasHeapOps) confidence += 0.45;

    return Math.max(0, Math.min(1.0, confidence));
  },

  scoreStack(content, text) {
    let confidence = 0;

    if (/\bstack\b/i.test(text)) confidence += 0.30;

    const hasStackType = /\b(Stack|ArrayDeque|Deque)\b/i.test(content);
    const hasLIFOOps = /\b(push\(|pop\()\b/i.test(content);
    if (hasStackType && hasLIFOOps) confidence += 0.70;

    return Math.max(0, Math.min(1.0, confidence));
  },

  scoreQueue(content, text) {
    let confidence = 0;

    if (/\bqueue\b/i.test(text)) confidence += 0.30;

    const hasQueueType = /\b(Queue|ArrayDeque|LinkedList)\b/i.test(content);
    const hasFIFOOps = /\b(offer\(|poll\(|enqueue\(|dequeue\()\b/i.test(content);
    if (hasQueueType && hasFIFOOps) confidence += 0.70;

    return Math.max(0, Math.min(1.0, confidence));
  },

  isChunkRelevant(chunk, query = '', intentConfig = {}) {
    if (!chunk) return false;

    if (chunk.isDependencyContext && (chunk.score || chunk.finalScore) >= 0.40) {
      return true;
    }

    const vScore = Number(chunk.vectorScore) || 0;
    const kScore = Number(chunk.keywordScore) || 0;
    const fScore = Number(chunk.finalScore || chunk.score) || 0;

    if (intentConfig.intent === 'EXISTENCE') {
      if (kScore >= 0.55) return true;
      if (vScore >= 0.60 && kScore >= 0.40) return true;
      return false;
    }

    if (intentConfig.intent === 'FILE_LOCATION') {
      if (kScore >= 0.40 && vScore >= 0.44) return true;
      return false;
    }

    if (kScore >= 0.55) return true;

    if (vScore >= 0.52) return true;

    if (vScore >= 0.44 && kScore >= 0.35) return true;

    if (fScore >= 0.035 && (vScore >= 0.44 || kScore >= 0.35)) return true;

    return false;
  },

  async expandDependencyGraph({ repositoryId, userId, primaryChunks = [], maxExpanded = 4 }) {
    if (!primaryChunks || primaryChunks.length === 0) return [];

    const rawRepoId = safeDecode(repositoryId);
    const existingIds = new Set(primaryChunks.map((c) => c.id || c._id.toString()));
    const existingPaths = new Set(primaryChunks.map((c) => c.filePath));

    const targetImports = new Set();
    const targetSymbols = new Set();

    primaryChunks.forEach((chunk) => {
      const importsList = chunk.imports || [];
      const exportsList = chunk.exports || [];

      importsList.forEach((imp) => {
        const baseName = imp.split('/').pop().replace(/\.[^.]+$/, '');
        if (baseName && baseName.length > 2) targetImports.add(baseName);
      });

      exportsList.forEach((exp) => targetSymbols.add(exp));

      if (chunk.content) {
        const deps = codeChunkingService.extractDependencies(chunk.content, chunk.language);
        deps.imports.forEach((imp) => {
          const baseName = imp.split('/').pop().replace(/\.[^.]+$/, '');
          if (baseName && baseName.length > 2) targetImports.add(baseName);
        });

        const calls = chunk.content.match(/\b([a-zA-Z0-9_$]+)\.([a-zA-Z0-9_$]+)\s*\(/g);
        if (calls) {
          calls.forEach((c) => {
            const parts = c.split('.');
            if (parts[0] && parts[0].length > 2) targetImports.add(parts[0]);
            if (parts[1]) targetSymbols.add(parts[1].replace('(', ''));
          });
        }
      }
    });

    if (targetImports.size === 0 && targetSymbols.size === 0) return [];

    // Precise segment-aware path matching for imported files
    const pathRegexes = Array.from(targetImports).map(
      (imp) => new RegExp(`(?:^|[/\\\\])${imp.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?:\\.[a-zA-Z0-9]+|[/\\\\]|$)`, 'i')
    );
    const symbolList = Array.from(targetSymbols);

    const dependencyQuery = {
      repositoryId: rawRepoId,
      userId,
      filePath: { $nin: Array.from(existingPaths) },
      $or: [
        { filePath: { $in: pathRegexes } },
        { symbolName: { $in: symbolList } },
      ],
    };

    // Fetch candidate related pool up to 20 chunks
    const candidateRelated = await CodeChunk.find(dependencyQuery)
      .select('filePath fileName language chunkIndex content startLine endLine symbolName symbolType commitSha')
      .limit(20)
      .lean();

    // Relevance scoring for candidate dependency chunks
    const scoredRelated = candidateRelated.map((chunk) => {
      let score = 0.5;

      if (chunk.symbolName && targetSymbols.has(chunk.symbolName)) {
        score += 0.35;
      }

      const filePathLower = (chunk.filePath || '').toLowerCase();
      for (const imp of targetImports) {
        const impLower = imp.toLowerCase();
        if (filePathLower.includes(`/${impLower}.`) || filePathLower.endsWith(`/${impLower}`)) {
          score += 0.35;
          break;
        } else if (filePathLower.includes(impLower)) {
          score += 0.15;
        }
      }

      const finalScore = parseFloat(score.toFixed(4));

      return {
        ...chunk,
        id: chunk._id.toString(),
        filePath: chunk.filePath,
        fileName: chunk.fileName,
        language: chunk.language,
        chunkIndex: chunk.chunkIndex,
        content: chunk.content,
        startLine: chunk.startLine,
        endLine: chunk.endLine,
        symbolName: chunk.symbolName,
        symbolType: chunk.symbolType,
        score: finalScore,
        finalScore: finalScore,
        vectorScore: 0,
        keywordScore: finalScore,
        retrievalMethod: 'dependency_graph',
        isDependencyContext: true,
      };
    });

    const expandedResults = scoredRelated
      .filter((c) => !existingIds.has(c.id))
      .sort((a, b) => b.score - a.score)
      .slice(0, maxExpanded);

    return expandedResults;
  },
};
