import { Router } from "express";
import { pool } from "../db.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();
router.use(requireAuth);

router.get("/", async (req, res) => {
  try {
    const month = /^\d{4}-\d{2}$/.test(req.query.month || "")
      ? req.query.month
      : new Date().toISOString().slice(0, 7);

    const totals = await pool.query(
      `SELECT
        COALESCE(SUM(amount) FILTER (WHERE type='income'), 0) AS income,
        COALESCE(SUM(amount) FILTER (WHERE type='expense'), 0) AS expenses,
        COUNT(*) AS transaction_count
       FROM transactions
       WHERE user_id=$1 AND date_trunc('month', transaction_date)=date_trunc('month', $2::date)`,
      [req.user.id, `${month}-01`],
    );

    const categories = await pool.query(
      `SELECT category, SUM(amount)::numeric(12,2) AS amount
       FROM transactions WHERE user_id=$1 AND type='expense'
       AND date_trunc('month', transaction_date)=date_trunc('month', $2::date)
       GROUP BY category ORDER BY amount DESC`,
      [req.user.id, `${month}-01`],
    );

    const trend = await pool.query(
      `SELECT to_char(transaction_date, 'DD Mon') AS day,
        SUM(amount) FILTER (WHERE type='income') AS income,
        SUM(amount) FILTER (WHERE type='expense') AS expenses
       FROM transactions WHERE user_id=$1 AND transaction_date >= ($2::date - INTERVAL '6 days')
       AND transaction_date < ($2::date + INTERVAL '1 month')
       GROUP BY transaction_date ORDER BY transaction_date`,
      [req.user.id, `${month}-01`],
    );

    return res.json({
      ...totals.rows[0],
      categories: categories.rows,
      trend: trend.rows,
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    return res.status(500).json({ message: "Unable to load dashboard." });
  }
});

export default router;