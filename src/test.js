import { spawn } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

// Test the Python trends service
async function testTrends() {
    return new Promise((resolve, reject) => {
        const pythonProcess = spawn('python', ['src/trends_service.py']);
        let data = '';

        pythonProcess.stdout.on('data', (chunk) => {
            data += chunk;
        });

        pythonProcess.stderr.on('data', (data) => {
            console.error('Python Error:', data.toString());
        });

        pythonProcess.on('close', (code) => {
            if (code !== 0) {
                reject(new Error(`Python process exited with code ${code}`));
                return;
            }
            try {
                const topics = JSON.parse(data);
                console.log('Successfully fetched topics:', topics);
                resolve(topics);
            } catch (error) {
                reject(error);
            }
        });
    });
}

// Test Pexels image fetching
async function testImageFetching(topic) {
    try {
        const response = await axios.get(`https://api.pexels.com/v1/search`, {
            params: {
                query: topic,
                per_page: 1
            },
            headers: {
                Authorization: process.env.PEXELS_API_KEY
            }
        });

        if (response.data.photos.length > 0) {
            const photo = response.data.photos[0];
            return {
                url: photo.src.large,
                alt: `${topic} - ${photo.alt || 'Featured image'}`,
                width: photo.width,
                height: photo.height,
                photographer: photo.photographer,
                photographerUrl: photo.photographer_url
            };
        }
        return null;
    } catch (error) {
        console.error('Error fetching image:', error.message);
        return null;
    }
}

// Create a sample article JSON
async function createSampleArticle(topic, image) {
    const article = {
        id: `test-${Date.now()}`,
        title: `Test Article: ${topic}`,
        excerpt: `This is a test article about ${topic}.`,
        content: `<h2>Introduction</h2>
                 <p>This is a test article about ${topic}. The content is generated for testing purposes.</p>
                 <h2>Key Points</h2>
                 <ul>
                    <li>Test point 1</li>
                    <li>Test point 2</li>
                    <li>Test point 3</li>
                 </ul>`,
        timestamp: new Date().toISOString(),
        keywords: [topic, 'test', 'sample'],
        searchVolume: '100,000+',
        featuredImage: image
    };

    const articlesDir = path.join(process.cwd(), 'data/articles');
    await fs.mkdir(articlesDir, { recursive: true });
    await fs.writeFile(
        path.join(articlesDir, `${article.id}.json`),
        JSON.stringify(article, null, 2)
    );

    return article;
}

// Run all tests
async function runTests() {
    try {
        console.log('Testing Google Trends...');
        const result = await testTrends();
        const topics = result.trends;
        
        if (topics && topics.length > 0) {
            console.log('Testing image fetching...');
            const image = await testImageFetching(topics[0].title);
            
            console.log('Creating sample article...');
            const article = await createSampleArticle(topics[0].title, image);
            
            console.log('Test completed successfully!');
            console.log('Sample article created:', article);
        }
    } catch (error) {
        console.error('Test failed:', error);
    }
}

// Run the tests
runTests(); 