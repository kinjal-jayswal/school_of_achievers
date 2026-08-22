require("dotenv").config({ quiet: true });

const path = require("path");
const express = require("express");
const session = require("express-session");
const pgSession = require("connect-pg-simple")(session);

const { pool, initSchema } = require("./db");
const { router: authRouter } = require("./auth");
const eventsRouter = require("./routes/events");
const resultsRouter = require("./routes/results");

const app = express();
const PORT = process.env.PORT || 3000;

// Railway terminates HTTPS at its edge and forwards plain HTTP internally.
// Without this, Express can't tell the original request was secure, and
// express-session silently drops the Secure cookie instead of setting it.
app.set("trust proxy", 1);

app.use(express.json());
app.use(
    session({
        store: new pgSession({ pool, createTableIfMissing: true }),
        secret: process.env.SESSION_SECRET || "dev-only-insecure-secret",
        resave: false,
        saveUninitialized: false,
        cookie: {
            httpOnly: true,
            sameSite: "lax",
            secure: process.env.NODE_ENV === "production",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        },
    })
);

app.use("/api/admin", authRouter);
app.use("/api/events", eventsRouter);
app.use("/api/results", resultsRouter);

// Admin panel: served directly as static files, not part of the Vite build.
app.use("/admin", express.static(path.join(__dirname, "..", "admin")));

// Serve public static assets directly (including Chiloda album)
app.use("/assets", express.static(path.join(__dirname, "..", "public", "assets")));

// Public site: Vite-built multi-page output. No catch-all fallback here —
// this is a true multi-page site, and an index.html fallback would silently
// send unmatched routes back to the home page instead of 404ing.
app.use(express.static(path.join(__dirname, "..", "dist")));


// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
    console.error(err);
    const status = err.message && err.message.includes("Only JPEG, PNG, or WEBP") ? 400 : 500;
    res.status(status).json({ error: err.message || "Server error" });
});

initSchema()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Server listening on port ${PORT}`);
        });
    })
    .catch((err) => {
        console.error("Failed to initialize database schema", err);
        process.exit(1);
    });
