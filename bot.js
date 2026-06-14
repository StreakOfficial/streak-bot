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

  const embed = new EmbedBuilder()
    .setTitle("🔒 Security Verification")
    .setDescription("You must verify yourself to access the server.\nClick the button below.")
    .setColor("#5865F2");

  const button = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setLabel("Verify Now")
      .setStyle(ButtonStyle.Link)
      .setURL(VERIFY_URL)
  );

  // 💥 CHECK IF MESSAGE ALREADY EXISTS
  const messages = await channel.messages.fetch({ limit: 10 });

  const alreadyExists = messages.find(
    m => m.author.id === client.user.id && m.embeds.length > 0
  );

  if (alreadyExists) {
    console.log("Verify message already exists — not sending again.");
    return;
  }

  // send only once
  channel.send({
    embeds: [embed],
    components: [button]
  });
});

client.login(process.env.TOKEN);
