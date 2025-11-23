import mongoose from 'mongoose';

const listSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true, trim: true },
    color: { type: String, default: '' },
    order: { type: Number, default: () => Date.now(), index: true }
  },
  { timestamps: true }
);

listSchema.index({ user: 1, name: 1 }, { unique: true });

export const List = mongoose.model('List', listSchema);


