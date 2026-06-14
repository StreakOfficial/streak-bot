const express = require("express");
const {
  Client,
  GatewayIntentBits,
  ActivityType,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  PermissionsBitField
} = require("discord.js");

const app = express();
app.use(express.json());

/* =========================
   DISCORD BOT
========================= */
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

let embedQueue = [];

/* =========================
   API ENDPOINT (FIX 502)
========================= */
app.post("/api/embed", (req, res) => {
  embedQueue.push(req.body);
  res.json({ ok: true });
});

app.get("/api/embed", (req, res) => {
  const item = embedQueue.shift();
  res.json(item || null);
});

/* =========================
   EMBED PROCESSOR
========================= */
async function processEmbeds() {
  try {
    const data = embedQueue.shift();
    if (!data) return;

    const channel = await client.channels.fetch(data.channel);
    if (!channel) return;

    const embed = new EmbedBuilder()
      .setTitle(data.title || "No title")
      .setDescription(data.description || "No description")
      .setColor("#a855f7");

    await channel.send({ embeds: [embed] });

  } catch (err) {
    console.log("Embed error:", err.message);
  }
}

setInterval(processEmbeds, 2000);

/* =========================
   READY
========================= */
client.once("ready", () => {
  console.log(`Logged in as ${client.user.tag}`);
  client.user.setActivity("Streak System", {
    type: ActivityType.Watching
  });
});

/* =========================
   LOGIN + SERVER
========================= */
client.login(process.env.TOKEN);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("API running on", PORT));
