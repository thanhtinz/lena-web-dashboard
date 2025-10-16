'use client';

import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faEye, faPlus, faTrash } from '@fortawesome/free-solid-svg-icons';

interface EmbedBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  serverId: string;
  embed?: any;
  onSuccess: () => void;
}

interface EmbedField {
  name: string;
  value: string;
  inline: boolean;
}

const parseFields = (fieldsJson: string | null): EmbedField[] => {
  if (!fieldsJson) return [];
  try {
    return JSON.parse(fieldsJson);
  } catch {
    return [];
  }
};

export default function EmbedBuilderModal({ 
  isOpen, 
  onClose, 
  serverId, 
  embed,
  onSuccess 
}: EmbedBuilderModalProps) {
  const [formData, setFormData] = useState({
    name: '',
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
  const [showPreview, setShowPreview] = useState(true);

  // Sync state when modal opens or embed changes
  useEffect(() => {
    if (isOpen) {
      if (embed) {
        // Editing existing embed
        setFormData({
          name: embed.name || '',
          title: embed.title || '',
          description: embed.description || '',
          color: embed.color || '#5865F2',
          authorName: embed.authorName || '',
          authorIcon: embed.authorIcon || '',
          footerText: embed.footerText || '',
          footerIcon: embed.footerIcon || '',
          imageUrl: embed.imageUrl || '',
          thumbnailUrl: embed.thumbnailUrl || '',
        });
        setFields(parseFields(embed.fields));
      } else {
        // Creating new embed - reset to defaults
        setFormData({
          name: '',
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
      }
      setError('');
    }
  }, [isOpen, embed]);

  if (!isOpen) return null;

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

    try {
      const url = `/api/servers/${serverId}/embeds`;
      const method = embed ? 'PATCH' : 'POST';

      const payload = embed ? {
        embedId: embed.id,
        ...formData,
        fields: fields.length > 0 ? JSON.stringify(fields) : null,
      } : {
        ...formData,
        fields: fields.length > 0 ? JSON.stringify(fields) : null,
      };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to save');
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save embed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 border border-slate-700 rounded-lg max-w-7xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-slate-800 border-b border-slate-700 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-xl font-bold text-white">
            {embed ? 'Edit Embed' : 'Create Embed'}
          </h2>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="px-3 py-1 border border-slate-600 text-slate-300 rounded hover:bg-slate-700 transition text-sm"
            >
              <FontAwesomeIcon icon={faEye} className="h-4 w-4 mr-1" />
              {showPreview ? 'Hide' : 'Show'} Preview
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white transition"
            >
              <FontAwesomeIcon icon={faTimes} className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6 p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Basic Info */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Embed Name * (for reference)
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2.5 text-white focus:border-indigo-600 outline-none"
                placeholder="welcome_embed"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Title
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2.5 text-white focus:border-indigo-600 outline-none"
                placeholder="Welcome to our server!"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2.5 text-white focus:border-indigo-600 outline-none"
                rows={4}
                placeholder="Your description here..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Color (Hex)
              </label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className="w-16 h-10 bg-slate-900 border border-slate-600 rounded-lg cursor-pointer"
                />
                <input
                  type="text"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className="flex-1 bg-slate-900 border border-slate-600 rounded-lg px-4 py-2.5 text-white focus:border-indigo-600 outline-none"
                  placeholder="#5865F2"
                />
              </div>
            </div>

            {/* Author Section */}
            <div className="border-t border-slate-700 pt-4">
              <h3 className="text-sm font-semibold text-slate-300 mb-3">Author</h3>
              <div className="space-y-3">
                <input
                  type="text"
                  value={formData.authorName}
                  onChange={(e) => setFormData({ ...formData, authorName: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2.5 text-white focus:border-indigo-600 outline-none"
                  placeholder="Author name"
                />
                <input
                  type="url"
                  value={formData.authorIcon}
                  onChange={(e) => setFormData({ ...formData, authorIcon: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2.5 text-white focus:border-indigo-600 outline-none"
                  placeholder="Author icon URL"
                />
              </div>
            </div>

            {/* Fields Section */}
            <div className="border-t border-slate-700 pt-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-slate-300">Fields ({fields.length}/25)</h3>
                <button
                  type="button"
                  onClick={addField}
                  className="px-3 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition text-sm"
                  disabled={fields.length >= 25}
                >
                  <FontAwesomeIcon icon={faPlus} className="h-3 w-3 mr-1" />
                  Add Field
                </button>
              </div>
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {fields.map((field, index) => (
                  <div key={index} className="bg-slate-900 border border-slate-600 rounded-lg p-3">
                    <div className="flex items-start gap-2 mb-2">
                      <input
                        type="text"
                        value={field.name}
                        onChange={(e) => updateField(index, 'name', e.target.value)}
                        className="flex-1 bg-slate-800 border border-slate-600 rounded px-3 py-1.5 text-white text-sm focus:border-indigo-600 outline-none"
                        placeholder="Field name"
                      />
                      <button
                        type="button"
                        onClick={() => removeField(index)}
                        className="px-2 py-1.5 border border-red-600 text-red-400 rounded hover:bg-red-600/10 transition"
                      >
                        <FontAwesomeIcon icon={faTrash} className="h-3 w-3" />
                      </button>
                    </div>
                    <textarea
                      value={field.value}
                      onChange={(e) => updateField(index, 'value', e.target.value)}
                      className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-1.5 text-white text-sm focus:border-indigo-600 outline-none mb-2"
                      rows={2}
                      placeholder="Field value"
                    />
                    <label className="flex items-center gap-2 text-sm text-slate-400">
                      <input
                        type="checkbox"
                        checked={field.inline}
                        onChange={(e) => updateField(index, 'inline', e.target.checked)}
                        className="rounded"
                      />
                      Display inline
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer Section */}
            <div className="border-t border-slate-700 pt-4">
              <h3 className="text-sm font-semibold text-slate-300 mb-3">Footer</h3>
              <div className="space-y-3">
                <input
                  type="text"
                  value={formData.footerText}
                  onChange={(e) => setFormData({ ...formData, footerText: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2.5 text-white focus:border-indigo-600 outline-none"
                  placeholder="Footer text"
                />
                <input
                  type="url"
                  value={formData.footerIcon}
                  onChange={(e) => setFormData({ ...formData, footerIcon: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2.5 text-white focus:border-indigo-600 outline-none"
                  placeholder="Footer icon URL"
                />
              </div>
            </div>

            {/* Images */}
            <div className="border-t border-slate-700 pt-4">
              <h3 className="text-sm font-semibold text-slate-300 mb-3">Images</h3>
              <div className="space-y-3">
                <input
                  type="url"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2.5 text-white focus:border-indigo-600 outline-none"
                  placeholder="Main image URL"
                />
                <input
                  type="url"
                  value={formData.thumbnailUrl}
                  onChange={(e) => setFormData({ ...formData, thumbnailUrl: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2.5 text-white focus:border-indigo-600 outline-none"
                  placeholder="Thumbnail URL"
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-900/20 border border-red-700/30 rounded-lg p-4">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            <div className="flex items-center gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-slate-600 text-white rounded-lg hover:bg-slate-700 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-3 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
              >
                {isSubmitting ? 'Saving...' : embed ? 'Update' : 'Create'}
              </button>
            </div>
          </form>

          {showPreview && (
            <div className="bg-slate-900 rounded-lg p-6 sticky top-24 self-start">
              <h3 className="text-sm font-semibold text-slate-400 mb-4">Live Preview</h3>
              <div 
                className="border-l-4 bg-slate-800 rounded p-4"
                style={{ borderLeftColor: formData.color || '#5865F2' }}
              >
                {/* Author */}
                {formData.authorName && (
                  <div className="flex items-center gap-2 mb-3">
                    {formData.authorIcon && (
                      <img 
                        src={formData.authorIcon} 
                        alt="Author" 
                        className="w-6 h-6 rounded-full"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                      />
                    )}
                    <span className="text-sm font-semibold text-white">{formData.authorName}</span>
                  </div>
                )}

                {/* Thumbnail */}
                {formData.thumbnailUrl && (
                  <div className="float-right ml-4 mb-2">
                    <img 
                      src={formData.thumbnailUrl} 
                      alt="Thumbnail" 
                      className="w-20 h-20 object-cover rounded"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                  </div>
                )}

                {/* Title & Description */}
                {formData.title && (
                  <h3 className="text-lg font-semibold text-white mb-2">{formData.title}</h3>
                )}
                {formData.description && (
                  <p className="text-sm text-slate-300 mb-3 whitespace-pre-wrap">{formData.description}</p>
                )}

                {/* Fields */}
                {fields.length > 0 && (
                  <div className="grid grid-cols-1 gap-2 mb-3">
                    {fields.map((field, index) => (
                      <div 
                        key={index} 
                        className={field.inline ? 'inline-block w-1/2 pr-2' : 'block'}
                      >
                        <div className="text-sm font-semibold text-white mb-1">{field.name || 'Field Name'}</div>
                        <div className="text-sm text-slate-400">{field.value || 'Field Value'}</div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Main Image */}
                {formData.imageUrl && (
                  <img 
                    src={formData.imageUrl} 
                    alt="Embed" 
                    className="w-full rounded mt-2"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                )}

                {/* Footer */}
                {formData.footerText && (
                  <div className="flex items-center gap-2 text-xs text-slate-500 mt-3 pt-2 border-t border-slate-700">
                    {formData.footerIcon && (
                      <img 
                        src={formData.footerIcon} 
                        alt="Footer" 
                        className="w-5 h-5 rounded-full"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                      />
                    )}
                    <span>{formData.footerText}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
