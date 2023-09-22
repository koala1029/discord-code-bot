import dotenv from 'dotenv';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, Client, Events, GatewayIntentBits } from 'discord.js';
import { StorageHelper } from './src';
dotenv.config();

const client = new Client({ intents: [GatewayIntentBits.GuildMessages, GatewayIntentBits.Guilds] });
if (!process.env.GUILD || !process.env.CHANNEL || !process.env.ROLES)
  throw Error('.env files missing guild or channel id.');

//set roles
const ROLES = process.env.ROLES.split(',');
const GUILD_ID = process.env.GUILD;
const CHANNEL_ID = process.env.CHANNEL;

//Init storage
const storageHelper = StorageHelper.getInstance();

//discord api setup
client.login(process.env.DISCORD_TOKEN).then(
  async () => {
    const targetGuild = await client.guilds.fetch(GUILD_ID);
    const targetChannel = await targetGuild.channels.fetch(CHANNEL_ID);
    if (!targetChannel || (targetChannel && !targetChannel.isTextBased())) {
      throw Error('Cannot send button in the channel given.');
    }

    const button = new ButtonBuilder().setCustomId('codes').setLabel('Get promo codes').setStyle(ButtonStyle.Primary);
    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(button);
    const lastMessage = (await targetChannel.messages.fetch()).first();
    if (!lastMessage || lastMessage.author.id !== client.user!.id) {
      await targetChannel.send({
        content: 'Click on the button below to receive your promo codes.',
        components: [row],
      });
    }

    //add commands
    client.on(Events.InteractionCreate, async (interaction) => {
      if (!interaction.isButton()) return;

      const { customId, guildId, channelId, user, guild } = interaction;

      if (guildId !== GUILD_ID || channelId !== CHANNEL_ID || customId !== 'codes') {
        return;
      }

      await interaction.deferReply({ ephemeral: true });

      //check if has a role that can receive a code
      const member = await guild!.members.fetch(user);
      let acceptedRoles = member.roles.cache
        .map((role) => role.id)
        .filter((id) => {
          return ROLES.indexOf(id) !== -1;
        });

      //in case user was somehow able to send cmd in the channel without having roles needed
      if (acceptedRoles.length === 0) {
        interaction.editReply({ content: "You don't have any code to claim." });
        return;
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
        if (usersData[user.id][roleId] && usersData[user.id][roleId].length > 0) {
          codesToDisplay.push(usersData[user.id][roleId]);
          continue;
        }

        if (!codes[roleId] || codes[roleId].length === 0) {
          interaction.editReply({
            content: 'Error while generating the code. Please contact discord admin.',
          });
          console.log('No codes available for ' + roleId + '. Please refill codes.');
          return;
        }

        //set code, remove from available and add to display
        usersData[user.id][roleId] = codes[roleId].pop()!;
        codesToDisplay.push(usersData[user.id][roleId]);
      }

      interaction.editReply({
        content: 'Your codes are: ' + codesToDisplay.toString(),
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
