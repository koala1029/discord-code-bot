import { SlashCommandBuilder } from '@discordjs/builders';
import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9';
import dotenv from 'dotenv';
dotenv.config();
const [clientId, token] = [process.env.DISCORD_APP_ID, process.env.DISCORD_TOKEN];
if (!token || !clientId) {
  throw Error('Incomplete env file.');
}

const commands = [new SlashCommandBuilder().setName('codes').setDescription('Returns promo codes owned by user')].map(
  (command) => command.toJSON()
);

const rest = new REST({ version: '10' }).setToken(token);

rest
  .put(Routes.applicationCommands(clientId), { body: commands })
  .then(() => console.log('Successfully registered application commands.'))
  .catch(console.error);
