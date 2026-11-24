import { Router } from "express";
import { pool } from "../db.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();
function isValidDate(date) {
  if (typeof date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return false;
  }

  const parsed = new Date(`${date}T00:00:00Z`);

  return (
    !Number.isNaN(parsed.getTime()) &&
    parsed.toISOString().slice(0, 10) === date
  );
}
router.use(requireAuth);

router.get("/", async (req, res) => {
  try {
    const { month } = req.query;
    const values = [req.user.id];
    let filter = "";
    if (month && /^\d{4}-\d{2}$/.test(month)) {
      values.push(`${month}-01`);
      filter =
        "AND date_trunc('month', transaction_date) = date_trunc('month', $2::date)";
    }
    const result = await pool.query(
      `SELECT id, type, title, category, amount, to_char(transaction_date, 'YYYY-MM-DD') AS date, note
       FROM transactions WHERE user_id = $1 ${filter}
       ORDER BY transaction_date DESC, id DESC`,
      values,
    );
    return res.json(result.rows);
  } catch (error) {
    console.error("Fetch transactions error:", error);
    return res.status(500).json({ message: "Unable to load transactions." });
  }
});

router.post("/", async (req, res) => {
  try {
    const { type, title, category, amount, date, note = "" } = req.body;
    if (
      !["income", "expense"].includes(type) ||
      !title?.trim() ||
      !category?.trim() ||
      title.trim().length > 120 ||
      category.trim().length > 60 ||
      typeof note !== "string" ||
      note.length > 500 ||
      !Number.isFinite(Number(amount)) ||
      Number(amount) <= 0 ||
      !isValidDate(date)
    ) {
      return res
        .status(400)
        .json({ message: "Please provide valid transaction details." });
    }
    const result = await pool.query(
      `INSERT INTO transactions (user_id, type, title, category, amount, transaction_date, note)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, type, title, category, amount, to_char(transaction_date, 'YYYY-MM-DD') AS date, note`,
      [
        req.user.id,
        type,
        title.trim(),
        category.trim(),
        Number(amount),
        date,
        note,
      ],
    );
    return res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Create transaction error:", error);
    return res.status(500).json({ message: "Unable to save transaction." });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const { type, title, category, amount, date, note = "" } = req.body;
    if (
      !["income", "expense"].includes(type) ||
      !title?.trim() ||
      !category?.trim() ||
      title.trim().length > 120 ||
      category.trim().length > 60 ||
      typeof note !== "string" ||
      note.length > 500 ||
      !Number.isFinite(Number(amount)) ||
      Number(amount) <= 0 ||
      !isValidDate(date)
    ) {
      return res
        .status(400)
        .json({ message: "Please provide valid transaction details." });
    }
    const result = await pool.query(
      `UPDATE transactions SET type=$1, title=$2, category=$3, amount=$4,
       transaction_date=$5, note=$6
       WHERE id=$7 AND user_id=$8
       RETURNING id, type, title, category, amount, to_char(transaction_date, 'YYYY-MM-DD') AS date, note`,
      [
        type,
        title.trim(),
        category.trim(),
        Number(amount),
        date,
        note,
        req.params.id,
        req.user.id,
      ],
    );
    if (!result.rowCount)
      return res.status(404).json({ message: "Transaction not found." });
    return res.json(result.rows[0]);
  } catch (error) {
    console.error("Update transaction error:", error);
    return res.status(500).json({ message: "Unable to update transaction." });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const result = await pool.query(
      "DELETE FROM transactions WHERE id=$1 AND user_id=$2",
      [req.params.id, req.user.id],
    );
    if (!result.rowCount)
      return res.status(404).json({ message: "Transaction not found." });
    return res.json({ message: "Transaction deleted." });
  } catch (error) {
    console.error("Delete transaction error:", error);
    return res.status(500).json({ message: "Unable to delete transaction." });
  }
});

export default router;
