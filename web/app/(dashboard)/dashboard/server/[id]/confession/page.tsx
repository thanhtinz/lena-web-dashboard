'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faSave, 
  faSpinner, 
  faCommentDots,
  faComments,
  faCrown,
  faExternalLinkAlt,
  faUser,
  faCalendar,
  faTrash,
  faExclamationTriangle,
  faCheck,
  faTimes,
  faClock
} from '@fortawesome/free-solid-svg-icons';

interface ConfessionConfigData {
  channelId: string | null;
  buttonLabel: string;
  replyButtonLabel: string;
  isActive: boolean;
  requireReplyApproval: boolean;
  logConfessions: boolean;
  logChannelId: string | null;
  logToWeb: boolean;
}

interface ConfessionReply {
  id: number;
  confessionId: number;
  userId: string;
  content: string;
  status: string;
  isModerated: boolean;
  moderatedBy: string;
  createdAt: string;
}

interface ConfessionLog {
  id: number;
  userId: string;
  username: string;
  threadUrl: string;
  content: string;
  createdAt: string;
  replies?: ConfessionReply[];
}

export default function ConfessionPage() {
  const params = useParams();
  const serverId = params.id as string;

  const [config, setConfig] = useState<ConfessionConfigData>({
    channelId: null,
    buttonLabel: '📝 Send Confession',
    replyButtonLabel: '💬 Reply',
    isActive: true,
    requireReplyApproval: false,
    logConfessions: false,
    logChannelId: null,
    logToWeb: true,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [channels, setChannels] = useState<any[]>([]);
  const [isPremium, setIsPremium] = useState(false);
  const [logs, setLogs] = useState<ConfessionLog[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [showLogs, setShowLogs] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [pendingReplies, setPendingReplies] = useState<any[]>([]);
  const [loadingPending, setLoadingPending] = useState(false);
  const [moderating, setModerating] = useState<number | null>(null);

  useEffect(() => {
    fetchConfig();
    fetchChannels();
    checkPremium();
  }, [serverId]);

  useEffect(() => {
    if (config.requireReplyApproval && !loading) {
      fetchPendingReplies();
    }
  }, [config.requireReplyApproval, loading]);

  const fetchConfig = async () => {
    try {
      const res = await fetch(`/api/servers/${serverId}/confession`);
      if (res.ok) {
        const data = await res.json();
        setConfig(data);
      }
    } catch (error) {
      console.error('Error fetching confession config:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchChannels = async () => {
    try {
      const res = await fetch(`/api/servers/${serverId}/channels`);
      if (res.ok) {
        const data = await res.json();
        setChannels(data.filter((ch: any) => ch.type === 0));
      }
    } catch (error) {
      console.error('Error fetching channels:', error);
    }
  };

  const checkPremium = async () => {
    try {
      const res = await fetch(`/api/servers/${serverId}/config`);
      if (res.ok) {
        const data = await res.json();
        setIsPremium(data.isPremium || false);
      }
    } catch (error) {
      console.error('Error checking premium status:', error);
    }
  };

  const fetchLogs = async () => {
    setLoadingLogs(true);
    try {
      const res = await fetch(`/api/servers/${serverId}/confession/logs`);
      if (res.ok) {
        const data = await res.json();
        setLogs(data);
      }
    } catch (error) {
      console.error('Error fetching confession logs:', error);
    } finally {
      setLoadingLogs(false);
    }
  };

  const fetchPendingReplies = async () => {
    setLoadingPending(true);
    try {
      const res = await fetch(`/api/servers/${serverId}/confession/pending-replies`);
      if (res.ok) {
        const data = await res.json();
        setPendingReplies(data.pendingReplies || []);
      }
    } catch (error) {
      console.error('Error fetching pending replies:', error);
    } finally {
      setLoadingPending(false);
    }
  };

  const handleModerate = async (replyId: number, action: 'approve' | 'reject') => {
    setModerating(replyId);
    setMessage('');

    try {
      const res = await fetch(`/api/servers/${serverId}/confession/replies/${replyId}/moderate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });

      if (res.ok) {
        setMessage(`✅ Reply ${action === 'approve' ? 'approved' : 'rejected'} successfully!`);
        // Remove from pending list
        setPendingReplies(prev => prev.filter(r => r.replyId !== replyId));
        // Refresh logs if showing
        if (showLogs) {
          fetchLogs();
        }
      } else {
        setMessage(`❌ Failed to ${action} reply`);
      }
    } catch (error) {
      console.error(`Error ${action}ing reply:`, error);
      setMessage(`❌ An error occurred while ${action}ing reply`);
    } finally {
      setModerating(null);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage('');

    try {
      const res = await fetch(`/api/servers/${serverId}/confession`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });

      if (res.ok) {
        setMessage('✅ Confession configuration saved successfully!');
      } else {
        setMessage('❌ Failed to save configuration');
      }
    } catch (error) {
      console.error('Error saving confession config:', error);
      setMessage('❌ An error occurred while saving');
    } finally {
      setSaving(false);
    }
  };

  const handleViewLogs = () => {
    setShowLogs(!showLogs);
    if (!showLogs && logs.length === 0) {
      fetchLogs();
    }
  };

  const handleResetConfessions = async () => {
    setResetting(true);
    setMessage('');

    try {
      const res = await fetch(`/api/servers/${serverId}/confession/reset`, {
        method: 'DELETE',
      });

      if (res.ok) {
        const data = await res.json();
        setMessage(`✅ Successfully deleted ${data.deletedCount} confessions and all replies`);
        setShowResetModal(false);
        setLogs([]); // Clear logs from UI
      } else {
        const error = await res.json();
        setMessage(`❌ Failed to reset confessions: ${error.error}`);
      }
    } catch (error) {
      console.error('Error resetting confessions:', error);
      setMessage('❌ An error occurred while resetting confessions');
    } finally {
      setResetting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <FontAwesomeIcon icon={faSpinner} className="h-8 w-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 md:gap-3 mb-2">
          <FontAwesomeIcon icon={faCommentDots} className="h-5 w-5 md:h-6 md:w-6 text-blue-400" />
          <h1 className="text-lg md:text-2xl font-bold text-white">Confession Configuration</h1>
        </div>
        <p className="text-sm md:text-base text-slate-400">Configure anonymous confession system for your server</p>
      </div>

      {/* Success/Error Message */}
      {message && (
        <div className={`mb-6 p-4 rounded-lg ${message.includes('✅') ? 'bg-green-500/10 border border-green-500/20 text-green-400' : 'bg-red-500/10 border border-red-500/20 text-red-400'}`}>
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Configuration */}
        <div className="lg:col-span-2 space-y-6">
          {/* Master Toggle */}
          <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <h3 className="text-lg font-bold text-white">Enable Confession System</h3>
                <p className="text-sm text-slate-400">Allow users to send anonymous confessions</p>
              </div>
              <input
                type="checkbox"
                checked={config.isActive}
                onChange={(e) => setConfig({ ...config, isActive: e.target.checked })}
                className="w-12 h-6 rounded-full appearance-none cursor-pointer relative transition-colors bg-slate-600 checked:bg-blue-600 before:content-[''] before:absolute before:w-5 before:h-5 before:rounded-full before:bg-white before:top-0.5 before:left-0.5 before:transition-transform checked:before:translate-x-6"
              />
            </label>
          </div>

          {/* Confession Channel */}
          <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
            <h3 className="text-lg font-bold text-white mb-2">Confession Channel</h3>
            <p className="text-sm text-slate-400 mb-4">Select the channel where confessions will be posted</p>
            <select
              value={config.channelId || ''}
              onChange={(e) => setConfig({ ...config, channelId: e.target.value || null })}
              className="w-full bg-slate-700 text-white px-4 py-2 rounded border border-slate-600 focus:border-blue-500 focus:outline-none"
            >
              <option value="">Select a channel</option>
              {channels.map(channel => (
                <option key={channel.id} value={channel.id}>#{channel.name}</option>
              ))}
            </select>
          </div>

          {/* Button Labels */}
          <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
            <h3 className="text-lg font-bold text-white mb-4">Button Labels</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Confession Button Label
                </label>
                <input
                  type="text"
                  value={config.buttonLabel}
                  onChange={(e) => setConfig({ ...config, buttonLabel: e.target.value })}
                  className="w-full bg-slate-700 text-white px-4 py-2 rounded border border-slate-600 focus:border-blue-500 focus:outline-none"
                  placeholder="📝 Send Confession"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Reply Button Label
                </label>
                <input
                  type="text"
                  value={config.replyButtonLabel}
                  onChange={(e) => setConfig({ ...config, replyButtonLabel: e.target.value })}
                  className="w-full bg-slate-700 text-white px-4 py-2 rounded border border-slate-600 focus:border-blue-500 focus:outline-none"
                  placeholder="💬 Reply"
                />
              </div>
            </div>
          </div>

          {/* Reply Moderation */}
          <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
            <h3 className="text-lg font-bold text-white mb-2">Reply Moderation</h3>
            <p className="text-sm text-slate-400 mb-4">Control how confession replies are handled</p>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={config.requireReplyApproval}
                onChange={(e) => setConfig({ ...config, requireReplyApproval: e.target.checked })}
                className="w-5 h-5 text-blue-600 bg-slate-600 border-slate-500 rounded focus:ring-blue-500"
              />
              <div>
                <span className="text-white font-medium">Require Admin Approval for Replies</span>
                <p className="text-xs text-slate-500 mt-1">
                  When enabled, all confession replies must be approved by an admin before appearing in threads
                </p>
              </div>
            </label>
          </div>

          {/* Pending Replies (shown when approval is enabled) */}
          {config.requireReplyApproval && (
            <div className="bg-slate-800 p-6 rounded-lg border border-orange-500/30">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <FontAwesomeIcon icon={faClock} className="h-5 w-5 text-orange-500" />
                  <h3 className="text-lg font-bold text-white">Pending Replies</h3>
                  {pendingReplies.length > 0 && (
                    <span className="bg-orange-500/20 text-orange-400 text-xs px-2 py-1 rounded">
                      {pendingReplies.length} waiting
                    </span>
                  )}
                </div>
                <button
                  onClick={fetchPendingReplies}
                  disabled={loadingPending}
                  className="text-sm px-2.5 py-1 bg-slate-700 hover:bg-slate-600 text-white rounded transition disabled:opacity-50"
                >
                  <FontAwesomeIcon icon={loadingPending ? faSpinner : faComments} className={loadingPending ? 'animate-spin' : ''} />
                </button>
              </div>

              {loadingPending ? (
                <div className="flex justify-center py-8">
                  <FontAwesomeIcon icon={faSpinner} className="h-6 w-6 text-orange-500 animate-spin" />
                </div>
              ) : pendingReplies.length === 0 ? (
                <div className="text-center py-6 text-slate-500">
                  <FontAwesomeIcon icon={faCheck} className="h-8 w-8 mb-2" />
                  <p className="text-sm">No pending replies to review</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-slate-800">
                  {pendingReplies.map((reply) => (
                    <div key={reply.replyId} className="bg-slate-700/50 p-4 rounded border border-slate-600">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs text-orange-400 font-medium">
                              Reply to Confession #{reply.confessionId}
                            </span>
                            <span className="text-xs text-slate-500">
                              {reply.createdAt ? new Date(reply.createdAt).toLocaleString() : 'N/A'}
                            </span>
                          </div>
                          {reply.confession?.threadUrl && (
                            <a
                              href={reply.confession.threadUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-blue-400 hover:text-blue-300 inline-flex items-center gap-1"
                            >
                              View Thread <FontAwesomeIcon icon={faExternalLinkAlt} className="h-3 w-3" />
                            </a>
                          )}
                        </div>
                      </div>

                      <div className="bg-slate-800/50 p-3 rounded mb-3">
                        <p className="text-sm text-slate-300">{reply.content}</p>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleModerate(reply.replyId, 'approve')}
                          disabled={moderating === reply.replyId}
                          className="flex-1 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded transition disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
                        >
                          <FontAwesomeIcon icon={moderating === reply.replyId ? faSpinner : faCheck} className={`${moderating === reply.replyId ? 'animate-spin' : ''} md:mr-1`} />
                          <span className="hidden md:inline">Approve</span>
                        </button>
                        <button
                          onClick={() => handleModerate(reply.replyId, 'reject')}
                          disabled={moderating === reply.replyId}
                          className="flex-1 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded transition disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
                        >
                          <FontAwesomeIcon icon={moderating === reply.replyId ? faSpinner : faTimes} className={`${moderating === reply.replyId ? 'animate-spin' : ''} md:mr-1`} />
                          <span className="hidden md:inline">Reject</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Premium: Confession Logging */}
          <div className={`bg-slate-800 p-6 rounded-lg border ${isPremium ? 'border-yellow-500/30' : 'border-slate-700'}`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <h3 className="text-lg font-bold text-white">Confession Logging</h3>
                {isPremium ? (
                  <span className="px-2 py-1 bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 text-xs rounded">
                    <FontAwesomeIcon icon={faCrown} className="mr-1" />
                    PREMIUM
                  </span>
                ) : (
                  <span className="px-2 py-1 bg-slate-700 border border-slate-600 text-slate-400 text-xs rounded">
                    <FontAwesomeIcon icon={faCrown} className="mr-1" />
                    REQUIRES PREMIUM
                  </span>
                )}
              </div>
            </div>
            <p className="text-sm text-slate-400 mb-4">
              {isPremium 
                ? 'Log confession authors for moderation purposes'
                : 'Upgrade to premium to enable confession author logging for moderation'}
            </p>
            
            {!isPremium && (
              <div className="bg-blue-500/10 border border-blue-500/20 text-blue-400 p-4 rounded-lg mb-4">
                <p className="text-sm">
                  🔒 This feature requires premium. Upgrade to enable confession author logging for better moderation control.
                </p>
              </div>
            )}

            <div className="space-y-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.logConfessions}
                  onChange={(e) => setConfig({ ...config, logConfessions: e.target.checked })}
                  disabled={!isPremium}
                  className="w-5 h-5 text-blue-600 bg-slate-600 border-slate-500 rounded focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <span className={`text-white ${!isPremium && 'opacity-50'}`}>
                  Enable Confession Logging
                </span>
              </label>

              {config.logConfessions && isPremium && (
                <div className="space-y-4 pl-8 border-l-2 border-blue-500/30">
                  {/* Log to Web Dashboard */}
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.logToWeb}
                      onChange={(e) => setConfig({ ...config, logToWeb: e.target.checked })}
                      className="w-4 h-4 text-blue-600 bg-slate-600 border-slate-500 rounded focus:ring-blue-500"
                    />
                    <div>
                      <span className="text-white">Log to Web Dashboard</span>
                      <p className="text-xs text-slate-500">View confession logs directly on this page</p>
                    </div>
                  </label>

                  {/* Log to Discord Channel */}
                  <div>
                    <label className="flex items-center gap-3 cursor-pointer mb-2">
                      <input
                        type="checkbox"
                        checked={config.logChannelId !== null}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setConfig({ ...config, logChannelId: '' });
                          } else {
                            setConfig({ ...config, logChannelId: null });
                          }
                        }}
                        className="w-4 h-4 text-blue-600 bg-slate-600 border-slate-500 rounded focus:ring-blue-500"
                      />
                      <div>
                        <span className="text-white">Log to Discord Channel</span>
                        <p className="text-xs text-slate-500">Send logs to a private Discord channel</p>
                      </div>
                    </label>
                    
                    {config.logChannelId !== null && (
                      <div className="ml-7">
                        <select
                          value={config.logChannelId || ''}
                          onChange={(e) => setConfig({ ...config, logChannelId: e.target.value || null })}
                          className="w-full bg-slate-700 text-white px-4 py-2 rounded border border-slate-600 focus:border-blue-500 focus:outline-none"
                        >
                          <option value="">Select a channel</option>
                          {channels.map(channel => (
                            <option key={channel.id} value={channel.id}>#{channel.name}</option>
                          ))}
                        </select>
                        <p className="text-xs text-slate-500 mt-2">
                          ⚠️ Make sure this channel is only visible to moderators/admins
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between items-center gap-4">
            {/* Reset All Confessions (Premium) */}
            {isPremium && (
              <button
                onClick={() => setShowResetModal(true)}
                className="px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg transition flex items-center gap-2 text-sm"
              >
                <FontAwesomeIcon icon={faTrash} className="md:mr-1" />
                <span className="hidden md:inline">Reset All Confessions</span>
              </button>
            )}
            
            {/* Save Configuration */}
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 ml-auto"
            >
              <FontAwesomeIcon icon={saving ? faSpinner : faSave} className={`${saving ? 'animate-spin' : ''} md:mr-2`} />
              <span className="hidden md:inline">{saving ? 'Saving...' : 'Save Configuration'}</span>
            </button>
          </div>

          {/* Info Box */}
          <div className="bg-blue-500/10 border border-blue-500/20 text-blue-400 p-4 rounded-lg">
            <h4 className="font-bold mb-2">How to use:</h4>
            <ul className="text-sm space-y-1 list-disc list-inside">
              <li>Users can send confessions using <code className="bg-slate-700 px-1 rounded">/confession</code> command</li>
              <li>Each confession creates a thread for replies and discussions</li>
              <li>All content is filtered through blacklist system</li>
              <li>Premium: View confession authors on web or Discord channel</li>
            </ul>
          </div>
        </div>

        {/* Right Column - Logs Viewer */}
        {isPremium && config.logConfessions && config.logToWeb && (
          <div className="lg:col-span-1">
            <div className="bg-slate-800 p-6 rounded-lg border border-slate-700 sticky top-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white">Confession Logs</h3>
                <button
                  onClick={handleViewLogs}
                  className="text-sm px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded transition"
                >
                  <FontAwesomeIcon icon={showLogs ? faTimes : faCommentDots} className="md:mr-1" />
                  <span className="hidden md:inline">{showLogs ? 'Hide' : 'Show'} Logs</span>
                </button>
              </div>

              {showLogs && (
                <div className="space-y-3">
                  {loadingLogs ? (
                    <div className="flex justify-center py-8">
                      <FontAwesomeIcon icon={faSpinner} className="h-6 w-6 text-blue-500 animate-spin" />
                    </div>
                  ) : logs.length === 0 ? (
                    <div className="text-center py-8 text-slate-500">
                      <p className="text-sm">No confession logs yet</p>
                    </div>
                  ) : (
                    <div className="max-h-[600px] overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-slate-800">
                      {logs.map(log => (
                        <div key={log.id} className="bg-slate-700/50 p-4 rounded border border-slate-600 hover:border-slate-500 transition">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <FontAwesomeIcon icon={faUser} className="h-3 w-3 text-slate-400" />
                              <span className="text-sm font-medium text-white">{log.username || 'Unknown'}</span>
                            </div>
                            <span className="text-xs text-slate-500">#{log.id}</span>
                          </div>
                          <p className="text-xs text-slate-400 mb-2 line-clamp-3">{log.content}</p>
                          
                          {/* Replies Section */}
                          {log.replies && log.replies.length > 0 && (
                            <div className="mt-3 pt-3 border-t border-slate-600/50 space-y-2">
                              <div className="flex items-center gap-2 mb-2">
                                <FontAwesomeIcon icon={faComments} className="h-3 w-3 text-blue-400" />
                                <span className="text-xs font-medium text-blue-400">{log.replies.length} {log.replies.length === 1 ? 'Reply' : 'Replies'}</span>
                              </div>
                              {log.replies.map((reply: any) => (
                                <div key={reply.id} className="bg-slate-800/50 p-2 rounded border border-slate-600/30">
                                  <div className="flex items-center gap-2 mb-1">
                                    <FontAwesomeIcon icon={faUser} className="h-2.5 w-2.5 text-slate-500" />
                                    <span className="text-xs text-slate-400">{reply.userId}</span>
                                    {reply.status === 'approved' && (
                                      <span className="text-xs px-1.5 py-0.5 bg-green-500/20 text-green-400 rounded">Approved</span>
                                    )}
                                    <span className="text-xs text-slate-600 ml-auto">{reply.createdAt ? new Date(reply.createdAt).toLocaleDateString() : 'N/A'}</span>
                                  </div>
                                  <p className="text-xs text-slate-400 line-clamp-2">{reply.content}</p>
                                </div>
                              ))}
                            </div>
                          )}

                          <div className="flex items-center justify-between text-xs mt-3">
                            <div className="flex items-center gap-1 text-slate-500">
                              <FontAwesomeIcon icon={faCalendar} className="h-3 w-3" />
                              {log.createdAt ? new Date(log.createdAt).toLocaleDateString() : 'N/A'}
                            </div>
                            {log.threadUrl && (
                              <a
                                href={log.threadUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-400 hover:text-blue-300 transition flex items-center gap-1"
                              >
                                View <FontAwesomeIcon icon={faExternalLinkAlt} className="h-3 w-3" />
                              </a>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Reset Confirmation Modal */}
      {showResetModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-slate-800 rounded-lg border-2 border-red-500 max-w-md w-full animate-scale-in shadow-2xl">
            <div className="p-6 border-b border-red-500/30 bg-gradient-to-r from-red-900/30 to-orange-900/30">
              <div className="flex items-center gap-3">
                <FontAwesomeIcon icon={faExclamationTriangle} className="h-8 w-8 text-red-500" />
                <div>
                  <h3 className="text-xl font-bold text-white">Reset All Confessions</h3>
                  <p className="text-sm text-red-400 mt-1">This action cannot be undone!</p>
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-4">
                <p className="text-white font-medium mb-2">
                  ⚠️ You are about to permanently delete:
                </p>
                <ul className="text-sm text-slate-300 space-y-1 list-disc list-inside">
                  <li>All confession messages</li>
                  <li>All confession replies</li>
                  <li>All confession threads (Discord threads will remain)</li>
                  <li>All logged confession data</li>
                </ul>
              </div>

              <p className="text-slate-400 text-sm mb-4">
                This will remove all confession data from the database. Discord threads will not be deleted, but the confession system will have no record of them.
              </p>

              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 mb-6">
                <p className="text-yellow-400 text-xs font-medium">
                  💡 TIP: Consider exporting confession logs before resetting if you need them for records
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowResetModal(false)}
                  disabled={resetting}
                  className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition disabled:opacity-50"
                >
                  <FontAwesomeIcon icon={faTimes} className="md:mr-2" />
                  <span className="hidden md:inline">Cancel</span>
                </button>
                <button
                  onClick={handleResetConfessions}
                  disabled={resetting}
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <FontAwesomeIcon icon={resetting ? faSpinner : faTrash} className={`${resetting ? 'animate-spin' : ''} md:mr-2`} />
                  <span className="hidden md:inline">{resetting ? 'Deleting...' : 'Yes, Reset All'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
