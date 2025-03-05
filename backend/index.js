const express = require("express");
const cors = require("cors");
const crypto = require("crypto");
const mongoose = require("mongoose");
require("dotenv").config();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

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
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true }, 
    password: { type: String, required: true },
    balance: { type: Number, default: 1000 },
  });
  
  playerSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
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


app.post("/signup", async (req, res) => {
  console.log(req.body)
  try {
    const { name, email, password } = req.body;

    const existingUser = await Player.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }
    console.log("existingUser", existingUser)

    const newPlayer = new Player({ name, email, password });
    await newPlayer.save();
    console.log(newPlayer)

    res.status(201).json({ message: "Signup successful!" });
  } catch (error) {
    res.status(500).json({ message: "Error signing up", error });
    console.log(error)

  }
});

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const player = await Player.findOne({ email });
    if (!player) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, player.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign({ id: player._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

    res.json({ message: "Login successful", token });
    console.log("logged in")
  } catch (error) {
    res.status(500).json({ message: "Error logging in", error });
    console.log("login error", error)
  }
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

app.get("/user_details", async (req, res) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token) return res.status(401).json({ message: "Unauthorized" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id; 

    const user = await Player.findById(userId).select("name balance");

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ name: user.name, balance: user.balance });
  } catch (error) {
    console.error("error", error);
    res.status(500).json({ message: "Server error" });
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
  const token = req.header("Authorization")?.replace("Bearer ", "");

  if (!token) return res.status(401).json({ error: "Unauthorized" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    if (!currentServerSeed || !currentServerSeedHash) {
      return res.status(400).json({ error: "Request server seed hash first." });
    }
    if (typeof bet_amount !== "number" || bet_amount <= 0) {
      return res.status(400).json({ error: "Invalid bet amount." });
    }
    if (!client_seed) {
      return res.status(400).json({ error: "Client seed is required." });
    }

    let player = await Player.findById(userId);
    console.log("player", player)
    if (!player) {
      return res.status(404).json({ error: "User not found." });
    }

    if (bet_amount > player.balance) {
      return res.status(400).json({ error: "Insufficient balance." });
    }

    const combined = currentServerSeed + client_seed;
    const hash = crypto.createHash("sha256").update(combined).digest("hex");
    const roll = (parseInt(hash.substr(0, 8), 16) % 6) + 1;

    let winnings = 0;
    let result = "lose";

    if (roll >= 4) {
      winnings = bet_amount * 2;
      result = "win";
    }

    const updatedPlayer = await Player.findByIdAndUpdate(
      userId,
      { $inc: { balance: winnings - bet_amount } }, 
      { new: true } 
    );
    console.log("player", updatedPlayer)


    if (!updatedPlayer) {
      return res.status(500).json({ error: "Failed to update user balance." });
    }

    console.log("Updated player balance:", updatedPlayer.balance);

    await RollHistory.create({
      userId: player._id,
      betAmount: bet_amount,
      clientSeed: client_seed,
      serverSeed: currentServerSeed,
      serverSeedHash: currentServerSeedHash,
      roll: roll,
      result: result,
      winnings: winnings,
    });

    currentServerSeed = null;
    currentServerSeedHash = null;

    res.json({
      roll,
      result,
      winnings,
      new_balance: updatedPlayer.balance,
    });
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
  console.log(`Server running on https://dice-game-test-aqcp.onrender.com`);
});
