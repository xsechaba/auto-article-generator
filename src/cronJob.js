import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { getTrendingTopics } from './scraper.js';
import { generateArticle } from './generateArticle.js';
import { publishArticle } from './publish.js';

// Load environment variables
dotenv.config({ path: path.join(path.dirname(fileURLToPath(import.meta.url)), '../.env') });

const SCRAPE_INTERVAL = (parseInt(process.env.SCRAPE_INTERVAL_MINUTES) || 15) * 60 * 1000; // Convert to milliseconds

/**
 * Process a single topic
 */
async function processTopic(topic) {
    try {
        console.log(`Processing topic: ${topic.title}`);
        
        // Generate article
        const article = await generateArticle(topic);
        console.log(`Generated article for: ${topic.title}`);

        // Publish to WordPress
        const result = await publishArticle(article);
        console.log(`Successfully published article: ${result.postUrl}`);

        return result;
    } catch (error) {
        console.error(`Error processing topic "${topic.title}":`, error);
        return null;
    }
}

/**
 * Main function to run the content generation pipeline
 */
async function runContentPipeline() {
    try {
        console.log('Starting content generation pipeline...');

        // Get trending topics
        const topics = await getTrendingTopics();
        console.log(`Found ${topics.length} new trending topics`);

        if (topics.length === 0) {
            console.log('No new topics to process');
            return;
        }

        // Process each topic
        const results = await Promise.all(
            topics.map(topic => processTopic(topic))
        );

        // Filter out failed attempts
        const successfulResults = results.filter(result => result !== null);
        console.log(`Successfully published ${successfulResults.length} articles`);

    } catch (error) {
        console.error('Error in content pipeline:', error);
    }
}

/**
 * Start the scheduled job
 */
function startScheduler() {
    console.log(`Starting scheduler with ${SCRAPE_INTERVAL/60000} minute interval`);
    
    // Run immediately on start
    runContentPipeline();

    // Schedule regular runs
    setInterval(runContentPipeline, SCRAPE_INTERVAL);
}

// Start the scheduler if this is the main module
if (process.argv[1] === fileURLToPath(import.meta.url)) {
    startScheduler();
} 