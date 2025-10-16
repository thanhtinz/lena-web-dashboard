import { db } from '@/lib/db';
import { subscriptions } from '@/lib/schema';
import { sql } from 'drizzle-orm';
import UserSubscriptionsList from '@/components/admin/UserSubscriptionsList';
import UsersHeader from '@/components/admin/UsersHeader';
import InfoBox from '@/components/admin/InfoBox';

export default async function UsersPage() {
  const subs = await db.select().from(subscriptions).orderBy(subscriptions.createdAt);

  const stats = await db.execute(sql`
    SELECT 
      COUNT(*) FILTER (WHERE status = 'active') as active_count,
      COUNT(*) FILTER (WHERE status = 'cancelled') as cancelled_count,
      COUNT(*) FILTER (WHERE status = 'expired') as expired_count,
      SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as total_mrr
    FROM subscriptions
  `);

  return (
    <div className="container mx-auto px-4 py-8">
      <UsersHeader />

      <div className="space-y-6">
        <InfoBox type="info" title="👥 User Management Guide">
          <p className="mb-2">Manage user subscriptions and payments:</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li><strong>View Subscriptions</strong> - See all active, cancelled, and expired subscriptions</li>
            <li><strong>Manual Override</strong> - Grant or revoke premium access manually</li>
            <li><strong>Payment History</strong> - Track all transactions and billing cycles</li>
            <li><strong>MRR Tracking</strong> - Monitor Monthly Recurring Revenue</li>
            <li><strong>User Details</strong> - View Discord user info and subscription status</li>
          </ul>
        </InfoBox>

        <InfoBox type="warning" title="⚠️ Important Notes">
          <ul className="list-disc list-inside space-y-1">
            <li>Manual subscription changes will override payment provider status</li>
            <li>Always verify payment before granting manual access</li>
            <li>Check refund policy before cancelling active subscriptions</li>
          </ul>
        </InfoBox>

        <div className="grid md:grid-cols-4 gap-6">
          <div className="border border-slate-700 rounded-lg p-6 bg-slate-800">
            <div className="text-sm text-slate-400 mb-2">Active Subscriptions</div>
            <div className="text-2xl font-bold text-white">
              {String(stats.rows[0]?.active_count || 0)}
            </div>
          </div>
          <div className="border border-slate-700 rounded-lg p-6 bg-slate-800">
            <div className="text-sm text-slate-400 mb-2">Cancelled</div>
            <div className="text-2xl font-bold text-white">
              {String(stats.rows[0]?.cancelled_count || 0)}
            </div>
          </div>
          <div className="border border-slate-700 rounded-lg p-6 bg-slate-800">
            <div className="text-sm text-slate-400 mb-2">Expired</div>
            <div className="text-2xl font-bold text-white">
              {String(stats.rows[0]?.expired_count || 0)}
            </div>
          </div>
          <div className="border border-slate-700 rounded-lg p-6 bg-slate-800">
            <div className="text-sm text-slate-400 mb-2">Total MRR</div>
            <div className="text-2xl font-bold text-white">
              ${String(stats.rows[0]?.total_mrr || 0)}
            </div>
          </div>
        </div>

        <UserSubscriptionsList subscriptions={subs} />
      </div>
    </div>
  );
}
