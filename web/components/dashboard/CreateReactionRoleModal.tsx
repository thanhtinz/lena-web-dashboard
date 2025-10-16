'use client';

import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faHashtag, faPlus, faTrash, faEye } from '@fortawesome/free-solid-svg-icons';

interface CreateReactionRoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  serverId: string;
  onSuccess: () => void;
}

interface EmbedField {
  name: string;
  value: string;
  inline: boolean;
}

export default function CreateReactionRoleModal({ 
  isOpen, 
  onClose, 
  serverId,
  onSuccess 
}: CreateReactionRoleModalProps) {
  const [channels, setChannels] = useState<any[]>([]);
  const [messageType, setMessageType] = useState<'text' | 'embed'>('text');
  const [channelId, setChannelId] = useState('');
  const [textContent, setTextContent] = useState('');
  const [showPreview, setShowPreview] = useState(true);
  
  // Embed builder fields
  const [embedData, setEmbedData] = useState({
    title: '',
    description: '',
    color: '#5865F2',
    authorName: '',
    authorIcon: '',
    footerText: '',
    footerIcon: '',
    imageUrl: '',
    thumbnailUrl: '',
  });
  const [fields, setFields] = useState<EmbedField[]>([]);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchChannels();
      // Reset form
      setMessageType('text');
      setChannelId('');
      setTextContent('');
      setEmbedData({
        title: '',
        description: '',
        color: '#5865F2',
        authorName: '',
        authorIcon: '',
        footerText: '',
        footerIcon: '',
        imageUrl: '',
        thumbnailUrl: '',
      });
      setFields([]);
      setError('');
    }
  }, [isOpen]);

  const fetchChannels = async () => {
    try {
      const res = await fetch(`/api/servers/${serverId}/channels`);
      if (res.ok) {
        const data = await res.json();
        setChannels(data.filter((c: any) => c.type === 0)); // Text channels only
      }
    } catch (error) {
      console.error('Failed to fetch channels:', error);
    }
  };

  const addField = () => {
    if (fields.length >= 25) {
      setError('Maximum 25 fields allowed per embed');
      return;
    }
    setFields([...fields, { name: '', value: '', inline: false }]);
  };

  const removeField = (index: number) => {
    setFields(fields.filter((_, i) => i !== index));
  };

  const updateField = (index: number, key: keyof EmbedField, value: any) => {
    const newFields = [...fields];
    newFields[index] = { ...newFields[index], [key]: value };
    setFields(newFields);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    if (!channelId) {
      setError('Please select a channel');
      setIsSubmitting(false);
      return;
    }

    if (messageType === 'text' && !textContent.trim()) {
      setError('Please enter message content');
      setIsSubmitting(false);
      return;
    }

    if (messageType === 'embed' && !embedData.title && !embedData.description) {
      setError('Embed must have at least a title or description');
      setIsSubmitting(false);
      return;
    }

    try {
      const payload = {
        channelId,
        messageType,
        content: messageType === 'text' ? textContent : null,
        embed: messageType === 'embed' ? {
          ...embedData,
          fields: fields.length > 0 ? fields : null,
        } : null,
      };

      const res = await fetch(`/api/servers/${serverId}/reaction-roles`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to create reaction role message');
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <h2 className="text-xl font-semibold text-white">Create Reaction Role Message</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <FontAwesomeIcon icon={faTimes} className="text-xl" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
            <div className="space-y-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    <FontAwesomeIcon icon={faHashtag} className="mr-2" />
                    Channel
                  </label>
                  <select
                    value={channelId}
                    onChange={(e) => setChannelId(e.target.value)}
                    className="w-full bg-slate-700 text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 outline-none"
                    required
                  >
                    <option value="">Select a channel</option>
                    {channels.map((ch) => (
                      <option key={ch.id} value={ch.id}>
                        #{ch.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Message Type
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setMessageType('text')}
                      className={`flex-1 px-4 py-2 rounded-lg transition-colors ${
                        messageType === 'text'
                          ? 'bg-purple-600 text-white'
                          : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                      }`}
                    >
                      Text Message
                    </button>
                    <button
                      type="button"
                      onClick={() => setMessageType('embed')}
                      className={`flex-1 px-4 py-2 rounded-lg transition-colors ${
                        messageType === 'embed'
                          ? 'bg-purple-600 text-white'
                          : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                      }`}
                    >
                      Embed
                    </button>
                  </div>
                </div>

                {messageType === 'text' ? (
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Message Content
                    </label>
                    <textarea
                      value={textContent}
                      onChange={(e) => setTextContent(e.target.value)}
                      className="w-full bg-slate-700 text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 outline-none min-h-[100px]"
                      placeholder="Enter your message here..."
                      required
                    />
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                          Title
                        </label>
                        <input
                          type="text"
                          value={embedData.title}
                          onChange={(e) => setEmbedData({ ...embedData, title: e.target.value })}
                          className="w-full bg-slate-700 text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 outline-none"
                          placeholder="Embed title"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                          Color
                        </label>
                        <input
                          type="color"
                          value={embedData.color}
                          onChange={(e) => setEmbedData({ ...embedData, color: e.target.value })}
                          className="w-full h-10 bg-slate-700 rounded-lg px-2"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Description
                      </label>
                      <textarea
                        value={embedData.description}
                        onChange={(e) => setEmbedData({ ...embedData, description: e.target.value })}
                        className="w-full bg-slate-700 text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 outline-none min-h-[100px]"
                        placeholder="Embed description"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                          Author Name
                        </label>
                        <input
                          type="text"
                          value={embedData.authorName}
                          onChange={(e) => setEmbedData({ ...embedData, authorName: e.target.value })}
                          className="w-full bg-slate-700 text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 outline-none"
                          placeholder="Optional"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                          Author Icon URL
                        </label>
                        <input
                          type="text"
                          value={embedData.authorIcon}
                          onChange={(e) => setEmbedData({ ...embedData, authorIcon: e.target.value })}
                          className="w-full bg-slate-700 text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 outline-none"
                          placeholder="Optional"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                          Footer Text
                        </label>
                        <input
                          type="text"
                          value={embedData.footerText}
                          onChange={(e) => setEmbedData({ ...embedData, footerText: e.target.value })}
                          className="w-full bg-slate-700 text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 outline-none"
                          placeholder="Optional"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                          Footer Icon URL
                        </label>
                        <input
                          type="text"
                          value={embedData.footerIcon}
                          onChange={(e) => setEmbedData({ ...embedData, footerIcon: e.target.value })}
                          className="w-full bg-slate-700 text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 outline-none"
                          placeholder="Optional"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                          Image URL
                        </label>
                        <input
                          type="text"
                          value={embedData.imageUrl}
                          onChange={(e) => setEmbedData({ ...embedData, imageUrl: e.target.value })}
                          className="w-full bg-slate-700 text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 outline-none"
                          placeholder="Optional"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                          Thumbnail URL
                        </label>
                        <input
                          type="text"
                          value={embedData.thumbnailUrl}
                          onChange={(e) => setEmbedData({ ...embedData, thumbnailUrl: e.target.value })}
                          className="w-full bg-slate-700 text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 outline-none"
                          placeholder="Optional"
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-medium text-slate-300">
                          Fields (Optional)
                        </label>
                        <button
                          type="button"
                          onClick={addField}
                          className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-lg transition-colors"
                        >
                          <FontAwesomeIcon icon={faPlus} className="mr-2" />
                          Add Field
                        </button>
                      </div>
                      <div className="space-y-3">
                        {fields.map((field, idx) => (
                          <div key={idx} className="bg-slate-700 p-3 rounded-lg space-y-2">
                            <div className="flex items-center gap-2">
                              <input
                                type="text"
                                value={field.name}
                                onChange={(e) => updateField(idx, 'name', e.target.value)}
                                className="flex-1 bg-slate-600 text-white rounded px-3 py-1 text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                                placeholder="Field name"
                              />
                              <button
                                type="button"
                                onClick={() => removeField(idx)}
                                className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded transition-colors"
                              >
                                <FontAwesomeIcon icon={faTrash} />
                              </button>
                            </div>
                            <input
                              type="text"
                              value={field.value}
                              onChange={(e) => updateField(idx, 'value', e.target.value)}
                              className="w-full bg-slate-600 text-white rounded px-3 py-1 text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                              placeholder="Field value"
                            />
                            <label className="flex items-center gap-2 text-sm text-slate-300">
                              <input
                                type="checkbox"
                                checked={field.inline}
                                onChange={(e) => updateField(idx, 'inline', e.target.checked)}
                                className="rounded"
                              />
                              Inline
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {error && (
                  <div className="bg-red-900/20 border border-red-700/50 p-3 rounded-lg text-red-400 text-sm">
                    {error}
                  </div>
                )}

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Creating...' : 'Create Message'}
                  </button>
                </div>
              </form>
            </div>

            <div className="bg-slate-900 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-semibold">Preview</h3>
                <button
                  onClick={() => setShowPreview(!showPreview)}
                  className="text-sm text-purple-400 hover:text-purple-300"
                >
                  <FontAwesomeIcon icon={faEye} className="mr-2" />
                  {showPreview ? 'Hide' : 'Show'}
                </button>
              </div>
              
              {showPreview && (
                <div className="space-y-4">
                  {messageType === 'text' ? (
                    <div className="bg-slate-800 rounded-lg p-4">
                      <p className="text-slate-300 whitespace-pre-wrap">
                        {textContent || 'Your message will appear here...'}
                      </p>
                    </div>
                  ) : (
                    <div 
                      className="rounded-lg overflow-hidden border-l-4 bg-slate-800"
                      style={{ borderColor: embedData.color }}
                    >
                      <div className="p-4 space-y-3">
                        {embedData.authorName && (
                          <div className="flex items-center gap-2">
                            {embedData.authorIcon && (
                              <img src={embedData.authorIcon} className="w-6 h-6 rounded-full" alt="" />
                            )}
                            <span className="text-white text-sm font-semibold">{embedData.authorName}</span>
                          </div>
                        )}
                        
                        {embedData.title && (
                          <h3 className="text-white font-semibold">{embedData.title}</h3>
                        )}
                        
                        {embedData.description && (
                          <p className="text-slate-300 text-sm whitespace-pre-wrap">{embedData.description}</p>
                        )}

                        {fields.length > 0 && (
                          <div className="grid grid-cols-1 gap-2">
                            {fields.map((field, idx) => (
                              <div key={idx} className={field.inline ? 'inline-block w-1/2' : ''}>
                                <p className="text-white text-sm font-semibold">{field.name || 'Field name'}</p>
                                <p className="text-slate-300 text-sm">{field.value || 'Field value'}</p>
                              </div>
                            ))}
                          </div>
                        )}

                        {embedData.imageUrl && (
                          <img src={embedData.imageUrl} className="rounded max-w-full" alt="" />
                        )}

                        {embedData.thumbnailUrl && (
                          <img src={embedData.thumbnailUrl} className="rounded w-20 float-right" alt="" />
                        )}

                        {embedData.footerText && (
                          <div className="flex items-center gap-2 text-xs text-slate-400">
                            {embedData.footerIcon && (
                              <img src={embedData.footerIcon} className="w-5 h-5 rounded-full" alt="" />
                            )}
                            <span>{embedData.footerText}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="bg-blue-900/20 border border-blue-700/50 p-3 rounded-lg">
                    <p className="text-blue-300 text-xs">
                      💡 After creating, use the bot to add reaction + role pairs to this message
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
