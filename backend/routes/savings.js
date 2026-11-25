
import { Router } from "express";
import { pool } from "../db.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();
router.use(requireAuth);

// Get all savings goals
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, name, target_amount, current_amount, target_date, created_at
       FROM savings_goals
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [req.user.id],
    );

    return res.json(result.rows);
  } catch (error) {
    console.error("Fetch savings goals error:", error);
    return res.status(500).json({ message: "Unable to load savings goals." });
  }
});

// Create savings goal
router.post("/", async (req, res) => {
  try {
    const name = String(req.body.name || "").trim();
    const targetAmount = Number(req.body.target_amount);
    const targetDate = req.body.target_date || null;

    if (
      !name ||
      name.length > 120 ||
      !Number.isFinite(targetAmount) ||
      targetAmount <= 0
    ) {
      return res.status(400).json({ message: "Please provide valid savings goal details." });
    }

    const result = await pool.query(
      `INSERT INTO savings_goals (user_id, name, target_amount, target_date)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, target_amount, current_amount, target_date, created_at`,
      [req.user.id, name, targetAmount, targetDate],
    );

    return res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Create savings goal error:", error);
    return res.status(500).json({ message: "Unable to create savings goal." });
  }
});

// Update savings goal
router.put("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const name = String(req.body.name || "").trim();
    const targetAmount = Number(req.body.target_amount);
    const targetDate = req.body.target_date || null;

    if (
      !Number.isInteger(id) ||
      id <= 0 ||
      !name ||
      name.length > 120 ||
      !Number.isFinite(targetAmount) ||
      targetAmount <= 0
    ) {
      return res.status(400).json({ message: "Please provide valid savings goal details." });
    }

    const result = await pool.query(
      `UPDATE savings_goals
       SET name = $1, target_amount = $2, target_date = $3
       WHERE id = $4 AND user_id = $5
       RETURNING id, name, target_amount, current_amount, target_date, created_at`,
      [name, targetAmount, targetDate, id, req.user.id],
    );

    if (!result.rows.length) {
      return res.status(404).json({ message: "Savings goal not found." });
    }

    return res.json(result.rows[0]);
  } catch (error) {
    console.error("Update savings goal error:", error);
    return res.status(500).json({ message: "Unable to update savings goal." });
  }
});

// Add contribution
router.patch("/:id/contribute", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const amount = Number(req.body.amount);

    if (
      !Number.isInteger(id) ||
      id <= 0 ||
      !Number.isFinite(amount) ||
      amount <= 0
    ) {
      return res.status(400).json({ message: "Please provide a valid contribution amount." });
    }

    const result = await pool.query(
      `UPDATE savings_goals
       SET current_amount = current_amount + $1
       WHERE id = $2 AND user_id = $3
       RETURNING id, name, target_amount, current_amount, target_date, created_at`,
      [amount, id, req.user.id],
    );

    if (!result.rows.length) {
      return res.status(404).json({ message: "Savings goal not found." });
    }

    return res.json(result.rows[0]);
  } catch (error) {
    console.error("Add savings contribution error:", error);
    return res.status(500).json({ message: "Unable to add contribution." });
  }
});

// Delete savings goal
router.delete("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ message: "Invalid savings goal ID." });
    }

    const result = await pool.query(
      `DELETE FROM savings_goals
       WHERE id = $1 AND user_id = $2
       RETURNING id`,
      [id, req.user.id],
    );

    if (!result.rows.length) {
      return res.status(404).json({ message: "Savings goal not found." });
    }

    return res.json({ message: "Savings goal deleted successfully." });
  } catch (error) {
    console.error("Delete savings goal error:", error);
    return res.status(500).json({ message: "Unable to delete savings goal." });
  }
});

export default router;
