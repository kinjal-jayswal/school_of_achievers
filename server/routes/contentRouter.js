const express = require("express");
const multer = require("multer");
const { pool } = require("../db");
const { requireAdmin } = require("../auth");

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowed = ["image/jpeg", "image/png", "image/webp"];
        if (allowed.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error("Only JPEG, PNG, or WEBP photos are allowed"));
        }
    },
});

/**
 * Builds an identical CRUD router for a content table (events/results),
 * which differ only in table name and their date column name.
 */
function makeContentRouter({ table, dateColumn }) {
    const router = express.Router();

    router.get("/", async (req, res) => {
        const result = await pool.query(
            `SELECT id, title, description, ${dateColumn}, created_at, (photo IS NOT NULL) AS has_photo
             FROM ${table} ORDER BY ${dateColumn} DESC NULLS LAST, created_at DESC`
        );
        const rows = result.rows.map((row) => ({
            ...row,
            photo_url: row.has_photo ? `/api/${table}/${row.id}/photo` : null,
        }));
        res.json(rows);
    });

    router.get("/:id/photo", async (req, res) => {
        const result = await pool.query(
            `SELECT photo, photo_mimetype FROM ${table} WHERE id = $1`,
            [req.params.id]
        );
        const row = result.rows[0];
        if (!row || !row.photo) {
            return res.status(404).end();
        }
        res.set("Content-Type", row.photo_mimetype || "application/octet-stream");
        res.set("Cache-Control", "public, max-age=31536000, immutable");
        res.send(row.photo);
    });

    router.post("/", requireAdmin, upload.single("photo"), async (req, res) => {
        const { title, description } = req.body;
        const date = req.body[dateColumn] || null;
        if (!title) {
            return res.status(400).json({ error: "Title is required" });
        }
        const photo = req.file ? req.file.buffer : null;
        const photoMimetype = req.file ? req.file.mimetype : null;

        const result = await pool.query(
            `INSERT INTO ${table} (title, description, ${dateColumn}, photo, photo_mimetype)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING id, title, description, ${dateColumn}, created_at`,
            [title, description || null, date, photo, photoMimetype]
        );
        res.status(201).json(result.rows[0]);
    });

    router.put("/:id", requireAdmin, upload.single("photo"), async (req, res) => {
        const { title, description } = req.body;
        const date = req.body[dateColumn] || null;
        if (!title) {
            return res.status(400).json({ error: "Title is required" });
        }

        if (req.file) {
            await pool.query(
                `UPDATE ${table}
                 SET title = $1, description = $2, ${dateColumn} = $3, photo = $4, photo_mimetype = $5
                 WHERE id = $6`,
                [title, description || null, date, req.file.buffer, req.file.mimetype, req.params.id]
            );
        } else {
            await pool.query(
                `UPDATE ${table}
                 SET title = $1, description = $2, ${dateColumn} = $3
                 WHERE id = $4`,
                [title, description || null, date, req.params.id]
            );
        }

        const result = await pool.query(
            `SELECT id, title, description, ${dateColumn}, created_at, (photo IS NOT NULL) AS has_photo
             FROM ${table} WHERE id = $1`,
            [req.params.id]
        );
        if (!result.rows[0]) {
            return res.status(404).json({ error: "Not found" });
        }
        res.json(result.rows[0]);
    });

    router.delete("/:id", requireAdmin, async (req, res) => {
        await pool.query(`DELETE FROM ${table} WHERE id = $1`, [req.params.id]);
        res.status(204).end();
    });

    return router;
}

module.exports = { makeContentRouter };
