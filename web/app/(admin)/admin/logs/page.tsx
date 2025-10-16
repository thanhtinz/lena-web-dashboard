import { db } from '@/lib/db';
import { adminLogs } from '@/lib/schema';
import { desc } from 'drizzle-orm';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClipboardList } from '@fortawesome/free-solid-svg-icons';
import InfoBox from '@/components/admin/InfoBox';

export default async function AdminLogsPage() {
  const logs = await db
    .select()
    .from(adminLogs)
    .orderBy(desc(adminLogs.timestamp))
    .limit(100);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-2">Admin Activity Logs</h1>
        <p className="text-slate-400">
          Track all administrative actions and system events
        </p>
      </div>

      <div className="space-y-6">
        <InfoBox type="info" title="📋 Admin Logs Guide">
          <p className="mb-2">Complete audit trail of all admin activities:</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li><strong>Activity Tracking</strong> - All admin actions are automatically logged</li>
            <li><strong>Timestamp Records</strong> - Precise date/time for each action</li>
            <li><strong>User Attribution</strong> - Know which admin performed each action</li>
            <li><strong>Action Details</strong> - Full context for debugging and compliance</li>
            <li><strong>Audit Trail</strong> - Required for security and compliance audits</li>
          </ul>
        </InfoBox>

        {logs.length === 0 ? (
          <div className="border border-slate-700 rounded-lg p-12 bg-slate-800 text-center">
            <FontAwesomeIcon icon={faClipboardList} className="h-12 w-12 text-slate-600 mb-4" />
            <p className="text-slate-400 mb-2">No activity logs yet</p>
            <p className="text-sm text-slate-500">Admin actions will be logged here automatically</p>
          </div>
        ) : (
          <div className="border border-slate-700 rounded-lg bg-slate-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-700">
                  <tr>
                    <th className="text-left px-6 py-3 text-sm font-semibold text-white">Time</th>
                    <th className="text-left px-6 py-3 text-sm font-semibold text-white">Admin</th>
                    <th className="text-left px-6 py-3 text-sm font-semibold text-white">Action</th>
                    <th className="text-left px-6 py-3 text-sm font-semibold text-white">Target</th>
                    <th className="text-left px-6 py-3 text-sm font-semibold text-white">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-700/50 transition">
                      <td className="px-6 py-4 text-sm text-slate-300">
                        {log.timestamp ? new Date(log.timestamp).toLocaleString() : 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-sm text-white">
                        {log.adminUserId}
                      </td>
                      <td className="px-6 py-4 text-sm text-white">
                        {log.action}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-300">
                        {log.targetType || 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-400">
                        {log.details ? JSON.stringify(log.details).slice(0, 50) + '...' : 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
