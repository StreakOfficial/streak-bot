const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

/* =========================
   SETTINGS STORAGE
========================= */
let settings = {};

/* =========================
   EMBED QUEUE (SAFE + FIXED)
========================= */
let embedQueue = [];

/* =========================
   SETTINGS API
========================= */
app.get("/api/settings", (req, res) => {
  res.json(settings);
});

app.post("/api/settings", (req, res) => {
  settings = { ...settings, ...req.body };
  res.json(settings);
});

/* =========================
   EMBED API
========================= */
app.post("/api/embed", (req, res) => {
  embedQueue.push(req.body);
  res.json({ success: true });
});

app.get("/api/embed", (req, res) => {
  const item = embedQueue.shift();
  res.json(item || null);
});

/* =========================
   HEALTH CHECK
========================= */
app.get("/", (req, res) => {
  res.send("Streak API Running");
});

/* =========================
   START SERVER
========================= */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("API running on port", PORT));
