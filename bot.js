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

const API = "https://streak-bot-9vnn.onrender.com";

const VERIFY_CHANNEL = "1514196080638820363";
const VERIFY_URL = "https://streakofficial.github.io/verify.html";

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

let verifySent = false;

/* =========================
   SETTINGS
========================= */
async function getSettings() {
  try {
    const res = await axios.get(`${API}/api/settings`);
    return res.data || {};
  } catch {
    return {};
  }
}

/* =========================
   READY
========================= */
client.once("ready", async () => {
  console.log(`Logged in as ${client.user.tag}`);

  const settings = await getSettings();

  client.user.setPresence({
    status: "online",
    activities: [
      {
        name: settings.status || "Streak System",
        type: ActivityType.Watching
      }
    ]
  });

  sendVerify();
});

/* =========================
   VERIFY SYSTEM (UNCHANGED)
========================= */
async function sendVerify(force = false) {
  try {
    const channel = await client.channels.fetch(VERIFY_CHANNEL);

    const messages = await channel.messages.fetch({ limit: 10 });

    const exists = messages.find(
      m => m.author.id === client.user.id && m.embeds.length > 0
    );

    if (!force && (exists || verifySent)) return;

    const embed = new EmbedBuilder()
      .setTitle("🔒 Security Verification")
      .setDescription("Click below to verify.")
      .setColor("#5865F2");

    const button = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel("Verify Now")
        .setStyle(ButtonStyle.Link)
        .setURL(VERIFY_URL)
    );

    await channel.send({ embeds: [embed], components: [button] });

    verifySent = true;
  } catch (err) {
    console.log("Verify error:", err.message);
  }
}

/* =========================
   EMBED WORKER (NEW SYSTEM)
========================= */
async function processEmbed() {
  try {
    const res = await axios.get(`${API}/api/embed`);
    const data = res.data;

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

/* =========================
   EVENT-DRIVEN LOOP (OPTIMIZED)
========================= */
setInterval(processEmbed, 1500);

/* =========================
   COMMANDS
========================= */
client.on("messageCreate", async (msg) => {
  if (msg.author.bot) return;

  if (msg.content === "!sendverify") {
    if (!msg.member.permissions.has(PermissionsBitField.Flags.Administrator))
      return msg.reply("No permission");

    verifySent = false;
    await sendVerify(true);

    msg.reply("Verify sent ✅");
  }
});

/* =========================
   LOGIN
========================= */
client.login(process.env.TOKEN);
