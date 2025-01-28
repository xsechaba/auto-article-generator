import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import { generateArticle } from './generateArticle.js';
import { publishArticle } from './publish.js';
import { topicCache } from './cache.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Command line arguments
const args = process.argv.slice(2);
const DRY_RUN = args.includes('--dry-run');
const FORCE = args.includes('--force');

async function getTrendingTopics() {
    return new Promise((resolve, reject) => {
        const pythonScript = path.join(__dirname, 'trends_service.py');
        const pythonProcess = spawn('python', [pythonScript]);
        
        let dataString = '';
        let errorString = '';

        pythonProcess.stdout.on('data', (data) => {
            dataString += data.toString();
        });

        pythonProcess.stderr.on('data', (data) => {
            errorString += data.toString();
            // Log progress messages to console
            console.log(data.toString());
        });

        pythonProcess.on('close', (code) => {
            if (code !== 0) {
                console.error('Python script error output:', errorString);
                reject(new Error(`Python script exited with code ${code}`));
                return;
            }

            try {
                const result = JSON.parse(dataString);
                if (result.error) {
                    reject(new Error(result.error));
                    return;
                }
                resolve(result.trends);
            } catch (error) {
                console.error('Failed to parse Python script output:', error);
                reject(error);
            }
        });
    });
}

async function runPipeline() {
    try {
        console.log(`Starting pipeline${DRY_RUN ? ' (DRY RUN)' : ''}...`);
        
        // Load topic cache
        await topicCache.load();
        
        console.log('Fetching trending topics...');
        const topics = await getTrendingTopics();
        
        if (!topics || topics.length === 0) {
            throw new Error('No trending topics found');
        }

        console.log(`Found ${topics.length} trending topics`);
        let newTopics = 0;
        
        for (const topic of topics) {
            try {
                // Check if topic has been processed recently
                if (!FORCE && await topicCache.isProcessed(topic.title)) {
                    console.log(`\nSkipping previously processed topic: ${topic.title}`);
                    continue;
                }

                console.log(`\nProcessing topic: ${topic.title} (${topic.searchVolume} searches)`);
                
                if (DRY_RUN) {
                    console.log('DRY RUN: Would generate and publish article');
                    newTopics++;
                    continue;
                }

                const article = await generateArticle(topic.title, topic.searchVolume);
                
                if (article) {
                    console.log('Article generated successfully');
                    await publishArticle(article);
                    console.log('Article published successfully');
                    
                    // Mark topic as processed
                    await topicCache.markProcessed(topic.title);
                    newTopics++;
                }
            } catch (error) {
                console.error(`Failed to process topic "${topic.title}":`, error.message);
                continue;
            }
            
            // Add delay between articles
            if (!DRY_RUN) {
                await new Promise(resolve => setTimeout(resolve, 5000));
            }
        }
        
        console.log('\nPipeline Summary:');
        console.log(`Total topics found: ${topics.length}`);
        console.log(`New topics processed: ${newTopics}`);
        console.log(`Skipped topics: ${topics.length - newTopics}`);
        
        if (DRY_RUN) {
            console.log('\nDRY RUN: No articles were actually generated or published');
        }
        
    } catch (error) {
        console.error('Pipeline failed:', error.message);
        process.exit(1);
    }
}

// Run the pipeline if called directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
    runPipeline();
} 