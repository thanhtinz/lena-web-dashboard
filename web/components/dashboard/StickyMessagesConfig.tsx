'use client';

import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faThumbtack, faPlus, faTrash, faPause, faPlay, faEdit, faTimes, faCheckCircle, faTimesCircle, faCrown, faCode, faPalette } from '@fortawesome/free-solid-svg-icons';

interface StickyMessage {
  id: number;
  channelId: string;
  messageContent: string;
  embedConfig: any;
  mode: string;
  messageCount: number;
  timeInterval: number | null;
  currentMessageId: string;
  isPremium: boolean;
  webhookConfig: any;
  slowMode: boolean;
  isActive: boolean;
  createdBy: string;
  createdAt: Date;
}

interface StickyMessagesConfigProps {
  serverId: string;
}

export default function StickyMessagesConfig({ serverId }: StickyMessagesConfigProps) {
  const [stickyMessages, setStickyMessages] = useState<StickyMessage[]>([]);
  const [channels, setChannels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingSticky, setEditingSticky] = useState<StickyMessage | null>(null);
  const [activeTab, setActiveTab] = useState<'basic' | 'embed' | 'advanced'>('basic');

  const [channelId, setChannelId] = useState('');
  const [messageContent, setMessageContent] = useState('');
  const [mode, setMode] = useState<'message' | 'time'>('message');
  const [messageCount, setMessageCount] = useState(1);
  const [timeInterval, setTimeInterval] = useState('5m');
  
  const [useEmbed, setUseEmbed] = useState(false);
  const [embedTitle, setEmbedTitle] = useState('');
  const [embedDescription, setEmbedDescription] = useState('');
  const [embedColor, setEmbedColor] = useState('#5865F2');
  const [embedImage, setEmbedImage] = useState('');
  const [embedThumbnail, setEmbedThumbnail] = useState('');
  const [embedUrl, setEmbedUrl] = useState('');
  const [embedAuthorName, setEmbedAuthorName] = useState('');
  const [embedAuthorIcon, setEmbedAuthorIcon] = useState('');
  const [embedFooter, setEmbedFooter] = useState('');
  const [embedFooterIcon, setEmbedFooterIcon] = useState('');
  const [embedTimestamp, setEmbedTimestamp] = useState(false);
  
  const [isPremium, setIsPremium] = useState(false);
  const [webhookName, setWebhookName] = useState('');
  const [webhookAvatar, setWebhookAvatar] = useState('');
  const [slowMode, setSlowMode] = useState(false);
  
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    fetchAll();
  }, [serverId]);

  const fetchAll = async () => {
    await Promise.all([
      fetchStickyMessages(),
      fetchChannels()
    ]);
    setLoading(false);
  };

  const fetchStickyMessages = async () => {
    try {
      const res = await fetch(`/api/servers/${serverId}/sticky-messages`);
      if (res.ok) {
        const data = await res.json();
        setStickyMessages(data);
      }
    } catch (error) {
      console.error('Failed to fetch sticky messages:', error);
    }
  };

  const fetchChannels = async () => {
    try {
      const res = await fetch(`/api/servers/${serverId}/channels`);
      if (res.ok) {
        const data = await res.json();
        setChannels(data.filter((c: any) => c.type === 0));
      }
    } catch (error) {
      console.error('Failed to fetch channels:', error);
    }
  };

  const handleEdit = (sticky: StickyMessage) => {
    setEditingSticky(sticky);
    setChannelId(sticky.channelId);
    setMessageContent(sticky.messageContent || '');
    setMode(sticky.mode as 'message' | 'time');
    setMessageCount(sticky.messageCount);
    
    if (sticky.embedConfig) {
      setUseEmbed(true);
      setEmbedTitle(sticky.embedConfig.title || '');
      setEmbedDescription(sticky.embedConfig.description || '');
      setEmbedColor(sticky.embedConfig.color || '#5865F2');
      setEmbedImage(sticky.embedConfig.image || '');
      setEmbedThumbnail(sticky.embedConfig.thumbnail || '');
      setEmbedUrl(sticky.embedConfig.url || '');
      setEmbedAuthorName(sticky.embedConfig.author?.name || '');
      setEmbedAuthorIcon(sticky.embedConfig.author?.icon_url || '');
      setEmbedFooter(sticky.embedConfig.footer?.text || '');
      setEmbedFooterIcon(sticky.embedConfig.footer?.icon_url || '');
      setEmbedTimestamp(!!sticky.embedConfig.timestamp);
    } else {
      // Reset embed fields for non-embed sticky
      setUseEmbed(false);
      setEmbedTitle('');
      setEmbedDescription('');
      setEmbedColor('#5865F2');
      setEmbedImage('');
      setEmbedThumbnail('');
      setEmbedUrl('');
      setEmbedAuthorName('');
      setEmbedAuthorIcon('');
      setEmbedFooter('');
      setEmbedFooterIcon('');
      setEmbedTimestamp(false);
    }
    
    setIsPremium(sticky.isPremium || false);
    if (sticky.webhookConfig) {
      setWebhookName(sticky.webhookConfig.name || '');
      setWebhookAvatar(sticky.webhookConfig.avatarUrl || '');
    }
    setSlowMode(sticky.slowMode || false);
    
    if (sticky.timeInterval) {
      const minutes = Math.floor(sticky.timeInterval / 60);
      const hours = Math.floor(minutes / 60);
      if (hours >= 24) setTimeInterval('24h');
      else if (hours >= 12) setTimeInterval('12h');
      else if (hours >= 6) setTimeInterval('6h');
      else if (hours >= 2) setTimeInterval('2h');
      else if (hours >= 1) setTimeInterval('1h');
      else if (minutes >= 30) setTimeInterval('30m');
      else if (minutes >= 10) setTimeInterval('10m');
      else if (minutes >= 5) setTimeInterval('5m');
      else setTimeInterval('1m');
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingSticky(null);
    setChannelId('');
    setMessageContent('');
    setMode('message');
    setMessageCount(1);
    setTimeInterval('5m');
    setUseEmbed(false);
    setEmbedTitle('');
    setEmbedDescription('');
    setEmbedColor('#5865F2');
    setEmbedImage('');
    setEmbedThumbnail('');
    setEmbedUrl('');
    setEmbedAuthorName('');
    setEmbedAuthorIcon('');
    setEmbedFooter('');
    setEmbedFooterIcon('');
    setEmbedTimestamp(false);
    setIsPremium(false);
    setWebhookName('');
    setWebhookAvatar('');
    setSlowMode(false);
    setActiveTab('basic');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const embedConfig = useEmbed ? {
        title: embedTitle,
        description: embedDescription,
        color: embedColor,
        url: embedUrl || undefined,
        image: embedImage || undefined,
        thumbnail: embedThumbnail || undefined,
        author: (embedAuthorName || embedAuthorIcon) ? {
          name: embedAuthorName || undefined,
          icon_url: embedAuthorIcon || undefined
        } : undefined,
        footer: (embedFooter || embedFooterIcon) ? { 
          text: embedFooter || undefined,
          icon_url: embedFooterIcon || undefined
        } : undefined,
        timestamp: embedTimestamp || undefined
      } : null;

      const webhookConfig = isPremium && (webhookName || webhookAvatar) ? {
        name: webhookName || undefined,
        avatarUrl: webhookAvatar || undefined
      } : null;

      const url = editingSticky 
        ? `/api/servers/${serverId}/sticky-messages/${editingSticky.id}`
        : `/api/servers/${serverId}/sticky-messages`;
      
      const method = editingSticky ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channelId,
          messageContent: !useEmbed ? messageContent : null,
          embedConfig,
          mode,
          messageCount: mode === 'message' ? messageCount : 1,
          timeInterval: mode === 'time' ? timeInterval : null,
          isPremium,
          webhookConfig,
          slowMode
        })
      });

      if (res.ok) {
        await fetchStickyMessages();
        handleCloseModal();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to save sticky message');
      }
    } catch (error) {
      console.error('Failed to save sticky message:', error);
      alert('Failed to save sticky message');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (id: number, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/servers/${serverId}/sticky-messages/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentStatus })
      });

      if (res.ok) {
        await fetchStickyMessages();
      } else {
        alert('Failed to toggle sticky message');
      }
    } catch (error) {
      console.error('Failed to toggle sticky message:', error);
      alert('Failed to toggle sticky message');
    }
  };

  const handleRemoveSticky = async (id: number) => {
    if (!confirm('Remove this sticky message?')) return;

    setDeletingId(id);
    try {
      const res = await fetch(`/api/servers/${serverId}/sticky-messages/${id}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        setStickyMessages(stickyMessages.filter(s => s.id !== id));
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to remove sticky message');
      }
    } catch (error) {
      console.error('Failed to remove sticky message:', error);
      alert('Failed to remove sticky message');
    } finally {
      setDeletingId(null);
    }
  };

  const formatInterval = (interval: number | null) => {
    if (!interval) return 'N/A';
    const minutes = Math.floor(interval / 60);
    const hours = Math.floor(minutes / 60);
    if (hours > 0) return `${hours}h`;
    return `${minutes}m`;
  };

  const insertVariable = (variable: string) => {
    if (activeTab === 'basic') {
      setMessageContent(prev => prev + `{${variable}}`);
    } else if (activeTab === 'embed') {
      setEmbedDescription(prev => prev + `{${variable}}`);
    }
  };

  if (loading) {
    return (
      <div className="text-slate-400">Loading...</div>
    );
  }

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
          <FontAwesomeIcon icon={faThumbtack} className="text-green-400" />
          Sticky Messages
        </h1>
        <p className="text-sm text-slate-400 mb-4">
          Auto-repost important messages to keep them visible at the bottom of channels
        </p>
        
        <div className="flex items-center justify-between">
          <div className="text-sm text-slate-400">
            {stickyMessages.length} sticky message{stickyMessages.length !== 1 ? 's' : ''} configured
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-green-600 text-white px-3 py-1.5 rounded-lg hover:bg-green-700 transition text-sm"
          >
            <FontAwesomeIcon icon={faPlus} className="h-3.5 w-3.5" />
            <span className="hidden md:inline">Add Sticky Message</span>
          </button>
        </div>
      </div>

      {stickyMessages.length === 0 ? (
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-12 text-center">
          <FontAwesomeIcon icon={faThumbtack} className="h-16 w-16 text-slate-600 mb-4" />
          <p className="text-slate-400 mb-2">No sticky messages yet</p>
          <p className="text-sm text-slate-500 mb-4">Click "Add Sticky Message" to auto-repost messages in channels</p>
          <div className="inline-flex items-center gap-2 text-green-500 text-sm">
            <FontAwesomeIcon icon={faThumbtack} />
            <span>Available in all plans</span>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {stickyMessages.map((sticky) => {
            const channel = channels.find(c => c.id === sticky.channelId);
            
            return (
              <div
                key={sticky.id}
                className="bg-slate-800 border border-slate-700 rounded-lg p-5 hover:border-slate-600 transition"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-3 flex-wrap">
                      <div className="flex items-center gap-2 text-green-400">
                        <FontAwesomeIcon icon={faThumbtack} className="h-4 w-4" />
                        <span className="font-semibold">#{channel?.name || sticky.channelId}</span>
                      </div>
                      <span className="text-xs px-2 py-0.5 bg-blue-900/30 text-blue-400 rounded border border-blue-700/30">
                        {sticky.mode === 'message' 
                          ? `Every ${sticky.messageCount} message${sticky.messageCount > 1 ? 's' : ''}`
                          : `Every ${formatInterval(sticky.timeInterval)}`
                        }
                      </span>
                      {sticky.isPremium && (
                        <span className="text-xs px-2 py-0.5 bg-yellow-900/30 text-yellow-400 rounded border border-yellow-700/30">
                          <FontAwesomeIcon icon={faCrown} className="h-3 w-3 mr-1" />
                          Premium
                        </span>
                      )}
                      {sticky.embedConfig && (
                        <span className="text-xs px-2 py-0.5 bg-purple-900/30 text-purple-400 rounded border border-purple-700/30">
                          <FontAwesomeIcon icon={faPalette} className="h-3 w-3 mr-1" />
                          Embed
                        </span>
                      )}
                      {sticky.isActive ? (
                        <span className="text-xs px-2 py-0.5 bg-green-900/30 text-green-400 rounded border border-green-700/30">
                          <FontAwesomeIcon icon={faCheckCircle} className="h-3 w-3 mr-1" />
                          Active
                        </span>
                      ) : (
                        <span className="text-xs px-2 py-0.5 bg-gray-900/30 text-gray-400 rounded border border-gray-700/30">
                          <FontAwesomeIcon icon={faTimesCircle} className="h-3 w-3 mr-1" />
                          Paused
                        </span>
                      )}
                    </div>
                    {sticky.embedConfig ? (
                      <div className="text-sm">
                        <p className="text-purple-400 font-medium">{sticky.embedConfig.title}</p>
                        <p className="text-white line-clamp-2 mt-1">{sticky.embedConfig.description}</p>
                      </div>
                    ) : (
                      <p className="text-white text-sm leading-relaxed line-clamp-2">{sticky.messageContent}</p>
                    )}
                    <div className="text-xs text-slate-500 mt-2">
                      Created: {new Date(sticky.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleActive(sticky.id, sticky.isActive)}
                      className={`px-2.5 py-1.5 border ${
                        sticky.isActive 
                          ? 'border-yellow-600 text-yellow-400 hover:bg-yellow-600/10' 
                          : 'border-green-600 text-green-400 hover:bg-green-600/10'
                      } rounded transition text-sm`}
                      title={sticky.isActive ? 'Pause' : 'Resume'}
                    >
                      <FontAwesomeIcon icon={sticky.isActive ? faPause : faPlay} className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleEdit(sticky)}
                      className="px-2.5 py-1.5 border border-purple-600 text-purple-400 rounded hover:bg-purple-600/10 transition text-sm"
                    >
                      <FontAwesomeIcon icon={faEdit} className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleRemoveSticky(sticky.id)}
                      disabled={deletingId === sticky.id}
                      className="px-2.5 py-1.5 border border-red-600 text-red-400 rounded hover:bg-red-600/10 transition text-sm disabled:opacity-50"
                    >
                      <FontAwesomeIcon icon={faTrash} className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-semibold text-white mb-4">
              {editingSticky ? 'Edit Sticky Message' : 'Add Sticky Message'}
            </h3>

            <div className="flex gap-2 mb-6 border-b border-slate-700">
              <button
                onClick={() => setActiveTab('basic')}
                className={`px-4 py-2 text-sm font-medium transition ${
                  activeTab === 'basic'
                    ? 'text-green-400 border-b-2 border-green-400'
                    : 'text-slate-400 hover:text-slate-300'
                }`}
              >
                <FontAwesomeIcon icon={faThumbtack} className="mr-2" />
                Basic
              </button>
              <button
                onClick={() => setActiveTab('embed')}
                className={`px-4 py-2 text-sm font-medium transition ${
                  activeTab === 'embed'
                    ? 'text-purple-400 border-b-2 border-purple-400'
                    : 'text-slate-400 hover:text-slate-300'
                }`}
              >
                <FontAwesomeIcon icon={faPalette} className="mr-2" />
                Embed
              </button>
              <button
                onClick={() => setActiveTab('advanced')}
                className={`px-4 py-2 text-sm font-medium transition ${
                  activeTab === 'advanced'
                    ? 'text-yellow-400 border-b-2 border-yellow-400'
                    : 'text-slate-400 hover:text-slate-300'
                }`}
              >
                <FontAwesomeIcon icon={faCrown} className="mr-2" />
                Premium
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {activeTab === 'basic' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Channel
                    </label>
                    <select
                      value={channelId}
                      onChange={(e) => setChannelId(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-green-500"
                      required
                    >
                      <option value="">Select a channel...</option>
                      {channels.map(channel => (
                        <option key={channel.id} value={channel.id}>
                          #{channel.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {!useEmbed && (
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Message Content
                      </label>
                      <textarea
                        value={messageContent}
                        onChange={(e) => setMessageContent(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-green-500"
                        rows={4}
                        placeholder="Enter sticky message content..."
                        required={!useEmbed}
                      />
                      <p className="text-xs text-slate-400 mt-1">
                        Supports Discord markdown formatting
                      </p>
                    </div>
                  )}

                  <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-3">
                    <p className="text-xs font-medium text-slate-300 mb-2">
                      <FontAwesomeIcon icon={faCode} className="mr-1" />
                      Available Variables
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {['user', 'channel', 'server', 'count'].map(v => (
                        <button
                          key={v}
                          type="button"
                          onClick={() => insertVariable(v)}
                          className="px-2 py-1 bg-slate-600 hover:bg-slate-500 text-slate-300 text-xs rounded"
                        >
                          {`{${v}}`}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Repost Mode
                    </label>
                    <select
                      value={mode}
                      onChange={(e) => setMode(e.target.value as 'message' | 'time')}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-green-500"
                    >
                      <option value="message">After N messages</option>
                      <option value="time">After time interval</option>
                    </select>
                  </div>

                  {mode === 'message' ? (
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Message Count
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="100"
                        value={messageCount}
                        onChange={(e) => setMessageCount(parseInt(e.target.value))}
                        className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-green-500"
                      />
                      <p className="text-xs text-slate-400 mt-1">Repost after this many messages (1-100)</p>
                    </div>
                  ) : (
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Time Interval
                      </label>
                      <select
                        value={timeInterval}
                        onChange={(e) => setTimeInterval(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-green-500"
                      >
                        <option value="1m">1 minute</option>
                        <option value="5m">5 minutes</option>
                        <option value="10m">10 minutes</option>
                        <option value="30m">30 minutes</option>
                        <option value="1h">1 hour</option>
                        <option value="2h">2 hours</option>
                        <option value="6h">6 hours</option>
                        <option value="12h">12 hours</option>
                        <option value="24h">24 hours</option>
                      </select>
                    </div>
                  )}
                </>
              )}

              {activeTab === 'embed' && (
                <>
                  <div className="flex items-center gap-2 mb-4">
                    <input
                      type="checkbox"
                      id="useEmbed"
                      checked={useEmbed}
                      onChange={(e) => setUseEmbed(e.target.checked)}
                      className="w-4 h-4 rounded bg-slate-700 border-slate-600"
                    />
                    <label htmlFor="useEmbed" className="text-sm text-slate-300">
                      Use Embed (instead of plain message)
                    </label>
                  </div>

                  {useEmbed && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                          Embed Title
                        </label>
                        <input
                          type="text"
                          value={embedTitle}
                          onChange={(e) => setEmbedTitle(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500"
                          placeholder="Sticky Message"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                          Embed URL (Title Link)
                        </label>
                        <input
                          type="url"
                          value={embedUrl}
                          onChange={(e) => setEmbedUrl(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500"
                          placeholder="https://..."
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                          Embed Description
                        </label>
                        <textarea
                          value={embedDescription}
                          onChange={(e) => setEmbedDescription(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500"
                          rows={4}
                          placeholder="Enter embed description..."
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                          Author
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="text"
                            value={embedAuthorName}
                            onChange={(e) => setEmbedAuthorName(e.target.value)}
                            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500"
                            placeholder="Author name"
                          />
                          <input
                            type="url"
                            value={embedAuthorIcon}
                            onChange={(e) => setEmbedAuthorIcon(e.target.value)}
                            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500"
                            placeholder="Icon URL"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-2">
                            Embed Color
                          </label>
                          <input
                            type="color"
                            value={embedColor}
                            onChange={(e) => setEmbedColor(e.target.value)}
                            className="w-full h-10 bg-slate-700 border border-slate-600 rounded-lg"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-2">
                            Thumbnail URL
                          </label>
                          <input
                            type="url"
                            value={embedThumbnail}
                            onChange={(e) => setEmbedThumbnail(e.target.value)}
                            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500"
                            placeholder="https://..."
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                          Image URL (Large)
                        </label>
                        <input
                          type="url"
                          value={embedImage}
                          onChange={(e) => setEmbedImage(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500"
                          placeholder="https://..."
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                          Footer
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="text"
                            value={embedFooter}
                            onChange={(e) => setEmbedFooter(e.target.value)}
                            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500"
                            placeholder="Footer text"
                          />
                          <input
                            type="url"
                            value={embedFooterIcon}
                            onChange={(e) => setEmbedFooterIcon(e.target.value)}
                            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500"
                            placeholder="Icon URL"
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="embedTimestamp"
                          checked={embedTimestamp}
                          onChange={(e) => setEmbedTimestamp(e.target.checked)}
                          className="w-4 h-4 rounded bg-slate-700 border-slate-600"
                        />
                        <label htmlFor="embedTimestamp" className="text-sm text-slate-300">
                          Show timestamp (current time)
                        </label>
                      </div>
                    </>
                  )}
                </>
              )}

              {activeTab === 'advanced' && (
                <>
                  <div className="bg-yellow-900/20 border border-yellow-700/30 rounded-lg p-4 mb-4">
                    <div className="flex items-center gap-2 text-yellow-400 mb-2">
                      <FontAwesomeIcon icon={faCrown} />
                      <span className="font-semibold">Premium Features</span>
                    </div>
                    <p className="text-sm text-slate-300">
                      Unlock advanced sticky message features with a premium subscription
                    </p>
                  </div>

                  <div className="flex items-center gap-2 mb-4">
                    <input
                      type="checkbox"
                      id="isPremium"
                      checked={isPremium}
                      onChange={(e) => setIsPremium(e.target.checked)}
                      className="w-4 h-4 rounded bg-slate-700 border-slate-600"
                    />
                    <label htmlFor="isPremium" className="text-sm text-slate-300">
                      Enable Premium Features
                    </label>
                  </div>

                  {isPremium && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                          Custom Webhook Name
                        </label>
                        <input
                          type="text"
                          value={webhookName}
                          onChange={(e) => setWebhookName(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-yellow-500"
                          placeholder="Custom Bot Name"
                        />
                        <p className="text-xs text-slate-400 mt-1">
                          Display name for sticky messages
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                          Custom Webhook Avatar URL
                        </label>
                        <input
                          type="url"
                          value={webhookAvatar}
                          onChange={(e) => setWebhookAvatar(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-yellow-500"
                          placeholder="https://..."
                        />
                        <p className="text-xs text-slate-400 mt-1">
                          Avatar image for sticky messages
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="slowMode"
                          checked={slowMode}
                          onChange={(e) => setSlowMode(e.target.checked)}
                          className="w-4 h-4 rounded bg-slate-700 border-slate-600"
                        />
                        <label htmlFor="slowMode" className="text-sm text-slate-300">
                          Enable Slow Mode (slower reposting to avoid spam)
                        </label>
                      </div>
                    </>
                  )}
                </>
              )}

              <div className="flex gap-3 pt-4 border-t border-slate-700">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
                  disabled={submitting}
                >
                  <FontAwesomeIcon icon={faTimes} />
                  <span className="hidden md:inline">Cancel</span>
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
                  disabled={submitting}
                >
                  <FontAwesomeIcon icon={editingSticky ? faEdit : faPlus} />
                  <span className="hidden md:inline">
                    {submitting ? 'Saving...' : editingSticky ? 'Update' : 'Add Sticky'}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
