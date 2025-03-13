const { Client, GatewayIntentBits } = require('discord.js');
require('dotenv').config();

// Add the specific server ID you want to track
const TARGET_GUILD_ID = '1120717903478652948'; // Replace with your server ID

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildInvites
    ]
});

// Store invite cache
const invites = new Map();

client.on('ready', async () => {
    console.log(`Logged in as ${client.user.tag}!`);
    
    // Get the specific guild we want to track
    const guild = client.guilds.cache.get(TARGET_GUILD_ID);
    if (guild) {
        try {
            // Fetch all Guild Invites for this specific server
            const firstInvites = await guild.invites.fetch();
            // Set the key as guild ID, and create a map which has the invite code and uses
            invites.set(guild.id, new Map(firstInvites.map((invite) => [invite.code, invite.uses])));
            console.log(`Successfully cached invites for server: ${guild.name}`);
        } catch (error) {
            console.error(`Error caching invites: ${error}`);
        }
    } else {
        console.log(`Bot is not in the specified server (ID: ${TARGET_GUILD_ID})`);
    }
});

client.on('guildMemberAdd', async (member) => {
    // Only process if it's the target server
    if (member.guild.id !== TARGET_GUILD_ID) return;

    const roleName = "MGA MAMAMAYAN";
    const role = member.guild.roles.cache.find(r => r.name === roleName);

    if (role) {
        await member.roles.add(role);
        console.log(`Assigned ${roleName} role to ${member.user.tag}`);
    } else {
        console.log(`Role ${roleName} not found!`);
    }

    // Invite tracking
    try {
        const currentInvites = await member.guild.invites.fetch();
        const guildInvites = invites.get(member.guild.id);
        const usedInvite = currentInvites.find(invite => {
            const usedUses = guildInvites.get(invite.code) || 0;
            return invite.uses > usedUses;
        });

        // Update invite cache
        currentInvites.each(invite => guildInvites.set(invite.code, invite.uses));

        if (usedInvite) {
            const welcomeChannelId = '1120717903478652948';
            const welcomeChannel = member.guild.channels.cache.get(welcomeChannelId);
            
            if (welcomeChannel) {
                welcomeChannel.send(
                    `User: ${member.user}. You were invited by ${usedInvite.inviter.tag}. `
                );
            } else {
                console.log('Welcome channel not found!');
            }
        }       
    } catch (err) {
        console.error('Error tracking invite:', err);
    }
});

client.on('inviteCreate', async (invite) => {
    // Only track invites for TP server
    if (invite.guild.id !== TARGET_GUILD_ID) return;

    try {
        const guildInvites = invites.get(invite.guild.id);
        guildInvites.set(invite.code, invite.uses);
    } catch (err) {
        console.error('Error handling new invite:', err);
    }
});

client.login(process.env.DISCORD_TOKEN);
