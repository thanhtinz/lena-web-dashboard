import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInfoCircle, faLightbulb, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';

type InfoBoxType = 'info' | 'tip' | 'warning';

interface InfoBoxProps {
  type?: InfoBoxType;
  title?: string;
  children: React.ReactNode;
}

const typeConfig = {
  info: {
    icon: faInfoCircle,
    bgColor: 'bg-blue-900/20',
    borderColor: 'border-blue-700/30',
    textColor: 'text-blue-300',
    iconColor: 'text-blue-400'
  },
  tip: {
    icon: faLightbulb,
    bgColor: 'bg-green-900/20',
    borderColor: 'border-green-700/30',
    textColor: 'text-green-300',
    iconColor: 'text-green-400'
  },
  warning: {
    icon: faExclamationTriangle,
    bgColor: 'bg-yellow-900/20',
    borderColor: 'border-yellow-700/30',
    textColor: 'text-yellow-300',
    iconColor: 'text-yellow-400'
  }
};

export default function InfoBox({ type = 'info', title, children }: InfoBoxProps) {
  const config = typeConfig[type];

  return (
    <div className={`${config.bgColor} border ${config.borderColor} rounded-lg p-4`}>
      <div className="flex gap-3">
        <FontAwesomeIcon icon={config.icon} className={`h-5 w-5 ${config.iconColor} flex-shrink-0 mt-0.5`} />
        <div className="flex-1">
          {title && (
            <h4 className={`font-semibold ${config.textColor} mb-2`}>{title}</h4>
          )}
          <div className={`text-sm ${config.textColor}`}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
