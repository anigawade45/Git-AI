import mongoose from 'mongoose';

const repositorySchema = new mongoose.Schema(
  {
    repoId: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    owner: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: '',
    },
    language: {
      type: String,
      default: 'JavaScript',
    },
    technologies: {
      type: [String],
      default: [],
    },
    stars: {
      type: String,
      default: '0',
    },
    forks: {
      type: String,
      default: '0',
    },
    commitSha: {
      type: String,
      default: null,
    },
    defaultBranch: {
      type: String,
      default: 'main',
    },
    status: {
      type: String,
      enum: ['IMPORTED', 'QUEUED', 'SYNCING', 'INDEXING', 'INDEXED', 'PARTIAL', 'FAILED'],
      default: 'IMPORTED',
    },
    activeEmbeddingModel: {
      type: String,
      default: null,
    },
    embeddingDimension: {
      type: Number,
      default: null,
    },
    indexVersion: {
      type: String,
      default: 'v1',
    },
    indexingError: {
      type: String,
      default: null,
    },
    indexingProgress: {
      processedFiles: { type: Number, default: 0 },
      totalFiles: { type: Number, default: 0 },
      totalChunks: { type: Number, default: 0 },
      processedChunks: { type: Number, default: 0 },
    },
    files: {
      type: mongoose.Schema.Types.Mixed,
      default: [],
    },
    stats: {
      files: { type: Number, default: 0 },
      functions: { type: Number, default: 0 },
      commits: { type: Number, default: 0 },
      lastUpdated: { type: String, default: 'Just now' },
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

repositorySchema.index({ userId: 1, repoId: 1 }, { unique: true });
repositorySchema.index({ userId: 1, updatedAt: -1 });
repositorySchema.index({ userId: 1, status: 1 });

const Repository = mongoose.models.Repository || mongoose.model('Repository', repositorySchema);
export default Repository;
