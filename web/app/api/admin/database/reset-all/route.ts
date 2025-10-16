import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";

export async function POST() {
  const session = await getServerSession(authOptions);
  
  const ADMIN_USER_IDS = process.env.ADMIN_USER_IDS?.split(",") || [];
  if (!session || !ADMIN_USER_IDS.includes(session.user.id)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // TRUNCATE all bot-related tables (dangerous!)
    await db.execute(sql`TRUNCATE TABLE conversation_history CASCADE`);
    await db.execute(sql`TRUNCATE TABLE giveaways, giveaway_participants, giveaway_blacklist CASCADE`);
    await db.execute(sql`TRUNCATE TABLE confessions, confession_replies CASCADE`);
    await db.execute(sql`TRUNCATE TABLE custom_responses CASCADE`);
    await db.execute(sql`TRUNCATE TABLE warnings CASCADE`);
    
    return NextResponse.json({ success: true, message: "Database reset successfully" });
  } catch (error) {
    console.error("Error resetting database:", error);
    return NextResponse.json(
      { error: "Failed to reset database" },
      { status: 500 }
    );
  }
}
