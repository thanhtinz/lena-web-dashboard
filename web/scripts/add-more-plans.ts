import { db } from '../lib/db';
import { pricingPlans } from '../lib/schema';

const additionalPlans = [
  {
    name: 'Student',
    slug: 'student',
    icon: '🎓',
    badge: 'HOC SINH - SINH VIÊN',
    description: 'Gói ưu đãi dành riêng cho học sinh, sinh viên',
    priceUsd: 1,
    priceVnd: 29000,
    billingCycle: 'monthly',
    trialDays: 14,
    features: [
      'Tất cả tính năng Free',
      'Tutor Mode - hỗ trợ học tập',
      'Code Assistant cơ bản',
      '30 Custom Commands',
      '5 Giveaways/tháng',
      'Ưu tiên hỗ trợ'
    ],
    limits: {
      maxServers: 2,
      maxCustomBots: 0,
      maxGiveawaysPerMonth: 5,
      maxCustomCommands: 30,
      maxCustomResponses: 30,
      maxEmbeds: 15,
      storageMb: 50,
      dailyApiCalls: 500,
    },
    allowedCommands: [
      'help', 'ping', 'status', 'avatar', 'banner', 
      'serverinfo', 'bot', 'roll', 'flip', 'trivia',
      'truth', 'dare', 'rps', '8ball', 'gif', 'pokemon', 
      'itunes', 'analyze', 'poll', 'giveaway', 'embed', 'response'
    ],
    allowedFeatures: [
      'ai_chat', 'tutor_mode', 'code_assistant', 'web_search',
      'news', 'vietnamese_games', 'giveaways', 
      'custom_embeds', 'auto_responses'
    ],
    restrictions: {
      canUseAI: true,
      canUseGames: true,
      canUseModeration: false,
      canUseGiveaways: true,
      canUseCustomBots: false,
      canUseWebSearch: true,
      canUseImageAnalysis: true,
    },
    isVisible: true,
    isActive: true,
    targetRegion: 'vietnam',
  },
  {
    name: 'Creator',
    slug: 'creator',
    icon: '🎨',
    badge: 'CONTENT CREATOR',
    description: 'Dành cho các nhà sáng tạo nội dung và streamer',
    priceUsd: 7,
    priceVnd: 149000,
    billingCycle: 'monthly',
    trialDays: 7,
    features: [
      'Tất cả tính năng Pro',
      '5 Custom Bots',
      'Giveaway không giới hạn',
      'Custom Embeds không giới hạn',
      'Moderation Tools',
      'Analytics Dashboard',
      'Priority Support 24/7'
    ],
    limits: {
      maxServers: null,
      maxCustomBots: 5,
      maxGiveawaysPerMonth: null,
      maxCustomCommands: null,
      maxCustomResponses: null,
      maxEmbeds: null,
      storageMb: 1000,
      dailyApiCalls: 10000,
    },
    allowedCommands: ['*'],
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
    name: 'Lifetime',
    slug: 'lifetime',
    icon: '💎',
    badge: 'TRỌN ĐỜI',
    description: 'Trả 1 lần, sử dụng mãi mãi - không cần gia hạn',
    priceUsd: 49,
    priceVnd: 999000,
    billingCycle: 'lifetime',
    trialDays: 0,
    features: [
      'Tất cả tính năng Pro',
      '3 Custom Bots',
      'Giveaway không giới hạn',
      'Commands không giới hạn',
      'Sử dụng trọn đời',
      'Priority Support',
      'Early Access tính năng mới'
    ],
    limits: {
      maxServers: null,
      maxCustomBots: 3,
      maxGiveawaysPerMonth: null,
      maxCustomCommands: null,
      maxCustomResponses: null,
      maxEmbeds: null,
      storageMb: 1000,
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
  {
    name: 'VIP',
    slug: 'vip',
    icon: '👑',
    badge: 'VIP - ƯU TIÊN',
    description: 'Gói cao cấp nhất với đầy đủ tính năng và hỗ trợ VIP',
    priceUsd: 15,
    priceVnd: 299000,
    billingCycle: 'monthly',
    trialDays: 30,
    features: [
      'Tất cả tính năng Business',
      '15 Custom Bots',
      'Tất cả tính năng không giới hạn',
      'API Access - tích hợp custom',
      'Dedicated Support Team',
      'Custom Feature Development',
      'SLA 99.9% uptime',
      'Early Access & Beta Features'
    ],
    limits: {
      maxServers: null,
      maxCustomBots: 15,
      maxGiveawaysPerMonth: null,
      maxCustomCommands: null,
      maxCustomResponses: null,
      maxEmbeds: null,
      storageMb: 5000,
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
  {
    name: 'Team',
    slug: 'team',
    icon: '👥',
    badge: 'NHÓM',
    description: 'Dành cho team/cộng đồng nhỏ, chia sẻ nhiều server',
    priceUsd: 4,
    priceVnd: 79000,
    billingCycle: 'monthly',
    trialDays: 10,
    features: [
      'Tất cả tính năng Basic',
      '2 Custom Bots',
      'Đa server: 10 servers',
      '100 Custom Commands',
      '20 Giveaways/tháng',
      'Team Management',
      'Shared Resources'
    ],
    limits: {
      maxServers: 10,
      maxCustomBots: 2,
      maxGiveawaysPerMonth: 20,
      maxCustomCommands: 100,
      maxCustomResponses: 100,
      maxEmbeds: 50,
      storageMb: 300,
      dailyApiCalls: 2000,
    },
    allowedCommands: [
      'help', 'ping', 'status', 'avatar', 'banner', 
      'serverinfo', 'bot', 'roll', 'flip', 'trivia',
      'truth', 'dare', 'rps', '8ball', 'gif', 'pokemon', 
      'itunes', 'analyze', 'randomgif', 'poll', 'whois',
      'giveaway', 'confession', 'embed', 'response', 'purge'
    ],
    allowedFeatures: [
      'ai_chat', 'web_search', 'news', 'vietnamese_games',
      'image_analysis', 'giveaways', 'confession_system',
      'custom_embeds', 'auto_responses', 'moderation'
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
];

async function addMorePlans() {
  try {
    console.log('🌱 Adding more pricing plans...');
    
    await db.insert(pricingPlans).values(additionalPlans as any);
    
    console.log('✨ Successfully added 5 more plans!');
    console.log('   🎓 Student - 29,000đ/tháng');
    console.log('   🎨 Creator - 149,000đ/tháng');
    console.log('   💎 Lifetime - 999,000đ (trọn đời)');
    console.log('   👑 VIP - 299,000đ/tháng');
    console.log('   👥 Team - 79,000đ/tháng');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error adding plans:', error);
    process.exit(1);
  }
}

addMorePlans();
