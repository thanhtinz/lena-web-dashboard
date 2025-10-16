import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifySession } from '@/lib/session';
import AdminTopNav from '@/components/admin/AdminTopNav';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('session');

  if (!sessionCookie) {
    redirect('/api/auth/discord');
  }

  const user = verifySession(sessionCookie.value);

  if (!user) {
    redirect('/api/auth/discord');
  }

  const ADMIN_USER_IDS = process.env.ADMIN_USER_IDS?.split(',') || [];
  const isAdmin = ADMIN_USER_IDS.includes(user.id);

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="bg-slate-800 p-8 rounded-lg border border-slate-700 text-center max-w-md w-full">
          <h1 className="text-2xl font-bold text-red-400 mb-4">Access Denied</h1>
          <p className="text-slate-300 mb-4">You don't have permission to access the admin panel.</p>
          <div className="bg-slate-900 p-4 rounded mb-4">
            <p className="text-sm text-slate-500 mb-2">Your Discord ID:</p>
            <p className="text-sm text-white font-mono">{user.id}</p>
          </div>
          <div className="bg-slate-900 p-4 rounded mb-6">
            <p className="text-sm text-slate-500 mb-2">Authorized Admin IDs:</p>
            <p className="text-sm text-white font-mono">{ADMIN_USER_IDS.join(', ') || 'Not configured'}</p>
          </div>
          <a href="/dashboard" className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 inline-block">
            Back to Dashboard
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <AdminTopNav user={user} />
      <main className="pt-16">
        {children}
      </main>
    </div>
  );
}
