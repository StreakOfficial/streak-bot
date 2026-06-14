const express = require("express");
const app = express();

const { Client, GatewayIntentBits } = require("discord.js");

app.use(express.json());

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers
  ]
});

client.login(process.env.TOKEN);

// ---------------- CONFIG ----------------
const GUILD_ID = "1514193041802661919";
const VERIFIED_ROLE = "1514193860962685029";
const UNVERIFIED_ROLE = "1514195885527928834";
const TURNSTILE_SECRET = process.env.TURNSTILE_SECRET;

let guild;

client.once("ready", async () => {
  console.log("API ready");
  guild = await client.guilds.fetch(GUILD_ID);
});

// ---------------- STATS ----------------
app.get("/stats", async (req, res) => {
  try {
    res.json({
      members: guild.memberCount
    });
  } catch {
    res.json({ members: 0 });
  }
});

// ---------------- VERIFY ROUTE ----------------
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

    const data = await verifyRes.json();

    if (!data.success) {
      return res.send("Verification failed ❌");
    }

    // IMPORTANT: user must be passed from frontend (Discord OAuth later upgrade)
    return res.send("CAPTCHA verified ✅ (next step: link Discord account)");

  } catch (err) {
    console.log(err);
    res.send("Server error ❌");
  }
});

app.listen(3000, () => {
  console.log("API running on port 3000");
});
