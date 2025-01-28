import axios from 'axios';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
dotenv.config({ path: path.join(path.dirname(fileURLToPath(import.meta.url)), '../.env') });

// Constants
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

/**
 * Sleep function for delay between retries
 */
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Format the article content with source attribution and metadata
 */
function formatArticleContent(article) {
    const sourceAttribution = `
        <hr>
        <p><small>This article was generated based on trending topics. 
        Original source: <a href="${article.originalUrl}" target="_blank" rel="noopener noreferrer">Read more</a>
        <br>Search volume: ${article.searchVolume}
        <br>Published: ${new Date(article.timestamp).toLocaleString()}
        </small></p>
    `;

    return article.content + sourceAttribution;
}

/**
 * Generate SEO-friendly excerpt
 */
function generateExcerpt(content) {
    // Remove HTML tags and get first 150 characters
    const plainText = content.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    return plainText.substring(0, 150) + '...';
}

/**
 * Extract keywords from context
 */
function extractKeywords(context) {
    if (!context) return [];
    const keywordStr = context.replace('Related terms:', '');
    return keywordStr.split(',').map(k => k.trim()).filter(Boolean);
}

/**
 * Publish an article to the Next.js API with retries
 */
export async function publishArticle(article) {
    let lastError = null;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        try {
            console.log(`Publishing article: "${article.title}" (Attempt ${attempt}/${MAX_RETRIES})`);

            // Extract keywords for metadata
            const keywords = extractKeywords(article.context);

            // Prepare the post data
            const postData = {
                title: article.title,
                content: formatArticleContent(article),
                excerpt: generateExcerpt(article.content),
                searchVolume: article.searchVolume,
                originalUrl: article.originalUrl,
                keywords: keywords,
                timestamp: article.timestamp
            };

            // Post to API
            const response = await axios.post(`${API_URL}/articles`, postData);

            console.log(`Successfully published article: "${article.title}" (ID: ${response.data.id})`);
            
            return {
                success: true,
                articleId: response.data.id,
                url: `/article/${response.data.id}`,
                publishedDate: response.data.timestamp
            };
        } catch (error) {
            lastError = error;
            console.error(`Error on attempt ${attempt}:`, error.response?.data || error.message);

            // Check if we should retry
            if (attempt < MAX_RETRIES && isRetryableError(error)) {
                const delay = RETRY_DELAY * attempt; // Exponential backoff
                console.log(`Retrying in ${delay}ms...`);
                await sleep(delay);
            } else {
                console.error('Max retries reached or non-retryable error. Giving up.');
                throw new Error(`Failed to publish article after ${attempt} attempts: ${lastError.message}`);
            }
        }
    }
}

/**
 * Check if an error is retryable
 */
function isRetryableError(error) {
    // Retry on network errors or 5xx server errors
    return !error.response || (error.response.status >= 500 && error.response.status < 600);
}

// For testing purposes
if (process.argv[1] === fileURLToPath(import.meta.url)) {
    const testArticle = {
        title: "Test Article",
        content: "<h1>Test Headline</h1><p>This is a test article content.</p>",
        originalUrl: "https://example.com",
        searchVolume: "500K+ searches",
        timestamp: new Date().toISOString(),
        context: "Related terms: test, example, demo"
    };

    publishArticle(testArticle)
        .then(result => {
            console.log('\nPublishing Result:');
            console.log(JSON.stringify(result, null, 2));
        })
        .catch(error => {
            console.error('Failed to publish article:', error.message);
            process.exit(1);
        });
} 