import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDatabase } from '@fortawesome/free-solid-svg-icons';
import { db } from '@/lib/db';
import { sql } from 'drizzle-orm';
import InfoBox from '@/components/admin/InfoBox';
import { ResetAllButton, ResetServerButton } from '@/components/admin/DatabaseActions';
import QuickCleanup from '@/components/admin/QuickCleanup';

export default async function DatabasePage() {
  // Get real stats from database
  const stats = await db.execute(sql`
    SELECT 
      (SELECT COUNT(DISTINCT server_id) FROM server_configs) as total_servers,
      (SELECT COUNT(*) FROM conversation_history) as total_conversations,
      (SELECT COUNT(*) FROM giveaways) as total_giveaways,
      (SELECT COUNT(*) FROM subscriptions) as total_subscriptions
  `);

  const dbStats = stats.rows[0];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-2">Database Management</h1>
        <p className="text-slate-400">
          Manage database tables and perform cleanup operations
        </p>
      </div>

      <div className="space-y-6">
        <InfoBox type="warning" title="⚠️ Database Operations Warning">
          <p className="mb-2">Database operations are <strong>irreversible</strong>. Always:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Backup important data before resetting tables</li>
            <li>Verify server ID before performing server-specific resets</li>
            <li>Use cleanup operations during low-traffic periods</li>
            <li>Test operations on development database first</li>
          </ul>
        </InfoBox>

        <QuickCleanup />

        <div className="border border-slate-700 rounded-lg p-6 bg-slate-800">
          <h3 className="font-semibold text-white mb-4">Reset All Database</h3>
          <p className="text-sm text-slate-400 mb-4">
            Delete all data from all tables. This action cannot be undone.
          </p>
          <ResetAllButton />
        </div>

        <div className="border border-slate-700 rounded-lg p-6 bg-slate-800">
          <h3 className="font-semibold text-white mb-4">Reset by Server</h3>
          <ResetServerButton />
        </div>

        <div className="border border-slate-700 rounded-lg p-6 bg-slate-800">
          <h3 className="font-semibold text-white mb-4">Database Statistics</h3>
          <div className="grid md:grid-cols-4 gap-6">
            <div>
              <div className="text-sm text-slate-400 mb-1">Total Servers</div>
              <div className="text-2xl font-bold text-white">
                {dbStats.total_servers?.toLocaleString() || 0}
              </div>
            </div>
            <div>
              <div className="text-sm text-slate-400 mb-1">Conversations</div>
              <div className="text-2xl font-bold text-white">
                {dbStats.total_conversations?.toLocaleString() || 0}
              </div>
            </div>
            <div>
              <div className="text-sm text-slate-400 mb-1">Giveaways</div>
              <div className="text-2xl font-bold text-white">
                {dbStats.total_giveaways?.toLocaleString() || 0}
              </div>
            </div>
            <div>
              <div className="text-sm text-slate-400 mb-1">Subscriptions</div>
              <div className="text-2xl font-bold text-white">
                {dbStats.total_subscriptions?.toLocaleString() || 0}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
