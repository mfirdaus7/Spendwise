import { Router } from "express";
import { pool } from "../db.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();
router.use(requireAuth);

router.get("/:month", async (req, res) => {
  try {
    const month = req.params.month;
    const result = await pool.query(
      "SELECT id, month, amount FROM budgets WHERE user_id=$1 AND month=$2",
      [req.user.id, month],
    );
    return res.json(result.rows[0] || { month, amount: 0 });
  } catch (error) {
    console.error("Fetch budget error:", error);
    return res.status(500).json({ message: "Unable to load budget." });
  }
});

router.put("/:month", async (req, res) => {
  try {
    const amount = Number(req.body.amount);
    if (
      !/^\d{4}-\d{2}$/.test(req.params.month) ||
      !Number.isFinite(amount) ||
      amount <= 0
    ) {
      return res
        .status(400)
        .json({ message: "Please provide a valid monthly budget." });
    }
    const result = await pool.query(
      `INSERT INTO budgets (user_id, month, amount) VALUES ($1, $2, $3)
       ON CONFLICT (user_id, month) DO UPDATE SET amount=EXCLUDED.amount
       RETURNING id, month, amount`,
      [req.user.id, req.params.month, amount],
    );
    return res.json(result.rows[0]);
  } catch (error) {
    console.error("Save budget error:", error);
    return res.status(500).json({ message: "Unable to save budget." });
  }
});

export default router;
