import 'dotenv/config';
import cron from 'node-cron';
import { scrapeGoogleTrends } from './scraper.js';
import { generateArticle } from './generateArticle.js';
import { isTopicCovered, markTopicAsCovered } from './topicCache.js';

// Function to run the pipeline
async function runPipeline() {
  try {
    console.log('\n🕒 Starting scheduled article generation at:', new Date().toLocaleString());
    
    console.log('🔍 Fetching trending topics...');
    const trends = await scrapeGoogleTrends();
    
    console.log('📊 Found trending topics:', trends.map(t => t.title).join(', '));
    
    let newArticlesCount = 0;
    for (const trend of trends) {
      try {
        // Check if we've already covered this topic recently
        if (await isTopicCovered(trend.title)) {
          console.log(`⏭️ Skipping "${trend.title}" - already covered recently`);
          continue;
        }

        console.log(`\n📝 Generating article for: ${trend.title}`);
        console.log(`Search volume: ${trend.searchVolume}`);
        
        const article = await generateArticle(trend.title, trend.searchVolume);
        console.log('✅ Article generated and saved successfully!');
        console.log('Title:', article.title);
        console.log('Keywords:', article.keywords.join(', '));

        // Mark topic as covered
        await markTopicAsCovered(trend.title);
        newArticlesCount++;
      } catch (error) {
        console.error(`❌ Error generating article for ${trend.title}:`, error.message);
        continue;
      }
    }
    
    console.log(`\n🎉 Pipeline completed successfully! Generated ${newArticlesCount} new articles.`);
  } catch (error) {
    console.error('❌ Pipeline error:', error.message);
  }
}

// Schedule the job to run every 15 minutes
console.log('📅 Starting automatic article generation service...');
console.log('⏰ Articles will be generated every 15 minutes');
console.log('🗑️ Topics will be remembered for 7 days to prevent duplicates');

cron.schedule('*/15 * * * *', runPipeline);

// Run once immediately on startup
runPipeline(); 