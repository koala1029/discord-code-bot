import dotenv from 'dotenv';
import { Client, GatewayIntentBits, GuildMember, TextChannel } from 'discord.js';
import { StorageHelper } from './src';
dotenv.config();

const client = new Client({ intents: [GatewayIntentBits.GuildMessages, GatewayIntentBits.Guilds] });
if (!process.env.GUILD || !process.env.CHANNEL || !process.env.ROLES)
  throw Error('.env files missing guild or channel id.');

//set roles
const ROLES = process.env.ROLES.split(',');

//Init storage
const storageHelper = StorageHelper.getInstance();

//discord api setup
client.login(process.env.DISCORD_TOKEN).then(
  async () => {
    //add commands
    client.on('interactionCreate', async (interaction): Promise<void> => {
      if (!interaction.isCommand()) return;

      const { commandName, guildId, channelId, user, guild } = interaction;

      if (guildId !== process.env.GUILD || channelId !== process.env.CHANNEL || commandName !== 'code') {
        return;
      }

      //check if has a role that can receive a code
      const member = await guild!.members.fetch(user);
      let acceptedRoles = member.roles.cache
        .map((role) => role.id)
        .filter((id) => {
          return ROLES.indexOf(id) != -1;
        });

      //in case user was somehow able to send cmd in the channel without having roles needed
      if (acceptedRoles.length === 0) {
        interaction.reply({ content: "You don't have any code to claim.", ephemeral: true });
      }

      const usersData = await storageHelper.readUsers();
      const codes = await storageHelper.readCodes();

      //we need to create user
      if (!usersData[user.id]) {
        usersData[user.id] = {};
      }

      const codesToDisplay: String[] = [];

      //loop into roles and add code if needed
      for (const roleId of acceptedRoles) {
        //if we already have a code: add to display and go to next iteration
        if (usersData[user.id][roleId]) {
          codesToDisplay.push(usersData[user.id][roleId]);
          continue;
        }

        if (!codes[roleId] || codes[roleId].length === 0) {
          interaction.reply({
            content: 'Error while generating the code. Please contact discord admin.',
            ephemeral: true,
          });
          throw Error('No codes available for ' + roleId + '. Please refill codes.');
        }

        //set code, remove from available and add to display
        usersData[user.id][roleId] = codes[roleId].pop()!;
        codesToDisplay.push(usersData[user.id][roleId]);
      }

      interaction.reply({
        content: 'Your codes are: ' + codesToDisplay.toString(),
        ephemeral: true,
      });

      //write into storage
      await storageHelper.writeCodes(codes);
      await storageHelper.writeUsers(usersData);
    });
  },
  (err) => {
    console.log(err);
    throw Error("Can't connect to discord api.");
  }
);
