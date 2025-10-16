import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const lang = searchParams.get('lang') || 'en';

  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
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

    const categoriesData = categories.map((cat: any) => ({
      slug: cat.slug,
      name: lang === 'vi' ? cat.name_vi : cat.name_en,
      description: lang === 'vi' ? cat.description_vi : cat.description_en,
      icon: cat.icon,
      color: cat.color,
      sortOrder: cat.sort_order,
      commands: commands
        .filter((cmd: any) => cmd.category_slug === cat.slug)
        .map((cmd: any) => ({
          name: cmd.name,
          description: lang === 'vi' ? cmd.description_vi : cmd.description_en,
          usage: lang === 'vi' ? (cmd.usage_vi || cmd.usage) : (cmd.usage_en || cmd.usage),
          aliases: cmd.aliases || [],
          permissions: cmd.permissions,
          isPremium: cmd.is_premium,
          isSlashCommand: cmd.is_slash_command,
        }))
    }));

    return NextResponse.json({
      success: true,
      categories: categoriesData,
      lastSynced: categories[0]?.last_synced_at || new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching commands:', error);
    return NextResponse.json(
      { error: 'Failed to fetch commands' },
      { status: 500 }
    );
  }
}
