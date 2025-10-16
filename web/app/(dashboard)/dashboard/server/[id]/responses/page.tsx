import { db } from '@/lib/db';
import { customResponses } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRobot } from '@fortawesome/free-solid-svg-icons';
import CustomResponsesList from '@/components/dashboard/CustomResponsesList';
import InfoBox from '@/components/admin/InfoBox';
import { requireServerAccessOrRedirect } from '@/lib/server-page-auth';

export default async function CustomResponsesPage({ params }: { params: { id: string } }) {
  await requireServerAccessOrRedirect(params.id);
  
  const responses = await db
    .select()
    .from(customResponses)
    .where(eq(customResponses.serverId, params.id))
    .orderBy(customResponses.priority);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <FontAwesomeIcon icon={faRobot} className="h-6 w-6 text-blue-400" />
          <h1 className="text-2xl font-bold text-white">Custom Auto-Responses</h1>
        </div>
        <p className="text-slate-400">
          Create custom automatic responses for specific keywords or phrases
        </p>
      </div>

      <div className="space-y-6">
        <InfoBox type="info" title="How Auto-Responses Work">
          <p className="mb-2">Create custom responses that trigger automatically when users send specific messages:</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li><strong>Triggers</strong> - Keywords or phrases that activate the response</li>
            <li><strong>Exact Match</strong> - Enable to require exact phrase match (case-insensitive)</li>
            <li><strong>Priority</strong> - Higher priority responses trigger first (0 = lowest)</li>
            <li><strong>Embed Support</strong> - Link to custom embeds for rich responses</li>
          </ul>
        </InfoBox>

        <CustomResponsesList serverId={params.id} initialResponses={responses} />
      </div>
    </div>
  );
}
