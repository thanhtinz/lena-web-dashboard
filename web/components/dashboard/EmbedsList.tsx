'use client';

import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faEdit, faTrash, faCode } from '@fortawesome/free-solid-svg-icons';
import EmbedBuilderModal from './EmbedBuilderModal';

interface CustomEmbed {
  id: number;
  serverId: string;
  name: string;
  title: string | null;
  description: string | null;
  color: string | null;
  authorName: string | null;
  authorIcon: string | null;
  footerText: string | null;
  footerIcon: string | null;
  imageUrl: string | null;
  thumbnailUrl: string | null;
  fields: string | null;
  createdBy: string;
  createdAt: Date;
}

export default function EmbedsList({ 
  serverId, 
  initialEmbeds 
}: { 
  serverId: string; 
  initialEmbeds: CustomEmbed[];
}) {
  const [embeds, setEmbeds] = useState(initialEmbeds);
  const [showModal, setShowModal] = useState(false);
  const [editingEmbed, setEditingEmbed] = useState<CustomEmbed | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this embed?')) return;
    
    setDeletingId(id);
    try {
      const response = await fetch(`/api/servers/${serverId}/embeds`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ embedId: id }),
      });

      if (!response.ok) throw new Error('Failed to delete');
      
      setEmbeds(embeds.filter(e => e.id !== id));
    } catch (error) {
      alert('Failed to delete embed');
    } finally {
      setDeletingId(null);
    }
  };

  const handleEdit = (embed: CustomEmbed) => {
    setEditingEmbed(embed);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingEmbed(null);
  };

  const handleSuccess = () => {
    window.location.reload();
  };

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div className="text-sm text-slate-400">
          {embeds.length} embed template{embeds.length !== 1 ? 's' : ''} saved
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-indigo-600 text-white px-3 py-1.5 rounded-lg hover:bg-indigo-700 transition text-sm"
        >
          <FontAwesomeIcon icon={faPlus} className="h-4 w-4" />
          <span className="hidden md:inline">Create Embed</span>
        </button>
      </div>

      {embeds.length === 0 ? (
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-12 text-center">
          <FontAwesomeIcon icon={faCode} className="h-16 w-16 text-slate-600 mb-4" />
          <p className="text-slate-400 mb-2">No embeds yet</p>
          <p className="text-sm text-slate-500">Click "Create Embed" to build your first custom embed</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {embeds.map((embed) => (
            <div
              key={embed.id}
              className="bg-slate-800 border border-slate-700 rounded-lg overflow-hidden hover:border-slate-600 transition"
            >
              <div className="p-4 border-b border-slate-700">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-white mb-1">{embed.name}</h3>
                    {embed.title && (
                      <p className="text-sm text-slate-400 truncate">{embed.title}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEdit(embed)}
                      className="px-3 py-1.5 border border-indigo-600 text-indigo-400 rounded hover:bg-indigo-600/10 transition text-sm"
                    >
                      <FontAwesomeIcon icon={faEdit} className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(embed.id)}
                      disabled={deletingId === embed.id}
                      className="px-3 py-1.5 border border-red-600 text-red-400 rounded hover:bg-red-600/10 transition text-sm disabled:opacity-50"
                    >
                      <FontAwesomeIcon icon={faTrash} className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
              <div 
                className="p-4 border-l-4" 
                style={{ borderLeftColor: embed.color || '#5865F2' }}
              >
                {embed.description && (
                  <p className="text-sm text-slate-300 line-clamp-3">{embed.description}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <EmbedBuilderModal
        isOpen={showModal}
        onClose={handleCloseModal}
        serverId={serverId}
        embed={editingEmbed}
        onSuccess={handleSuccess}
      />
    </>
  );
}
