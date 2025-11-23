import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { List } from '../models/List.js';
import { Task } from '../models/Task.js';

const router = Router();
router.use(requireAuth);

// Get all lists for user
router.get('/', async (req, res, next) => {
  try {
    const lists = await List.find({ user: req.userId }).sort({ order: 1, createdAt: 1 });
    return res.json({ lists });
  } catch (err) { return next(err); }
});

// Create list
router.post('/', async (req, res, next) => {
  try {
    const { name, color = '' } = req.body || {};
    if (!name) return res.status(400).json({ error: 'Name is required' });
    const list = await List.create({ user: req.userId, name, color });
    return res.status(201).json({ list });
  } catch (err) {
    if (err?.code === 11000) return res.status(409).json({ error: 'List name already exists' });
    return next(err);
  }
});

// Update list
router.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, color, order } = req.body || {};
    const update = {};
    if (typeof name !== 'undefined') update.name = name;
    if (typeof color !== 'undefined') update.color = color;
    if (typeof order !== 'undefined') update.order = order;
    const list = await List.findOneAndUpdate({ _id: id, user: req.userId }, update, { new: true });
    if (!list) return res.status(404).json({ error: 'List not found' });
    return res.json({ list });
  } catch (err) { return next(err); }
});

// Delete list
// Reassign tasks to 'general' by default; if ?cascade=1, delete tasks instead
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const cascade = String(req.query?.cascade || '').toLowerCase() === 'true' || req.query?.cascade === '1';
    const list = await List.findOne({ _id: id, user: req.userId });
    if (!list) return res.status(404).json({ error: 'List not found' });
    const listName = list.name;
    await list.deleteOne();
    if (listName) {
      if (cascade) {
        await Task.deleteMany({ user: req.userId, category: listName });
      } else {
        await Task.updateMany({ user: req.userId, category: listName }, { $set: { category: 'general' } });
      }
    }
    return res.status(204).send();
  } catch (err) { return next(err); }
});

export default router;


