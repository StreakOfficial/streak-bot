const express = require("express");
const cors = require("cors");
const fs = require("fs");

const app = express();
app.use(cors());
app.use(express.json());

const FILE = "./data.json";

/* =========================
   SAFE DATA SYSTEM
========================= */
function getData() {
  try {
    if (!fs.existsSync(FILE)) return {};
    const raw = fs.readFileSync(FILE, "utf8");
    if (!raw) return {};
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function saveData(data) {
  try {
    fs.writeFileSync(FILE, JSON.stringify(data, null, 2));
  } catch (err) {
    console.log("Save error:", err.message);
  }
}

/* =========================
   SETTINGS SYSTEM
========================= */
app.get("/api/settings", (req, res) => {
  res.json(getData());
});

app.post("/api/settings", (req, res) => {
  const current = getData();
  const updated = { ...current, ...req.body };
  saveData(updated);
  res.json(updated);
});

/* =========================
   EMBED SYSTEM (NEW)
========================= */
let latestEmbed = null;

app.post("/api/embed", (req, res) => {
  latestEmbed = req.body;
  res.json({ success: true });
});

app.get("/api/embed", (req, res) => {
  res.json(latestEmbed);
});

/* =========================
   START SERVER
========================= */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("API running"));
