const { Client, GatewayIntentBits, ActivityType } = require("discord.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildPresences
  ]
});

client.once("ready", () => {
  console.log(`Bot is online as ${client.user.tag}`);

  client.user.setPresence({
    status: "online",
    activities: [
      {
        name: "Streak Official Dashboard",
        type: ActivityType.Watching
      }
    ]
  });
});

client.login(process.env.TOKEN);