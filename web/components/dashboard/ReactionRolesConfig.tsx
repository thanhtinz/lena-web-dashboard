'use client';

import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMessage, faCircleInfo, faLock, faUsers, faPlus } from '@fortawesome/free-solid-svg-icons';
import CreateReactionRoleModal from './CreateReactionRoleModal';

interface ReactionRoleMessage {
  id: number;
  messageId: string;
  channelId: string;
  enabled: boolean;
  locked: boolean;
  maxRolesPerUser: number | null;
  createdAt: Date;
}

interface ReactionRolesConfigProps {
  serverId: string;
}

export default function ReactionRolesConfig({ serverId }: ReactionRolesConfigProps) {
  const [messages, setMessages] = useState<ReactionRoleMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchMessages();
  }, [serverId]);

  const fetchMessages = async () => {
    try {
      const res = await fetch(`/api/servers/${serverId}/reaction-roles`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      }
    } catch (error) {
      console.error('Failed to fetch reaction roles:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-slate-800 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <FontAwesomeIcon icon={faMessage} className="text-purple-400 text-xl" />
          <h2 className="text-xl font-semibold text-white">Reaction Roles</h2>
        </div>
        <p className="text-slate-400">Loading...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-slate-800 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <FontAwesomeIcon icon={faMessage} className="text-purple-400 text-xl" />
            <h2 className="text-xl font-semibold text-white">Active Reaction Role Messages</h2>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
          >
            <FontAwesomeIcon icon={faPlus} className="mr-2" />
            <span className="hidden md:inline">Create Message</span>
          </button>
        </div>

        <p className="text-slate-400 text-sm mb-6">
          Create reaction role messages and manage role options
        </p>

        {messages.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            <FontAwesomeIcon icon={faMessage} className="text-4xl mb-3 opacity-50" />
            <p>No reaction role messages configured</p>
            <p className="text-sm mt-2">Click "Create Message" to get started</p>
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map((msg) => (
              <div key={msg.id} className="bg-slate-700 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <FontAwesomeIcon icon={faMessage} className="text-purple-400" />
                    <span className="text-white font-medium">Message {msg.messageId}</span>
                    {msg.locked && (
                      <span className="px-2 py-1 bg-yellow-900/30 text-yellow-400 rounded text-xs flex items-center gap-1">
                        <FontAwesomeIcon icon={faLock} className="text-xs" />
                        Locked
                      </span>
                    )}
                    {!msg.enabled && (
                      <span className="px-2 py-1 bg-red-900/30 text-red-400 rounded text-xs">
                        Disabled
                      </span>
                    )}
                  </div>
                  <a
                    href={`/dashboard/server/${serverId}/reaction-roles/${msg.messageId}`}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors text-sm flex items-center gap-2"
                  >
                    <span>Manage</span>
                    <span>→</span>
                  </a>
                </div>
                <div className="flex items-center gap-4 text-sm text-slate-400">
                  <span>Channel: {msg.channelId}</span>
                  {msg.maxRolesPerUser && (
                    <span className="flex items-center gap-1">
                      <FontAwesomeIcon icon={faUsers} />
                      Max: {msg.maxRolesPerUser} roles/user
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-blue-900/20 border border-blue-700/50 p-6 rounded-lg">
        <div className="flex items-start gap-3">
          <FontAwesomeIcon icon={faCircleInfo} className="text-blue-400 mt-1" />
          <div className="flex-1">
            <h3 className="text-blue-300 font-semibold mb-2">Advanced Features via Bot</h3>
            <p className="text-blue-300/80 text-sm mb-3">
              After creating a message, use bot commands to configure advanced features:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
              <div className="bg-slate-900/50 p-3 rounded">
                <p className="text-blue-400 font-medium mb-1">Add Role Options:</p>
                <ul className="text-slate-300 space-y-1 text-xs">
                  <li>• Add reaction + role pairs</li>
                  <li>• Edit existing options</li>
                  <li>• Remove options</li>
                  <li>• Custom emojis support</li>
                </ul>
              </div>
              <div className="bg-slate-900/50 p-3 rounded">
                <p className="text-green-400 font-medium mb-1">Advanced Settings:</p>
                <ul className="text-slate-300 space-y-1 text-xs">
                  <li>• Groups (unique/limit)</li>
                  <li>• Whitelist/Blacklist</li>
                  <li>• Temp assignments</li>
                  <li>• Max roles per user</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      <CreateReactionRoleModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        serverId={serverId}
        onSuccess={fetchMessages}
      />
    </div>
  );
}
