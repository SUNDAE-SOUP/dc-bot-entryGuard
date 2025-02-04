const { Client, GatewayIntentBits } = require('discord.js');
require('dotenv').config();

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers
    ]
});

client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('guildMemberAdd', async (member) => {
    const roleName = "Mga Mamamayan"; //Change this to the role name you want to assign
    const role = member.guild.roles.cache.find(r => r.name === roleName);

    if (role) {
        await member.roles.add(role);
        console.log(`Assigned ${roleName} role to ${member.user.tag}`);
    } else {
        console.log(`Role ${roleName} not found!`);
    }
});

client.login(process.env.DISCORD_TOKEN);
