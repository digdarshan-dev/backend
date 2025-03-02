require("module-alias/register");
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const db = require("@shared/db");
const authMiddleware = require("@shared/middleware/authMiddleware");

const app = express();
const PORT = process.env.USER_SERVICE_PORT || 5002;

app.use(cors());
app.use(express.json());

// Protected route: Get user profile
app.get("/profile", authMiddleware, async (req, res) => {
  try {
    const result = await db.query("SELECT id, email FROM users WHERE id = $1", [req.user.id]);
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: "Error fetching profile" });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 User Service running on port ${PORT}`);
});
