# 📊 PROFESSIONAL LOGGING SYSTEM - HỆ THỐNG LOG CHUYÊN NGHIỆP

## 🌟 Tổng quan

Lena có hệ thống logging chuyên nghiệp gửi logs từ tất cả servers về một kênh Discord tập trung để admin theo dõi và quản lý bot hiệu quả.

## ✨ Tính năng

### 📈 Log Levels (Mức độ)
- **ERROR** 🔴 - Lỗi nghiêm trọng (Priority 4)
- **WARN** 🟠 - Cảnh báo (Priority 3)
- **INFO** 🔵 - Thông tin (Priority 2, Default)
- **DEBUG** ⚪ - Debug chi tiết (Priority 1)

### 📂 Log Categories (Danh mục)
- **📝 Command** - User commands execution
- **❌ Error** - Errors & exceptions
- **🎉 Event** - Bot events (join/leave server)
- **⚙️ System** - System events
- **🔒 Security** - Blacklist triggers & security
- **🌐 API** - External API calls
- **🗄️ Database** - Database operations

### 🎯 Logged Events

**Tự động log:**
- ✅ Bot startup/shutdown
- ✅ Server join/leave
- ✅ Critical errors
- ✅ Blacklist 18+ triggers
- ✅ Message processing errors
- ✅ Discord client errors

## 🎮 Admin Commands

### !loglevel
Thay đổi log level (chỉ admin)

**Usage:**
```
!loglevel                    # Xem current level
!loglevel <error|warn|info|debug>  # Đổi level
```

**Examples:**
```
!loglevel info     # Set to INFO (default)
!loglevel error    # Chỉ log errors
!loglevel debug    # Log tất cả (debug mode)
```

**Log Levels:**
- `error` - Chỉ log lỗi nghiêm trọng
- `warn` - Log warnings và errors
- `info` - Log thông tin, warnings, errors (mặc định)
- `debug` - Log tất cả kể cả debug messages

### !logstats
Xem thống kê logging system (chỉ admin)

**Usage:**
```
!logstats
```

**Hiển thị:**
- Current log level
- Queue length
- Processing status
- Log channel & server
- Available levels

### !logtest
Test logging system với sample logs (chỉ admin)

**Usage:**
```
!logtest
```

**Test:**
- DEBUG log
- INFO log
- WARN log
- ERROR log (với stack trace)

## 📊 Log Format

### Standard Log Embed
```
🔴 ERROR - ❌ Error
<Error message>

🏠 Server: ServerName (ID)
👤 User: Username#1234 (ID)
📢 Channel: #channel-name (ID)
⚡ Command: `!command`
🐛 Error Details: <error message>
📋 Stack Trace: <stack trace>
ℹ️ Additional Info: <extra details>

Footer: Timestamp
```

### Specialized Logs

**Security (Blacklist Trigger):**
```
🟠 WARN - 🔒 Security
🔒 Blocked 18+ Content

👤 User: Username#1234 (ID)
🏠 Server: ServerName (ID)
📢 Channel: #channel-name (ID)
ℹ️ Additional Info: 
   Keyword: "blocked_word"
   Message: "user message preview..."
```

**Bot Events:**
```
🔵 INFO - 🎉 Event
🎉 Bot Joined Server

🏠 Server: ServerName (ID)
ℹ️ Additional Info:
   Members: 1234
   Owner: <@owner_id>
```

## ⚙️ Configuration

### Log Channel Setup
Logger được config trong `index.js`:

```javascript
const LOG_CHANNEL_ID = '1427091743542612099';
const LOG_SERVER_ID = '1332505823435558973';
logger.initialize(client, LOG_CHANNEL_ID, LOG_SERVER_ID);
logger.setLogLevel(LogLevel.INFO);
```

**Để đổi log channel:**
1. Lấy Channel ID từ Discord (Enable Developer Mode)
2. Right click channel → Copy ID
3. Update `LOG_CHANNEL_ID` trong `index.js`
4. Restart bot

### Permissions Required
Log channel cần permissions:
- ✅ View Channel
- ✅ Send Messages
- ✅ Embed Links
- ✅ Attach Files (nếu cần)

## 🔧 Technical Implementation

### Files
- `utils/logger.js` - Core logging system
- `commands/loggingCommands.js` - Admin commands
- `index.js` - Integration & initialization

### Logger Class

**Main Methods:**
```javascript
// Initialize
logger.initialize(client, channelId, serverId);
logger.setLogLevel(LogLevel.INFO);

// Log methods
logger.error(category, message, details);
logger.warn(category, message, details);
logger.info(category, message, details);
logger.debug(category, message, details);

// Specialized methods
logger.logCommand(name, user, server, channel, success);
logger.logError(message, error, context);
logger.logEvent(eventName, details);
logger.logSecurity(message, details);
logger.logAPI(apiName, success, details);
logger.logDatabase(operation, success, details);

// Stats
logger.getStats();
```

### Log Queue System
- **Queue Management**: Prevents Discord rate limits
- **Processing Rate**: 1 log per second
- **Auto Retry**: Failed logs are queued
- **Non-blocking**: Async processing

### Integration Points

**Bot Startup:**
```javascript
client.on('ready', async () => {
  logger.initialize(client, LOG_CHANNEL_ID, LOG_SERVER_ID);
  await logger.logEvent('🚀 Bot Started', { ... });
});
```

**Server Events:**
```javascript
client.on('guildCreate', async (guild) => {
  await logger.logEvent('🎉 Bot Joined Server', { ... });
});

client.on('guildDelete', async (guild) => {
  await logger.logEvent('👋 Bot Left Server', { ... });
});
```

**Error Handling:**
```javascript
catch (error) {
  await logger.logError('Message processing error', error, {
    user: `${message.author.tag}`,
    server: `${message.guild.name}`,
    // ...
  });
}
```

**Security Events:**
```javascript
if (blacklistCheck.blocked) {
  await logger.logSecurity('🔒 Blocked 18+ Content', {
    keyword: blacklistCheck.keyword,
    // ...
  });
}
```

## 📈 Use Cases

### 1. Monitor Bot Activity
- Track which servers bot joins/leaves
- Monitor active servers count
- Detect spam/abuse patterns

### 2. Debug Issues
- Set log level to `DEBUG`
- Check detailed logs for specific errors
- View stack traces and context

### 3. Security Monitoring
- Track blacklist triggers
- Monitor inappropriate content attempts
- Identify problematic users

### 4. Performance Tracking
- Monitor API call success rates
- Track database operation performance
- Identify bottlenecks

### 5. Audit Trail
- Track admin command usage
- Log important configuration changes
- Compliance & security auditing

## 💡 Best Practices

### For Admins:
- ✅ **Monitor log channel regularly**
- ✅ **Use INFO level for production** (default)
- ✅ **Switch to DEBUG only when debugging**
- ✅ **Review error logs immediately**
- ✅ **Archive logs periodically** (Discord has message limits)
- ⚠️ **Don't spam !logtest** (rate limits)

### For Developers:
- ✅ **Log all errors with context**
- ✅ **Use appropriate log levels**
- ✅ **Include relevant details** (user, server, etc.)
- ✅ **Don't log sensitive data** (passwords, keys)
- ✅ **Keep messages concise** (Discord 2000 char limit)

## 🎯 Examples

### Example 1: View Current Log Level
```
User: !loglevel
Bot: 📊 Log level hiện tại: INFO
     Các level khả dụng: error, warn, info, debug
     Sử dụng: !loglevel <level>
```

### Example 2: Change Log Level
```
User: !loglevel debug
Bot: ✅ Đã đổi log level thành: DEBUG
     ⚪ Priority: 1

[Log Channel]:
🔵 INFO - ⚙️ System
Log level changed to DEBUG
👤 User: Admin#1234 (123456789)
🏠 Server: My Server (987654321)
```

### Example 3: View Stats
```
User: !logstats
Bot: [Embed]
     📊 Logging System Statistics
     
     📈 Current Log Level: INFO
     📝 Queue Length: 3 logs
     ⚙️ Processing: ✅ Active
     📢 Log Channel: #bot-logs
     🏠 Log Server: 1332505823435558973
     📚 Available Levels:
         ERROR (🔴)
         WARN (🟠)
         INFO (🔵)
         DEBUG (⚪)
```

### Example 4: Security Event
```
[User triggers blacklist]

[Log Channel]:
🟠 WARN - 🔒 Security
🔒 Blocked 18+ Content

👤 User: BadUser#6969 (111222333)
🏠 Server: Example Server (444555666)
📢 Channel: #general (777888999)
ℹ️ Additional Info:
   Keyword: "blocked_word"
   Message: "inappropriate message here..."
```

### Example 5: Error Log
```
[Error occurs in bot]

[Log Channel]:
🔴 ERROR - ❌ Error
Message processing error

👤 User: User#1234 (123456789)
🏠 Server: Test Server (987654321)
📢 Channel: #bot-commands (555666777)
🐛 Error Details: Cannot read property 'id' of undefined
📋 Stack Trace: TypeError: Cannot read property...
   at async messageCreate (/index.js:650)
   ...
ℹ️ Additional Info: Message: "lena test command..."
```

## ⚠️ Limitations

- ❌ **Discord Rate Limits**: Max 5 requests/second per channel
  - Solution: Queue system với 1 log/second
- ❌ **Message Length**: Max 2000 characters
  - Solution: Truncate long messages
- ❌ **Embed Limits**: Max 6000 characters total
  - Solution: Truncate fields, split if needed
- ❌ **Channel Access**: Bot cần permissions
  - Solution: Check permissions before initializing

## 🔒 Privacy & Security

- ✅ **No Sensitive Data**: API keys, passwords never logged
- ✅ **User Privacy**: Only log necessary user info (ID, tag)
- ✅ **Message Preview**: Truncated to 100 chars max
- ✅ **Secure Channel**: Only admins should access log channel
- ✅ **GDPR Compliant**: User data minimal & purposeful

## 🌟 Ưu điểm

✨ **Centralized Logging** - Tất cả logs từ mọi server về 1 nơi
📊 **Professional Format** - Embeds đẹp, dễ đọc
🔍 **Easy Debugging** - Full context, stack traces
🔒 **Security Monitoring** - Track blacklist triggers
⚙️ **Configurable** - Flexible log levels
🚀 **Scalable** - Queue system, rate limit handling
💡 **Actionable** - Clear, useful information

---

**Theo dõi bot hiệu quả với Professional Logging System! 📊✨**

Made with 💕 by Thanh Tín
