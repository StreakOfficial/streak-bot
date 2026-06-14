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

// ---------------- READY ----------------
client.once("ready", async () => {
  console.log("API ready");
  guild = await client.guilds.fetch(GUILD_ID);
});

// ---------------- GIVE UNVERIFIED ON JOIN ----------------
client.on("guildMemberAdd", async (member) => {
  try {
    const role = member.guild.roles.cache.get(UNVERIFIED_ROLE);
    if (role) {
      await member.roles.add(role);
      console.log(`Unverified given to ${member.user.tag}`);
    }
  } catch (err) {
    console.log("Unverified role error:", err);
  }
});

// ---------------- VERIFY ENDPOINT ----------------
app.post("/verify", async (req, res) => {
  try {
    const { captcha, userId } = req.body;

    if (!captcha || !userId) {
      return res.send("Missing data ❌");
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
      return res.send("CAPTCHA failed ❌");
    }

    const member = await guild.members.fetch(userId).catch(() => null);

    if (!member) {
      return res.send("User not found ❌");
    }

    const verified = guild.roles.cache.get(VERIFIED_ROLE);
    const unverified = guild.roles.cache.get(UNVERIFIED_ROLE);

    if (unverified) await member.roles.remove(unverified);
    if (verified) await member.roles.add(verified);

    res.send("Verified successfully ✅");

  } catch (err) {
    console.log(err);
    res.send("Server error ❌");
  }
});

// ---------------- STATS ----------------
app.get("/stats", async (req, res) => {
  try {
    res.json({ members: guild.memberCount });
  } catch {
    res.json({ members: 0 });
  }
});

// ---------------- START ----------------
app.listen(3000, () => {
  console.log("API running on port 3000");
});
