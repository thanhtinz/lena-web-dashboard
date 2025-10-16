'use client';

import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faEdit, 
  faTrash, 
  faEye, 
  faEyeSlash,
  faStar,
  faArrowUp,
  faArrowDown
} from '@fortawesome/free-solid-svg-icons';
import Link from 'next/link';

interface DocPage {
  id: string;
  title: string;
  slug: string;
  categoryId?: string;
  categoryName?: string;
  orderIndex: number;
  isVisible: boolean;
  isFeatured: boolean;
  viewCount: number;
  createdAt: string;
}

export default function DocsManager() {
  const [docs, setDocs] = useState<DocPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'visible' | 'hidden'>('all');

  useEffect(() => {
    fetchDocs();
  }, []);

  const fetchDocs = async () => {
    try {
      const res = await fetch('/api/admin/docs');
      if (res.ok) {
        const data = await res.json();
        setDocs(data);
      }
    } catch (error) {
      console.error('Failed to fetch docs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this documentation page?')) return;

    try {
      const res = await fetch(`/api/admin/docs/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        fetchDocs();
      }
    } catch (error) {
      console.error('Failed to delete doc:', error);
    }
  };

  const handleToggleVisibility = async (id: string, currentVisibility: boolean) => {
    try {
      const res = await fetch(`/api/admin/docs/${id}/visibility`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isVisible: !currentVisibility }),
      });
      if (res.ok) {
        fetchDocs();
      }
    } catch (error) {
      console.error('Failed to update visibility:', error);
    }
  };

  const filteredDocs = docs.filter(doc => {
    if (filter === 'visible') return doc.isVisible;
    if (filter === 'hidden') return !doc.isVisible;
    return true;
  });

  if (loading) {
    return <div className="text-center py-12 text-slate-400">Loading documentation...</div>;
  }

  return (
    <div className="space-y-4">
      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-slate-700">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 ${filter === 'all' ? 'border-b-2 border-blue-500 text-blue-400' : 'text-slate-400'}`}
        >
          All ({docs.length})
        </button>
        <button
          onClick={() => setFilter('visible')}
          className={`px-4 py-2 ${filter === 'visible' ? 'border-b-2 border-green-500 text-green-400' : 'text-slate-400'}`}
        >
          Visible ({docs.filter(d => d.isVisible).length})
        </button>
        <button
          onClick={() => setFilter('hidden')}
          className={`px-4 py-2 ${filter === 'hidden' ? 'border-b-2 border-red-500 text-red-400' : 'text-slate-400'}`}
        >
          Hidden ({docs.filter(d => !d.isVisible).length})
        </button>
      </div>

      {/* Docs List */}
      {filteredDocs.length === 0 ? (
        <div className="bg-slate-800 rounded-lg p-8 text-center">
          <p className="text-slate-400">No documentation pages found</p>
          <Link href="/admin/docs/new" className="text-blue-400 hover:underline mt-2 inline-block">
            Create your first doc page
          </Link>
        </div>
      ) : (
        <div className="bg-slate-800 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-700">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-300">Title</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-300">Category</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-300">Slug</th>
                <th className="px-4 py-3 text-center text-sm font-medium text-slate-300">Views</th>
                <th className="px-4 py-3 text-center text-sm font-medium text-slate-300">Status</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-slate-300">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {filteredDocs.map((doc) => (
                <tr key={doc.id} className="hover:bg-slate-700/50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-white">{doc.title}</span>
                      {doc.isFeatured && (
                        <FontAwesomeIcon icon={faStar} className="h-3 w-3 text-yellow-400" />
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-400">
                    {doc.categoryName || <span className="text-slate-600">No category</span>}
                  </td>
                  <td className="px-4 py-3">
                    <code className="text-xs bg-slate-900 px-2 py-1 rounded text-blue-400">
                      /{doc.slug}
                    </code>
                  </td>
                  <td className="px-4 py-3 text-center text-slate-400">
                    {doc.viewCount.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {doc.isVisible ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-900/30 text-green-400 rounded text-xs">
                        <FontAwesomeIcon icon={faEye} className="h-3 w-3" />
                        Visible
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-900/30 text-red-400 rounded text-xs">
                        <FontAwesomeIcon icon={faEyeSlash} className="h-3 w-3" />
                        Hidden
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleToggleVisibility(doc.id, doc.isVisible)}
                        className="text-slate-400 hover:text-blue-400 p-2"
                        title={doc.isVisible ? 'Hide' : 'Show'}
                      >
                        <FontAwesomeIcon icon={doc.isVisible ? faEyeSlash : faEye} className="h-4 w-4" />
                      </button>
                      <Link
                        href={`/admin/docs/${doc.id}`}
                        className="text-slate-400 hover:text-blue-400 p-2"
                        title="Edit"
                      >
                        <FontAwesomeIcon icon={faEdit} className="h-4 w-4" />
                      </Link>
                      <button
                        onClick={() => handleDelete(doc.id)}
                        className="text-slate-400 hover:text-red-400 p-2"
                        title="Delete"
                      >
                        <FontAwesomeIcon icon={faTrash} className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
