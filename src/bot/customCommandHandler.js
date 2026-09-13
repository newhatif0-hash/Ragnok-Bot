export async function handleCustomCommand(context, message) {
  const { db, client } = context;

  // Skip bot messages and DMs
  if (message.author.bot || !message.guild) return;

  try {
    // Fetch custom commands for this guild
    const result = await db.query(
      'SELECT * FROM custom_commands WHERE guild_id = $1 AND enabled = true',
      [message.guild.id]
    );

    const customCommands = result.rows;

    // Check if message content matches any custom command trigger
    for (const cmd of customCommands) {
      if (message.content.toLowerCase().startsWith(cmd.trigger.toLowerCase())) {
        // Execute the response (could be text, embed, etc.)
        await message.reply({
          content: cmd.response,
          allowedMentions: { replaceRoles: false, replaceUsers: false },
        });
        return;
      }
    }
  } catch (error) {
    console.error('[customCommandHandler] Error:', error.message);
  }
}
