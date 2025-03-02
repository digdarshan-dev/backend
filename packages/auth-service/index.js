require("module-alias/register");
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const supabase = require("@shared/db"); // Supabase client
const { hashPassword, comparePassword, generateToken } = require("@shared/utils/auth");

const app = express();
const PORT = process.env.AUTH_SERVICE_PORT || 5001;

app.use(cors());
app.use(express.json());

// 🚀 User Registration
app.post("/register", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: "Email and password are required" });
  }

  try {
    // Check if user already exists
    const { data: existingUser, error: findError } = await supabase
      .from("users")
      .select("email")
      .eq("email", email)
      .single();

    if (existingUser) {
      return res.status(409).json({ success: false, message: "User already registered" });
    }

    // Hash password and insert user
    const hashedPassword = await hashPassword(password);

    const { data, error } = await supabase
      .from("users")
      .insert([{ email, password: hashedPassword }]);

    if (error) throw error;

    res.status(201).json({ success: true, message: "User registered successfully" });
  } catch (error) {
    console.error("❌ Error registering user:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

// 🚀 User Login
// 🚀 User Login (Fixed)
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: "Email and password are required" });
  }

  try {
    // ✅ Fetch user from the database (Fix: single() to get one user)
    const { data: users, error } = await supabase
      .from("users")
      .select("id, email, password")
      .eq("email", email); // Using `eq` for exact match

    if (error) {
      console.error("❌ Supabase error:", error);
      return res.status(500).json({ success: false, message: "Database error" });
    }

    console.log("✅ Supabase response:", users); // Debugging

    // ✅ Ensure user exists
    if (!users || users.length === 0) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    const user = users[0]; // Extract first user object

    // ✅ Compare Password (Fix: `user.password` exists now)
    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }
    // ✅ Generate JWT Token
    const token = generateToken({ id: user.id, email: user.email });

    res.json({
      success: true,
      message: "Login successful",
      token,
      user: { id: user.id, email: user.email },
    });
  } catch (error) {
    console.error("❌ Error logging in:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});



// 🚀 Server Start
app.listen(PORT, () => {
  console.log(`✅ Auth Service running on port ${PORT}`);
});
