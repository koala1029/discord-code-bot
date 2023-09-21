import dotenv from 'dotenv';
import { Client, Intents, TextChannel } from 'discord.js';
dotenv.config();

const client = new Client({ intents: [Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILDS] });

//discord api setup
client.login(process.env.DISCORD_TOKEN).then(
  async () => {
    if (!process.env.GUILDS || !process.env.CHANNELS) throw Error('.env files missing guild or channel id.');

    //add commands
    client.on('interactionCreate', async (interaction) => {
      if (!interaction.isCommand()) return;

      const { commandName } = interaction;

      if (commandName === 'ping') {
        await interaction.reply({ content: 'pong!' });
      }
    });
  },
  (err) => {
    console.log(err);
    throw Error("Can't connect to discord api.");
  }
);
