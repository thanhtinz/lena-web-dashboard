import { db } from '@/lib/db';
import { customEmbeds } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCode } from '@fortawesome/free-solid-svg-icons';
import EmbedsList from '@/components/dashboard/EmbedsList';
import InfoBox from '@/components/admin/InfoBox';
import { requireServerAccessOrRedirect } from '@/lib/server-page-auth';

export default async function EmbedsPage({ params }: { params: { id: string } }) {
  await requireServerAccessOrRedirect(params.id);
  
  const embeds = await db
    .select()
    .from(customEmbeds)
    .where(eq(customEmbeds.serverId, params.id));

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <FontAwesomeIcon icon={faCode} className="h-6 w-6 text-indigo-400" />
          <h1 className="text-2xl font-bold text-white">Embed Builder</h1>
        </div>
        <p className="text-slate-400">
          Create beautiful Discord embeds for your bot messages
        </p>
      </div>

      <div className="space-y-6">
        <InfoBox type="info" title="Embed Builder Guide">
          <p className="mb-2">Create rich, custom Discord embeds with visual editor:</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li><strong>Live Preview</strong> - See your embed as you build it</li>
            <li><strong>Reusable Templates</strong> - Save and reuse embeds across commands</li>
            <li><strong>Full Customization</strong> - Title, description, color, fields, images, and more</li>
            <li><strong>Auto-Responses Integration</strong> - Link embeds to auto-responses</li>
          </ul>
        </InfoBox>

        <EmbedsList serverId={params.id} initialEmbeds={embeds} />
      </div>
    </div>
  );
}
