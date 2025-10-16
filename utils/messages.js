// Centralized multilingual messages
const messages = {
  // Moderation messages
  moderation: {
    noPerm: {
      vi: '❌ Bạn không có quyền sử dụng lệnh này!',
      en: '❌ You don\'t have permission to use this command!'
    },
    noPermBan: {
      vi: '❌ Bạn không có quyền ban thành viên!',
      en: '❌ You don\'t have permission to ban members!'
    },
    noPermKick: {
      vi: '❌ Bạn không có quyền kick thành viên!',
      en: '❌ You don\'t have permission to kick members!'
    },
    noPermMute: {
      vi: '❌ Bạn không có quyền mute thành viên!',
      en: '❌ You don\'t have permission to mute members!'
    },
    protected: {
      vi: '❌ Không thể thực hiện hành động này với thành viên được bảo vệ!',
      en: '❌ Cannot perform this action on a protected member!'
    },
    higherRole: {
      vi: '❌ Không thể thực hiện hành động này với thành viên có role cao hơn!',
      en: '❌ Cannot perform this action on a member with higher role!'
    },
    cannotSelf: {
      vi: '❌ Bạn không thể thực hiện hành động này với chính mình!',
      en: '❌ You cannot perform this action on yourself!'
    },
    cannotBot: {
      vi: '❌ Không thể thực hiện hành động này với bot!',
      en: '❌ Cannot perform this action on a bot!'
    },
    invalidDuration: {
      vi: '❌ Thời gian không hợp lệ! Tối thiểu: 5 phút, tối đa: 7 ngày (10080 phút)',
      en: '❌ Invalid duration! Minimum: 5 minutes, Maximum: 7 days (10080 minutes)'
    },
    notMuted: {
      vi: '❌ Thành viên này không bị mute!',
      en: '❌ This member is not muted!'
    },
    banSuccess: {
      vi: '✅ Đã ban {user}',
      en: '✅ Banned {user}'
    },
    unbanSuccess: {
      vi: '✅ Đã unban {user}',
      en: '✅ Unbanned {user}'
    },
    kickSuccess: {
      vi: '✅ Đã kick {user}',
      en: '✅ Kicked {user}'
    },
    muteSuccess: {
      vi: '✅ Đã mute {user} trong {duration}',
      en: '✅ Muted {user} for {duration}'
    },
    unmuteSuccess: {
      vi: '✅ Đã unmute {user}',
      en: '✅ Unmuted {user}'
    },
    warnSuccess: {
      vi: '✅ Đã warn {user}',
      en: '✅ Warned {user}'
    },
    unwarnSuccess: {
      vi: '✅ Đã xóa warning #{id}',
      en: '✅ Removed warning #{id}'
    }
  },

  // Giveaway messages
  giveaway: {
    created: {
      vi: '✅ Đã tạo giveaway!',
      en: '✅ Giveaway created!'
    },
    ended: {
      vi: '✅ Đã kết thúc giveaway!',
      en: '✅ Giveaway ended!'
    },
    rerolled: {
      vi: '✅ Đã chọn lại winner!',
      en: '✅ Rerolled winner!'
    },
    notFound: {
      vi: '❌ Không tìm thấy giveaway!',
      en: '❌ Giveaway not found!'
    },
    alreadyEnded: {
      vi: '❌ Giveaway này đã kết thúc!',
      en: '❌ This giveaway has already ended!'
    },
    invalidDuration: {
      vi: '❌ Thời gian không hợp lệ! (Ví dụ: 1h, 30m, 1d)',
      en: '❌ Invalid duration! (Example: 1h, 30m, 1d)'
    }
  },

  // Role management messages
  roles: {
    added: {
      vi: '✅ Đã thêm role {role} cho {user}',
      en: '✅ Added role {role} to {user}'
    },
    removed: {
      vi: '✅ Đã gỡ role {role} khỏi {user}',
      en: '✅ Removed role {role} from {user}'
    },
    created: {
      vi: '✅ Đã tạo role {role}',
      en: '✅ Created role {role}'
    },
    deleted: {
      vi: '✅ Đã xóa role {role}',
      en: '✅ Deleted role {role}'
    },
    notFound: {
      vi: '❌ Không tìm thấy role!',
      en: '❌ Role not found!'
    },
    higherRole: {
      vi: '❌ Không thể quản lý role cao hơn role của bạn!',
      en: '❌ Cannot manage roles higher than yours!'
    },
    botHigherRole: {
      vi: '❌ Role này cao hơn role của bot!',
      en: '❌ This role is higher than bot\'s role!'
    }
  },

  // General errors
  errors: {
    noPermission: {
      vi: '❌ Bạn không có quyền sử dụng lệnh này!',
      en: '❌ You don\'t have permission to use this command!'
    },
    missingArgs: {
      vi: '❌ Thiếu tham số! Sử dụng: {usage}',
      en: '❌ Missing arguments! Usage: {usage}'
    },
    invalidUser: {
      vi: '❌ Không tìm thấy người dùng!',
      en: '❌ User not found!'
    },
    botError: {
      vi: '❌ Có lỗi xảy ra khi thực hiện lệnh!',
      en: '❌ An error occurred while executing the command!'
    },
    databaseError: {
      vi: '❌ Lỗi database! Vui lòng thử lại sau.',
      en: '❌ Database error! Please try again later.'
    }
  },

  // Success messages
  success: {
    updated: {
      vi: '✅ Đã cập nhật!',
      en: '✅ Updated!'
    },
    deleted: {
      vi: '✅ Đã xóa!',
      en: '✅ Deleted!'
    },
    created: {
      vi: '✅ Đã tạo!',
      en: '✅ Created!'
    }
  }
};

/**
 * Get message by key path
 * @param {string} lang - Language code (vi/en)
 * @param {string} path - Dot notation path (e.g., 'moderation.banSuccess')
 * @param {object} vars - Variables to replace in message
 * @returns {string} Localized message
 */
function getMessage(lang, path, vars = {}) {
  const keys = path.split('.');
  let message = messages;
  
  for (const key of keys) {
    message = message[key];
    if (!message) return path; // Return path if not found
  }
  
  let result = message[lang] || message.vi || message.en || path;
  
  // Replace variables
  Object.keys(vars).forEach(key => {
    result = result.replace(new RegExp(`{${key}}`, 'g'), vars[key]);
  });
  
  return result;
}

module.exports = { messages, getMessage };
