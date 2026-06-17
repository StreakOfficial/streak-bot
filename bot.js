const express = require("express");
const {
  Client,
  GatewayIntentBits,
  ActivityType,
  EmbedBuilder
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

function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/* =========================
   TICKET TOOL AUTO RENAMER TEST
========================= */
client.on("channelCreate", async (channel) => {
  try {
    if (!channel.guild) return;
    if (!channel.isTextBased()) return;

    console.log(`New channel created: ${channel.name}`);

    await wait(12000);

    const messages = await channel.messages.fetch({ limit: 20 });

    let text = "";

    messages.forEach(msg => {
      text += " " + (msg.content || "");

      msg.embeds.forEach(embed => {
        text += " " + (embed.title || "");
        text += " " + (embed.description || "");
        text += " " + (embed.footer?.text || "");

        embed.fields?.forEach(field => {
          text += " " + field.name + " " + field.value;
        });
      });
    });

    text += " " + (channel.topic || "");
    text += " " + (channel.parent?.name || "");
    text = text.toLowerCase();

    console.log("Ticket text found:", text);

    const ticketTypes = {
      "technical support": "tech-support",
      "bug report": "bug-report",
      "reseller application": "reseller-app",
      "reseller support": "reseller-support",
      "bulk purchase inquiry": "bulk-purchase",
      "license transfer": "license-transfer",
      "product access issue": "product-access",
      "blacklist appeal": "blacklist-appeal",
      "other questions": "other-questions"
    };

    for (const [keyword, newName] of Object.entries(ticketTypes)) {
      if (text.includes(keyword)) {
        await channel.setName(newName);
        await channel.send(`Renamed ticket to: ${newName}`);
        console.log(`Renamed ticket to ${newName}`);
        return;
      }
    }

    await channel.send("I detected the ticket, but could not find the ticket type.");
  } catch (err) {
    console.log("Ticket rename error:", err);
  }
});

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
