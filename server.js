const express = require("express");
const app = express();

const { Client, GatewayIntentBits } = require("discord.js");

app.use(express.json());

// ---------------- DISCORD BOT ----------------
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildPresences
  ]
});

client.login(process.env.TOKEN);

let guild;

// Your server ID
const GUILD_ID = "1514193041802661919";

client.once("ready", async () => {
  console.log("API ready");

  guild = await client.guilds.fetch(GUILD_ID);
});


// ---------------- STATS (KEEP THIS) ----------------
app.get("/stats", async (req, res) => {
  try {
    const members = guild.memberCount;

    const online = guild.members.cache.filter(
      m => m.presence?.status === "online"
    ).size;

    res.json({ members, online });

  } catch (err) {
    res.json({ members: 0, online: 0 });
  }
});


// ---------------- VERIFY (SIMPLE WORKING VERSION) ----------------
// For now: just receives request and gives role (we improve security later)
app.post("/verify", async (req, res) => {
  try {
    const { discordId } = req.body;

    if (!discordId) {
      return res.send("Missing Discord ID ❌");
    }

    const member = await guild.members.fetch(discordId).catch(() => null);

    if (!member) {
      return res.send("User not in server ❌");
    }

    const role = guild.roles.cache.find(r => r.name === "Verified");

    if (!role) {
      return res.send("Verified role not found ❌");
    }

    await member.roles.add(role);

    res.send("Verified successfully ✅");

  } catch (err) {
    console.log(err);
    res.send("Error verifying user ❌");
  }
});


// ---------------- START SERVER ----------------
app.listen(3000, () => {
  console.log("API running on port 3000");
});
