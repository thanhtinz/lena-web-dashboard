# Lena Bot Web Platform

Professional web dashboard for Lena Discord Bot with user dashboard and admin panel.

## 🚀 Features

### Landing Page
- Hero section with bot statistics
- Feature showcase
- Dynamic pricing plans (from database)
- FAQ and documentation
- Discord OAuth2 login

### User Dashboard
- Server management (Discord OAuth2)
- Bot configuration per server
  - General settings (prefix, personality mode)
  - Giveaway manager
  - Embed builder
  - Custom responses
  - Auto-messages setup
- Analytics and usage stats
- Subscription management

### Admin Panel
- System overview dashboard
- **Feature Flags Manager**
  - Enable/disable features globally
  - Gradual rollout (0-100%)
  - Target audience filtering
  - Scheduled enable/disable
- **Bot Instance Manager**
  - Multi-bot support
  - Create custom bot clones
  - White-label options
  - Resource monitoring
- **Dynamic Pricing Plans**
  - Create/edit/delete plans via UI
  - Set features per plan
  - Dual pricing (USD/VND)
  - Visibility controls
- **User & Subscription Management**
- **Analytics Dashboard**
- **Admin Activity Logs**

## 🛠️ Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS + shadcn/ui
- **Authentication:** NextAuth.js (Discord OAuth2)
- **Database:** PostgreSQL (Drizzle ORM)
- **Payments:** PayPal + PayOS (Vietnam)
- **Real-time:** Socket.io (planned)

## 📁 Project Structure

```
web/
├── app/
│   ├── (public)/          # Landing page
│   ├── (dashboard)/       # User dashboard
│   ├── (admin)/          # Admin panel
│   └── api/              # API routes
├── components/
│   ├── ui/               # shadcn/ui components
│   ├── landing/          # Landing page components
│   ├── dashboard/        # Dashboard components
│   └── admin/            # Admin components
├── lib/
│   ├── auth.ts           # NextAuth configuration
│   ├── db.ts             # Database client
│   └── schema.ts         # Database schema
└── types/                # TypeScript types
```

## 🗄️ Database Schema

### Core Tables
- `pricing_plans` - Admin-created pricing plans
- `subscriptions` - User subscriptions
- `feature_flags` - Feature toggles
- `bot_instances` - Multi-bot management
- `bot_features` - Feature assignments per bot
- `admin_logs` - Admin activity tracking
- `transactions` - Payment history

## 🔐 Environment Variables

```bash
# Database
DATABASE_URL=postgresql://...

# Discord OAuth
DISCORD_CLIENT_ID=your_client_id
DISCORD_CLIENT_SECRET=your_client_secret

# NextAuth
NEXTAUTH_URL=http://localhost:5000
NEXTAUTH_SECRET=your_secret

# Admin Users
ADMIN_USER_IDS=discord_user_id_1,discord_user_id_2

# Payment - PayPal
PAYPAL_CLIENT_ID=
PAYPAL_CLIENT_SECRET=
PAYPAL_MODE=sandbox

# Payment - PayOS VN
PAYOS_CLIENT_ID=
PAYOS_API_KEY=
PAYOS_CHECKSUM_KEY=
```

## 🚀 Getting Started

1. Install dependencies:
```bash
npm install
```

2. Setup environment variables:
```bash
cp .env.example .env
# Fill in your values
```

3. Push database schema:
```bash
npm run db:push
```

4. Run development server:
```bash
npm run dev
```

5. Open [http://localhost:5000](http://localhost:5000)

## 📝 Development

### Adding New Feature Flags
1. Go to Admin Panel → Feature Flags
2. Click "Create Feature Flag"
3. Configure name, key, rollout, filters
4. Enable/disable instantly

### Creating Pricing Plans
1. Go to Admin Panel → Pricing Plans
2. Click "Create New Plan"
3. Set prices (USD & VND), features, limits
4. Plan appears on pricing page automatically

### Multi-Bot Management
1. Go to Admin Panel → Bot Instances
2. Click "Create Bot Instance"
3. Configure bot settings, resources
4. Assign features to specific bots

## 🔄 Deployment

### Vercel (Recommended)
```bash
npm run build
vercel deploy
```

### Replit Deployments
- Configure deployment in Replit
- Bot runs on separate Replit instance
- Shared PostgreSQL database

## 📊 Admin Features

### Feature Flags Control
- **Global Toggle:** Enable/disable features system-wide
- **Gradual Rollout:** A/B testing with percentage control
- **Filters:** Target by subscription, server size, region
- **Scheduling:** Auto enable/disable at specific times

### Bot Instance Management
- **Clone Bots:** Create custom bot instances
- **White-label:** Custom name, avatar, branding
- **Resource Limits:** RAM, CPU, server count per bot
- **Independent Config:** Each bot has separate settings

## 🎯 Roadmap

- [ ] Complete payment integration (PayPal + PayOS)
- [ ] Real-time updates with Socket.io
- [ ] Advanced analytics charts
- [ ] Email notifications
- [ ] Mobile responsive improvements
- [ ] API documentation
- [ ] Webhook system for integrations
