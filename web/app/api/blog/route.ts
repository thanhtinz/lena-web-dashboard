import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { blogPosts } from '@/lib/schema';
import { eq, desc, like, or, sql, and } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const category = searchParams.get('category');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const offset = (page - 1) * limit;

    const conditions = [eq(blogPosts.status, 'published')];
    
    if (search) {
      conditions.push(
        or(
          like(blogPosts.title, `%${search}%`),
          like(blogPosts.excerpt, `%${search}%`)
        )!
      );
    }
    if (category) {
      conditions.push(eq(blogPosts.category, category));
    }

    const whereClause = and(...conditions);

    const [posts, totalResult] = await Promise.all([
      db.select({
        id: blogPosts.id,
        title: blogPosts.title,
        slug: blogPosts.slug,
        excerpt: blogPosts.excerpt,
        featuredImage: blogPosts.featuredImage,
        authorName: blogPosts.authorName,
        category: blogPosts.category,
        tags: blogPosts.tags,
        publishedAt: blogPosts.publishedAt,
        viewCount: blogPosts.viewCount,
      })
        .from(blogPosts)
        .where(whereClause)
        .orderBy(desc(blogPosts.publishedAt))
        .limit(limit)
        .offset(offset),
      db.select({ count: sql<number>`count(*)` })
        .from(blogPosts)
        .where(whereClause)
    ]);

    const total = Number(totalResult[0]?.count || 0);

    const categories = await db
      .select({ category: blogPosts.category })
      .from(blogPosts)
      .where(eq(blogPosts.status, 'published'))
      .groupBy(blogPosts.category);

    return NextResponse.json({
      posts,
      categories: categories.map(c => c.category).filter(Boolean),
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    return NextResponse.json({ error: 'Failed to fetch blog posts' }, { status: 500 });
  }
}
