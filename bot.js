const { 
  Client, 
  GatewayIntentBits, 
  ActivityType,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} = require("discord.js");

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

const VERIFY_URL = "https://streakofficial.github.io/verify.html";
const VERIFY_CHANNEL = "1514196080638820363";

// prevents duplicate messages EVEN across restarts
let sent = false;

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

  const channel = await client.channels.fetch(VERIFY_CHANNEL);

  // check last messages so we don't spam
  const messages = await channel.messages.fetch({ limit: 10 });

  const alreadyExists = messages.find(
    m => m.author.id === client.user.id && m.embeds.length > 0
  );

  if (alreadyExists || sent) {
    console.log("Verify message already exists — skipping send.");
    return;
  }

  const embed = new EmbedBuilder()
    .setTitle("🔒 Security Verification")
    .setDescription(
      "This server requires you to verify yourself to get access to other channels. You can simply verify by completing a captcha. Click the button below."
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
});

client.login(process.env.TOKEN);
