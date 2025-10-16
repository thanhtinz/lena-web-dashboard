'use client';

import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGift, faUsers, faClock, faTrophy, faStop, faDice } from '@fortawesome/free-solid-svg-icons';

interface Giveaway {
  id: number;
  serverId: string;
  channelId: string;
  messageId: string | null;
  hostId: string;
  prize: string;
  winnerCount: number;
  requiredRole: string | null;
  endTime: Date;
  status: string;
  winners: string | null;
  createdAt: Date;
  participantCount: number;
}

export default function GiveawaysList({ 
  serverId, 
  giveaways 
}: { 
  serverId: string; 
  giveaways: Giveaway[];
}) {
  const [actioningId, setActioningId] = useState<number | null>(null);

  const handleEndGiveaway = async (id: number) => {
    if (!confirm('Are you sure you want to end this giveaway early?')) return;
    
    setActioningId(id);
    try {
      const response = await fetch(`/api/servers/${serverId}/giveaways`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'end', giveawayId: id }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to end giveaway');
      }

      alert('Giveaway ended successfully!');
      window.location.reload();
    } catch (error: any) {
      alert('Failed to end giveaway: ' + error.message);
    } finally {
      setActioningId(null);
    }
  };

  const handleReroll = async (id: number) => {
    if (!confirm('Reroll winners for this giveaway?')) return;
    
    setActioningId(id);
    try {
      const response = await fetch(`/api/servers/${serverId}/giveaways`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reroll', giveawayId: id }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to reroll winners');
      }

      alert(`Winners rerolled successfully! New winners: ${data.newWinners.join(', ')}`);
      window.location.reload();
    } catch (error: any) {
      alert('Failed to reroll winners: ' + error.message);
    } finally {
      setActioningId(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-400 bg-green-400/10 border-green-700/30';
      case 'ended':
        return 'text-blue-400 bg-blue-400/10 border-blue-700/30';
      case 'cancelled':
        return 'text-red-400 bg-red-400/10 border-red-700/30';
      default:
        return 'text-slate-400 bg-slate-400/10 border-slate-700/30';
    }
  };

  const isActive = (endTime: Date) => new Date() < new Date(endTime);

  if (giveaways.length === 0) {
    return (
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-12 text-center">
        <FontAwesomeIcon icon={faGift} className="h-16 w-16 text-slate-600 mb-4" />
        <p className="text-slate-400 mb-2">No giveaways yet</p>
        <p className="text-sm text-slate-500">Create a giveaway using !giveaway command in Discord</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {giveaways.map((giveaway) => {
        const winners = giveaway.winners ? JSON.parse(giveaway.winners) : [];
        const timeLeft = new Date(giveaway.endTime).getTime() - new Date().getTime();
        const hoursLeft = Math.floor(timeLeft / (1000 * 60 * 60));

        return (
          <div
            key={giveaway.id}
            className="bg-slate-800 border border-slate-700 rounded-lg p-6 hover:border-slate-600 transition"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex items-center gap-2 text-purple-400">
                    <FontAwesomeIcon icon={faGift} className="h-5 w-5" />
                    <span className="font-semibold text-lg text-white">{giveaway.prize}</span>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded border ${getStatusColor(giveaway.status)}`}>
                    {giveaway.status}
                  </span>
                </div>

                <div className="grid md:grid-cols-3 gap-4 mb-4 text-sm">
                  <div className="flex items-center gap-2 text-slate-400">
                    <FontAwesomeIcon icon={faUsers} className="h-4 w-4" />
                    <span>{giveaway.participantCount} participants</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-400">
                    <FontAwesomeIcon icon={faTrophy} className="h-4 w-4" />
                    <span>{giveaway.winnerCount} winner{giveaway.winnerCount > 1 ? 's' : ''}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-400">
                    <FontAwesomeIcon icon={faClock} className="h-4 w-4" />
                    <span>
                      {isActive(giveaway.endTime) && giveaway.status === 'active'
                        ? `${hoursLeft}h left`
                        : new Date(giveaway.endTime).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {winners.length > 0 && (
                  <div className="bg-slate-900 rounded p-3 text-sm">
                    <span className="text-slate-400">Winners: </span>
                    <span className="text-green-400">{winners.join(', ')}</span>
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-2">
                {giveaway.status === 'active' && (
                  <button
                    onClick={() => handleEndGiveaway(giveaway.id)}
                    disabled={actioningId === giveaway.id}
                    className="px-3 py-1.5 border border-red-600 text-red-400 rounded hover:bg-red-600/10 transition text-sm disabled:opacity-50 whitespace-nowrap"
                  >
                    <FontAwesomeIcon icon={faStop} className="h-4 w-4 md:mr-1" />
                    <span className="hidden md:inline">End Early</span>
                  </button>
                )}
                {giveaway.status === 'ended' && winners.length > 0 && (
                  <button
                    onClick={() => handleReroll(giveaway.id)}
                    disabled={actioningId === giveaway.id}
                    className="px-3 py-1.5 border border-blue-600 text-blue-400 rounded hover:bg-blue-600/10 transition text-sm disabled:opacity-50 whitespace-nowrap"
                  >
                    <FontAwesomeIcon icon={faDice} className="h-4 w-4 md:mr-1" />
                    <span className="hidden md:inline">Reroll</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
