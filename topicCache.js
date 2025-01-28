import fs from 'fs/promises';
import path from 'path';

const CACHE_FILE = 'data/topic-cache.json';
const CACHE_DURATION_DAYS = 7; // How long to remember topics

export async function loadTopicCache() {
  try {
    const cacheDir = path.dirname(CACHE_FILE);
    await fs.mkdir(cacheDir, { recursive: true });

    try {
      const data = await fs.readFile(CACHE_FILE, 'utf8');
      const cache = JSON.parse(data);
      
      // Clean up old entries
      const now = Date.now();
      const cleanedCache = Object.fromEntries(
        Object.entries(cache).filter(([_, timestamp]) => {
          const age = now - timestamp;
          return age < CACHE_DURATION_DAYS * 24 * 60 * 60 * 1000;
        })
      );

      return cleanedCache;
    } catch (error) {
      // If file doesn't exist or is invalid, start with empty cache
      return {};
    }
  } catch (error) {
    console.error('Error loading topic cache:', error);
    return {};
  }
}

export async function saveTopicCache(cache) {
  try {
    await fs.writeFile(CACHE_FILE, JSON.stringify(cache, null, 2));
  } catch (error) {
    console.error('Error saving topic cache:', error);
  }
}

export async function isTopicCovered(topic) {
  const cache = await loadTopicCache();
  return !!cache[topic.toLowerCase()];
}

export async function markTopicAsCovered(topic) {
  const cache = await loadTopicCache();
  cache[topic.toLowerCase()] = Date.now();
  await saveTopicCache(cache);
} 