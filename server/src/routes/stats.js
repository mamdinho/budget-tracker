import { Router } from 'express';
import { pool } from '../db.js';
import { authRequired } from '../auth.js';

const router = Router();
router.use(authRequired());

router.get('/summary', async (req, res) => {
  try {
    const { from, to } = req.query;
    const where = ['user_id = $1'];
    const params = [req.user.sub];
    let i = params.length + 1;
    if (from) { where.push(`occurred_at >= $${i++}`); params.push(new Date(from)); }
    if (to)   { where.push(`occurred_at <  $${i++}`); params.push(new Date(to)); }

    const base = `FROM transactions WHERE ${where.join(' AND ')}`;

    const totalQ = `
      SELECT
        COALESCE(SUM(CASE WHEN type='income'  THEN amount END), 0)  AS income,
        COALESCE(SUM(CASE WHEN type='expense' THEN amount END), 0)  AS expense
      ${base}`;

    const catExpenseQ = `
      SELECT category, SUM(amount) AS total
      ${base} AND type='expense'
      GROUP BY category
      ORDER BY total DESC`;

    const catIncomeQ = `
      SELECT category, SUM(amount) AS total
      ${base} AND type='income'
      GROUP BY category
      ORDER BY total DESC`;

    const [totals, byExp, byInc] = await Promise.all([
      pool.query(totalQ, params),
      pool.query(catExpenseQ, params),
      pool.query(catIncomeQ, params),
    ]);

    res.json({
      income: totals.rows[0]?.income || '0',
      expense: totals.rows[0]?.expense || '0',
      byExpenseCategory: byExp.rows,  // [{category, total}]
      byIncomeCategory: byInc.rows    // [{category, total}]
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to compute summary' });
  }
});

export default router;
