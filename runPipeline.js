import 'dotenv/config';
import { scrapeGoogleTrends } from './scraper.js';
import { generateArticle } from './generateArticle.js';
import { isTopicCovered, markTopicAsCovered } from './topicCache.js';

async function runPipeline() {
  try {
    console.log('🔍 Fetching trending topics...');
    const trends = await scrapeGoogleTrends();
    
    console.log('📊 Found trending topics:', trends.map(t => t.title).join(', '));
    
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
      } catch (error) {
        console.error(`❌ Error generating article for ${trend.title}:`, error.message);
        continue;
      }
    }
    
    console.log('\n🎉 Pipeline completed successfully!');
  } catch (error) {
    console.error('❌ Pipeline error:', error.message);
    process.exit(1);
  }
}

runPipeline(); 