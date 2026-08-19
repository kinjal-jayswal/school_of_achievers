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
 * which differ only in table name, their date column name, and an optional
 * set of extra columns (e.g. events' event_type/end_date).
 */
function makeContentRouter({ table, dateColumn, extraFields = [] }) {
    const router = express.Router();
    const extraNames = extraFields.map((f) => f.name);
    const baseCols = ["id", "title", "description", dateColumn, ...extraNames, "created_at"];
    const selectCols = baseCols.join(", ");

    const parseExtraValue = (val, f) => {
        if (val === "true" || val === true) return true;
        if (val === "false" || val === false) return false;
        if (val !== undefined && val !== null && val !== "") return val;
        return f.default !== undefined ? f.default : null;
    };

    router.get("/", async (req, res) => {
        const fetchAll = req.query.all === "true" || Boolean(req.session && req.session.adminId);
        const hasPublishCol = extraNames.includes("is_published");
        let whereClause = "";
        if (!fetchAll && hasPublishCol) {
            whereClause = "WHERE COALESCE(is_published, true) = true AND photo IS NOT NULL";
        }

        const result = await pool.query(
            `SELECT ${selectCols}, (photo IS NOT NULL) AS has_photo
             FROM ${table} ${whereClause} ORDER BY ${dateColumn} DESC NULLS LAST, created_at DESC`
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
        const extraValues = extraFields.map((f) => parseExtraValue(req.body[f.name], f));

        const columns = ["title", "description", dateColumn, ...extraNames, "photo", "photo_mimetype"];
        const placeholders = columns.map((_, i) => `$${i + 1}`).join(", ");
        const values = [title, description || null, date, ...extraValues, photo, photoMimetype];

        const result = await pool.query(
            `INSERT INTO ${table} (${columns.join(", ")})
             VALUES (${placeholders})
             RETURNING ${selectCols}`,
            values
        );
        res.status(201).json(result.rows[0]);
    });

    router.put("/:id", requireAdmin, upload.single("photo"), async (req, res) => {
        const { title, description } = req.body;
        const date = req.body[dateColumn] || null;
        if (!title) {
            return res.status(400).json({ error: "Title is required" });
        }
        const extraValues = extraFields.map((f) => parseExtraValue(req.body[f.name], f));
        const extraSet = extraNames.map((name, i) => `${name} = $${4 + i}`);

        if (req.file) {
            const photoParamIndex = 4 + extraNames.length;
            await pool.query(
                `UPDATE ${table}
                 SET title = $1, description = $2, ${dateColumn} = $3${extraSet.length ? ", " + extraSet.join(", ") : ""},
                     photo = $${photoParamIndex}, photo_mimetype = $${photoParamIndex + 1}
                 WHERE id = $${photoParamIndex + 2}`,
                [title, description || null, date, ...extraValues, req.file.buffer, req.file.mimetype, req.params.id]
            );
        } else {
            const idParamIndex = 4 + extraNames.length;
            await pool.query(
                `UPDATE ${table}
                 SET title = $1, description = $2, ${dateColumn} = $3${extraSet.length ? ", " + extraSet.join(", ") : ""}
                 WHERE id = $${idParamIndex}`,
                [title, description || null, date, ...extraValues, req.params.id]
            );
        }

        const result = await pool.query(
            `SELECT ${selectCols}, (photo IS NOT NULL) AS has_photo FROM ${table} WHERE id = $1`,
            [req.params.id]
        );
        if (!result.rows[0]) {
            return res.status(404).json({ error: "Not found" });
        }
        const row = result.rows[0];
        res.json({ ...row, photo_url: row.has_photo ? `/api/${table}/${row.id}/photo` : null });
    });

    router.patch("/:id/toggle-published", requireAdmin, async (req, res) => {
        if (!extraNames.includes("is_published")) {
            return res.status(400).json({ error: "Table does not support publication toggle" });
        }
        await pool.query(
            `UPDATE ${table}
             SET is_published = NOT COALESCE(is_published, true)
             WHERE id = $1`,
            [req.params.id]
        );
        const result = await pool.query(
            `SELECT ${selectCols}, (photo IS NOT NULL) AS has_photo FROM ${table} WHERE id = $1`,
            [req.params.id]
        );
        if (!result.rows[0]) {
            return res.status(404).json({ error: "Not found" });
        }
        const row = result.rows[0];
        res.json({ ...row, photo_url: row.has_photo ? `/api/${table}/${row.id}/photo` : null });
    });

    router.delete("/:id", requireAdmin, async (req, res) => {
        await pool.query(`DELETE FROM ${table} WHERE id = $1`, [req.params.id]);
        res.status(204).end();
    });

    return router;
}

module.exports = { makeContentRouter };
