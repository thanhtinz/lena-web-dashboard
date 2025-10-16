'use client';

import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faEdit, faTrash, faBolt, faCheckCircle, faRobot } from '@fortawesome/free-solid-svg-icons';
import CustomResponseModal from './CustomResponseModal';

interface CustomResponse {
  id: number;
  serverId: string;
  trigger: string;
  response: string;
  embedName: string | null;
  isExactMatch: boolean;
  priority: number;
  createdBy: string;
  createdAt: Date;
}

export default function CustomResponsesList({ 
  serverId, 
  initialResponses 
}: { 
  serverId: string; 
  initialResponses: CustomResponse[];
}) {
  const [responses, setResponses] = useState(initialResponses);
  const [showModal, setShowModal] = useState(false);
  const [editingResponse, setEditingResponse] = useState<CustomResponse | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this auto-response?')) return;
    
    setDeletingId(id);
    try {
      const response = await fetch(`/api/servers/${serverId}/responses`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ responseId: id }),
      });

      if (!response.ok) throw new Error('Failed to delete');
      
      setResponses(responses.filter(r => r.id !== id));
    } catch (error) {
      alert('Failed to delete auto-response');
    } finally {
      setDeletingId(null);
    }
  };

  const handleEdit = (response: CustomResponse) => {
    setEditingResponse(response);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingResponse(null);
  };

  const handleSuccess = () => {
    window.location.reload();
  };

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div className="text-sm text-slate-400">
          {responses.length} auto-response{responses.length !== 1 ? 's' : ''} configured
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition text-sm"
        >
          <FontAwesomeIcon icon={faPlus} className="h-3.5 w-3.5" />
          <span className="hidden md:inline">Add Auto-Response</span>
        </button>
      </div>

      {responses.length === 0 ? (
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-12 text-center">
          <FontAwesomeIcon icon={faRobot} className="h-16 w-16 text-slate-600 mb-4" />
          <p className="text-slate-400 mb-2">No auto-responses yet</p>
          <p className="text-sm text-slate-500">Click "Add Auto-Response" to create your first one</p>
        </div>
      ) : (
        <div className="space-y-3">
          {responses.map((resp) => (
            <div
              key={resp.id}
              className="bg-slate-800 border border-slate-700 rounded-lg p-5 hover:border-slate-600 transition"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex items-center gap-2 text-blue-400">
                      <FontAwesomeIcon icon={faBolt} className="h-4 w-4" />
                      <span className="font-mono font-medium">"{resp.trigger}"</span>
                    </div>
                    {resp.isExactMatch && (
                      <span className="text-xs px-2 py-0.5 bg-green-900/30 text-green-400 rounded border border-green-700/30">
                        <FontAwesomeIcon icon={faCheckCircle} className="h-3 w-3 mr-1" />
                        Exact Match
                      </span>
                    )}
                    {resp.priority > 0 && (
                      <span className="text-xs px-2 py-0.5 bg-purple-900/30 text-purple-400 rounded border border-purple-700/30">
                        Priority: {resp.priority}
                      </span>
                    )}
                  </div>
                  <p className="text-white mb-2">{resp.response}</p>
                  {resp.embedName && (
                    <div className="text-xs text-slate-500">
                      Embed: <span className="text-blue-400">{resp.embedName}</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEdit(resp)}
                    className="px-3 py-1.5 border border-blue-600 text-blue-400 rounded hover:bg-blue-600/10 transition text-sm"
                  >
                    <FontAwesomeIcon icon={faEdit} className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(resp.id)}
                    disabled={deletingId === resp.id}
                    className="px-3 py-1.5 border border-red-600 text-red-400 rounded hover:bg-red-600/10 transition text-sm disabled:opacity-50"
                  >
                    <FontAwesomeIcon icon={faTrash} className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <CustomResponseModal
        isOpen={showModal}
        onClose={handleCloseModal}
        serverId={serverId}
        response={editingResponse}
        onSuccess={handleSuccess}
      />
    </>
  );
}
