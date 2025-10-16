import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifySession } from '@/lib/session';
import { isPremiumUser } from '@/lib/premium';
import DashboardNav from '@/components/dashboard/DashboardNav';
import DashboardSidebar from '@/components/dashboard/DashboardSidebar';

export default async function DashboardLayout({
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

  // Check premium status
  const isPremium = await isPremiumUser(user.id);

  return (
    <div className="min-h-screen bg-slate-900">
      <DashboardNav user={user} />
      <div className="flex pt-14">
        <DashboardSidebar isPremium={isPremium} />
        <main className="flex-1 p-6 lg:ml-0 w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
