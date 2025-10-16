import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBook, faPlus, faFolderOpen } from '@fortawesome/free-solid-svg-icons';
import DocsManager from '@/components/admin/DocsManager';

export default async function AdminDocsPage() {
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <FontAwesomeIcon icon={faBook} className="h-7 w-7 text-blue-400" />
            Documentation Management
          </h1>
          <p className="text-slate-400 mt-1">Manage documentation pages and categories (GitBook-style)</p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/admin/docs/categories"
            className="bg-slate-700 text-white px-4 py-2 rounded-lg hover:bg-slate-600 transition flex items-center gap-2"
          >
            <FontAwesomeIcon icon={faFolderOpen} className="h-4 w-4" />
            Manage Categories
          </Link>
          <Link
            href="/admin/docs/new"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
          >
            <FontAwesomeIcon icon={faPlus} className="h-4 w-4" />
            New Doc Page
          </Link>
        </div>
      </div>

      <DocsManager />
    </div>
  );
}
