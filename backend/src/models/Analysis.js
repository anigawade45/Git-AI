import mongoose from 'mongoose';

const analysisSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    repoId: {
      type: String,
      required: true,
    },
    healthScore: {
      type: Number,
      default: 100,
    },
    healthStatus: {
      type: String,
      default: 'Excellent',
    },
    scores: {
      quality: { type: Number, default: 100 },
      security: { type: Number, default: 100 },
      performance: { type: Number, default: 100 },
      architecture: { type: Number, default: 100 },
    },
    stats: {
      files: { type: Number, default: 0 },
      functions: { type: Number, default: 0 },
      classes: { type: Number, default: 0 },
      issues: { type: Number, default: 0 },
      securityIssues: { type: Number, default: 0 },
      commits: { type: Number, default: 0 },
    },
    qualityMetrics: {
      maintainability: { type: Number, default: 100 },
      complexity: { type: Number, default: 100 },
      duplication: { type: Number, default: null },
      readability: { type: Number, default: null },
      testCoverage: { type: Number, default: null },
    },
    issues: [
      {
        id: String,
        severity: { type: String, enum: ['critical', 'high', 'medium', 'low', 'info'] },
        category: String,
        title: String,
        description: String,
        file: String,
        startLine: Number,
        endLine: Number,
        snippet: String,
        recommendation: String,
        status: { type: String, default: 'open' },
      },
    ],
    problematicFiles: [
      {
        name: String,
        path: String,
        issues: Number,
      },
    ],
    complexFunctions: [
      {
        name: String,
        file: String,
        complexity: Number,
        rating: String,
      },
    ],
    history: [
      {
        id: String,
        date: String,
        healthScore: Number,
        issuesCount: Number,
        status: String,
      },
    ],
    lastAnalyzed: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Compound Index: Scoped to userId + repoId
analysisSchema.index({ userId: 1, repoId: 1 }, { unique: true });

const Analysis = mongoose.models.Analysis || mongoose.model('Analysis', analysisSchema);
export default Analysis;
