import { getShortcutData, isAllowedToUseShortcut } from './shortcuts.js';

export async function setupMessageHandler(context, message) {
  if (message.author.bot || !message.guild || !message.member) return;

  const args = message.content.split(/\s+/);
  const firstWord = args[0].toLowerCase();

  const shortcutData = getShortcutData(firstWord);
  if (!shortcutData) return;

  const userRoles = message.member.roles.cache.map((role) => role.id);

  if (!isAllowedToUseShortcut(shortcutData, userRoles)) {
    return message.reply('❌ ليس لديك صلاحية لاستخدام هذا الأمر');
  }

  try {
    const { audit, liveFeed, db } = context;
    const mentionedUser = message.mentions.users.first();
    const reason = args.slice(2).join(' ') || 'No reason provided';

    switch (shortcutData.command) {
      case 'warn': {
        if (!mentionedUser) return message.reply('❌ يجب أن تحدد مستخدم');
        const targetMember = await message.guild.members.fetch(mentionedUser.id).catch(() => null);
        if (!targetMember) return message.reply('❌ لم أجد هذا المستخدم');

        // Store warning in database
        const result = await db.query(
          `INSERT INTO warnings (guild_id, user_id, warned_by, reason, created_at)
           VALUES ($1, $2, $3, $4, NOW())
           RETURNING id`,
          [message.guild.id, mentionedUser.id, message.author.id, reason]
        );

        await message.reply(`⚠️ تم تحذير ${mentionedUser} - السبب: ${reason}`);

        await audit.record({
          guildId: message.guild.id,
          actorId: message.author.id,
          targetId: mentionedUser.id,
          action: 'shortcut.warn',
          source: 'discord',
          details: { shortcut: firstWord, reason, warningId: result.rows[0].id },
        });
        break;
      }

      case 'timeout': {
        if (!mentionedUser) return message.reply('❌ يجب أن تحدد مستخدم');
        const targetMember = await message.guild.members.fetch(mentionedUser.id).catch(() => null);
        if (!targetMember) return message.reply('❌ لم أجد هذا المستخدم');

        const durationSeconds = parseInt(args[1]) || 3600;
        await targetMember.timeout(durationSeconds * 1000, reason);

        await message.reply(`🔇 تم إسكات ${mentionedUser} لمدة ${durationSeconds}s - السبب: ${reason}`);

        await audit.record({
          guildId: message.guild.id,
          actorId: message.author.id,
          targetId: mentionedUser.id,
          action: 'shortcut.timeout',
          source: 'discord',
          details: { shortcut: firstWord, duration: durationSeconds, reason },
        });
        break;
      }

      case 'kick': {
        if (!mentionedUser) return message.reply('❌ يجب أن تحدد مستخدم');
        const targetMember = await message.guild.members.fetch(mentionedUser.id).catch(() => null);
        if (!targetMember) return message.reply('❌ لم أجد هذا المستخدم');

        await targetMember.kick(reason);

        await message.reply(`👢 تم طرد ${mentionedUser} - السبب: ${reason}`);

        await audit.record({
          guildId: message.guild.id,
          actorId: message.author.id,
          targetId: mentionedUser.id,
          action: 'shortcut.kick',
          source: 'discord',
          details: { shortcut: firstWord, reason },
        });
        break;
      }

      case 'ban': {
        if (!mentionedUser) return message.reply('❌ يجب أن تحدد مستخدم');

        await message.guild.members.ban(mentionedUser, { reason });

        await message.reply(`🔨 تم بان ${mentionedUser} - السبب: ${reason}`);

        await audit.record({
          guildId: message.guild.id,
          actorId: message.author.id,
          targetId: mentionedUser.id,
          action: 'shortcut.ban',
          source: 'discord',
          details: { shortcut: firstWord, reason },
        });
        break;
      }

      case 'purge': {
        const amount = parseInt(args[1]) || 10;
        if (amount < 1 || amount > 100) return message.reply('❌ العدد يجب أن يكون بين 1 و 100');

        const fetched = await message.channel.messages.fetch({ limit: amount });
        await message.channel.bulkDelete(fetched);

        await message.reply(`✅ تم حذف ${amount} رسالة`);

        await audit.record({
          guildId: message.guild.id,
          actorId: message.author.id,
          targetId: message.channelId,
          action: 'shortcut.purge',
          source: 'discord',
          details: { shortcut: firstWord, amount },
        });
        break;
      }

      case 'warns-list': {
        if (!mentionedUser) return message.reply('❌ يجب أن تحدد مستخدم');

        const result = await db.query(
          `SELECT * FROM warnings WHERE guild_id = $1 AND user_id = $2 ORDER BY created_at DESC`,
          [message.guild.id, mentionedUser.id]
        );

        const warnings = result.rows;
        if (warnings.length === 0) {
          return message.reply(`📋 ${mentionedUser} ليس لديه تحذيرات`);
        }

        const warningList = warnings.map((w, i) => `${i + 1}. ${w.reason} (بواسطة <@${w.warned_by}>)`).join('\n');

        await message.reply(`📋 تحذيرات ${mentionedUser} (${warnings.length}):\n${warningList}`);

        await audit.record({
          guildId: message.guild.id,
          actorId: message.author.id,
          targetId: mentionedUser.id,
          action: 'shortcut.warns-list',
          source: 'discord',
          details: { shortcut: firstWord },
        });
        break;
      }

      case 'role': {
        if (!mentionedUser) return message.reply('❌ يجب أن تحدد مستخدم');
        const targetMember = await message.guild.members.fetch(mentionedUser.id).catch(() => null);
        if (!targetMember) return message.reply('❌ لم أجد هذا المستخدم');

        const roleId = args[1];
        if (!roleId) return message.reply('❌ يجب أن تحدد رول');

        const role = message.guild.roles.cache.get(roleId);
        if (!role) return message.reply('❌ لم أجد هذا الرول');

        if (targetMember.roles.cache.has(roleId)) {
          await targetMember.roles.remove(roleId);
          await message.reply(`✅ تم إزالة الرول ${role.name} من ${mentionedUser}`);
        } else {
          await targetMember.roles.add(roleId);
          await message.reply(`✅ تم إضافة الرول ${role.name} لـ ${mentionedUser}`);
        }

        await audit.record({
          guildId: message.guild.id,
          actorId: message.author.id,
          targetId: mentionedUser.id,
          action: 'shortcut.role',
          source: 'discord',
          details: { shortcut: firstWord, roleId, roleName: role.name },
        });
        break;
      }

      case 'lock': {
        await message.channel.permissionOverwrites.edit(message.guild.id, { SendMessages: false });
        await message.reply('✅ تم قفل القناة');

        await audit.record({
          guildId: message.guild.id,
          actorId: message.author.id,
          targetId: message.channelId,
          action: 'shortcut.lock',
          source: 'discord',
          details: { shortcut: firstWord },
        });
        break;
      }

      case 'unlock': {
        await message.channel.permissionOverwrites.edit(message.guild.id, { SendMessages: null });
        await message.reply('✅ تم فتح القناة');

        await audit.record({
          guildId: message.guild.id,
          actorId: message.author.id,
          targetId: message.channelId,
          action: 'shortcut.unlock',
          source: 'discord',
          details: { shortcut: firstWord },
        });
        break;
      }

      default:
        return;
    }
  } catch (error) {
    console.error('[shortcuts] Error:', error);
    context.liveFeed.publish('shortcuts.error', { error: String(error?.message || error) }, 'error');
    message.reply('❌ حدث خطأ أثناء تنفيذ الأمر');
  }
          }
          
