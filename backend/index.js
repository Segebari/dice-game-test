const express = require("express");
const cors = require("cors");
const crypto = require("crypto");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();


app.use(cors());
app.use(express.json());

mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));


const playerSchema = new mongoose.Schema({
  balance: { type: Number, default: 1000 },
});

const Player = mongoose.model("Player", playerSchema);


const rollHistorySchema = new mongoose.Schema({
  timestamp: { type: Date, default: Date.now },
  betAmount: Number,
  clientSeed: String,
  serverSeed: String,
  serverSeedHash: String,
  roll: Number,
  result: String,
  winnings: Number,
});

const RollHistory = mongoose.model("RollHistory", rollHistorySchema);


let currentServerSeed = null;
let currentServerSeedHash = null;


app.get("/", (req, res) => {
  res.send("Dice Game Server is running!");
});


app.get("/balance", async (req, res) => {
  try {
    let player = await Player.findOne();
    if (!player) {
      player = await Player.create({ balance: 1000 });
    }
    res.json({ balance: player.balance });
  } catch (error) {
    console.error("Error fetching balance:", error);
    res.status(500).json({ error: "Server error" });
  }
});


app.get("/get-server-seed-hash", (req, res) => {
  try {
   
    currentServerSeed = crypto.randomBytes(32).toString("hex");

    
    currentServerSeedHash = crypto
      .createHash("sha256")
      .update(currentServerSeed)
      .digest("hex");

    res.json({ server_seed_hash: currentServerSeedHash });
  } catch (error) {
    console.error("Error generating server seed:", error);
    res.status(500).json({ error: "Server seed generation failed" });
  }
});


app.post("/roll-dice", async (req, res) => {
  const { bet_amount, client_seed } = req.body;

 
  if (!currentServerSeed || !currentServerSeedHash) {
    return res.status(400).json({ error: "Request server seed hash first." });
  }
  if (typeof bet_amount !== "number" || bet_amount <= 0) {
    return res.status(400).json({ error: "Invalid bet amount." });
  }
  if (!client_seed) {
    return res.status(400).json({ error: "Client seed is required." });
  }

  try {
    
    let player = await Player.findOne();
    if (!player) {
      player = await Player.create({ balance: 1000 });
    }

    
    if (bet_amount > player.balance) {
      return res.status(400).json({ error: "Insufficient balance." });
    }

    
    const combined = currentServerSeed + client_seed;
    const hash = crypto.createHash("sha256").update(combined).digest("hex");
    const roll = (parseInt(hash.substr(0, 8), 16) % 6) + 1;

    
    player.balance -= bet_amount;
    let winnings = 0;
    let result = "lose";

    if (roll >= 4) {
      winnings = bet_amount * 2;
      player.balance += winnings;
      result = "win";
    }

    
    await player.save();

    
    await RollHistory.create({
      betAmount: bet_amount,
      clientSeed: client_seed,
      serverSeed: currentServerSeed,
      serverSeedHash: currentServerSeedHash,
      roll: roll,
      result: result,
      winnings: winnings,
    });

    
    const response = {
      roll,
      server_seed: currentServerSeed,
      balance: player.balance,
      winnings,
    };

    
    currentServerSeed = null;
    currentServerSeedHash = null;

    res.json(response);
  } catch (error) {
    console.error("Error rolling dice:", error);
    res.status(500).json({ error: "Server error" });
  }
});


app.get("/verify-roll/:rollId", async (req, res) => {
  try {
    const roll = await RollHistory.findById(req.params.rollId);
    if (!roll) {
      return res.status(404).json({ error: "Roll not found" });
    }

    
    const combined = roll.serverSeed + roll.clientSeed;
    const hash = crypto.createHash("sha256").update(combined).digest("hex");
    const verifiedRoll = (parseInt(hash.substr(0, 8), 16) % 6) + 1;

    res.json({
      originalRoll: roll.roll,
      verifiedRoll: verifiedRoll,
      match: verifiedRoll === roll.roll,
    });
  } catch (error) {
    console.error("Verification error:", error);
    res.status(500).json({ error: "Verification failed" });
  }
});


const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
