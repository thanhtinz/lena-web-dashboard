import { db } from '@/lib/db';
import { conversationHistory, giveaways, customResponses, customEmbeds, giveawayParticipants } from '@/lib/schema';
import { eq, sql, count, and, gte } from 'drizzle-orm';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChartLine, faComments, faGift, faRobot, faUsers } from '@fortawesome/free-solid-svg-icons';
import InfoBox from '@/components/admin/InfoBox';
import { requireServerAccessOrRedirect } from '@/lib/server-page-auth';
import ActivityChart from '@/components/dashboard/ActivityChart';

export default async function ServerAnalyticsPage({ params }: { params: { id: string } }) {
  const serverId = params.id;
  
  await requireServerAccessOrRedirect(serverId);

  // Get conversation stats
  const totalConversations = await db
    .select({ count: count() })
    .from(conversationHistory)
    .where(eq(conversationHistory.serverId, serverId));

  // Get recent conversations (last 7 days)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  
  const recentConversations = await db
    .select({ count: count() })
    .from(conversationHistory)
    .where(
      and(
        eq(conversationHistory.serverId, serverId),
        gte(conversationHistory.createdAt, sevenDaysAgo)
      )
    );

  // Get giveaway stats
  const activeGiveaways = await db
    .select({ count: count() })
    .from(giveaways)
    .where(and(
      eq(giveaways.serverId, serverId),
      eq(giveaways.status, 'active')
    ));

  const totalGiveaways = await db
    .select({ count: count() })
    .from(giveaways)
    .where(eq(giveaways.serverId, serverId));

  // Get custom content stats
  const totalResponses = await db
    .select({ count: count() })
    .from(customResponses)
    .where(eq(customResponses.serverId, serverId));

  const totalEmbeds = await db
    .select({ count: count() })
    .from(customEmbeds)
    .where(eq(customEmbeds.serverId, serverId));

  // Get total giveaway participants
  const serverGiveaways = await db
    .select({ id: giveaways.id })
    .from(giveaways)
    .where(eq(giveaways.serverId, serverId));

  const participantCounts = await Promise.all(
    serverGiveaways.map(async (g) => {
      const result = await db
        .select({ count: count() })
        .from(giveawayParticipants)
        .where(eq(giveawayParticipants.giveawayId, g.id));
      return result[0]?.count || 0;
    })
  );

  const totalParticipants = participantCounts.reduce((sum, count) => sum + count, 0);

  const stats = {
    totalConversations: totalConversations[0]?.count || 0,
    recentConversations: recentConversations[0]?.count || 0,
    activeGiveaways: activeGiveaways[0]?.count || 0,
    totalGiveaways: totalGiveaways[0]?.count || 0,
    totalResponses: totalResponses[0]?.count || 0,
    totalEmbeds: totalEmbeds[0]?.count || 0,
    totalParticipants,
  };

  // Generate chart data for last 7 days from real database data
  const activityData = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);
    
    const nextDay = new Date(date);
    nextDay.setDate(nextDay.getDate() + 1);
    
    const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    
    // Query real conversations for this day
    const dayConversations = await db
      .select({ count: count() })
      .from(conversationHistory)
      .where(
        and(
          eq(conversationHistory.serverId, serverId),
          gte(conversationHistory.createdAt, date),
          sql`${conversationHistory.createdAt} < ${nextDay}`
        )
      );
    
    // Query real giveaway participants for this day
    const dayGiveaways = await db
      .select({ id: giveaways.id })
      .from(giveaways)
      .where(
        and(
          eq(giveaways.serverId, serverId),
          gte(giveaways.createdAt, date),
          sql`${giveaways.createdAt} < ${nextDay}`
        )
      );
    
    let dayParticipants = 0;
    for (const g of dayGiveaways) {
      const pCount = await db
        .select({ count: count() })
        .from(giveawayParticipants)
        .where(eq(giveawayParticipants.giveawayId, g.id));
      dayParticipants += pCount[0]?.count || 0;
    }
    
    activityData.push({
      date: dateStr,
      conversations: dayConversations[0]?.count || 0,
      participants: dayParticipants,
    });
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center gap-2 md:gap-3 mb-2">
          <FontAwesomeIcon icon={faChartLine} className="h-5 w-5 md:h-6 md:w-6 text-blue-400" />
          <h1 className="text-lg md:text-2xl font-bold text-white">Server Analytics</h1>
        </div>
        <p className="text-sm md:text-base text-slate-400">
          Monitor your server's bot activity and engagement
        </p>
      </div>

      <div className="space-y-6">
        <InfoBox type="info" title="Analytics Overview">
          <p className="mb-2">Track your server's engagement with Lena Bot:</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li><strong>Conversations</strong> - Total AI interactions with server members</li>
            <li><strong>Giveaways</strong> - Active and historical giveaway participation</li>
            <li><strong>Custom Content</strong> - Auto-responses and custom embeds created</li>
            <li><strong>Activity Trends</strong> - Recent engagement metrics (last 7 days)</li>
          </ul>
        </InfoBox>

        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <FontAwesomeIcon icon={faComments} className="h-6 w-6 text-blue-400" />
              <h3 className="font-semibold text-white">Total Conversations</h3>
            </div>
            <div className="text-3xl font-bold text-white mb-2">
              {stats.totalConversations.toLocaleString()}
            </div>
            <div className="text-sm text-slate-400">
              {stats.recentConversations} in last 7 days
            </div>
          </div>

          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <FontAwesomeIcon icon={faGift} className="h-6 w-6 text-purple-400" />
              <h3 className="font-semibold text-white">Giveaways</h3>
            </div>
            <div className="text-3xl font-bold text-white mb-2">
              {stats.activeGiveaways} / {stats.totalGiveaways}
            </div>
            <div className="text-sm text-slate-400">
              Active / Total
            </div>
          </div>

          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <FontAwesomeIcon icon={faUsers} className="h-6 w-6 text-green-400" />
              <h3 className="font-semibold text-white">Giveaway Participants</h3>
            </div>
            <div className="text-3xl font-bold text-white mb-2">
              {stats.totalParticipants.toLocaleString()}
            </div>
            <div className="text-sm text-slate-400">
              Total participants
            </div>
          </div>
        </div>

        <ActivityChart data={activityData} />

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
            <h3 className="font-semibold text-white mb-4">Custom Content</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <FontAwesomeIcon icon={faRobot} className="h-4 w-4 text-blue-400" />
                  <span className="text-slate-300">Auto-Responses</span>
                </div>
                <span className="text-xl font-bold text-white">{stats.totalResponses}</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <FontAwesomeIcon icon={faRobot} className="h-4 w-4 text-indigo-400" />
                  <span className="text-slate-300">Custom Embeds</span>
                </div>
                <span className="text-xl font-bold text-white">{stats.totalEmbeds}</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
            <h3 className="font-semibold text-white mb-4">Activity Overview</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-slate-400">Recent Activity (7d)</span>
                  <span className="text-white">{stats.recentConversations}</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ 
                      width: `${Math.min((stats.recentConversations / Math.max(stats.totalConversations, 1)) * 100, 100)}%` 
                    }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-slate-400">Active Giveaways</span>
                  <span className="text-white">{stats.activeGiveaways}</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <div 
                    className="bg-purple-600 h-2 rounded-full" 
                    style={{ 
                      width: `${stats.totalGiveaways > 0 ? (stats.activeGiveaways / stats.totalGiveaways) * 100 : 0}%` 
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 border border-blue-700/30 rounded-lg p-6">
          <h3 className="font-semibold text-white mb-3">Engagement Tip</h3>
          <p className="text-sm text-slate-300">
            {stats.recentConversations === 0 
              ? "No recent activity detected. Try promoting the bot in announcement channels or setting up auto-responses to encourage interaction!"
              : stats.recentConversations < 10
              ? "Low recent activity. Consider creating giveaways or setting up welcome messages to boost engagement!"
              : "Great activity! Keep engaging your community with regular giveaways and custom responses."}
          </p>
        </div>
      </div>
    </div>
  );
}
