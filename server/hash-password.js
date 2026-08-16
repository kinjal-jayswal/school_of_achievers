// One-off local utility: prints a bcrypt hash for ADMIN_PASSWORD_HASH.
// Usage: node server/hash-password.js "your-chosen-password"
const bcrypt = require("bcryptjs");

const password = process.argv[2];
if (!password) {
    console.error("Usage: node server/hash-password.js <password>");
    process.exit(1);
}

bcrypt.hash(password, 10).then((hash) => {
    console.log(hash);
});
