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

const axios = require("axios");

// 🔴 RENDER API (YOUR DASHBOARD BACKEND)
const API_URL = "https://streak-bot-9vnn.onrender.com/api/settings";

// VERIFY SYSTEM
const VERIFY_URL = "https://streakofficial.github.io/verify.html";
const VERIFY_CHANNEL = "1514196080638820363";

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

let sent = false;

// 🔄 GET SETTINGS FROM DASHBOARD
async function getSettings() {
  try {
    const res = await axios.get(API_URL);
    return res.data;
  } catch (err) {
    console.log("API error:", err.message);
    return {};
  }
}

client.once("ready", async () => {
  console.log(`Bot online as ${client.user.tag}`);

  const settings = await getSettings();

  client.user.setPresence({
    status: "online",
    activities: [
      {
        name: settings.status || "Security System",
        type: ActivityType.Watching
      }
    ]
  });

  await sendVerify();
});

// 🔒 VERIFY EMBED SYSTEM (UNCHANGED)
async function sendVerify(force = false) {
  try {
    const channel = await client.channels.fetch(VERIFY_CHANNEL);

    const messages = await channel.messages.fetch({ limit: 10 });

    const exists = messages.find(
      m => m.author.id === client.user.id && m.embeds.length > 0
    );

    if (!force && (exists || sent)) return;

    const embed = new EmbedBuilder()
      .setTitle("🔒 Security Verification")
      .setDescription("This server requires you to verify yourself. Click below.")
      .setColor("#5865F2");

    const button = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel("Verify Now")
        .setStyle(ButtonStyle.Link)
        .setURL(VERIFY_URL)
    );

    await channel.send({
      embeds: [embed],
      components: [button]
    });

    sent = true;
  } catch (err) {
    console.log("Verify error:", err.message);
  }
}

// 💬 COMMAND SYSTEM
client.on("messageCreate", async (msg) => {
  if (msg.author.bot) return;

  if (msg.content === "!sendverify") {
    if (!msg.member.permissions.has(PermissionsBitField.Flags.Administrator))
      return msg.reply("No permission");

    sent = false;
    await sendVerify(true);

    msg.reply("Verify embed sent ✅");
  }
});

client.login(process.env.TOKEN);
