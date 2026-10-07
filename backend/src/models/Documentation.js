import mongoose from 'mongoose';

const documentationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    repoId: {
      type: String,
      required: true,
      index: true,
    },
    docType: {
      type: String,
      default: 'readme',
      index: true,
    },
    title: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    sections: [
      {
        id: String,
        title: String,
        content: String,
      },
    ],
    metadata: {
      version: { type: Number, default: 1 },
      language: { type: String, default: 'English' },
      tone: { type: String, default: 'Professional' },
      detailLevel: { type: String, default: 'Detailed' },
      scope: { type: String, default: 'Entire Repository' },
      generatedAt: { type: Date, default: Date.now },
    },
  },
  {
    timestamps: true,
  }
);

documentationSchema.index({ userId: 1, repoId: 1, docType: 1 }, { unique: true });

const Documentation = mongoose.models.Documentation || mongoose.model('Documentation', documentationSchema);
export default Documentation;
