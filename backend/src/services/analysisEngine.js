import CodeChunk from '../models/CodeChunk.js';
import Repository from '../models/Repository.js';
import Analysis from '../models/Analysis.js';

const safeDecode = (str) => {
  if (!str) return '';
  try {
    return decodeURIComponent(str);
  } catch (e) {
    return str;
  }
};

export const analysisEngine = {
  /**
   * Run automated static codebase audit and AST vulnerability scan
   * Strictly tenant-scoped: requires both repositoryId and userId
   */
  async runAudit({ repositoryId, userId }) {
    if (!userId) {
      throw new Error('UserId is required to run multi-tenant codebase analysis.');
    }

    const rawRepoId = safeDecode(repositoryId);

    // 1. Fetch user-scoped repository record
    const repoRecord = await Repository.findOne({ repoId: rawRepoId, userId });
    if (!repoRecord) {
      throw new Error(`Repository '${rawRepoId}' not found for authenticated user.`);
    }

    // 2. Reject analysis if repository status is not INDEXED
    if (repoRecord.status !== 'INDEXED') {
      throw new Error(`Repository '${rawRepoId}' is not indexed yet (Current status: ${repoRecord.status || 'INDEXING'}). Please wait for indexing to complete before running analysis.`);
    }

    // 3. Fetch user-scoped code chunks strictly for this repository string ID
    const chunks = await CodeChunk.find({ repositoryId: rawRepoId, userId }).lean();
    if (!chunks || chunks.length === 0) {
      throw new Error(`No indexed code chunks found for repository '${rawRepoId}'. Please complete indexing first.`);
    }

    const repoName = repoRecord.name || rawRepoId.split('/')[1] || rawRepoId;
    const repoOwner = repoRecord.owner || rawRepoId.split('/')[0] || 'github';

    const issues = [];
    const fileIssueCount = new Map();
    const complexFunctions = [];
    const trackedFunctions = new Set();
    const trackedClasses = new Set();
    let issueCounter = 1;

    const addIssue = (item) => {
      const id = `issue-${String(issueCounter++).padStart(3, '0')}`;
      issues.push({ id, status: 'open', ...item });

      const count = fileIssueCount.get(item.file) || 0;
      fileIssueCount.set(item.file, count + 1);
    };

    // AST Symbol Metadata + Static Heuristic Rule Scan
    for (const chunk of chunks) {
      const text = chunk.content || '';
      const lines = text.split('\n');
      const filePath = chunk.filePath;

      // Clean comments & string literals to avoid false positives in code inspection
      const cleanCode = text
        .replace(/\/\*[\s\S]*?\*\/|\/\/.*/g, '')
        .replace(/(['"])(?:(?!\1)[^\\]|\\.)*\1/g, '');

      // Primary AST Symbol Counting & Deduplication
      if (chunk.symbolName) {
        const symbolKey = `${filePath}:${chunk.symbolName}`;
        const type = (chunk.symbolType || '').toLowerCase();
        if (type === 'function' || type === 'method') {
          trackedFunctions.add(symbolKey);
        } else if (type === 'class') {
          trackedClasses.add(symbolKey);
        }
      } else {
        // Fallback: Parse declarations from clean code with location deduplication
        const funcMatches = cleanCode.match(/\bfunction\s+([a-zA-Z0-9_$]+)|\b(?:const|let|var)\s+([a-zA-Z0-9_$]+)\s*=\s*(?:async\s*)?\([^)]*\)\s*=>/g);
        if (funcMatches) {
          funcMatches.forEach((m) => trackedFunctions.add(`${filePath}:${m.trim()}`));
        }

        const classMatches = cleanCode.match(/\bclass\s+([a-zA-Z0-9_$]+)/g);
        if (classMatches) {
          classMatches.forEach((m) => trackedClasses.add(`${filePath}:${m.trim()}`));
        }
      }

      // Rule 1: Hardcoded API Secret / Credentials
      const secretRegex = /(api[_\s]?key|secret[_\s]?key|password|jwt[_\s]?secret)\s*[:=]\s*['"][a-zA-Z0-9_\-]{8,}['"]/i;
      lines.forEach((line, idx) => {
        if (secretRegex.test(line) && !line.includes('process.env')) {
          addIssue({
            severity: 'critical',
            category: 'security',
            title: 'Hardcoded Credential or API Secret',
            description: 'A sensitive secret or password appears to be hardcoded directly in source code instead of using environment variables.',
            file: filePath,
            startLine: chunk.startLine + idx,
            endLine: chunk.startLine + idx,
            snippet: line.trim(),
            recommendation: 'Refactor to read credentials from process.env environment variables.',
          });
        }
      });

      // Rule 2A: Dangerous eval() Code Execution
      lines.forEach((line, idx) => {
        if (/\beval\s*\(/.test(line)) {
          addIssue({
            severity: 'high',
            category: 'security',
            title: 'Dangerous Code Execution via eval()',
            description: 'Usage of eval() executes arbitrary string inputs as JavaScript code, introducing high-risk code injection vulnerabilities.',
            file: filePath,
            startLine: chunk.startLine + idx,
            endLine: chunk.startLine + idx,
            snippet: line.trim(),
            recommendation: 'Avoid eval() completely. Use JSON.parse() or safe function abstractions.',
          });
        }
      });

      // Rule 2B: Potentially Unsafe DOM HTML Assignment
      lines.forEach((line, idx) => {
        if (/\.innerHTML\s*=/.test(line)) {
          addIssue({
            severity: 'medium',
            category: 'security',
            title: 'Potentially Unsafe DOM HTML Assignment',
            description: 'Usage of innerHTML assignment detected. Ensure assigned values are properly sanitized or escaped to prevent DOM-based Cross-Site Scripting (XSS).',
            file: filePath,
            startLine: chunk.startLine + idx,
            endLine: chunk.startLine + idx,
            snippet: line.trim(),
            recommendation: 'Use textContent or DOM element creation methods instead of innerHTML when rendering untrusted user data.',
          });
        }
      });

      // Rule 3: Async Operation Without Local Error Handling
      if (/async\s+function|async\s+\(/.test(text) && !text.includes('try') && !text.includes('catch')) {
        addIssue({
          severity: 'low',
          category: 'quality',
          title: 'Async Operation Without Local Error Handling',
          description: 'This async function does not contain an obvious local try/catch block or catch handler. Promise rejection handling may occur at the caller or middleware level.',
          file: filePath,
          startLine: chunk.startLine,
          endLine: chunk.endLine,
          snippet: lines[0]?.trim() || text.substring(0, 60),
          recommendation: 'Consider adding local try/catch error boundaries for unhandled async exceptions.',
        });
      }

      // Rule 4: Heuristic Branch Complexity Scanner (computed on clean code without string/comment distortion)
      const branchMatches = cleanCode.match(/\b(if|else|switch|case|for|while|catch|\?\?|\&\&|\|\|)\b/g);
      const branchCount = branchMatches ? branchMatches.length : 1;
      const fnName = chunk.symbolName || `function_${chunk.chunkIndex}`;

      if (branchCount >= 8) {
        complexFunctions.push({
          name: fnName,
          symbol: fnName,
          file: filePath,
          complexity: branchCount + 1,
          rating: branchCount >= 14 ? 'High' : 'Medium',
        });

        if (branchCount >= 14) {
          addIssue({
            severity: 'medium',
            category: 'performance',
            title: `High Heuristic Branch Complexity in ${fnName}`,
            description: `Function contains ${branchCount + 1} decision branches, making it difficult to test and maintain.`,
            file: filePath,
            startLine: chunk.startLine,
            endLine: chunk.endLine,
            snippet: lines[0]?.trim() || '',
            recommendation: 'Break down complex control flow into smaller, single-responsibility helper functions.',
          });
        }
      }
    }

    // Sort problematic files by issue count
    const problematicFiles = Array.from(fileIssueCount.entries())
      .map(([filePath, count]) => ({
        name: filePath.split('/').pop(),
        path: filePath,
        issues: count,
      }))
      .sort((a, b) => b.issues - a.issues)
      .slice(0, 5);

    // Dynamic Health & Category Scores strictly based on real findings
    const criticalCount = issues.filter((i) => i.severity === 'critical').length;
    const highCount = issues.filter((i) => i.severity === 'high').length;
    const mediumCount = issues.filter((i) => i.severity === 'medium').length;
    const lowCount = issues.filter((i) => i.severity === 'low').length;

    let healthScore = 100;
    let securityScore = 100;
    let qualityScore = 100;
    let performanceScore = 100;

    if (issues.length > 0) {
      const healthDeduction = (criticalCount * 15) + (highCount * 8) + (mediumCount * 4) + (lowCount * 1);
      healthScore = Math.max(40, Math.min(100, 100 - healthDeduction));

      const securityDeduction = (criticalCount * 20) + (highCount * 10);
      securityScore = Math.max(40, Math.min(100, 100 - securityDeduction));

      const qualityDeduction = (mediumCount * 5) + (lowCount * 2);
      qualityScore = Math.max(50, Math.min(100, 100 - qualityDeduction));

      const perfDeduction = complexFunctions.filter((f) => f.rating === 'High').length * 10;
      performanceScore = Math.max(50, Math.min(100, 100 - perfDeduction));
    }

    const healthStatus = healthScore >= 90 ? 'Excellent' : healthScore >= 75 ? 'Good' : 'Needs Review';
    const uniqueFiles = new Set(chunks.map((c) => c.filePath)).size;

    const auditReport = {
      userId,
      repoId: rawRepoId,
      repositoryName: repoName,
      owner: repoOwner,
      status: 'completed',
      lastAnalyzed: new Date(),
      healthScore,
      healthStatus,
      stats: {
        files: repoRecord.stats?.files || uniqueFiles,
        functions: trackedFunctions.size,
        classes: trackedClasses.size,
        issues: issues.length,
        securityIssues: criticalCount + highCount,
        commits: repoRecord.stats?.commits || 0,
      },
      scores: {
        quality: qualityScore,
        security: securityScore,
        performance: performanceScore,
        architecture: Math.round((qualityScore + performanceScore) / 2),
      },
      qualityMetrics: {
        maintainability: qualityScore,
        complexity: Math.max(40, 100 - (complexFunctions.length * 5)),
        duplication: null,
        readability: null,
        testCoverage: null,
      },
      issues,
      problematicFiles,
      complexFunctions,
      history: [
        {
          id: `h_${Date.now()}`,
          date: new Date().toISOString(),
          healthScore,
          issuesCount: issues.length,
          status: 'Completed',
        },
      ],
    };

    // Save/Update in MongoDB for (userId + repoId)
    const savedDoc = await Analysis.findOneAndUpdate(
      { userId, repoId: rawRepoId },
      auditReport,
      { upsert: true, new: true }
    );

    return savedDoc || auditReport;
  },
};
