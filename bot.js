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
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
});

const VERIFY_URL = "https://streakofficial.github.io/verify.html";
const VERIFY_CHANNEL = "1514196080638820363";

let sent = false;

// ---------------- READY EVENT ----------------
client.once("ready", async () => {
  console.log(`Bot is online as ${client.user.tag}`);

  client.user.setPresence({
    status: "online",
    activities: [
      {
        name: "Security Verification System",
        type: ActivityType.Watching
      }
    ]
  });

  await sendVerifyMessage();
});

// ---------------- SEND VERIFY FUNCTION ----------------
async function sendVerifyMessage(force = false) {
  const channel = await client.channels.fetch(VERIFY_CHANNEL);

  const messages = await channel.messages.fetch({ limit: 10 });

  const alreadyExists = messages.find(
    m => m.author.id === client.user.id && m.embeds.length > 0
  );

  if (!force && (alreadyExists || sent)) {
    console.log("Verify message already exists — skipping.");
    return;
  }

  const embed = new EmbedBuilder()
    .setTitle("🔒 Security Verification")
    .setDescription(
      "This server requires you to verify yourself to get access to other channels, you can simply verify by completing a captcha, click on the button below."
    )
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
}

// ---------------- COMMAND: !sendverify ----------------
client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  if (message.content === "!sendverify") {
    // OPTIONAL: restrict to admins
    if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      return message.reply("You don't have permission.");
    }

    sent = false;
    await sendVerifyMessage(true);

    message.reply("Verify message sent ✅");
  }
});

client.login(process.env.TOKEN);
