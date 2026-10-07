import mongoose from 'mongoose';

const conversationSchema = new mongoose.Schema(
  {
    convId: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    repoId: {
      type: String,
      required: true,
    },
    timestamp: {
      type: String,
      default: 'TODAY',
    },
    updatedAtText: {
      type: String,
      default: 'Just now',
    },
    messages: [
      {
        id: { type: String, required: true },
        role: { type: String, enum: ['user', 'assistant'], required: true },
        content: { type: String, required: true },
        timestamp: { type: String, default: '' },
        sources: [
          {
            fileName: { type: String, required: true },
            filePath: { type: String, required: true },
            startLine: { type: Number, default: null },
            endLine: { type: Number, default: null },
            language: { type: String, default: '' },
          },
        ],
      },
    ],
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

conversationSchema.index({ userId: 1, convId: 1 }, { unique: true });
conversationSchema.index({ userId: 1, updatedAt: -1 });
conversationSchema.index({ userId: 1, repoId: 1 });

const Conversation = mongoose.models.Conversation || mongoose.model('Conversation', conversationSchema);
export default Conversation;
