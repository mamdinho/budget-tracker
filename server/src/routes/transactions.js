import { Router } from 'express';
import { z } from 'zod';
import { pool } from '../db.js';
import { authRequired } from '../auth.js';

const router = Router();

// Validation
const CreateTx = z.object({
  type: z.enum(['income', 'expense']),
  amount: z.number().nonnegative(),
  category: z.string().min(1),
  note: z.string().optional(),
  occurred_at: z.string().datetime().optional() // ISO string
});

const UpdateTx = CreateTx.partial();

router.use(authRequired());

// Create
router.post('/', async (req, res) => {
  try {
    const body = CreateTx.parse(req.body);
    const { type, amount, category, note, occurred_at } = body;

    const q = `
      INSERT INTO transactions (user_id, type, amount, category, note, occurred_at)
      VALUES ($1,$2,$3,$4,$5, COALESCE($6, now()))
      RETURNING *`;
    const { rows } = await pool.query(q, [
      req.user.sub,
      type,
      amount,
      category,
      note ?? null,
      occurred_at ?? null
    ]);

    res.status(201).json(rows[0]);
  } catch (e) {
    if (e.name === 'ZodError') return res.status(400).json({ error: e.errors });
    console.error(e);
    res.status(500).json({ error: 'Failed to create transaction' });
  }
});

// List with filters & pagination  ✅ returns { items, total, page, pageSize }
router.get('/', async (req, res) => {
  try {
    const { from, to, category, type, page = 1, pageSize = 20 } = req.query;

    const where = ['user_id = $1'];
    const params = [req.user.sub];
    let i = 2;

    if (type) { where.push(`type = $${i++}`); params.push(type); }
    if (category) { where.push(`category = $${i++}`); params.push(category); }
    if (from) { where.push(`occurred_at >= $${i++}`); params.push(new Date(from)); }
    if (to) { where.push(`occurred_at < $${i++}`); params.push(new Date(to)); }

    const limit = Math.min(Math.max(parseInt(pageSize, 10) || 20, 1), 100);
    const curPg = Math.max(parseInt(page, 10) || 1, 1);
    const offset = (curPg - 1) * limit;

    const listQ = `
      SELECT * FROM transactions
      WHERE ${where.join(' AND ')}
      ORDER BY occurred_at DESC
      LIMIT $${i} OFFSET $${i + 1}`;
    const listParams = [...params, limit, offset];

    const countQ = `SELECT COUNT(*) AS count FROM transactions WHERE ${where.join(' AND ')}`;

    const [list, cnt] = await Promise.all([
      pool.query(listQ, listParams),
      pool.query(countQ, params),
    ]);

    res.json({
      items: list.rows,
      total: Number(cnt.rows[0].count || 0),
      page: curPg,
      pageSize: limit,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

// Category suggestions  ✅ /api/transactions/categories?q=Fo&type=expense
router.get('/categories', async (req, res) => {
  try {
    const { q = '', type } = req.query;
    const where = ['user_id = $1'];
    const params = [req.user.sub];
    let i = 2;

    if (type) { where.push(`type = $${i++}`); params.push(type); }
    if (q) { where.push(`category ILIKE $${i++}`); params.push(`${q}%`); }

    const sql = `
      SELECT DISTINCT category
      FROM transactions
      WHERE ${where.join(' AND ')}
      ORDER BY category ASC
      LIMIT 50`;
    const { rows } = await pool.query(sql, params);
    res.json(rows.map(r => r.category));
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});


// Get one
router.get('/:id', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM transactions WHERE id=$1 AND user_id=$2',
      [req.params.id, req.user.sub]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Not found' });
    res.json(rows[0]);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to fetch transaction' });
  }
});

// Update
router.put('/:id', async (req, res) => {
  try {
    const body = UpdateTx.parse(req.body);

    // Build dynamic update
    const fields = [];
    const params = [];
    let i = 1;
    for (const [k, v] of Object.entries(body)) {
      fields.push(`${k}=$${i++}`);
      params.push(k === 'occurred_at' ? new Date(v) : v);
    }
    params.push(new Date(), req.params.id, req.user.sub);

    const q = `
      UPDATE transactions
      SET ${fields.length ? fields.join(', ') + ',' : ''} updated_at=$${i++}
      WHERE id=$${i++} AND user_id=$${i}
      RETURNING *`;

    const { rows } = await pool.query(q, params);
    if (!rows[0]) return res.status(404).json({ error: 'Not found' });
    res.json(rows[0]);
  } catch (e) {
    if (e.name === 'ZodError') return res.status(400).json({ error: e.errors });
    console.error(e);
    res.status(500).json({ error: 'Failed to update transaction' });
  }
});

// Delete
router.delete('/:id', async (req, res) => {
  try {
    const { rowCount } = await pool.query(
      'DELETE FROM transactions WHERE id=$1 AND user_id=$2',
      [req.params.id, req.user.sub]
    );
    if (!rowCount) return res.status(404).json({ error: 'Not found' });
    res.status(204).send();
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to delete transaction' });
  }
});

export default router;
