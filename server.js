const express = require("express");
const cors = require("cors");
const fs = require("fs");

const app = express();

app.use(cors());
app.use(express.json());

const FILE = "./data.json";

function getData() {
  if (!fs.existsSync(FILE)) return {};
  return JSON.parse(fs.readFileSync(FILE));
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

app.listen(process.env.PORT || 3000, () => {
  console.log("API running");
});
