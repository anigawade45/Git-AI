export const mockAnalysisData = {
  repositoryId: 'ecommerce-platform',
  repositoryName: 'ecommerce-platform',
  owner: 'facebook',
  status: 'completed',
  lastAnalyzed: '2 minutes ago',

  healthScore: 82, // Overall score 82% (Good)
  healthStatus: 'Good',

  stats: {
    files: 124,
    functions: 387,
    classes: 24,
    issues: 23,
    securityIssues: 2,
    commits: 542,
  },

  scores: {
    quality: 86,
    security: 90,
    performance: 78,
    architecture: 84,
  },

  qualityMetrics: {
    maintainability: 86,
    complexity: 72,
    duplication: 91,
    readability: 88,
    testCoverage: 74,
  },

  issues: [
    {
      id: 'issue-001',
      severity: 'critical', // 'critical' | 'high' | 'medium' | 'low' | 'info'
      category: 'security',
      title: 'Hardcoded API Secret in Database Config',
      description: 'A sensitive database credential appears to be stored directly in source code instead of using environment variables.',
      file: 'src/config/database.js',
      startLine: 18,
      endLine: 18,
      snippet: `const user = "admin";
const host = "localhost";
const password = "admin123";  // Issue: Hardcoded secret
connectDatabase(user, password);`,
      recommendation: 'Move database password to process.env.DB_PASSWORD environment variable.',
      status: 'open',
    },
    {
      id: 'issue-002',
      severity: 'high',
      category: 'security',
      title: 'Missing Rate Limiting on Authentication Route',
      description: 'The POST /api/auth/login endpoint does not enforce IP rate limiting, exposing it to brute-force credential attacks.',
      file: 'src/controllers/authController.js',
      startLine: 12,
      endLine: 25,
      snippet: `export const loginUser = async (req, res) => {
  const { email, password } = req.body;
  // Missing express-rate-limit middleware
  const user = await User.findOne({ email });`,
      recommendation: 'Add express-rate-limit middleware to authentication routes.',
      status: 'open',
    },
    {
      id: 'issue-003',
      severity: 'high',
      category: 'performance',
      title: 'Unindexed Database Query in User Lookup',
      description: 'Querying User collection without indexed search fields causes full collection scans under high concurrency.',
      file: 'src/services/userService.js',
      startLine: 34,
      endLine: 42,
      snippet: `const users = await User.find({ status: "active", country: req.query.country });`,
      recommendation: 'Add compound index on { status: 1, country: 1 } in User Mongoose schema.',
      status: 'open',
    },
    {
      id: 'issue-004',
      severity: 'medium',
      category: 'quality',
      title: 'High Cyclomatic Complexity in Order Processing',
      description: 'Function processOrder() contains 18 conditional branches, exceeding the complexity threshold of 10.',
      file: 'src/controllers/orderController.js',
      startLine: 45,
      endLine: 98,
      snippet: `if (cart.length > 0) {
  if (coupon.valid) {
    if (user.isVIP) { ... }
  }
}`,
      recommendation: 'Refactor complex nested conditionals into dedicated helper functions or strategy patterns.',
      status: 'open',
    },
    {
      id: 'issue-005',
      severity: 'medium',
      category: 'quality',
      title: 'Duplicate Logic in Password Encryption',
      description: 'Bcrypt hashing logic is duplicated across authController.js and resetPasswordService.js.',
      file: 'src/controllers/authController.js',
      startLine: 54,
      endLine: 62,
      snippet: `const salt = await bcrypt.genSalt(10);
const hashedPassword = await bcrypt.hash(password, salt);`,
      recommendation: 'Extract password hashing into a reusable utility module in src/utils/crypto.js.',
      status: 'open',
    },
    {
      id: 'issue-006',
      severity: 'low',
      category: 'performance',
      title: 'Unnecessary Full Object Destructuring in Loop',
      description: 'Destructuring large objects inside array map loops causes transient garbage collection pressure.',
      file: 'src/services/productService.js',
      startLine: 22,
      endLine: 30,
      snippet: `products.map(product => { const { ...details } = product; return details; });`,
      recommendation: 'Use targeted property picking instead of spreading full objects.',
      status: 'open',
    },
  ],

  problematicFiles: [
    { name: 'authController.js', path: 'src/controllers/authController.js', issues: 5 },
    { name: 'database.js', path: 'src/config/database.js', issues: 3 },
    { name: 'orderController.js', path: 'src/controllers/orderController.js', issues: 3 },
    { name: 'userService.js', path: 'src/services/userService.js', issues: 2 },
  ],

  complexFunctions: [
    { name: 'processOrder()', file: 'orderController.js', complexity: 18, rating: 'High' },
    { name: 'authenticateUser()', file: 'authController.js', complexity: 14, rating: 'Medium' },
    { name: 'calculateDiscount()', file: 'discountService.js', complexity: 12, rating: 'Medium' },
    { name: 'generateReport()', file: 'analyticsService.js', complexity: 11, rating: 'Medium' },
  ],

  history: [
    { id: 'h_1', date: 'Aug 25, 2026', healthScore: 82, issuesCount: 23, status: 'Passed' },
    { id: 'h_2', date: 'Aug 20, 2026', healthScore: 78, issuesCount: 29, status: 'Passed' },
    { id: 'h_3', date: 'Aug 12, 2026', healthScore: 74, issuesCount: 35, status: 'Passed' },
  ],
};
