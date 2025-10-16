import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCrown, faLock } from '@fortawesome/free-solid-svg-icons';
import Link from 'next/link';

interface PremiumNoticeProps {
  featureName: string;
  serverId: string;
}

export default function PremiumNotice({ featureName, serverId }: PremiumNoticeProps) {
  return (
    <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border-2 border-yellow-500/50 rounded-lg p-6 text-center">
      <div className="flex justify-center mb-4">
        <div className="w-16 h-16 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 flex items-center justify-center">
          <FontAwesomeIcon icon={faLock} className="h-8 w-8 text-white" />
        </div>
      </div>
      <h3 className="text-xl font-bold text-white mb-2 flex items-center justify-center gap-2">
        <FontAwesomeIcon icon={faCrown} className="h-5 w-5 text-yellow-500" />
        Premium Feature
      </h3>
      <p className="text-slate-300 mb-4">
        {featureName} is a premium feature. Upgrade your server to unlock this powerful tool!
      </p>
      <Link
        href={`/dashboard/server/${serverId}/premium`}
        className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-semibold rounded-lg hover:from-yellow-600 hover:to-orange-600 transition"
      >
        <FontAwesomeIcon icon={faCrown} className="h-4 w-4" />
        Upgrade to Premium
      </Link>
    </div>
  );
}
