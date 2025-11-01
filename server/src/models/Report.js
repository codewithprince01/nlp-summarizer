import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true, required: false, default: null },
    sourceType: { type: String, enum: ['text', 'image', 'pdf'], required: true },
    fileUrl: { type: String },
    ocrText: { type: String },
    originalText: { type: String },
    summaryText: { type: String },
    status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' },
  },
  { timestamps: true }
);

reportSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model('Report', reportSchema);
