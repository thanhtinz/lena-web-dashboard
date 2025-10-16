import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { faCrown } from '@fortawesome/free-solid-svg-icons';

interface PageHeaderProps {
  icon: IconDefinition;
  title: string;
  description: string;
  isPremium?: boolean;
  gradientFrom?: string;
  gradientTo?: string;
}

export default function PageHeader({
  icon,
  title,
  description,
  isPremium = false,
  gradientFrom = 'blue-500',
  gradientTo = 'purple-500'
}: PageHeaderProps) {
  return (
    <div className="bg-slate-800 p-4 md:p-6 rounded-lg border border-slate-700 mb-6">
      <div className="flex items-center gap-3 md:gap-4">
        <div className={`w-10 h-10 md:w-12 md:h-12 flex-shrink-0 rounded-full bg-gradient-to-r from-${gradientFrom} to-${gradientTo} flex items-center justify-center`}>
          <FontAwesomeIcon icon={icon} className="h-5 w-5 md:h-6 md:w-6 text-white" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-xl md:text-2xl font-bold text-white">{title}</h2>
            {isPremium && (
              <span className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-black text-xs px-2 py-1 rounded-full">
                <FontAwesomeIcon icon={faCrown} className="mr-1" />
                PREMIUM
              </span>
            )}
          </div>
          <p className="text-sm md:text-base text-slate-400 break-words">{description}</p>
        </div>
      </div>
    </div>
  );
}
