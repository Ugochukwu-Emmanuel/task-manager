const db = require('../config/db');

// GET /api/tasks
async function getAllTasks(req, res) {
  try {
    const [rows] = await db.query(
      'SELECT * FROM tasks WHERE user_id = ? ORDER BY due_date IS NULL, due_date ASC',
      [req.userId]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch tasks' });
  }
}

// GET /api/tasks/:id
async function getTaskById(req, res) {
  try {
    const [rows] = await db.query('SELECT * FROM tasks WHERE id = ? AND user_id = ?', [
      req.params.id,
      req.userId,
    ]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Task not found' });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch task' });
  }
}

// POST /api/tasks
async function createTask(req, res) {
  try {
    const { title, description, priority, category, due_date } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ message: 'Title is required' });
    }

    const [result] = await db.query(
      `INSERT INTO tasks (title, description, priority, category, due_date, user_id)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        title.trim(),
        description?.trim() || '',
        priority || 'medium',
        category || 'Other',
        due_date || null,
        req.userId,
      ]
    );

    const [rows] = await db.query('SELECT * FROM tasks WHERE id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to create task' });
  }
}

// PUT /api/tasks/:id
async function updateTask(req, res) {
  try {
    const { id } = req.params;
    const { title, description, status, priority, category, due_date } = req.body;

    const [existing] = await db.query('SELECT * FROM tasks WHERE id = ? AND user_id = ?', [
      id,
      req.userId,
    ]);
    if (existing.length === 0) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const current = existing[0];
const newStatus = status ?? current.status;

// Only stamp completed_at the moment a task actually becomes completed,
// and clear it if it's ever moved back out of that status — so the
// analytics trend reflects real completion events, not just edits.
let completedAt = current.completed_at;
if (newStatus === 'completed' && current.status !== 'completed') {
  completedAt = new Date();
} else if (newStatus !== 'completed' && current.status === 'completed') {
  completedAt = null;
}

await db.query(
  `UPDATE tasks
   SET title = ?, description = ?, status = ?, priority = ?, category = ?, due_date = ?, completed_at = ?
   WHERE id = ? AND user_id = ?`,
  [
    title ?? current.title,
    description ?? current.description,
    newStatus,
    priority ?? current.priority,
    category ?? current.category,
    due_date ?? current.due_date,
    completedAt,
    id,
    req.userId,
  ]
);

    const [rows] = await db.query('SELECT * FROM tasks WHERE id = ?', [id]);
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to update task' });
  }
}

// DELETE /api/tasks/:id
async function deleteTask(req, res) {
  try {
    const [result] = await db.query('DELETE FROM tasks WHERE id = ? AND user_id = ?', [
      req.params.id,
      req.userId,
    ]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Task not found' });
    }
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to delete task' });
  }
}

module.exports = {
  getAllTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
};