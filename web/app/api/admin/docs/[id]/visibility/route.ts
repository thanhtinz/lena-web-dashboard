import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { docPages } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import { verifyAdmin } from '@/lib/admin-auth';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const adminId = await verifyAdmin(request);
  if (!adminId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { isVisible } = await request.json();
    
    const [updated] = await db
      .update(docPages)
      .set({ isVisible, updatedAt: new Date() })
      .where(eq(docPages.id, id))
      .returning();

    if (!updated) {
      return NextResponse.json({ error: 'Doc not found' }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update visibility' }, { status: 500 });
  }
}
