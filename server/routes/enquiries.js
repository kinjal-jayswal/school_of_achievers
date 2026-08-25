const express = require("express");
const { pool } = require("../db");
const { requireAdmin } = require("../auth");

const router = express.Router();

// Public: Submit a new enquiry from website forms
router.post("/", async (req, res, next) => {
    try {
        const { parent_name, email, phone, campus, message } = req.body || {};

        if (!parent_name || !phone || !campus) {
            return res.status(400).json({ error: "Parent Name, Phone Number, and Campus are required fields." });
        }

        const query = `
            INSERT INTO enquiries (parent_name, email, phone, campus, message, status)
            VALUES ($1, $2, $3, $4, $5, 'pending')
            RETURNING id, created_at;
        `;
        const values = [
            String(parent_name).trim(),
            email ? String(email).trim() : null,
            String(phone).trim(),
            String(campus).trim(),
            message ? String(message).trim() : null
        ];

        const result = await pool.query(query, values);
        const row = result.rows[0];

        res.status(201).json({
            success: true,
            id: row.id,
            created_at: row.created_at,
            message: "Thank you! Your enquiry has been submitted successfully."
        });
    } catch (err) {
        next(err);
    }
});

// Admin: Get all submitted enquiries
router.get("/", requireAdmin, async (req, res, next) => {
    try {
        const result = await pool.query(`
            SELECT id, parent_name, email, phone, campus, message, status, created_at
            FROM enquiries
            ORDER BY created_at DESC;
        `);
        res.json(result.rows);
    } catch (err) {
        next(err);
    }
});

// Admin: Update enquiry status (pending / contacted / enrolled)
router.patch("/:id/status", requireAdmin, async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status } = req.body || {};

        if (!status || !["pending", "contacted", "enrolled"].includes(status)) {
            return res.status(400).json({ error: "Valid status ('pending', 'contacted', 'enrolled') is required." });
        }

        const result = await pool.query(
            "UPDATE enquiries SET status = $1 WHERE id = $2 RETURNING *;",
            [status, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Enquiry not found." });
        }

        res.json(result.rows[0]);
    } catch (err) {
        next(err);
    }
});

// Admin: Delete enquiry
router.delete("/:id", requireAdmin, async (req, res, next) => {
    try {
        const { id } = req.params;
        const result = await pool.query("DELETE FROM enquiries WHERE id = $1 RETURNING id;", [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Enquiry not found." });
        }
        res.json({ success: true, id: Number(id) });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
