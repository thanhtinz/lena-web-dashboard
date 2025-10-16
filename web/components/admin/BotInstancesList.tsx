'use client';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCog, faChartLine, faRotateRight, faPlay } from '@fortawesome/free-solid-svg-icons';

export default function BotInstancesList({ bots }: { bots: any[] }) {
  if (bots.length === 0) {
    return (
      <div className="border border-slate-700 rounded-lg p-12 bg-slate-800 text-center">
        <p className="text-slate-400 mb-4">No bot instances created yet</p>
        <p className="text-sm text-slate-500">Click "Create Bot Instance" to get started</p>
      </div>
    );
  }

  const statusColors = {
    online: "bg-green-500",
    offline: "bg-red-500",
    maintenance: "bg-yellow-500",
  };

  return (
    <div className="space-y-4">
      {bots.map((bot) => (
        <div key={bot.id} className="border border-slate-700 rounded-lg p-6 bg-slate-800">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-lg font-semibold text-white">{bot.name}</h3>
                <div className="flex items-center gap-2">
                  <div className={`h-2 w-2 rounded-full ${statusColors[bot.status as keyof typeof statusColors] || 'bg-gray-500'}`} />
                  <span className="text-sm capitalize text-slate-300">{bot.status || 'offline'}</span>
                </div>
              </div>
              <div className="text-sm text-slate-500 mb-3">ID: {bot.id}</div>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-slate-400">Client ID: </span>
                  <span className="font-medium text-white">{bot.clientId || bot.client_id || 'Not set'}</span>
                </div>
                <div>
                  <span className="text-slate-400">Token: </span>
                  <span className="font-medium text-white">{bot.tokenEncrypted || bot.token_encrypted ? '••••••••' : 'Not set'}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button className="px-4 py-2 border border-slate-600 rounded-lg hover:bg-slate-700 transition text-white">
                <FontAwesomeIcon icon={faCog} className="h-4 w-4 mr-2" />
                Settings
              </button>
              <button className="px-4 py-2 border border-slate-600 rounded-lg hover:bg-slate-700 transition text-white">
                <FontAwesomeIcon icon={faChartLine} className="h-4 w-4 mr-2" />
                Stats
              </button>
              {bot.status === "online" ? (
                <button className="px-4 py-2 border border-yellow-600 text-yellow-400 rounded-lg hover:bg-yellow-600/10 transition">
                  <FontAwesomeIcon icon={faRotateRight} className="h-4 w-4 mr-2" />
                  Restart
                </button>
              ) : (
                <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition">
                  <FontAwesomeIcon icon={faPlay} className="h-4 w-4 mr-2" />
                  Start
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
