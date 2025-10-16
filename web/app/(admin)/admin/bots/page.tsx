import { db } from '@/lib/db';
import { botInstances } from '@/lib/schema';
import { desc } from 'drizzle-orm';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import BotInstancesList from '@/components/admin/BotInstancesList';
import InfoBox from '@/components/admin/InfoBox';

export default async function BotInstancesPage() {
  const bots = await db.select().from(botInstances).orderBy(desc(botInstances.createdAt));

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Bot Instances</h1>
          <p className="text-slate-400">
            Manage multiple bot instances and custom bots
          </p>
        </div>
        <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
          <FontAwesomeIcon icon={faPlus} className="h-5 w-5" />
          Create Bot Instance
        </button>
      </div>

      <div className="space-y-6">
        <InfoBox type="info" title="🤖 Bot Instances Guide">
          <p className="mb-2">Manage multiple Discord bot instances from one dashboard:</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li><strong>Main Bot</strong> - Primary production bot for all servers</li>
            <li><strong>Custom Bots</strong> - User-owned bots with custom tokens</li>
            <li><strong>Dev Bots</strong> - Development/testing instances</li>
            <li><strong>Status Monitoring</strong> - Real-time online/offline tracking</li>
          </ul>
        </InfoBox>

        <InfoBox type="warning" title="⚠️ Security Notice">
          <p>Bot tokens are encrypted and stored securely. Never share tokens publicly or commit them to code repositories.</p>
        </InfoBox>

        <BotInstancesList bots={bots} />
      </div>
    </div>
  );
}
