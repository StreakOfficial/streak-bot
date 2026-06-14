const express = require("express");
const cors = require("cors");
const app = express();

const { Client, GatewayIntentBits } = require("discord.js");

app.use(cors());
app.use(express.json());

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers]
});

client.login(process.env.TOKEN);

const GUILD_ID = "1514193041802661919";
const VERIFIED_ROLE = "1514193860962685029";
const UNVERIFIED_ROLE = "1514195885527928834";
const TURNSTILE_SECRET = process.env.TURNSTILE_SECRET;

let guild;

client.once("ready", async () => {
  console.log("API ready");
  guild = await client.guilds.fetch(GUILD_ID);
});

client.on("guildMemberAdd", async (member) => {
  const role = member.guild.roles.cache.get(UNVERIFIED_ROLE);
  if (role) member.roles.add(role);
});

app.post("/verify", async (req, res) => {
  try {

    const { captcha, userId } = req.body;

    if (!captcha || !userId)
      return res.send("Missing data ❌");

    const verify = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        headers: {"Content-Type":"application/x-www-form-urlencoded"},
        body: `secret=${TURNSTILE_SECRET}&response=${captcha}`
      }
    );

    const data = await verify.json();

    if (!data.success)
      return res.send("CAPTCHA failed ❌");

    const member = await guild.members.fetch(userId).catch(() => null);

    if (!member)
      return res.send("User not found ❌");

    const verified = guild.roles.cache.get(VERIFIED_ROLE);
    const unverified = guild.roles.cache.get(UNVERIFIED_ROLE);

    if (unverified) await member.roles.remove(unverified).catch(()=>{});
    if (verified) await member.roles.add(verified).catch(()=>{});

    res.send("Verified successfully ✅");

  } catch (err) {
    console.log(err);
    res.send("Error ❌");
  }
});

app.get("/stats", (req, res) => {
  res.json({ members: guild?.memberCount || 0 });
});

app.listen(3000, () => {
  console.log("API running on port 3000");
});
