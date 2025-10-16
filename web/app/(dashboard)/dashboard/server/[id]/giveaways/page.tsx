import { db } from '@/lib/db';
import { giveaways, giveawayParticipants } from '@/lib/schema';
import { eq, desc } from 'drizzle-orm';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGift, faPlus } from '@fortawesome/free-solid-svg-icons';
import GiveawaysList from '@/components/dashboard/GiveawaysList';
import InfoBox from '@/components/admin/InfoBox';
import { requireServerAccessOrRedirect } from '@/lib/server-page-auth';
import CreateGiveawayButton from '@/components/dashboard/CreateGiveawayButton';

export default async function GiveawaysPage({ params }: { params: { id: string } }) {
  await requireServerAccessOrRedirect(params.id);
  
  const serverGiveaways = await db
    .select()
    .from(giveaways)
    .where(eq(giveaways.serverId, params.id))
    .orderBy(desc(giveaways.createdAt));

  // Get participant counts for each giveaway
  const giveawaysWithCounts = await Promise.all(
    serverGiveaways.map(async (giveaway) => {
      const participants = await db
        .select()
        .from(giveawayParticipants)
        .where(eq(giveawayParticipants.giveawayId, giveaway.id));
      
      return {
        ...giveaway,
        participantCount: participants.length,
      };
    })
  );

  const activeCount = giveawaysWithCounts.filter(g => g.status === 'active').length;
  const endedCount = giveawaysWithCounts.filter(g => g.status === 'ended').length;

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <FontAwesomeIcon icon={faGift} className="h-6 w-6 text-purple-400" />
            <h1 className="text-2xl font-bold text-white">Giveaway Manager</h1>
          </div>
          <CreateGiveawayButton serverId={params.id} />
        </div>
        <p className="text-slate-400">
          Manage and monitor server giveaways
        </p>
      </div>

      <div className="space-y-6">
        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
            <div className="text-sm text-slate-400 mb-1">Active Giveaways</div>
            <div className="text-2xl font-bold text-green-400">{activeCount}</div>
          </div>
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
            <div className="text-sm text-slate-400 mb-1">Ended</div>
            <div className="text-2xl font-bold text-slate-400">{endedCount}</div>
          </div>
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
            <div className="text-sm text-slate-400 mb-1">Total</div>
            <div className="text-2xl font-bold text-white">{giveawaysWithCounts.length}</div>
          </div>
        </div>

        <InfoBox type="info" title="Giveaway Management">
          <p className="mb-2">Manage your server giveaways from the dashboard:</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li><strong>Monitor Status</strong> - Track active, ended, and cancelled giveaways</li>
            <li><strong>View Participants</strong> - See who joined each giveaway</li>
            <li><strong>End Early</strong> - Close a giveaway before scheduled end time</li>
            <li><strong>Reroll Winners</strong> - Pick new winners if needed</li>
          </ul>
          <p className="mt-2 text-xs text-slate-500">
            Note: Create new giveaways using the Discord bot commands (!giveaway)
          </p>
        </InfoBox>

        <GiveawaysList serverId={params.id} giveaways={giveawaysWithCounts} />
      </div>
    </div>
  );
}
