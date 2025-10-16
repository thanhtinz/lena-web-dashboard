import { db } from '../lib/db';
import { pricingPlans } from '../lib/schema';

const seedPlans = [
  {
    name: 'Free',
    slug: 'free',
    icon: '🌸',
    badge: '',
    description: 'Gói miễn phí với tính năng cơ bản',
    priceUsd: 0,
    priceVnd: 0,
    billingCycle: 'monthly',
    trialDays: 0,
    features: [
      'AI Chat cơ bản',
      'Web Search',
      'Vietnamese Games',
      'News & Info',
      '15 lệnh cơ bản'
    ],
    limits: {
      maxServers: null,
      maxCustomBots: 0,
      maxGiveawaysPerMonth: 2,
      maxCustomCommands: 0,
      maxCustomResponses: 5,
      maxEmbeds: 3,
      storageMb: 0,
      dailyApiCalls: 100,
    },
    allowedCommands: [
      'help', 'ping', 'status', 'avatar', 'banner', 
      'serverinfo', 'bot', 'roll', 'flip', 'trivia',
      'truth', 'dare', 'rps', '8ball', 'gif', 'pokemon', 'itunes'
    ],
    allowedFeatures: [
      'ai_chat', 'web_search', 'news', 'vietnamese_games'
    ],
    restrictions: {
      canUseAI: true,
      canUseGames: true,
      canUseModeration: false,
      canUseGiveaways: true,
      canUseCustomBots: false,
      canUseWebSearch: true,
      canUseImageAnalysis: false,
    },
    isVisible: true,
    isActive: true,
    targetRegion: 'all',
  },
  {
    name: 'Basic',
    slug: 'basic',
    icon: '⭐',
    badge: 'PHỔ BIẾN',
    description: 'Gói cơ bản cho server nhỏ',
    priceUsd: 2,
    priceVnd: 49000,
    billingCycle: 'monthly',
    trialDays: 7,
    features: [
      'Tất cả tính năng Free',
      '1 Custom Bot',
      '50 Custom Commands',
      '10 Giveaways/tháng',
      'Image Analysis',
      'Priority Support'
    ],
    limits: {
      maxServers: 3,
      maxCustomBots: 1,
      maxGiveawaysPerMonth: 10,
      maxCustomCommands: 50,
      maxCustomResponses: 50,
      maxEmbeds: 20,
      storageMb: 100,
      dailyApiCalls: 1000,
    },
    allowedCommands: [
      'help', 'ping', 'status', 'avatar', 'banner', 
      'serverinfo', 'bot', 'roll', 'flip', 'trivia',
      'truth', 'dare', 'rps', '8ball', 'gif', 'pokemon', 
      'itunes', 'analyze', 'randomgif', 'poll', 'whois',
      'giveaway', 'confession', 'embed', 'response'
    ],
    allowedFeatures: [
      'ai_chat', 'web_search', 'news', 'vietnamese_games',
      'image_analysis', 'giveaways', 'confession_system',
      'custom_embeds', 'auto_responses'
    ],
    restrictions: {
      canUseAI: true,
      canUseGames: true,
      canUseModeration: false,
      canUseGiveaways: true,
      canUseCustomBots: true,
      canUseWebSearch: true,
      canUseImageAnalysis: true,
    },
    isVisible: true,
    isActive: true,
    targetRegion: 'all',
  },
  {
    name: 'Pro',
    slug: 'pro',
    icon: '🚀',
    badge: 'TỐT NHẤT',
    description: 'Gói chuyên nghiệp cho server lớn',
    priceUsd: 5,
    priceVnd: 99000,
    billingCycle: 'monthly',
    trialDays: 14,
    features: [
      'Tất cả tính năng Basic',
      '3 Custom Bots',
      '200 Custom Commands',
      'Giveaways không giới hạn',
      'Moderation Tools',
      'Tutor Mode',
      'Code Assistant'
    ],
    limits: {
      maxServers: null,
      maxCustomBots: 3,
      maxGiveawaysPerMonth: null,
      maxCustomCommands: 200,
      maxCustomResponses: 200,
      maxEmbeds: 100,
      storageMb: 500,
      dailyApiCalls: 5000,
    },
    allowedCommands: [
      '*'
    ],
    allowedFeatures: [
      'ai_chat', 'tutor_mode', 'code_assistant', 'web_search',
      'image_analysis', 'news', 'video_search', 'game_info',
      'vietnamese_games', 'action_commands', 'giveaways',
      'confession_system', 'custom_embeds', 'auto_responses',
      'moderation', 'logging'
    ],
    restrictions: {
      canUseAI: true,
      canUseGames: true,
      canUseModeration: true,
      canUseGiveaways: true,
      canUseCustomBots: true,
      canUseWebSearch: true,
      canUseImageAnalysis: true,
    },
    isVisible: true,
    isActive: true,
    targetRegion: 'all',
  },
  {
    name: 'Business',
    slug: 'business',
    icon: '💼',
    badge: 'DOANH NGHIỆP',
    description: 'Gói cao cấp cho tổ chức lớn',
    priceUsd: 10,
    priceVnd: 199000,
    billingCycle: 'monthly',
    trialDays: 30,
    features: [
      'Tất cả tính năng Pro',
      '10 Custom Bots',
      'Commands không giới hạn',
      'API Access',
      'Custom Integrations',
      'Dedicated Support',
      'SLA 99.9%'
    ],
    limits: {
      maxServers: null,
      maxCustomBots: 10,
      maxGiveawaysPerMonth: null,
      maxCustomCommands: null,
      maxCustomResponses: null,
      maxEmbeds: null,
      storageMb: 2000,
      dailyApiCalls: null,
    },
    allowedCommands: ['*'],
    allowedFeatures: ['*'],
    restrictions: {
      canUseAI: true,
      canUseGames: true,
      canUseModeration: true,
      canUseGiveaways: true,
      canUseCustomBots: true,
      canUseWebSearch: true,
      canUseImageAnalysis: true,
    },
    isVisible: true,
    isActive: true,
    targetRegion: 'all',
  },
];

async function seedPricingPlans() {
  try {
    console.log('🌱 Seeding pricing plans...');
    
    await db.insert(pricingPlans).values(seedPlans as any);
    
    console.log('✨ Pricing plans seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding pricing plans:', error);
    process.exit(1);
  }
}

seedPricingPlans();
