import { db } from '@/lib/db';
import { docPages, docCategories } from '@/lib/schema';
import { eq, desc } from 'drizzle-orm';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBook, faArrowRight, faStar } from '@fortawesome/free-solid-svg-icons';

export const revalidate = 3600; // Revalidate every hour

export default async function DocsPage() {
  // Get featured docs
  const featuredDocs = await db
    .select()
    .from(docPages)
    .where(eq(docPages.isFeatured, true))
    .limit(3);

  // Get all categories with their docs
  const categories = await db
    .select()
    .from(docCategories)
    .where(eq(docCategories.isVisible, true))
    .orderBy(docCategories.orderIndex);

  const categoriesWithDocs = await Promise.all(
    categories.map(async (category) => {
      const docs = await db
        .select()
        .from(docPages)
        .where(eq(docPages.categoryId, category.id))
        .orderBy(docPages.orderIndex)
        .limit(5);
      return { ...category, docs };
    })
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-black">
      {/* Navigation */}
      <nav className="border-b bg-white/5 backdrop-blur-lg fixed w-full z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <FontAwesomeIcon icon={faBook} className="h-6 w-6 text-blue-400" />
            <span className="text-xl font-bold text-white">Lena Documentation</span>
          </Link>
          <Link href="/" className="text-sm text-slate-300 hover:text-white transition">
            ← Back to Home
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-16 px-4">
        <div className="container mx-auto text-center">
          <h1 className="text-5xl font-bold text-white mb-4">Documentation</h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Everything you need to know about Lena Bot - from setup to advanced features
          </p>
        </div>
      </section>

      {/* Featured Docs */}
      {featuredDocs.length > 0 && (
        <section className="py-12 px-4">
          <div className="container mx-auto">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <FontAwesomeIcon icon={faStar} className="text-yellow-400" />
              Featured Guides
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              {featuredDocs.map((doc) => (
                <Link
                  key={doc.id}
                  href={`/docs/${doc.slug}`}
                  className="bg-slate-800 border border-slate-700 rounded-lg p-6 hover:border-blue-500 transition group"
                >
                  <h3 className="text-lg font-bold text-white mb-2 group-hover:text-blue-400 transition">
                    {doc.title}
                  </h3>
                  {doc.excerpt && (
                    <p className="text-sm text-slate-400 mb-4">{doc.excerpt}</p>
                  )}
                  <div className="flex items-center gap-2 text-blue-400 text-sm">
                    Read more
                    <FontAwesomeIcon icon={faArrowRight} className="h-3 w-3" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Categories */}
      <section className="py-12 px-4">
        <div className="container mx-auto">
          <div className="space-y-8">
            {categoriesWithDocs.map((category) => (
              <div key={category.id} className="bg-slate-800 border border-slate-700 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  {category.icon && (
                    <span className="text-2xl">{category.icon}</span>
                  )}
                  <div>
                    <h3 className="text-xl font-bold text-white">{category.name}</h3>
                    {category.description && (
                      <p className="text-sm text-slate-400">{category.description}</p>
                    )}
                  </div>
                </div>
                
                {category.docs.length > 0 ? (
                  <div className="grid md:grid-cols-2 gap-3">
                    {category.docs.map((doc) => (
                      <Link
                        key={doc.id}
                        href={`/docs/${doc.slug}`}
                        className="flex items-center gap-2 p-3 bg-slate-900/50 rounded hover:bg-slate-700 transition"
                      >
                        <FontAwesomeIcon icon={faArrowRight} className="h-3 w-3 text-blue-400" />
                        <span className="text-white hover:text-blue-400">{doc.title}</span>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-500 text-sm">No documentation available yet</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
