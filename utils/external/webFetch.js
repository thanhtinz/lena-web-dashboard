// Web Fetch utility - wrapper for fetching web content
// This is a simple wrapper that can be used by other modules

async function web_fetch(url) {
  try {
    const fetch = (await import('node-fetch')).default;
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      },
      timeout: 10000
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const text = await response.text();
    return text;
  } catch (error) {
    console.error('❌ Web fetch error:', error.message);
    throw error;
  }
}

module.exports = { web_fetch };
