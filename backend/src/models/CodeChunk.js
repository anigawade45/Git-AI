import mongoose from 'mongoose';

const CodeChunkSchema = new mongoose.Schema(
  {
    repositoryId: {
      type: String,
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    filePath: {
      type: String,
      required: true,
      index: true,
    },
    fileName: {
      type: String,
      required: true,
    },
    language: {
      type: String,
      default: 'plaintext',
    },
    chunkIndex: {
      type: Number,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    startLine: {
      type: Number,
      required: true,
    },
    endLine: {
      type: Number,
      required: true,
    },
    tokenEstimate: {
      type: Number,
      default: 0,
    },
    symbolName: {
      type: String,
    },
    symbolType: {
      type: String,
    },
    fileSha: {
      type: String,
    },
    commitSha: {
      type: String,
      default: null,
      index: true,
    },
    contentHash: {
      type: String,
      required: true,
    },
    embedding: {
      type: [Number],
      default: [],
    },
    embeddingModel: {
      type: String,
      default: null,
    },
    embeddingDimension: {
      type: Number,
      default: null,
    },
    imports: {
      type: [String],
      default: [],
    },
    exports: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for deterministic repository isolation & multi-tenant deduplication
CodeChunkSchema.index({ userId: 1, repositoryId: 1 });
CodeChunkSchema.index({ userId: 1, repositoryId: 1, filePath: 1, chunkIndex: 1 }, { unique: true });

export default mongoose.models.CodeChunk || mongoose.model('CodeChunk', CodeChunkSchema);
