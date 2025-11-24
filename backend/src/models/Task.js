import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    category: { type: String, default: 'general', index: true },
    status: { type: String, enum: ['todo', 'doing', 'done'], default: 'todo', index: true },
    tags: { type: [String], default: [] },
    subtasks: {
      type: [
        {
          _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
          title: { type: String, required: true },
          completed: { type: Boolean, default: false }
        }
      ],
      default: []
    },
    notes: { type: String, default: '' },
    completed: { type: Boolean, default: false },
    dueDate: { 
      type: Date,
      validate: {
        validator: function (v) {
          if (!v) return true;
          const d = v instanceof Date ? v : new Date(v);
          if (Number.isNaN(d.getTime())) return false;
          const y = d.getUTCFullYear();
          return y >= 1000 && y <= 9999;
        },
        message: 'dueDate year must be 4 digits (1000–9999)'
      }
    },
    order: { type: Number, default: () => Date.now(), index: true }
  },
  { timestamps: true }
);

export const Task = mongoose.model('Task', taskSchema);


