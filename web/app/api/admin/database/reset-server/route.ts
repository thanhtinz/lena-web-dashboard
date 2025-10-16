import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  
  const ADMIN_USER_IDS = process.env.ADMIN_USER_IDS?.split(",") || [];
  if (!session || !ADMIN_USER_IDS.includes(session.user.id)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { serverId, tables } = await request.json();

    if (!serverId || !tables || tables.length === 0) {
      return NextResponse.json(
        { error: "Server ID and tables are required" },
        { status: 400 }
      );
    }

    // Delete data for specific server based on selected tables
    const promises = [];
    
    if (tables.includes('conversation')) {
      promises.push(
        db.execute(sql`DELETE FROM conversation_history WHERE guild_id = ${serverId}`)
      );
    }
    
    if (tables.includes('giveaway')) {
      promises.push(
        db.execute(sql`DELETE FROM giveaways WHERE guild_id = ${serverId}`),
        db.execute(sql`DELETE FROM giveaway_blacklist WHERE guild_id = ${serverId}`)
      );
    }
    
    if (tables.includes('confession')) {
      promises.push(
        db.execute(sql`DELETE FROM confessions WHERE guild_id = ${serverId}`),
        db.execute(sql`DELETE FROM confession_replies WHERE guild_id = ${serverId}`)
      );
    }
    
    if (tables.includes('responses')) {
      promises.push(
        db.execute(sql`DELETE FROM custom_responses WHERE guild_id = ${serverId}`)
      );
    }
    
    if (tables.includes('config')) {
      promises.push(
        db.execute(sql`DELETE FROM server_configs WHERE guild_id = ${serverId}`),
        db.execute(sql`DELETE FROM welcome_configs WHERE guild_id = ${serverId}`),
        db.execute(sql`DELETE FROM leave_configs WHERE guild_id = ${serverId}`),
        db.execute(sql`DELETE FROM boost_configs WHERE guild_id = ${serverId}`)
      );
    }
    
    if (tables.includes('warnings')) {
      promises.push(
        db.execute(sql`DELETE FROM warnings WHERE guild_id = ${serverId}`)
      );
    }

    await Promise.all(promises);
    
    return NextResponse.json({ 
      success: true, 
      message: `Reset ${tables.length} table(s) for server ${serverId}` 
    });
  } catch (error) {
    console.error("Error resetting server data:", error);
    return NextResponse.json(
      { error: "Failed to reset server data" },
      { status: 500 }
    );
  }
}
