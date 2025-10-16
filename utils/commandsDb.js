const { neon } = require('@neondatabase/serverless');

async function getCommandsFromDb(lang = 'vi') {
  if (!process.env.DATABASE_URL) {
    console.log('DATABASE_URL not found, using fallback data');
    return null;
  }

  const sql = neon(process.env.DATABASE_URL);

  try {
    const categories = await sql`
      SELECT * FROM bot_command_categories 
      ORDER BY sort_order ASC
    `;

    const commands = await sql`
      SELECT * FROM bot_commands 
      ORDER BY category_slug ASC, sort_order ASC
    `;

    const categoriesData = categories.map(cat => ({
      slug: cat.slug,
      name: lang === 'vi' ? cat.name_vi : cat.name_en,
      description: lang === 'vi' ? cat.description_vi : cat.description_en,
      icon: cat.icon,
      color: cat.color,
      commands: commands
        .filter(cmd => cmd.category_slug === cat.slug)
        .map(cmd => ({
          name: cmd.name,
          nameVi: cmd.name_vi || cmd.name,
          nameEn: cmd.name_en || cmd.name,
          desc: {
            vi: cmd.description_vi,
            en: cmd.description_en
          },
          usage: lang === 'vi' ? (cmd.usage_vi || cmd.usage) : (cmd.usage_en || cmd.usage),
          usageVi: cmd.usage_vi || cmd.usage,
          usageEn: cmd.usage_en || cmd.usage,
          aliases: cmd.aliases || [],
          permissions: cmd.permissions,
          isPremium: cmd.is_premium,
          isSlashCommand: cmd.is_slash_command
        }))
    }));

    return categoriesData;
  } catch (error) {
    console.error('Error fetching commands from database:', error);
    return null;
  }
}

module.exports = { getCommandsFromDb };
