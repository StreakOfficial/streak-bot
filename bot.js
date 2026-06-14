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

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

const VERIFY_URL = "https://streakofficial.github.io/verify.html";
const VERIFY_CHANNEL = "1514196080638820363";

let sent = false;

client.once("ready", async () => {
  console.log(`Bot online as ${client.user.tag}`);

  client.user.setPresence({
    status: "online",
    activities: [
      { name: "Security System", type: ActivityType.Watching }
    ]
  });

  await sendVerify();
});

async function sendVerify(force = false) {
  const channel = await client.channels.fetch(VERIFY_CHANNEL);

  const messages = await channel.messages.fetch({ limit: 10 });

  const exists = messages.find(
    m => m.author.id === client.user.id && m.embeds.length > 0
  );

  if (!force && (exists || sent)) return;

  const embed = new EmbedBuilder()
    .setTitle("🔒 Security Verification")
    .setDescription(
      "This server requires you to verify yourself to get access to channels.\nClick the button below to continue."
    )
    .setColor("#5865F2");

  const button = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setLabel("Verify Now")
      .setStyle(ButtonStyle.Link)
      .setURL(VERIFY_URL)
  );

  await channel.send({ embeds: [embed], components: [button] });

  sent = true;
}

// COMMAND: !sendverify
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
