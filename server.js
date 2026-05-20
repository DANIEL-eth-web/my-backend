const express = require("express");
const app = express();

app.use(express.json());

// simple in-memory database
let users = {};

// deposit money
app.post("/deposit", (req, res) => {
  const { userId, amount } = req.body;

  if (!users[userId]) {
    users[userId] = { balance: 0 };
  }

  users[userId].balance += Number(amount);

  res.json({
    message: "Deposit successful",
    balance: users[userId].balance
  });
});

// check balance
app.get("/balance/:userId", (req, res) => {
  const user = users[req.params.userId];

  res.json({
    balance: user ? user.balance : 0
  });
});

app.listen(3000, () => console.log("Server running"));
