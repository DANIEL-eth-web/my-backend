const express = require("express");
const { createClient } = require("@supabase/supabase-js");

const app = express();
app.use(express.json());

// ======================
// 🌍 ROOT ROUTES
// ======================

app.get("/", (req, res) => {
  res.send("Backend running successfully");
});

app.get("/test-admin", (req, res) => {
  res.json({
    success: true,
    message: "Admin routes loaded"
  });
});

// ======================
// ✅ SUPABASE CONNECTION
// ======================

const supabase = createClient(
  "https://ppkpbvbjjxuzekyhltte.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBwa3BidmJqanh1emVreWhsdHRlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTI5MTU5MCwiZXhwIjoyMDk0ODY3NTkwfQ.5Kh_fAKHcv60VKh26IbK2SxxUdA4jvM7P2OW0XooW7E"
);

// ======================
// 💰 DEPOSIT ROUTE
// ======================

app.post("/deposit", async (req, res) => {
  const {
    userId,
    crypto_type,
    amount,
    transaction_hash,
    proof_image_url
  } = req.body;

  try {
    // Save deposit
    await supabase.from("deposits").insert([
      {
        user_id: userId,
        crypto_type,
        amount,
        transaction_hash,
        proof_image_url
      }
    ]);

    // Get user
    let { data: user } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .single();

    // Create or update user
    if (!user) {
      await supabase.from("users").insert([
        {
          id: userId,
          balance: Number(amount),
          status: "active"
        }
      ]);
    } else {
      await supabase
        .from("users")
        .update({
          balance: Number(user.balance || 0) + Number(amount)
        })
        .eq("id", userId);
    }

    res.json({
      success: true,
      message: "Deposit saved successfully"
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ======================
// 💼 GET BALANCE
// ======================

app.get("/balance/:userId", async (req, res) => {
  const { data, error } = await supabase
    .from("users")
    .select("balance")
    .eq("id", req.params.userId)
    .single();

  if (error || !data) {
    return res.json({ balance: 0 });
  }

  res.json({ balance: data.balance });
});

// ======================
// 🔐 ADMIN AUTH
// ======================

const ADMIN_KEY = "my_admin_key_4839_virstra_secure";

function checkAdmin(req, res, next) {
  if (req.headers["admin-key"] !== ADMIN_KEY) {
    return res.status(403).json({ error: "Not allowed" });
  }
  next();
}

// ======================
// 👀 GET ALL USERS
// ======================

app.get("/admin/users", checkAdmin, async (req, res) => {
  const { data, error } = await supabase
    .from("users")
    .select("*");

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json(data);
});

// ======================
// 💰 UPDATE BALANCE
// ======================

app.post("/admin/update-balance", checkAdmin, async (req, res) => {
  const { userId, amount } = req.body;

  const { error } = await supabase
    .from("users")
    .update({
      balance: Number(amount)
    })
    .eq("id", userId);

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json({
    success: true,
    message: "Balance updated"
  });
});

// ======================
// 🚫 SUSPEND USER
// ======================

app.post("/admin/suspend-user", checkAdmin, async (req, res) => {
  const { userId } = req.body;

  const { error } = await supabase
    .from("users")
    .update({
      status: "suspended"
    })
    .eq("id", userId);

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json({
    success: true,
    message: "User suspended"
  });
});

// ======================
// 🚀 START SERVER
// ======================

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
