const express = require("express");
const app = express();
const { REST, Routes } = require("discord.js");
const { SlashCommandBuilder } = require("@discordjs/builders"); // Add this import
require('dotenv').config();

app.listen(3000, () => {
  console.log("Project is running");
});

app.get("/", (req, res) => {
  res.send("Hello world!");
});

const Discord = require("discord.js");
const client = new Discord.Client({
  intents: [
    Discord.IntentsBitField.Flags.Guilds,
    Discord.IntentsBitField.Flags.GuildMessages,
    Discord.IntentsBitField.Flags.MessageContent,
  ],
});

let hiCount = 0; // Declare the hiCount variable
let lastRuiner = null; // Declare lastRuiner variable

const targetChannelName = "🙋hi"; // Updated channel name
// Handle messages
client.on("messageCreate", (message) => {
  if (message.channel.name === targetChannelName) {
    if (message.author.bot) return;
    // React with a check if the message is "hi"
    if (message.content.toLowerCase().startsWith("hi")) {
      hiCount++; // Increment count
      message.react("✅"); // React with check
    } else {
      // Reset the count if it's not "hi"
      hiCount = 0;
      lastRuiner = message.author.tag; // Track the user who broke the streak
      message.react("❌"); // React with x
    }
  }
});

client.on("ready", async () => {
  // Register slash commands
  const commands = [
    new SlashCommandBuilder()
      .setName("count")
      .setDescription(
        "Display the current count of consecutive 'hi' messages.",
      ),
    new SlashCommandBuilder()
      .setName("ruiner")
      .setDescription("Display the user who last ruined the streak."),
  ].map((command) => command.toJSON());

  // Register slash commands to a specific guild
  const rest = new REST({ version: "10" }).setToken(process.env.token);

  (async () => {
    try {
      console.log("Refreshing slash commands...");

      // Register commands for a specific guild (replace with your guild ID)
      await rest.put(
        Routes.applicationGuildCommands(client.user.id, "1301301351208452137"), // Replace this with your guild ID
        { body: commands },
      );
      console.log("Slash commands registered.");
    } catch (error) {
      console.error(error);
    }
  })();
});

// Handle slash commands
client.on("interactionCreate", (interaction) => {
  if (!interaction.isCommand()) return;

  const { commandName } = interaction;

  if (commandName === "count") {
    interaction.reply(`hi's: **${hiCount}**`);
  } else if (commandName === "ruiner") {
    if (lastRuiner) {
      interaction.reply(
        `The last user to ruin the streak was: **${lastRuiner}**`,
      );
    } else {
      interaction.reply("No one has ruined the streak yet.");
    }
  }
});

client.login(process.env.token);