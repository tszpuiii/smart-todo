const PRIORITY_RANK = { high: 0, medium: 1, low: 2 };

/** Sort tasks: incomplete first → priority → due date → manual order. */
export function compareTaskPriority(a, b) {
  if (a.completed !== b.completed) return a.completed ? 1 : -1;

  const pa = PRIORITY_RANK[a.priority || 'medium'] ?? 1;
  const pb = PRIORITY_RANK[b.priority || 'medium'] ?? 1;
  if (pa !== pb) return pa - pb;

  const da = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
  const db = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
  if (da !== db) return da - db;

  const oa = typeof a.order === 'number' ? a.order : 0;
  const ob = typeof b.order === 'number' ? b.order : 0;
  return oa - ob;
}

export function sortTasks(tasks) {
  return tasks.slice().sort(compareTaskPriority);
}
