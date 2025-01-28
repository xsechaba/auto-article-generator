import { getTrendingTopics } from './scraper.js';
import { generateArticle } from './generateArticle.js';
import { publishArticle } from './publish.js';

async function runPipeline() {
    try {
        // Step 1: Get trending topics
        console.log('\n🔍 Fetching trending topics...');
        const topics = await getTrendingTopics();
        console.log(`Found ${topics.length} new trending topics`);

        // Process each topic
        for (const topic of topics) {
            try {
                console.log(`\n📝 Processing topic: ${topic.title}`);
                
                // Step 2: Generate article
                console.log('Generating article...');
                const article = await generateArticle(topic);
                console.log('Article generated successfully');

                // Step 3: Publish article
                console.log('Publishing article...');
                const result = await publishArticle(article);
                console.log(`✅ Article published successfully: ${result.url}`);

            } catch (error) {
                console.error(`❌ Error processing topic "${topic.title}":`, error.message);
                // Continue with next topic
                continue;
            }
        }

        console.log('\n✨ Pipeline completed successfully!');
    } catch (error) {
        console.error('\n❌ Pipeline failed:', error.message);
        process.exit(1);
    }
}

// Run the pipeline
console.log('🚀 Starting content generation pipeline...');
runPipeline(); 