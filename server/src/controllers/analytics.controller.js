const db = require('../config/db');

// GET /api/analytics/summary
// Counts grouped by status, priority, and category — the "shape" of your
// current workload, as opposed to a trend over time.
async function getSummary(req, res) {
  try {
    const { userId } = req;

    const [byStatus] = await db.query(
      'SELECT status, COUNT(*) AS count FROM tasks WHERE user_id = ? GROUP BY status',
      [userId]
    );
    const [byPriority] = await db.query(
      'SELECT priority, COUNT(*) AS count FROM tasks WHERE user_id = ? GROUP BY priority',
      [userId]
    );
    const [byCategory] = await db.query(
      'SELECT category, COUNT(*) AS count FROM tasks WHERE user_id = ? GROUP BY category ORDER BY count DESC',
      [userId]
    );

    res.json({ byStatus, byPriority, byCategory });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to load analytics summary' });
  }
}

// GET /api/analytics/trend?days=30
// Tasks created vs. completed per day, for the last N days — a real
// productivity trend rather than a single snapshot count.
async function getTrend(req, res) {
  try {
    const { userId } = req;
    const days = Math.min(parseInt(req.query.days, 10) || 30, 90);

    const [created] = await db.query(
      `SELECT DATE(created_at) AS day, COUNT(*) AS count
       FROM tasks
       WHERE user_id = ? AND created_at >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
       GROUP BY DATE(created_at)`,
      [userId, days]
    );

    const [completed] = await db.query(
      `SELECT DATE(completed_at) AS day, COUNT(*) AS count
       FROM tasks
       WHERE user_id = ? AND completed_at IS NOT NULL
         AND completed_at >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
       GROUP BY DATE(completed_at)`,
      [userId, days]
    );

    // Build a complete day-by-day series, including days with zero activity,
    // so the chart doesn't have gaps or a misleading x-axis.
    const createdMap = Object.fromEntries(created.map((r) => [r.day, r.count]));
    const completedMap = Object.fromEntries(completed.map((r) => [r.day, r.count]));

    const series = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      series.push({
        date: key,
        created: createdMap[key] || 0,
        completed: completedMap[key] || 0,
      });
    }

    res.json(series);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to load analytics trend' });
  }
}

module.exports = { getSummary, getTrend };