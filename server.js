const express = require("express");
const cors = require("cors");
const fs = require("fs");

const app = express();
app.use(cors());
app.use(express.json());

const FILE = "./data.json";

/* -------- READ DATA -------- */
function getData() {
  if (!fs.existsSync(FILE)) return {};
  return JSON.parse(fs.readFileSync(FILE, "utf8"));
}

/* -------- SAVE DATA -------- */
function saveData(data) {
  fs.writeFileSync(FILE, JSON.stringify(data, null, 2));
}

/* -------- GET -------- */
app.get("/api/settings", (req, res) => {
  res.json(getData());
});

/* -------- POST -------- */
app.post("/api/settings", (req, res) => {
  const updated = { ...getData(), ...req.body };
  saveData(updated);
  res.json(updated);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("API running"));
