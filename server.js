const express = require("express");
const app = express();

app.use(express.json());

let balance = 0;

// deposit money
app.post("/deposit", (req, res) => {
  balance += req.body.amount;
  res.json({ message: "Deposit successful", balance });
});

// check balance
app.get("/balance", (req, res) => {
  res.json({ balance });
});

app.listen(3000, () => console.log("Server running"));
