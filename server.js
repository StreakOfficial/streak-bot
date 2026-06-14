const express = require("express");
const cors = require("cors");
const fs = require("fs");

const app = express();
app.use(cors());
app.use(express.json());

const FILE = "./data.json";

/* -------- READ DATA (SAFE VERSION) -------- */
function getData() {
  try {
    if (!fs.existsSync(FILE)) return {};

    const raw = fs.readFileSync(FILE, "utf8");

    // prevents crash if file is empty or broken
    if (!raw) return {};

    return JSON.parse(raw);

  } catch (err) {
    console.log("Data read error:", err.message);
    return {}; // fallback so server never crashes
  }
}

/* -------- SAVE DATA (SAFE VERSION) -------- */
function saveData(data) {
  try {
    fs.writeFileSync(FILE, JSON.stringify(data, null, 2));
  } catch (err) {
    console.log("Data save error:", err.message);
  }
}

/* -------- GET -------- */
app.get("/api/settings", (req, res) => {
  res.json(getData());
});

/* -------- POST -------- */
app.post("/api/settings", (req, res) => {
  const current = getData();

  // merge safely (does NOT delete existing values)
  const updated = {
    ...current,
    ...req.body
  };

  saveData(updated);
  res.json(updated);
});

/* -------- START SERVER -------- */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("API running"));
