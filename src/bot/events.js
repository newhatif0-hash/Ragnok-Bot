import { ensureGuild, isModuleEnabled } from '../db/index.js';
import { handleInteraction } from './interactions.js';
import { renderTemplate } from '../services/templateEngine.js';
import { setupMessageHandler } from './messageHandler.js';
import { handleCustomCommand } from './customCommandHandler.js';
import { handleLeveling } from './levelingHandler.js';
import { handleWelcome } from './welcomeHandler.js';
import { handleJoinRole } from './autoroleHandler.js';
import { handleLeave } from './leaveHandler.js';
import { handleReactionRole } from './reactionRoleHandler.js';
import { runEventFeature } from './featureRunner.js';

export function wireDiscordEvents(context) {
  const { client, db, liveFeed, audit } = context;

  client.once('ready', async () => {
    console.log(`[discord] ThePurge online as ${client.user.tag}`);
    liveFeed.publish('discord.ready', {
      user: client.user.tag,
      guildCount: client.guilds.cache.size,
    });

    for (const guild of client.guilds.cache.values()) {
      await ensureGuild(db, guild);
    }
  });

  client.on('guildCreate', async (guild) => {
    await ensureGuild(db, guild);
    await audit.record({
      guildId: guild.id,
      action: 'guild.joined',
      source: 'discord',
      details: { name: guild.name },
    });
  });

  client.on('guildDelete', async (guild) => {
    await db.query('UPDATE guilds SET left_at = NOW(), updated_at = NOW() WHERE id = $1', [guild.id]);
    liveFeed.publish('guild.left', { guildId: guild.id, name: guild.name });
  });

  client.on('interactionCreate', async (interaction) => {
    await handleInteraction(context, interaction);
  });

  client.on('messageCreate', async (message) => {
    // Handle shortcuts first
    await runEventFeature(context, 'shortcuts', () => setupMessageHandler(context, message));

    // Then other features
    await runEventFeature(context, 'automod', async () => {
      const { runAutomod } = await import('../services/automodService.js');
      await runAutomod(context, message);
    });
    await runEventFeature(context, 'customCommands', () => handleCustomCommand(context, message));
    await runEventFeature(context, 'levels', () => handleLeveling(context, message));
  });

  client.on('guildMemberAdd', async (member) => {
    await runEventFeature(context, 'welcome', () => handleWelcome(context, member));
    await runEventFeature(context, 'autoroles', () => handleJoinRole(context, member));
  });

  client.on('guildMemberRemove', async (member) => {
    await runEventFeature(context, 'welcome', () => handleLeave(context, member));
  });

  client.on('messageDelete', async (message) => {
    if (!message.guild) return;
    await audit.record({
      guildId: message.guild.id,
      actorId: message.author?.id || null,
      targetId: message.channelId,
      action: 'message.deleted',
      source: 'discord',
      details: { messageId: message.id },
    });
  });

  client.on('messageReactionAdd', async (reaction, user) => {
    await runEventFeature(context, 'reactionRoles', () => handleReactionRole(context, reaction, user, 'add'));
  });

  client.on('messageReactionRemove', async (reaction, user) => {
    await runEventFeature(context, 'reactionRoles', () => handleReactionRole(context, reaction, user, 'remove'));
  });
}
