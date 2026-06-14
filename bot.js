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
  intents: [
    GatewayIntentBits.Guilds
  ]
});

const VERIFY_URL = "https://streakofficial.github.io/verify.html";
const VERIFY_CHANNEL = "1514196080638820363";

client.once("ready", async () => {
  console.log(`Bot is online as ${client.user.tag}`);

  // Status
  client.user.setPresence({
    status: "online",
    activities: [
      {
        name: "Security Verification System",
        type: ActivityType.Watching
      }
    ]
  });

  // Send embed to verify channel
  const channel = await client.channels.fetch(VERIFY_CHANNEL);

  const embed = new EmbedBuilder()
    .setTitle("🔒 Security Verification")
    .setDescription("You must verify yourself to access the server.\nClick the button below to continue.")
    .setColor("#5865F2");

  const button = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setLabel("Verify Now")
      .setStyle(ButtonStyle.Link)
      .setURL(VERIFY_URL)
  );

  channel.send({
    embeds: [embed],
    components: [button]
  });
});

client.login(process.env.TOKEN);
