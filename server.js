const express = require("express");
const { createClient } = require("@supabase/supabase-js");

const app = express();
app.use(express.json());

// ✅ CONNECT SUPABASE
const supabase = createClient(
  "https://ppkpbvbjjxuzekyhltte.supabase.co",
  "YOUR_SERVICE_ROLE_KEY"
);

// ======================
// 💰 DEPOSIT ROUTE
// ======================
app.post("/deposit", async (req, res) => {
  const { userId, crypto_type, amount, transaction_hash, proof_image_url } = req.body;

  try {
    // 1. Save deposit
    await supabase.from("deposits").insert([
      {
        user_id: userId,
        crypto_type,
        amount,
        transaction_hash,
        proof_image_url
      }
    ]);

    // 2. Get user
    let { data: user } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .single();

    // 3. Create or update balance
    if (!user) {
      await supabase.from("users").insert([
        { id: userId, balance: amount }
      ]);
    } else {
      await supabase
        .from("users")
        .update({ balance: Number(user.balance) + Number(amount) })
        .eq("id", userId);
    }

    res.json({ message: "Deposit saved permanently ✔️" });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ======================
// 💼 BALANCE ROUTE
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
app.listen(3000, () => console.log("Server running"));
