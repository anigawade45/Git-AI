import mongoose from 'mongoose';

const repositoryManifestSchema = new mongoose.Schema(
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
    fileSha: {
      type: String,
      default: null,
    },
    commitSha: {
      type: String,
      default: null,
      index: true,
    },
    language: {
      type: String,
      default: 'plaintext',
    },
    status: {
      type: String,
      enum: ['INDEXED', 'SKIPPED', 'FAILED'],
      default: 'INDEXED',
    },
    chunkCount: {
      type: Number,
      default: 0,
    },
    contentHash: {
      type: String,
      default: null,
    },
    embeddingModel: {
      type: String,
      default: null,
    },
    embeddingDimension: {
      type: Number,
      default: null,
    },
    indexedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

repositoryManifestSchema.index({ userId: 1, repositoryId: 1, filePath: 1 }, { unique: true });

const RepositoryManifest =
  mongoose.models.RepositoryManifest ||
  mongoose.model('RepositoryManifest', repositoryManifestSchema);

export default RepositoryManifest;
