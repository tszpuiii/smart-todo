import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { suggestWithAI } from '../services/ai.js';

const router = Router();
router.use(requireAuth);

router.post('/suggest', async (req, res, next) => {
  try {
    const { title = '', description = '' } = req.body || {};
    const suggestion = await suggestWithAI({ title, description });
    return res.json({ suggestion });
  } catch (err) {
    return next(err);
  }
});

export default router;


