'use client';

import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faEdit, faTrash, faBrain, faCheckCircle, faTimesCircle, faCrown } from '@fortawesome/free-solid-svg-icons';
import TrainingDataModal from './TrainingDataModal';

interface TrainingData {
  id: number;
  serverId: string;
  question: string;
  answer: string;
  category: string | null;
  isActive: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export default function TrainingDataList({ 
  serverId, 
  initialData 
}: { 
  serverId: string; 
  initialData: TrainingData[];
}) {
  const [trainings, setTrainings] = useState(initialData);
  const [showModal, setShowModal] = useState(false);
  const [editingTraining, setEditingTraining] = useState<TrainingData | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this training data?')) return;
    
    setDeletingId(id);
    try {
      const response = await fetch(`/api/servers/${serverId}/training`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trainingId: id }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete');
      }
      
      setTrainings(trainings.filter(t => t.id !== id));
    } catch (error: any) {
      alert(error.message || 'Failed to delete training data');
    } finally {
      setDeletingId(null);
    }
  };

  const handleEdit = (training: TrainingData) => {
    setEditingTraining(training);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingTraining(null);
  };

  const handleSuccess = () => {
    window.location.reload();
  };

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div className="text-sm text-slate-400">
          {trainings.length} training item{trainings.length !== 1 ? 's' : ''} configured
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-purple-600 text-white px-3 py-1.5 rounded-lg hover:bg-purple-700 transition text-sm"
        >
          <FontAwesomeIcon icon={faPlus} className="h-3.5 w-3.5" />
          <span className="hidden md:inline">Add Training Data</span>
        </button>
      </div>

      {trainings.length === 0 ? (
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-12 text-center">
          <FontAwesomeIcon icon={faBrain} className="h-16 w-16 text-slate-600 mb-4" />
          <p className="text-slate-400 mb-2">No training data yet</p>
          <p className="text-sm text-slate-500 mb-4">Click "Add Training Data" to train Lena with custom Q&A</p>
          <div className="inline-flex items-center gap-2 text-yellow-500 text-sm">
            <FontAwesomeIcon icon={faCrown} />
            <span>Premium feature</span>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {trainings.map((training) => (
            <div
              key={training.id}
              className="bg-slate-800 border border-slate-700 rounded-lg p-5 hover:border-slate-600 transition"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex items-center gap-2 text-purple-400">
                      <FontAwesomeIcon icon={faBrain} className="h-4 w-4" />
                      <span className="font-semibold">{training.question}</span>
                    </div>
                    {training.category && (
                      <span className="text-xs px-2 py-0.5 bg-blue-900/30 text-blue-400 rounded border border-blue-700/30">
                        {training.category}
                      </span>
                    )}
                    {training.isActive ? (
                      <span className="text-xs px-2 py-0.5 bg-green-900/30 text-green-400 rounded border border-green-700/30">
                        <FontAwesomeIcon icon={faCheckCircle} className="h-3 w-3 mr-1" />
                        Active
                      </span>
                    ) : (
                      <span className="text-xs px-2 py-0.5 bg-gray-900/30 text-gray-400 rounded border border-gray-700/30">
                        <FontAwesomeIcon icon={faTimesCircle} className="h-3 w-3 mr-1" />
                        Inactive
                      </span>
                    )}
                  </div>
                  <p className="text-white text-sm leading-relaxed">{training.answer}</p>
                  <div className="text-xs text-slate-500 mt-2">
                    Created: {new Date(training.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEdit(training)}
                    className="px-2.5 py-1.5 border border-purple-600 text-purple-400 rounded hover:bg-purple-600/10 transition text-sm"
                  >
                    <FontAwesomeIcon icon={faEdit} className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(training.id)}
                    disabled={deletingId === training.id}
                    className="px-2.5 py-1.5 border border-red-600 text-red-400 rounded hover:bg-red-600/10 transition text-sm disabled:opacity-50"
                  >
                    <FontAwesomeIcon icon={faTrash} className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <TrainingDataModal
          isOpen={showModal}
          onClose={handleCloseModal}
          serverId={serverId}
          training={editingTraining}
          onSuccess={handleSuccess}
        />
      )}
    </>
  );
}
