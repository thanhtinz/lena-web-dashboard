import { NextRequest, NextResponse } from 'next/server';
import { verifyAdmin } from '@/lib/admin-auth';
import { db } from '@/lib/db';
import { supportTickets } from '@/lib/schema';
import { eq } from 'drizzle-orm';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const adminId = await verifyAdmin(request);
  
  if (!adminId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  const body = await request.json();

  // Update ticket status to in_progress if it's open
  await db.update(supportTickets)
    .set({ 
      status: 'in_progress',
      assignedTo: adminId,
      updatedAt: new Date()
    })
    .where(eq(supportTickets.id, id));

  // TODO: Send DM to user via Discord bot
  // This would require Discord bot integration
  console.log(`Admin ${adminId} replied to ticket ${id}:`, body.message);

  return NextResponse.json({ success: true });
}
