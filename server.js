const express = require("express");
const app = express();

const { Client, GatewayIntentBits } = require("discord.js");

app.use(express.json());

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildPresences
  ]
});

client.login(process.env.TOKEN);

const GUILD_ID = "1514193041802661919";
const TURNSTILE_SECRET = process.env.TURNSTILE_SECRET;

let guild;

client.once("ready", async () => {
  console.log("API ready");
  guild = await client.guilds.fetch(GUILD_ID);
});


// ---------------- STATS ----------------
app.get("/stats", async (req, res) => {
  try {
    const members = guild.memberCount;

    const online = guild.members.cache.filter(
      m => m.presence?.status === "online"
    ).size;

    res.json({ members, online });
  } catch {
    res.json({ members: 0, online: 0 });
  }
});


// ---------------- VERIFY (TURNSTILE + ROLE) ----------------
app.post("/verify", async (req, res) => {
  try {
    const { captcha } = req.body;

    if (!captcha) {
      return res.send("Missing CAPTCHA ❌");
    }

    // VERIFY TURNSTILE
    const verifyRes = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `secret=${TURNSTILE_SECRET}&response=${captcha}`
      }
    );

    const verifyData = await verifyRes.json();

    if (!verifyData.success) {
      return res.send("CAPTCHA failed ❌");
    }

    // GIVE ROLE (basic version using last member in guild cache)
    const role = guild.roles.cache.get("1514193860962685029");

    if (!role) {
      return res.send("Verified role not found ❌");
    }

    res.send("CAPTCHA verified ✅ (role system ready - next upgrade will auto-assign)");

  } catch (err) {
    console.log(err);
    res.send("Server error ❌");
  }
});

app.listen(3000, () => {
  console.log("API running on port 3000");
});
