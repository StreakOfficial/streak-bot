const express = require("express");
const cors = require("cors");
const fs = require("fs");

const app = express();
app.use(cors());
app.use(express.json());

const FILE = "./data.json";

function getData() {
  if (!fs.existsSync(FILE)) return {};
  return JSON.parse(fs.readFileSync(FILE, "utf8"));
}

function saveData(data) {
  fs.writeFileSync(FILE, JSON.stringify(data, null, 2));
}

app.get("/api/settings", (req, res) => {
  res.json(getData());
});

app.post("/api/settings", (req, res) => {
  saveData(req.body);
  res.json({ success: true });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("API running"));
let latestEmbed = null;

app.post("/api/embed", (req, res) => {
  latestEmbed = req.body;
  res.json({ success: true });
});

app.get("/api/embed", (req, res) => {
  res.json(latestEmbed);
});
