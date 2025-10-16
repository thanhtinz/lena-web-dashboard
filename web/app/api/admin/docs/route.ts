import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { docPages, docCategories } from '@/lib/schema';
import { eq, desc } from 'drizzle-orm';
import { verifyAdmin } from '@/lib/admin-auth';

export async function GET(request: NextRequest) {
  const adminId = await verifyAdmin(request);
  if (!adminId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Get all docs with category info
    const docs = await db
      .select({
        id: docPages.id,
        title: docPages.title,
        slug: docPages.slug,
        categoryId: docPages.categoryId,
        categoryName: docCategories.name,
        orderIndex: docPages.orderIndex,
        isVisible: docPages.isVisible,
        isFeatured: docPages.isFeatured,
        viewCount: docPages.viewCount,
        createdAt: docPages.createdAt,
      })
      .from(docPages)
      .leftJoin(docCategories, eq(docPages.categoryId, docCategories.id))
      .orderBy(desc(docPages.createdAt));

    return NextResponse.json(docs);
  } catch (error) {
    console.error('Failed to fetch docs:', error);
    return NextResponse.json({ error: 'Failed to fetch docs' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const adminId = await verifyAdmin(request);
  if (!adminId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { title, slug, content, excerpt, categoryId, icon, orderIndex, isVisible, isFeatured, tags, seo } = body;

    const [newDoc] = await db.insert(docPages).values({
      title,
      slug,
      content,
      excerpt,
      categoryId,
      icon,
      orderIndex: orderIndex || 0,
      isVisible: isVisible ?? true,
      isFeatured: isFeatured ?? false,
      tags: tags || [],
      seo,
    }).returning();

    return NextResponse.json(newDoc, { status: 201 });
  } catch (error: any) {
    console.error('Failed to create doc:', error);
    if (error.code === '23505') {
      return NextResponse.json({ error: 'Slug already exists' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to create doc' }, { status: 500 });
  }
}
