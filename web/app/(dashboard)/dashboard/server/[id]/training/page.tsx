import { db } from '@/lib/db';
import { trainingData } from '@/lib/schema';
import { eq, desc } from 'drizzle-orm';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBrain, faCrown } from '@fortawesome/free-solid-svg-icons';
import TrainingDataList from '@/components/dashboard/TrainingDataList';
import InfoBox from '@/components/admin/InfoBox';
import { requireServerAccessOrRedirect } from '@/lib/server-page-auth';

export default async function TrainingPage({ params }: { params: { id: string } }) {
  await requireServerAccessOrRedirect(params.id);
  
  const trainings = await db
    .select()
    .from(trainingData)
    .where(eq(trainingData.serverId, params.id))
    .orderBy(desc(trainingData.createdAt));

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center gap-2 md:gap-3 mb-2">
          <FontAwesomeIcon icon={faBrain} className="h-5 w-5 md:h-6 md:w-6 text-purple-400" />
          <h1 className="text-lg md:text-2xl font-bold text-white">Train Lena</h1>
          <span className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-black text-xs px-2 py-1 rounded-full font-semibold whitespace-nowrap">
            <FontAwesomeIcon icon={faCrown} className="mr-1" />
            PREMIUM
          </span>
        </div>
        <p className="text-sm md:text-base text-slate-400">
          Teach Lena custom Q&A responses specific to your server
        </p>
      </div>

      <div className="space-y-6">
        <InfoBox type="info" title="How Training Works">
          <p className="mb-2">Train Lena to answer custom questions with your own data:</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li><strong>Question</strong> - The question or topic users ask about</li>
            <li><strong>Answer</strong> - Lena's response to this question</li>
            <li><strong>Category</strong> - Organize training data by topic</li>
            <li><strong>Active/Inactive</strong> - Enable or disable individual training items</li>
            <li><strong>Premium Only</strong> - Training data is a premium feature</li>
          </ul>
        </InfoBox>

        <TrainingDataList serverId={params.id} initialData={trainings} />
      </div>
    </div>
  );
}
