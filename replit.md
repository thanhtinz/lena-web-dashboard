### Overview
Lena is a versatile Discord AI bot designed to enhance server interactions with a multi-personality AI. Its core purpose is to provide a comprehensive AI assistant offering educational support, entertainment, and utility features. Key capabilities include a professional tutor system, code assistance, web search with citations, content filtering, and real-time news and game information. The project aims to provide a natural and engaging AI presence across multiple Discord servers, embodying a cute, slightly shy, and knowledgeable persona, with a business vision to offer a comprehensive AI assistant platform with multi-language support.

### User Preferences
- **Ngôn ngữ**: Hỗ trợ đa ngôn ngữ (Tiếng Việt & English)
- **Phong cách**: Ưu tiên tính tự nhiên và dễ thương trong giao tiếp
- **UI/UX**: Sử dụng FontAwesome icons only (không dùng emoji icons), button size vừa phải (px-4 py-2 cho main buttons)

### System Architecture

#### UI/UX Decisions
The bot's persona, Lena, is a a cute, slightly shy, and timid 19-year-old "Học bá" (academic ace), using cute emojis and gentle speech. Bot status messages rotate with 10 cute statuses every 5 minutes, integrating custom Lena emojis. Giveaway embeds feature custom design with Lena-themed bullets and real-time participant counts. Auto-messages UI is redesigned for improved user experience, matching a Mimu-bot style layout. The web platform features a dark theme with slate-900/black background and a dark blue primary color, utilizing Font Awesome icons and clean, modern sans-serif typography. All config pages are mobile-responsive with buttons showing icons only on mobile and full text on desktop.

#### Technical Implementations
The bot is built with Node.js and Discord.js (v14+). Conversation history is tracked per channel (max 41 messages / 20 exchanges) and persisted to a PostgreSQL database for 7 days. The bot responds to mentions, the keyword "lena", or messages in configured allowed channels.

**Core Features:**
- **Multi-Language System**: Full i18n support for Vietnamese and English across bot and web platform, with per-server language configuration.
- **Personality System**: Six distinct, switchable AI personalities.
- **Multi-server Support & Custom Prefix**: Independent configurations per server with customizable prefix and command aliases.
- **Admin Command System**: For configuration, keyword management, blacklist, training, and language settings.
- **Automated Responses**: Auto-reaction emojis, custom keyword-triggered responses, and a comprehensive auto-message system.
- **Educational System**: Professional tutor for grades 1-university across 10+ subjects.
- **Code Assistant**: Provides debugging, coding, learning, and review assistance.
- **Entertainment & Games**: Interactive games, Vietnamese knowledge games, and poll system.
- **Utility Commands**: Ping, AFK system, avatar/banner viewer, server/bot info, customizable dice roller.
- **Content Moderation**: Comprehensive moderation system with commands for banning, muting, kicking, warnings, channel control (lock, unlock, slowmode), message management (purge, nuke), and individual command enable/disable via web dashboard. Includes configurable DM notifications, Discord timeout integration, role-based permissions, and granular event logging.
- **Auto-Ban System**: Automatic member ban on join based on configurable rules: no custom avatar, account age check, username pattern matching (regex), and Discord invite links in username. Full web dashboard configuration with rule management.
- **Confession System**: Anonymous confession system with optional admin approval and web logging.
- **Giveaway System**: Complete management with dual command support (prefix and slash commands).
- **Custom Embed System**: Full CRUD operations for embeds.
- **Custom Response System**: Database-driven auto-responses with priority ordering.
- **Custom Commands System (Premium)**: Server-specific custom commands with advanced features.
- **Dynamic Information Retrieval**: Web search with citations, video & music search, real-time news, game information, and a knowledge base.
- **Professional Logging System**: Centralized, categorized, and rate-limited logging to a Discord channel.
- **Sharding & Clustering System**: Implemented sharding infrastructure with metrics collection and auto-reporting.
- **Bot Control Interface**: Admin panel includes bot control with stop, restart, and real-time status monitoring.
- **Premium System**: Comprehensive subscription system with server-level premium checker utilities and feature gating.
- **Role Management System**: Includes Auto Roles, Temp Roles, Timed Roles, and Reaction Roles.
- **Sticky Messages System**: Bot commands and a web dashboard for configuring message-based and time-based sticky messages.
- **Commands Auto-Sync System**: Bot automatically syncs all commands to database on startup. Web commands page (`/commands`) and help system read from centralized database for automatic updates. Multi-language support (Vietnamese/English) with API route `/api/commands` for fetching command data.

#### System Design Choices
The project is modularized with directories for `personalities/`, `config/`, `commands/`, `database/`, `games/`, `utils/`, and `data/`.

**Database Integration:**
Complete bot-database-website integration using PostgreSQL and Drizzle ORM. Data flow ensures bot writes conversations, giveaways, custom responses, while the website reads live stats and 7-day activity data. Schemas are synchronized, and database indexes are added for query performance. Conversation history is tracked and cleaned up after 7 days.

**Web Platform (Next.js 14, TypeScript, Tailwind CSS):**
A professional web dashboard provides:
- **Landing Page**: Displays real-time server count, stats, pricing plans, and feature display.
- **Status Page**: Real-time bot monitoring dashboard with cluster/shard information and live metrics.
- **User Dashboard**: Discord OAuth2 authentication, server management, bot configuration, custom auto-responses, giveaway manager, embed builder, and server analytics.
- **Admin Panel**: Secured with JWT authentication, provides system overview, bot control, feature flags, instance manager, pricing plans, user & subscription management, support tickets, analytics, activity logs, database management, blog, and system settings.
- **Custom Bot Provisioning (Premium)**: Full-featured custom bot instance creation with encrypted token storage.
- **Documentation System**: GitBook-style professional documentation with categories and admin CRUD.

### External Dependencies
- **Discord.js**: Discord API interaction.
- **OpenAI**: AI model (`GPT-4o-mini`) via Replit AI Integrations.
- **PostgreSQL**: Database for persistent storage.
- **Tenor API**: GIF search.
- **Google Custom Search API**: Primary web search.
- **DuckDuckGo API**: Fallback web search.
- **YouTube Data API v3**: Video search.
- **GPT-4o Vision**: For image analysis.
- **jsonwebtoken**: For session signing/verification (web platform).
- **Drizzle ORM**: Used with PostgreSQL (web platform).
- **PayPal & PayOS (Vietnam)**: Planned payment integration (web platform).
- **Top.gg API**: Bot list stats posting and vote tracking.