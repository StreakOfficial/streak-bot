const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

/* =========================
   SIMPLE IN-MEMORY QUEUE
========================= */
const embedQueue = [];

/* =========================
   SETTINGS STORAGE
========================= */
let settings = {};

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
   EMBED QUEUE SYSTEM (UPGRADED)
========================= */
app.post("/api/embed", (req, res) => {
  embedQueue.push(req.body);
  res.json({ success: true, queued: true });
});

app.get("/api/embed", (req, res) => {
  const item = embedQueue.shift(); // FIFO queue
  res.json(item || null);
});

/* =========================
   HEALTH CHECK
========================= */
app.get("/", (req, res) => {
  res.send("Streak API Online");
});

/* =========================
   START
========================= */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("API running on port", PORT));
