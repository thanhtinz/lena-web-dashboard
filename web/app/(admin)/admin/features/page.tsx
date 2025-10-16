import { db } from '@/lib/db';
import { featureFlags } from '@/lib/schema';
import { desc } from 'drizzle-orm';
import FeatureFlagsList from '@/components/admin/FeatureFlagsList';
import FeatureFlagsHeader from '@/components/admin/FeatureFlagsHeader';
import InfoBox from '@/components/admin/InfoBox';

export default async function FeatureFlagsPage() {
  const flags = await db.select().from(featureFlags).orderBy(desc(featureFlags.createdAt));

  return (
    <div className="container mx-auto px-4 py-8">
      <FeatureFlagsHeader />

      <div className="space-y-6">
        <InfoBox type="info" title="🎛️ Feature Flags Guide">
          <p className="mb-2">Feature flags allow you to enable/disable features globally without code changes:</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li><strong>Toggle Features</strong> - Enable/disable features in real-time</li>
            <li><strong>Rollout Percentage</strong> - Gradually release features to users (0-100%)</li>
            <li><strong>Targeting Rules</strong> - Control which servers/users see the feature</li>
            <li><strong>A/B Testing</strong> - Test features with specific user groups</li>
          </ul>
        </InfoBox>

        <InfoBox type="tip" title="💡 Best Practices">
          <ul className="list-disc list-inside space-y-1">
            <li>Start with low rollout percentage (10-20%) for new features</li>
            <li>Monitor error logs when enabling features</li>
            <li>Use descriptive names for easy identification</li>
            <li>Disable unused flags to keep the system clean</li>
          </ul>
        </InfoBox>

        <FeatureFlagsList flags={flags} />
      </div>
    </div>
  );
}
