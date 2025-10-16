'use client';

import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import CreateGiveawayModal from './CreateGiveawayModal';

interface Channel {
  id: string;
  name: string;
  type: number;
}

export default function CreateGiveawayButton({ serverId }: { serverId: string }) {
  const [showModal, setShowModal] = useState(false);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(false);

  const handleOpen = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/servers/${serverId}/channels`);
      if (response.ok) {
        const data = await response.json();
        setChannels(data || []);
        setShowModal(true);
      } else {
        alert('Failed to load channels');
      }
    } catch (error) {
      console.error('Error loading channels:', error);
      alert('Failed to load channels');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={handleOpen}
        disabled={loading}
        className="flex items-center gap-2 px-3 py-1.5 bg-purple-600 text-white rounded hover:bg-purple-700 transition disabled:opacity-50 text-sm"
      >
        <FontAwesomeIcon icon={faPlus} className="h-4 w-4 md:mr-1" />
        <span className="hidden md:inline">Create Giveaway</span>
      </button>

      {showModal && (
        <CreateGiveawayModal
          serverId={serverId}
          channels={channels}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
}
