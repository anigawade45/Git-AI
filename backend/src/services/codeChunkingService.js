import crypto from 'crypto';

// Files and directories to exclude from chunking and embedding
const EXCLUDED_EXTENSIONS = new Set([
  'png', 'jpg', 'jpeg', 'gif', 'webp', 'ico', 'svg', 'bmp', 'tiff',
  'pdf', 'doc', 'docx', 'zip', 'tar', 'gz', '7z', 'rar',
  'mp3', 'mp4', 'avi', 'mov', 'mkv', 'flv',
  'exe', 'dll', 'so', 'dylib', 'bin', 'dat', 'db', 'sqlite',
  'lock', 'log', 'map'
]);

const EXCLUDED_FILENAMES = new Set([
  'package-lock.json',
  'yarn.lock',
  'pnpm-lock.yaml',
  'composer.lock',
  'Gemfile.lock'
]);

const EXCLUDED_DIRS = [
  'node_modules',
  '.git',
  'dist',
  'build',
  'coverage',
  '.next',
  '.nuxt',
  'vendor',
  'tmp',
  'temp'
];

export const codeChunkingService = {
  /**
   * Determine if a file path should be indexed for RAG
   */
  shouldIndexFile(filePath) {
    if (!filePath) return false;

    const normalized = filePath.replace(/\\/g, '/');
    const parts = normalized.split('/');
    const fileName = parts[parts.length - 1];

    // Check directory exclusion
    for (const dir of EXCLUDED_DIRS) {
      if (parts.includes(dir)) return false;
    }

    // Check filename exclusion
    if (EXCLUDED_FILENAMES.has(fileName)) return false;

    // Check extension exclusion
    const extMatch = fileName.match(/\.([^.]+)$/);
    if (extMatch) {
      const ext = extMatch[1].toLowerCase();
      if (EXCLUDED_EXTENSIONS.has(ext)) return false;
    }

    return true;
  },

  /**
   * Infer programming language from file extension
   */
  detectLanguage(filePath) {
    if (!filePath) return 'plaintext';
    const extMatch = filePath.match(/\.([^.]+)$/);
    if (!extMatch) return 'plaintext';

    const ext = extMatch[1].toLowerCase();
    const map = {
      js: 'javascript',
      jsx: 'javascript',
      ts: 'typescript',
      tsx: 'typescript',
      py: 'python',
      java: 'java',
      c: 'c',
      cpp: 'cpp',
      cs: 'csharp',
      go: 'go',
      rs: 'rust',
      php: 'php',
      rb: 'ruby',
      swift: 'swift',
      kt: 'kotlin',
      sql: 'sql',
      html: 'html',
      css: 'css',
      scss: 'scss',
      json: 'json',
      yaml: 'yaml',
      yml: 'yaml',
      md: 'markdown',
      sh: 'bash',
    };
    return map[ext] || 'plaintext';
  },

  /**
   * Calculate SHA256 hash of content string
   */
  hashContent(content) {
    return crypto.createHash('sha256').update(content || '').digest('hex');
  },

  /**
   * Extract import statements and exported symbols to build code relationship graph across supported languages
   */
  extractDependencies(content, language = 'javascript') {
    if (!content || typeof content !== 'string') return { imports: [], exports: [] };

    const imports = [];
    const exports = [];
    const lang = (language || 'javascript').toLowerCase();

    let match;

    if (lang === 'javascript' || lang === 'typescript') {
      const es6ImportRegex = /import\s+(?:[\s\w*{},$]+?\s+from\s+)?['"]([^'"]+)['"]/g;
      const commonJsRegex = /require\(['"]([^'"]+)['"]\)/g;
      const dynamicImportRegex = /import\(['"]([^'"]+)['"]\)/g;
      const exportRegex = /export\s+(?:default\s+)?(?:async\s+)?(?:function|class|const|let|var|type|interface|enum)\s+([a-zA-Z0-9_$]+)/g;

      while ((match = es6ImportRegex.exec(content)) !== null) {
        if (match[1]) imports.push(match[1]);
      }
      while ((match = commonJsRegex.exec(content)) !== null) {
        if (match[1]) imports.push(match[1]);
      }
      while ((match = dynamicImportRegex.exec(content)) !== null) {
        if (match[1]) imports.push(match[1]);
      }
      while ((match = exportRegex.exec(content)) !== null) {
        if (match[1]) exports.push(match[1]);
      }
    } else if (lang === 'python') {
      const pyImportRegex = /(?:from\s+([\w.]+)\s+import|import\s+([\w.]+))/g;
      const pySymbolRegex = /(?:def|class)\s+([a-zA-Z0-9_]+)/g;

      while ((match = pyImportRegex.exec(content)) !== null) {
        const mod = match[1] || match[2];
        if (mod) imports.push(mod);
      }
      while ((match = pySymbolRegex.exec(content)) !== null) {
        if (match[1]) exports.push(match[1]);
      }
    } else if (lang === 'java' || lang === 'kotlin') {
      const javaImportRegex = /import\s+([\w.]+);?/g;
      const javaClassRegex = /(?:public|protected|private)?\s*(?:class|interface|enum)\s+([a-zA-Z0-9_]+)/g;

      while ((match = javaImportRegex.exec(content)) !== null) {
        if (match[1]) imports.push(match[1]);
      }
      while ((match = javaClassRegex.exec(content)) !== null) {
        if (match[1]) exports.push(match[1]);
      }
    } else if (lang === 'go') {
      const goSingleImportRegex = /import\s+['"]([^'"]+)['"]/g;
      const goMultiImportBlockRegex = /import\s*\(([\s\S]*?)\)/g;
      const goSymbolRegex = /(?:func|type)\s+([a-zA-Z0-9_]+)/g;

      while ((match = goSingleImportRegex.exec(content)) !== null) {
        if (match[1]) imports.push(match[1]);
      }
      while ((match = goMultiImportBlockRegex.exec(content)) !== null) {
        if (match[1]) {
          const lines = match[1].split('\n');
          for (const line of lines) {
            const lineMatch = line.match(/['"]([^'"]+)['"]/);
            if (lineMatch && lineMatch[1]) imports.push(lineMatch[1]);
          }
        }
      }
      while ((match = goSymbolRegex.exec(content)) !== null) {
        if (match[1]) exports.push(match[1]);
      }
    } else if (lang === 'rust') {
      const rustUseRegex = /use\s+([\w:]+);/g;
      const rustModRegex = /mod\s+([\w]+);/g;
      const rustSymbolRegex = /pub\s+(?:fn|struct|enum|trait)\s+([a-zA-Z0-9_]+)/g;

      while ((match = rustUseRegex.exec(content)) !== null) {
        if (match[1]) imports.push(match[1]);
      }
      while ((match = rustModRegex.exec(content)) !== null) {
        if (match[1]) imports.push(match[1]);
      }
      while ((match = rustSymbolRegex.exec(content)) !== null) {
        if (match[1]) exports.push(match[1]);
      }
    } else if (lang === 'c' || lang === 'cpp') {
      const cppIncludeRegex = /#include\s+[<"]([^>"]+)[>"]/g;
      const cppSymbolRegex = /(?:class|struct|namespace)\s+([a-zA-Z0-9_]+)/g;

      while ((match = cppIncludeRegex.exec(content)) !== null) {
        if (match[1]) imports.push(match[1]);
      }
      while ((match = cppSymbolRegex.exec(content)) !== null) {
        if (match[1]) exports.push(match[1]);
      }
    } else if (lang === 'csharp') {
      const csUsingRegex = /using\s+([\w.]+);/g;
      const csClassRegex = /(?:public|protected|private)?\s*(?:class|interface|struct)\s+([a-zA-Z0-9_]+)/g;

      while ((match = csUsingRegex.exec(content)) !== null) {
        if (match[1]) imports.push(match[1]);
      }
      while ((match = csClassRegex.exec(content)) !== null) {
        if (match[1]) exports.push(match[1]);
      }
    } else if (lang === 'php') {
      const phpUseRegex = /use\s+([\w\\]+);/g;
      const phpRequireRegex = /(?:require|require_once|include|include_once)\s*\(?['"]([^'"]+)['"]\)?/g;
      const phpSymbolRegex = /(?:function|class|interface)\s+([a-zA-Z0-9_]+)/g;

      while ((match = phpUseRegex.exec(content)) !== null) {
        if (match[1]) imports.push(match[1]);
      }
      while ((match = phpRequireRegex.exec(content)) !== null) {
        if (match[1]) imports.push(match[1]);
      }
      while ((match = phpSymbolRegex.exec(content)) !== null) {
        if (match[1]) exports.push(match[1]);
      }
    } else if (lang === 'ruby') {
      const rbRequireRegex = /(?:require|require_relative)\s+['"]([^'"]+)['"]/g;
      const rbSymbolRegex = /(?:class|module|def)\s+([a-zA-Z0-9_!?]+)/g;

      while ((match = rbRequireRegex.exec(content)) !== null) {
        if (match[1]) imports.push(match[1]);
      }
      while ((match = rbSymbolRegex.exec(content)) !== null) {
        if (match[1]) exports.push(match[1]);
      }
    } else {
      // Fallback for generic languages
      const genericImport = /(?:import|require|using|use|include)\s+.*?['"]?([\w.\-/]+)['"]?/g;
      while ((match = genericImport.exec(content)) !== null) {
        if (match[1]) imports.push(match[1]);
      }
    }

    return {
      imports: Array.from(new Set(imports)),
      exports: Array.from(new Set(exports)),
    };
  },

  /**
   * Split source file into semantic chunks preserving startLine and endLine
   */
  chunkFile({ repositoryId, filePath, content, language, maxChunkChars = 1500 }) {
    if (!content || typeof content !== 'string') return [];

    const normalizedLang = language || this.detectLanguage(filePath);
    const lines = content.split(/\r?\n/);
    if (lines.length === 0) return [];

    const fileName = filePath.split('/').pop() || filePath;
    const fileHash = this.hashContent(content);
    const chunks = [];

    // Semantic splitting strategy based on top-level boundaries (functions, classes, blocks)
    let currentChunkLines = [];
    let startLine = 1;
    let currentChars = 0;
    let currentSymbolName = '';
    let currentSymbolType = '';

    const pushChunk = (endLine) => {
      if (currentChunkLines.length === 0) return;
      const chunkText = currentChunkLines.join('\n').trim();

      if (chunkText.length > 10) { // Ignore tiny empty blocks
        const chunkIndex = chunks.length;
        const deps = this.extractDependencies(chunkText, normalizedLang);
        chunks.push({
          repositoryId,
          filePath,
          fileName,
          language: normalizedLang,
          chunkIndex,
          content: chunkText,
          startLine,
          endLine,
          tokenEstimate: Math.ceil(chunkText.length / 4),
          symbolName: currentSymbolName || undefined,
          symbolType: currentSymbolType || undefined,
          imports: deps.imports,
          exports: deps.exports,
          contentHash: this.hashContent(chunkText),
          fileSha: fileHash,
        });
      }

      currentChunkLines = [];
      currentChars = 0;
      currentSymbolName = '';
      currentSymbolType = '';
    };

    const jsFunctionRegex = /(?:export\s+)?(?:async\s+)?function\s+([a-zA-Z0-9_$]+)|const\s+([a-zA-Z0-9_$]+)\s*=\s*(?:async\s*)?\(/;
    const pyFunctionRegex = /def\s+([a-zA-Z0-9_]+)/;
    const goFunctionRegex = /func\s+(?:\([^)]*\)\s*)?([a-zA-Z0-9_]+)/;
    const rustFunctionRegex = /fn\s+([a-zA-Z0-9_]+)/;

    const classRegex = /(?:export\s+)?(?:public|protected|private)?\s*(?:class|interface|struct|enum)\s+([a-zA-Z0-9_$]+)/;
    const methodRegex = /(?:public|private|protected|async|static|\s)*([a-zA-Z0-9_$]+)\s*\([^)]*\)\s*\{/;
    const controlFlowRegex = /^(if|for|while|switch|catch|else|finally)\b/;

    lines.forEach((line, idx) => {
      const lineNum = idx + 1;
      const trimmed = line.trim();

      // Multi-language symbol boundary detection
      const isControlFlow = controlFlowRegex.test(trimmed);

      let functionMatch = null;
      let classMatch = null;
      let methodMatch = null;

      if (!isControlFlow) {
        if (normalizedLang === 'python') {
          functionMatch = trimmed.match(pyFunctionRegex);
        } else if (normalizedLang === 'go') {
          functionMatch = trimmed.match(goFunctionRegex);
        } else if (normalizedLang === 'rust') {
          functionMatch = trimmed.match(rustFunctionRegex);
        } else {
          functionMatch = trimmed.match(jsFunctionRegex);
        }

        classMatch = trimmed.match(classRegex);
        if (!functionMatch && !classMatch) {
          methodMatch = trimmed.match(methodRegex);
        }
      }

      const isNewSymbol = functionMatch || classMatch || methodMatch;

      if (isNewSymbol && currentChunkLines.length > 5) {
        // Split on new symbol boundary if current chunk has substance
        pushChunk(lineNum - 1);
        startLine = lineNum;
      }

      if (currentChunkLines.length === 0) {
        startLine = lineNum;
        if (functionMatch) {
          currentSymbolName = functionMatch.slice(1).find(Boolean) || '';
          currentSymbolType = 'function';
        } else if (classMatch) {
          currentSymbolName = classMatch[1] || '';
          currentSymbolType = 'class';
        } else if (methodMatch) {
          currentSymbolName = methodMatch[1] || '';
          currentSymbolType = 'method';
        }
      }

      currentChunkLines.push(line);
      currentChars += line.length + 1;

      // Force split if chunk size limit reached
      if (currentChars >= maxChunkChars) {
        pushChunk(lineNum);
        startLine = lineNum + 1;
      }
    });

    // Push final remaining chunk
    if (currentChunkLines.length > 0) {
      pushChunk(lines.length);
    }

    return chunks;
  },
};
