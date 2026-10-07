import mongoose from 'mongoose';

const failedFileSchema = new mongoose.Schema(
  {
    filePath: { type: String, required: true },
    reason: { type: String, default: 'Content fetch / parsing error' },
    error: { type: String, default: null },
  },
  { _id: false }
);

const indexingJobSchema = new mongoose.Schema(
  {
    jobId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    repositoryId: {
      type: String,
      required: true,
      index: true,
    },
    commitSha: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: ['QUEUED', 'SYNCING', 'INDEXING', 'INDEXED', 'PARTIAL', 'FAILED'],
      default: 'QUEUED',
    },
    startedAt: {
      type: Date,
      default: Date.now,
    },
    completedAt: {
      type: Date,
      default: null,
    },
    totalFiles: {
      type: Number,
      default: 0,
    },
    processedFiles: {
      type: Number,
      default: 0,
    },
    totalChunks: {
      type: Number,
      default: 0,
    },
    processedChunks: {
      type: Number,
      default: 0,
    },
    embeddingsGenerated: {
      type: Number,
      default: 0,
    },
    failedFiles: [failedFileSchema],
    error: {
      type: String,
      default: null,
    },
    failedStep: {
      type: String,
      enum: ['FETCH_TREE', 'FETCH_CONTENT', 'CHUNK_FILE', 'GENERATE_EMBEDDING', 'WRITE_DB', null],
      default: null,
    },
    retryCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

indexingJobSchema.index({ userId: 1, repositoryId: 1, createdAt: -1 });
indexingJobSchema.index({ userId: 1, repositoryId: 1, status: 1 });
indexingJobSchema.index(
  { userId: 1, repositoryId: 1 },
  {
    unique: true,
    partialFilterExpression: {
      status: { $in: ['QUEUED', 'SYNCING', 'INDEXING'] },
    },
  }
);

const IndexingJob =
  mongoose.models.IndexingJob || mongoose.model('IndexingJob', indexingJobSchema);

export default IndexingJob;
