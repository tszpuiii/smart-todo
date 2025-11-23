import { Router } from 'express';
import { Task } from '../models/Task.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.use(requireAuth);

// List tasks with optional filters
router.get('/', async (req, res, next) => {
  try {
    const { category, completed, status } = req.query;
    const query = { user: req.userId };
    if (category) query.category = category;
    if (typeof completed !== 'undefined') query.completed = completed === 'true';
    if (status) query.status = status;

    const tasks = await Task.find(query).sort({ order: 1, createdAt: 1 });
    return res.json({ tasks });
  } catch (err) {
    return next(err);
  }
});

// Create task
router.post('/', async (req, res, next) => {
  try {
    const { title, description = '', category = 'general', status = 'todo', tags = [], subtasks = [], notes = '', dueDate } = req.body;
    if (!title) return res.status(400).json({ error: 'Title is required' });
    const task = await Task.create({
      user: req.userId,
      title,
      description,
      category,
      status,
      tags,
      subtasks,
      notes,
      dueDate: dueDate ? new Date(dueDate) : undefined
    });
    return res.status(201).json({ task });
  } catch (err) {
    return next(err);
  }
});

// Update task
router.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const update = {};
    const allowed = ['title', 'description', 'category', 'status', 'tags', 'subtasks', 'notes', 'completed', 'dueDate'];
    for (const key of allowed) {
      if (key in req.body) update[key] = req.body[key];
    }
    if ('dueDate' in update && update.dueDate) update.dueDate = new Date(update.dueDate);

    const task = await Task.findOneAndUpdate({ _id: id, user: req.userId }, update, { new: true });
    if (!task) return res.status(404).json({ error: 'Task not found' });
    return res.json({ task });
  } catch (err) {
    return next(err);
  }
});

// Toggle complete
router.patch('/:id/toggle', async (req, res, next) => {
  try {
    const { id } = req.params;
    const task = await Task.findOne({ _id: id, user: req.userId });
    if (!task) return res.status(404).json({ error: 'Task not found' });
    task.completed = !task.completed;
    // 當任務被勾選完成時，自動切換到看板的 done 欄位
    if (task.completed) {
      task.status = 'done';
    } else {
      // 取消完成時若當前是 done，預設返回 todo（保留使用者後續手動調整的彈性）
      if (task.status === 'done') task.status = 'todo';
    }
    await task.save();
    return res.json({ task });
  } catch (err) {
    return next(err);
  }
});

// Delete task
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await Task.deleteOne({ _id: id, user: req.userId });
    if (!result.deletedCount) return res.status(404).json({ error: 'Task not found' });
    return res.status(204).send();
  } catch (err) {
    return next(err);
  }
});

// Bulk delete by category (e.g., DELETE /tasks?category=School)
router.delete('/', async (req, res, next) => {
  try {
    const { category } = req.query || {};
    if (!category) return res.status(400).json({ error: 'category is required' });
    const result = await Task.deleteMany({ user: req.userId, category });
    return res.json({ deletedCount: result.deletedCount || 0 });
  } catch (err) {
    return next(err);
  }
});

// Reorder tasks (accept orderedIds array)
router.post('/reorder', async (req, res, next) => {
  try {
    const { orderedIds } = req.body || {};
    if (!Array.isArray(orderedIds) || orderedIds.length === 0) {
      return res.status(400).json({ error: 'orderedIds is required' });
    }
    const bulk = orderedIds.map((id, index) => ({
      updateOne: {
        filter: { _id: id, user: req.userId },
        update: { $set: { order: index } }
      }
    }));
    await Task.bulkWrite(bulk);
    return res.json({ success: true });
  } catch (err) {
    return next(err);
  }
});

export default router;


