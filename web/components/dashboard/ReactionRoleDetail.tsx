'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faArrowLeft, 
  faPlus, 
  faTrash, 
  faEdit, 
  faSave,
  faLock,
  faUnlock,
  faCog,
  faUsers,
  faShieldAlt,
  faClock,
  faTimes
} from '@fortawesome/free-solid-svg-icons';

interface ReactionRoleMessage {
  id: number;
  messageId: string;
  channelId: string;
  enabled: boolean;
  locked: boolean;
  maxRolesPerUser: number | null;
}

interface ReactionOption {
  id: number;
  emoji: string;
  roleId: string;
  description: string | null;
}

interface ReactionGroup {
  id: number;
  name: string;
  type: 'unique' | 'limit';
  maxRoles: number | null;
  emojiIds: string[];
}

export default function ReactionRoleDetail({ 
  serverId, 
  messageId 
}: { 
  serverId: string; 
  messageId: string;
}) {
  const router = useRouter();
  const [message, setMessage] = useState<ReactionRoleMessage | null>(null);
  const [options, setOptions] = useState<ReactionOption[]>([]);
  const [groups, setGroups] = useState<ReactionGroup[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Add option modal
  const [showAddOption, setShowAddOption] = useState(false);
  const [newEmoji, setNewEmoji] = useState('');
  const [newRoleId, setNewRoleId] = useState('');
  const [newDescription, setNewDescription] = useState('');
  
  // Settings
  const [maxRolesPerUser, setMaxRolesPerUser] = useState<number | null>(null);
  const [tempDuration, setTempDuration] = useState<number | null>(null);
  
  // Groups modal
  const [showAddGroup, setShowAddGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupType, setNewGroupType] = useState<'unique' | 'limit'>('unique');
  const [newGroupMaxRoles, setNewGroupMaxRoles] = useState<number>(1);
  const [newGroupEmojis, setNewGroupEmojis] = useState<string[]>([]);
  
  // Access control
  const [whitelist, setWhitelist] = useState<any[]>([]);
  const [blacklist, setBlacklist] = useState<any[]>([]);
  const [userWhitelist, setUserWhitelist] = useState<any[]>([]);
  const [userBlacklist, setUserBlacklist] = useState<any[]>([]);
  const [showAddWhitelist, setShowAddWhitelist] = useState(false);
  const [showAddBlacklist, setShowAddBlacklist] = useState(false);
  const [showAddUserWhitelist, setShowAddUserWhitelist] = useState(false);
  const [showAddUserBlacklist, setShowAddUserBlacklist] = useState(false);
  const [newWhitelistRoleId, setNewWhitelistRoleId] = useState('');
  const [newBlacklistRoleId, setNewBlacklistRoleId] = useState('');
  const [newWhitelistUserId, setNewWhitelistUserId] = useState('');
  const [newBlacklistUserId, setNewBlacklistUserId] = useState('');

  useEffect(() => {
    fetchAll();
  }, [serverId, messageId]);

  const fetchAll = async () => {
    await Promise.all([
      fetchMessage(),
      fetchOptions(),
      fetchGroups(),
      fetchRoles(),
      fetchWhitelist(),
      fetchBlacklist(),
      fetchUserWhitelist(),
      fetchUserBlacklist()
    ]);
    setLoading(false);
  };

  const fetchMessage = async () => {
    try {
      const res = await fetch(`/api/servers/${serverId}/reaction-roles/${messageId}`);
      if (res.ok) {
        const data = await res.json();
        setMessage(data);
        setMaxRolesPerUser(data.maxRolesPerUser);
        setTempDuration(data.tempDurationMinutes || null);
      }
    } catch (error) {
      console.error('Failed to fetch message:', error);
    }
  };

  const fetchOptions = async () => {
    try {
      const res = await fetch(`/api/servers/${serverId}/reaction-roles/${messageId}/options`);
      if (res.ok) {
        const data = await res.json();
        setOptions(data);
      }
    } catch (error) {
      console.error('Failed to fetch options:', error);
    }
  };

  const fetchGroups = async () => {
    try {
      const res = await fetch(`/api/servers/${serverId}/reaction-roles/${messageId}/groups`);
      if (res.ok) {
        const data = await res.json();
        setGroups(data);
      }
    } catch (error) {
      console.error('Failed to fetch groups:', error);
    }
  };

  const fetchRoles = async () => {
    try {
      const res = await fetch(`/api/servers/${serverId}/roles`);
      if (res.ok) {
        const data = await res.json();
        setRoles(data);
      }
    } catch (error) {
      console.error('Failed to fetch roles:', error);
    }
  };

  const fetchWhitelist = async () => {
    try {
      const res = await fetch(`/api/servers/${serverId}/reaction-roles/${messageId}/whitelist`);
      if (res.ok) {
        const data = await res.json();
        setWhitelist(data);
      }
    } catch (error) {
      console.error('Failed to fetch whitelist:', error);
    }
  };

  const fetchBlacklist = async () => {
    try {
      const res = await fetch(`/api/servers/${serverId}/reaction-roles/${messageId}/blacklist`);
      if (res.ok) {
        const data = await res.json();
        setBlacklist(data);
      }
    } catch (error) {
      console.error('Failed to fetch blacklist:', error);
    }
  };

  const fetchUserWhitelist = async () => {
    try {
      const res = await fetch(`/api/servers/${serverId}/reaction-roles/${messageId}/user-whitelist`);
      if (res.ok) {
        const data = await res.json();
        setUserWhitelist(data);
      }
    } catch (error) {
      console.error('Failed to fetch user whitelist:', error);
    }
  };

  const fetchUserBlacklist = async () => {
    try {
      const res = await fetch(`/api/servers/${serverId}/reaction-roles/${messageId}/user-blacklist`);
      if (res.ok) {
        const data = await res.json();
        setUserBlacklist(data);
      }
    } catch (error) {
      console.error('Failed to fetch user blacklist:', error);
    }
  };

  const handleAddOption = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const res = await fetch(`/api/servers/${serverId}/reaction-roles/${messageId}/options`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          emoji: newEmoji,
          roleId: newRoleId,
          description: newDescription || null
        })
      });

      if (res.ok) {
        await fetchOptions();
        setShowAddOption(false);
        setNewEmoji('');
        setNewRoleId('');
        setNewDescription('');
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to add option');
      }
    } catch (error) {
      console.error('Failed to add option:', error);
      alert('Failed to add option');
    }
  };

  const handleDeleteOption = async (optionId: number) => {
    if (!confirm('Remove this reaction option?')) return;

    try {
      const res = await fetch(`/api/servers/${serverId}/reaction-roles/${messageId}/options/${optionId}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        await fetchOptions();
      } else {
        alert('Failed to delete option');
      }
    } catch (error) {
      console.error('Failed to delete option:', error);
      alert('Failed to delete option');
    }
  };

  const handleToggleLock = async () => {
    if (!message) return;

    try {
      const res = await fetch(`/api/servers/${serverId}/reaction-roles/${messageId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ locked: !message.locked })
      });

      if (res.ok) {
        await fetchMessage();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to toggle lock');
      }
    } catch (error) {
      console.error('Failed to toggle lock:', error);
      alert('Failed to toggle lock');
    }
  };

  const handleSaveSettings = async () => {
    try {
      const res = await fetch(`/api/servers/${serverId}/reaction-roles/${messageId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          maxRolesPerUser,
          tempDuration
        })
      });

      if (res.ok) {
        await fetchMessage();
        alert('Settings saved successfully');
      } else {
        alert('Failed to save settings');
      }
    } catch (error) {
      console.error('Failed to save settings:', error);
      alert('Failed to save settings');
    }
  };

  const handleAddGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newGroupEmojis.length === 0) {
      alert('Please select at least one emoji for this group');
      return;
    }

    try {
      const res = await fetch(`/api/servers/${serverId}/reaction-roles/${messageId}/groups`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          groupName: newGroupName,
          groupType: newGroupType,
          maxRoles: newGroupType === 'limit' ? newGroupMaxRoles : 1,
          emojiIds: newGroupEmojis
        })
      });

      if (res.ok) {
        await fetchGroups();
        setShowAddGroup(false);
        setNewGroupName('');
        setNewGroupType('unique');
        setNewGroupMaxRoles(1);
        setNewGroupEmojis([]);
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to add group');
      }
    } catch (error) {
      console.error('Failed to add group:', error);
      alert('Failed to add group');
    }
  };

  const handleDeleteGroup = async (groupId: number) => {
    if (!confirm('Delete this group?')) return;

    try {
      const res = await fetch(`/api/servers/${serverId}/reaction-roles/${messageId}/groups/${groupId}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        await fetchGroups();
      } else {
        alert('Failed to delete group');
      }
    } catch (error) {
      console.error('Failed to delete group:', error);
      alert('Failed to delete group');
    }
  };

  const toggleGroupEmoji = (emoji: string) => {
    if (newGroupEmojis.includes(emoji)) {
      setNewGroupEmojis(newGroupEmojis.filter(e => e !== emoji));
    } else {
      setNewGroupEmojis([...newGroupEmojis, emoji]);
    }
  };

  const handleAddWhitelist = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await fetch(`/api/servers/${serverId}/reaction-roles/${messageId}/whitelist`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roleId: newWhitelistRoleId })
      });

      if (res.ok) {
        await fetchWhitelist();
        setShowAddWhitelist(false);
        setNewWhitelistRoleId('');
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to add to whitelist');
      }
    } catch (error) {
      console.error('Failed to add to whitelist:', error);
      alert('Failed to add to whitelist');
    }
  };

  const handleDeleteWhitelist = async (whitelistId: number) => {
    if (!confirm('Remove from whitelist?')) return;

    try {
      const res = await fetch(`/api/servers/${serverId}/reaction-roles/${messageId}/whitelist/${whitelistId}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        await fetchWhitelist();
      } else {
        alert('Failed to remove from whitelist');
      }
    } catch (error) {
      console.error('Failed to remove from whitelist:', error);
      alert('Failed to remove from whitelist');
    }
  };

  const handleAddBlacklist = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await fetch(`/api/servers/${serverId}/reaction-roles/${messageId}/blacklist`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roleId: newBlacklistRoleId })
      });

      if (res.ok) {
        await fetchBlacklist();
        setShowAddBlacklist(false);
        setNewBlacklistRoleId('');
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to add to blacklist');
      }
    } catch (error) {
      console.error('Failed to add to blacklist:', error);
      alert('Failed to add to blacklist');
    }
  };

  const handleDeleteBlacklist = async (blacklistId: number) => {
    if (!confirm('Remove from blacklist?')) return;

    try {
      const res = await fetch(`/api/servers/${serverId}/reaction-roles/${messageId}/blacklist/${blacklistId}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        await fetchBlacklist();
      } else {
        alert('Failed to remove from blacklist');
      }
    } catch (error) {
      console.error('Failed to remove from blacklist:', error);
      alert('Failed to remove from blacklist');
    }
  };

  const handleAddUserWhitelist = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await fetch(`/api/servers/${serverId}/reaction-roles/${messageId}/user-whitelist`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: newWhitelistUserId })
      });

      if (res.ok) {
        await fetchUserWhitelist();
        setShowAddUserWhitelist(false);
        setNewWhitelistUserId('');
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to add to user whitelist');
      }
    } catch (error) {
      console.error('Failed to add to user whitelist:', error);
      alert('Failed to add to user whitelist');
    }
  };

  const handleDeleteUserWhitelist = async (whitelistId: number) => {
    if (!confirm('Remove from user whitelist?')) return;

    try {
      const res = await fetch(`/api/servers/${serverId}/reaction-roles/${messageId}/user-whitelist/${whitelistId}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        await fetchUserWhitelist();
      } else {
        alert('Failed to remove from user whitelist');
      }
    } catch (error) {
      console.error('Failed to remove from user whitelist:', error);
      alert('Failed to remove from user whitelist');
    }
  };

  const handleAddUserBlacklist = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await fetch(`/api/servers/${serverId}/reaction-roles/${messageId}/user-blacklist`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: newBlacklistUserId })
      });

      if (res.ok) {
        await fetchUserBlacklist();
        setShowAddUserBlacklist(false);
        setNewBlacklistUserId('');
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to add to user blacklist');
      }
    } catch (error) {
      console.error('Failed to add to user blacklist:', error);
      alert('Failed to add to user blacklist');
    }
  };

  const handleDeleteUserBlacklist = async (blacklistId: number) => {
    if (!confirm('Remove from user blacklist?')) return;

    try {
      const res = await fetch(`/api/servers/${serverId}/reaction-roles/${messageId}/user-blacklist/${blacklistId}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        await fetchUserBlacklist();
      } else {
        alert('Failed to remove from user blacklist');
      }
    } catch (error) {
      console.error('Failed to remove from user blacklist:', error);
      alert('Failed to remove from user blacklist');
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-400">Loading...</p>
      </div>
    );
  }

  if (!message) {
    return (
      <div className="text-center py-12">
        <p className="text-red-400">Message not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
          >
            <FontAwesomeIcon icon={faArrowLeft} className="text-slate-400" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white">Reaction Role Configuration</h1>
            <p className="text-sm text-slate-400">Message ID: {message.messageId}</p>
          </div>
        </div>
        
        <button
          onClick={handleToggleLock}
          className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
            message.locked 
              ? 'bg-yellow-600 hover:bg-yellow-700 text-white' 
              : 'bg-slate-700 hover:bg-slate-600 text-slate-300'
          }`}
        >
          <FontAwesomeIcon icon={message.locked ? faLock : faUnlock} />
          <span className="hidden md:inline">{message.locked ? 'Locked' : 'Unlocked'}</span>
        </button>
      </div>

      {/* Reaction Options */}
      <div className="bg-slate-800 rounded-lg p-4 md:p-6">
        <div className="flex items-center justify-between mb-3 md:mb-4">
          <h2 className="text-lg md:text-xl font-semibold text-white flex items-center gap-2">
            <FontAwesomeIcon icon={faUsers} className="text-purple-400" />
            Reaction Options
          </h2>
          <button
            onClick={() => setShowAddOption(true)}
            className="px-3 md:px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex items-center gap-2"
          >
            <FontAwesomeIcon icon={faPlus} />
            <span className="hidden md:inline">Add Option</span>
          </button>
        </div>

        {options.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            <p>No reaction options configured</p>
            <p className="text-sm mt-2">Add reaction + role pairs to get started</p>
          </div>
        ) : (
          <div className="space-y-2">
            {options.map((option) => {
              const role = roles.find(r => r.id === option.roleId);
              return (
                <div key={option.id} className="bg-slate-700 rounded-lg p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="text-3xl">{option.emoji}</span>
                    <div>
                      <p className="text-white font-medium">{role?.name || 'Unknown Role'}</p>
                      {option.description && (
                        <p className="text-sm text-slate-400">{option.description}</p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteOption(option.id)}
                    className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Groups */}
      <div className="bg-slate-800 rounded-lg p-4 md:p-6">
        <div className="flex items-center justify-between mb-3 md:mb-4">
          <h2 className="text-lg md:text-xl font-semibold text-white flex items-center gap-2">
            <FontAwesomeIcon icon={faShieldAlt} className="text-green-400" />
            Groups
          </h2>
          <button
            onClick={() => setShowAddGroup(true)}
            className="px-3 md:px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center gap-2"
          >
            <FontAwesomeIcon icon={faPlus} />
            <span className="hidden md:inline">Add Group</span>
          </button>
        </div>

        {groups.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            <p>No groups configured</p>
            <p className="text-sm mt-2">Groups let you set constraints like "only 1 role from this set"</p>
          </div>
        ) : (
          <div className="space-y-2">
            {groups.map((group) => (
              <div key={group.id} className="bg-slate-700 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="text-white font-medium">{group.name}</p>
                    <p className="text-sm text-slate-400">
                      Type: <span className="text-green-400">{group.type}</span>
                      {group.type === 'limit' && <span> • Max: {group.maxRoles} roles</span>}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDeleteGroup(group.id)}
                    className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                </div>
                <div className="flex gap-2 mt-2">
                  {Array.isArray(group.emojiIds) && group.emojiIds.map((emojiId: string, idx: number) => {
                    const option = options.find(o => o.emoji === emojiId);
                    return (
                      <span key={idx} className="text-2xl">{option?.emoji || emojiId}</span>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Access Control */}
      <div className="bg-slate-800 rounded-lg p-4 md:p-6">
        <h2 className="text-lg md:text-xl font-semibold text-white flex items-center gap-2 mb-3 md:mb-4">
          <FontAwesomeIcon icon={faShieldAlt} className="text-orange-400" />
          Access Control
        </h2>

        <div className="grid md:grid-cols-2 gap-4 md:gap-6 mb-4 md:mb-6">
          {/* Role Whitelist */}
          <div>
            <div className="flex items-center justify-between mb-2 md:mb-3">
              <h3 className="text-sm md:text-base text-white font-medium">Role Whitelist</h3>
              <button
                onClick={() => setShowAddWhitelist(true)}
                className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm flex items-center gap-1"
              >
                <FontAwesomeIcon icon={faPlus} className="text-xs" />
                <span className="hidden md:inline">Add</span>
              </button>
            </div>
            {whitelist.length === 0 ? (
              <p className="text-sm text-slate-400">All roles can react</p>
            ) : (
              <div className="space-y-2">
                {whitelist.map((item) => {
                  const role = roles.find(r => r.id === item.roleId);
                  return (
                    <div key={item.id} className="bg-slate-700 rounded p-2 flex items-center justify-between">
                      <span className="text-white text-sm">{role?.name || 'Unknown'}</span>
                      <button
                        onClick={() => handleDeleteWhitelist(item.id)}
                        className="text-red-400 hover:text-red-300 text-sm"
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Role Blacklist */}
          <div>
            <div className="flex items-center justify-between mb-2 md:mb-3">
              <h3 className="text-sm md:text-base text-white font-medium">Role Blacklist</h3>
              <button
                onClick={() => setShowAddBlacklist(true)}
                className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm flex items-center gap-1"
              >
                <FontAwesomeIcon icon={faPlus} className="text-xs" />
                <span className="hidden md:inline">Add</span>
              </button>
            </div>
            {blacklist.length === 0 ? (
              <p className="text-sm text-slate-400">No blocked roles</p>
            ) : (
              <div className="space-y-2">
                {blacklist.map((item) => {
                  const role = roles.find(r => r.id === item.roleId);
                  return (
                    <div key={item.id} className="bg-slate-700 rounded p-2 flex items-center justify-between">
                      <span className="text-white text-sm">{role?.name || 'Unknown'}</span>
                      <button
                        onClick={() => handleDeleteBlacklist(item.id)}
                        className="text-red-400 hover:text-red-300 text-sm"
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4 md:gap-6">
          {/* User Whitelist */}
          <div>
            <div className="flex items-center justify-between mb-2 md:mb-3">
              <h3 className="text-sm md:text-base text-white font-medium">User Whitelist</h3>
              <button
                onClick={() => setShowAddUserWhitelist(true)}
                className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm flex items-center gap-1"
              >
                <FontAwesomeIcon icon={faPlus} className="text-xs" />
                <span className="hidden md:inline">Add</span>
              </button>
            </div>
            {userWhitelist.length === 0 ? (
              <p className="text-sm text-slate-400">All users can react</p>
            ) : (
              <div className="space-y-2">
                {userWhitelist.map((item) => (
                  <div key={item.id} className="bg-slate-700 rounded p-2 flex items-center justify-between">
                    <span className="text-white text-sm font-mono">{item.userId}</span>
                    <button
                      onClick={() => handleDeleteUserWhitelist(item.id)}
                      className="text-red-400 hover:text-red-300 text-sm"
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* User Blacklist */}
          <div>
            <div className="flex items-center justify-between mb-2 md:mb-3">
              <h3 className="text-sm md:text-base text-white font-medium">User Blacklist</h3>
              <button
                onClick={() => setShowAddUserBlacklist(true)}
                className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm flex items-center gap-1"
              >
                <FontAwesomeIcon icon={faPlus} className="text-xs" />
                <span className="hidden md:inline">Add</span>
              </button>
            </div>
            {userBlacklist.length === 0 ? (
              <p className="text-sm text-slate-400">No blocked users</p>
            ) : (
              <div className="space-y-2">
                {userBlacklist.map((item) => (
                  <div key={item.id} className="bg-slate-700 rounded p-2 flex items-center justify-between">
                    <span className="text-white text-sm font-mono">{item.userId}</span>
                    <button
                      onClick={() => handleDeleteUserBlacklist(item.id)}
                      className="text-red-400 hover:text-red-300 text-sm"
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <p className="text-xs text-slate-400 mt-4">
          Note: If whitelist is set, only users/roles on the whitelist can react. Blacklist takes priority over whitelist.
        </p>
      </div>

      {/* Advanced Settings */}
      <div className="bg-slate-800 rounded-lg p-4 md:p-6">
        <h2 className="text-lg md:text-xl font-semibold text-white flex items-center gap-2 mb-3 md:mb-4">
          <FontAwesomeIcon icon={faCog} className="text-blue-400" />
          Advanced Settings
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Max Roles Per User
            </label>
            <input
              type="number"
              value={maxRolesPerUser || ''}
              onChange={(e) => setMaxRolesPerUser(e.target.value ? parseInt(e.target.value) : null)}
              placeholder="No limit"
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-slate-400 mt-1">Maximum number of roles a user can get from this message</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Temporary Assignment Duration (minutes)
            </label>
            <input
              type="number"
              value={tempDuration || ''}
              onChange={(e) => setTempDuration(e.target.value ? parseInt(e.target.value) : null)}
              placeholder="Permanent"
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-slate-400 mt-1">Roles will be automatically removed after this duration (leave empty for permanent)</p>
          </div>

          <button
            onClick={handleSaveSettings}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2"
          >
            <FontAwesomeIcon icon={faSave} />
            <span>Save Settings</span>
          </button>
        </div>
      </div>

      {/* Add Whitelist Modal */}
      {showAddWhitelist && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-semibold text-white mb-4">Add to Whitelist</h3>
            
            <form onSubmit={handleAddWhitelist} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Select Role
                </label>
                <select
                  value={newWhitelistRoleId}
                  onChange={(e) => setNewWhitelistRoleId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-green-500"
                  required
                >
                  <option value="">Choose a role...</option>
                  {roles.map(role => (
                    <option key={role.id} value={role.id}>{role.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setShowAddWhitelist(false)}
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                >
                  Add to Whitelist
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Blacklist Modal */}
      {showAddBlacklist && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-semibold text-white mb-4">Add to Blacklist</h3>
            
            <form onSubmit={handleAddBlacklist} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Select Role
                </label>
                <select
                  value={newBlacklistRoleId}
                  onChange={(e) => setNewBlacklistRoleId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-red-500"
                  required
                >
                  <option value="">Choose a role...</option>
                  {roles.map(role => (
                    <option key={role.id} value={role.id}>{role.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setShowAddBlacklist(false)}
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                >
                  Add to Blacklist
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add User Whitelist Modal */}
      {showAddUserWhitelist && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-semibold text-white mb-4">Add User to Whitelist</h3>
            
            <form onSubmit={handleAddUserWhitelist} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  User ID
                </label>
                <input
                  type="text"
                  value={newWhitelistUserId}
                  onChange={(e) => setNewWhitelistUserId(e.target.value)}
                  placeholder="Enter Discord User ID"
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-green-500"
                  required
                />
                <p className="text-xs text-slate-400 mt-1">Enter the Discord User ID (18-digit number)</p>
              </div>

              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setShowAddUserWhitelist(false)}
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                >
                  Add to Whitelist
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add User Blacklist Modal */}
      {showAddUserBlacklist && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-semibold text-white mb-4">Add User to Blacklist</h3>
            
            <form onSubmit={handleAddUserBlacklist} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  User ID
                </label>
                <input
                  type="text"
                  value={newBlacklistUserId}
                  onChange={(e) => setNewBlacklistUserId(e.target.value)}
                  placeholder="Enter Discord User ID"
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-red-500"
                  required
                />
                <p className="text-xs text-slate-400 mt-1">Enter the Discord User ID (18-digit number)</p>
              </div>

              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setShowAddUserBlacklist(false)}
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                >
                  Add to Blacklist
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Group Modal */}
      {showAddGroup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-semibold text-white mb-4">Create Group</h3>
            
            <form onSubmit={handleAddGroup} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Group Name
                </label>
                <input
                  type="text"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  placeholder="Color Roles, Game Roles, etc."
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Group Type
                </label>
                <select
                  value={newGroupType}
                  onChange={(e) => setNewGroupType(e.target.value as 'unique' | 'limit')}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-green-500"
                >
                  <option value="unique">Unique - Only 1 role from this group</option>
                  <option value="limit">Limit - Maximum N roles from this group</option>
                </select>
              </div>

              {newGroupType === 'limit' && (
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Max Roles
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={newGroupMaxRoles}
                    onChange={(e) => setNewGroupMaxRoles(parseInt(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-green-500"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Select Emojis in Group
                </label>
                {options.length === 0 ? (
                  <div className="p-4 bg-slate-700 rounded-lg text-center">
                    <p className="text-slate-400 text-sm">
                      No reaction options available. Add reaction options first before creating groups.
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto p-2 bg-slate-700 rounded-lg">
                      {options.map(option => (
                        <button
                          key={option.id}
                          type="button"
                          onClick={() => toggleGroupEmoji(option.emoji)}
                          className={`p-3 rounded-lg transition-colors ${
                            newGroupEmojis.includes(option.emoji)
                              ? 'bg-green-600'
                              : 'bg-slate-600 hover:bg-slate-500'
                          }`}
                        >
                          <span className="text-2xl">{option.emoji}</span>
                        </button>
                      ))}
                    </div>
                    {newGroupEmojis.length > 0 && (
                      <p className="text-xs text-green-400 mt-2">
                        {newGroupEmojis.length} emoji{newGroupEmojis.length !== 1 ? 's' : ''} selected
                      </p>
                    )}
                  </>
                )}
              </div>

              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setShowAddGroup(false)}
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors flex items-center gap-2"
                >
                  <FontAwesomeIcon icon={faTimes} />
                  <span className="hidden md:inline">Cancel</span>
                </button>
                <button
                  type="submit"
                  disabled={newGroupEmojis.length === 0}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <FontAwesomeIcon icon={faPlus} />
                  <span className="hidden md:inline">Create Group</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Option Modal */}
      {showAddOption && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-semibold text-white mb-4">Add Reaction Option</h3>
            
            <form onSubmit={handleAddOption} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Emoji
                </label>
                <input
                  type="text"
                  value={newEmoji}
                  onChange={(e) => setNewEmoji(e.target.value)}
                  placeholder="😀 or :smile: or custom emoji"
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500"
                  required
                />
                {newEmoji && options.some(opt => opt.emoji === newEmoji) && (
                  <p className="text-xs text-yellow-400 mt-1 flex items-center gap-1">
                    ⚠️ This emoji is already used in this message
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Role
                </label>
                <select
                  value={newRoleId}
                  onChange={(e) => setNewRoleId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500"
                  required
                >
                  <option value="">Select a role...</option>
                  {roles.map(role => (
                    <option key={role.id} value={role.id}>{role.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Description (Optional)
                </label>
                <input
                  type="text"
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="What this role is for..."
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setShowAddOption(false)}
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                >
                  Add Option
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
