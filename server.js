const express = require("express");
const app = express();

const { Client, GatewayIntentBits } = require("discord.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildPresences
  ]
});

client.login(process.env.TOKEN);

let guild;

client.once("ready", async () => {
  console.log("API ready");

  guild = await client.guilds.fetch("1514193041802661919");
});

app.get("/stats", async (req, res) => {
  const members = guild.memberCount;

  const online = guild.members.cache.filter(
    m => m.presence?.status === "online"
  ).size;

  res.json({
    members,
    online
  });
});

app.listen(3000, () => {
  console.log("API running on port 3000");
});