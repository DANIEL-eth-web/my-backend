app.listen(3000, () => console.log("Server running"));
// ======================
// 🔐 ADMIN SECURITY
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
// 💰 UPDATE USER BALANCE
// ======================

app.post("/admin/update-balance", checkAdmin, async (req, res) => {
  const { userId, amount } = req.body;

  const { error } = await supabase
    .from("users")
    .update({ balance: Number(amount) })
    .eq("id", userId);

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json({
    message: "Balance updated successfully"
  });
});

// ======================
// 🚫 SUSPEND USER
// ======================

app.post("/admin/suspend-user", checkAdmin, async (req, res) => {
  const { userId } = req.body;

  const { error } = await supabase
    .from("users")
    .update({ status: "suspended" })
    .eq("id", userId);

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json({
    message: "User suspended successfully"
  });
});
