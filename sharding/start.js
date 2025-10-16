// dotenv not needed in Replit - environment variables are managed via Secrets
const clusterManager = require('./ShardManager');

console.log('🚀 Starting Lena Bot with Sharding...');

clusterManager.start().then(() => {
  console.log('✅ All shards launched successfully!');
}).catch(error => {
  console.error('❌ Failed to start sharding:', error);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('Shutting down gracefully...');
  process.exit(0);
});
