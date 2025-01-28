import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CACHE_FILE = path.join(__dirname, '../data/topic-cache.json');
const CACHE_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

class TopicCache {
    constructor() {
        this.cache = new Map();
        this.loaded = false;
    }

    async load() {
        try {
            const data = await fs.readFile(CACHE_FILE, 'utf-8');
            const entries = JSON.parse(data);
            
            // Convert stored entries back to Map
            this.cache = new Map(
                entries.map(([topic, timestamp]) => [
                    topic.toLowerCase(),
                    timestamp
                ])
            );
            
            this.loaded = true;
            
            // Clean old entries
            await this.cleanup();
        } catch (error) {
            if (error.code !== 'ENOENT') {
                console.error('Error loading topic cache:', error);
            }
            this.cache = new Map();
            this.loaded = true;
        }
    }

    async save() {
        try {
            await fs.mkdir(path.dirname(CACHE_FILE), { recursive: true });
            const entries = Array.from(this.cache.entries());
            await fs.writeFile(CACHE_FILE, JSON.stringify(entries, null, 2));
        } catch (error) {
            console.error('Error saving topic cache:', error);
        }
    }

    async cleanup() {
        const now = Date.now();
        let changed = false;

        for (const [topic, timestamp] of this.cache.entries()) {
            if (now - timestamp > CACHE_DURATION) {
                this.cache.delete(topic);
                changed = true;
            }
        }

        if (changed) {
            await this.save();
        }
    }

    async isProcessed(topic) {
        if (!this.loaded) {
            await this.load();
        }
        return this.cache.has(topic.toLowerCase());
    }

    async markProcessed(topic) {
        if (!this.loaded) {
            await this.load();
        }
        this.cache.set(topic.toLowerCase(), Date.now());
        await this.save();
    }

    async getProcessedTopics() {
        if (!this.loaded) {
            await this.load();
        }
        return Array.from(this.cache.entries()).map(([topic, timestamp]) => ({
            topic,
            processedAt: new Date(timestamp).toISOString()
        }));
    }
}

// Create and export the singleton instance
const topicCache = new TopicCache();
export { topicCache }; 