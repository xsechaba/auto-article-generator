import axios from 'axios';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
dotenv.config({ path: path.join(path.dirname(fileURLToPath(import.meta.url)), '../.env') });

const WP_SITE_URL = process.env.WP_SITE_URL;
const WP_USERNAME = process.env.WP_USERNAME;
const WP_PASSWORD = process.env.WP_PASSWORD;

if (!WP_SITE_URL || !WP_USERNAME || !WP_PASSWORD) {
    throw new Error('WordPress credentials not configured in .env file');
}

// Create axios instance for WordPress
const wpApi = axios.create({
    baseURL: `${WP_SITE_URL}/wp-json/wp/v2`,
    auth: {
        username: WP_USERNAME,
        password: WP_PASSWORD
    }
});

/**
 * Upload media to WordPress
 */
async function uploadFeaturedImage(imageUrl) {
    try {
        // Download image
        const imageResponse = await axios.get(imageUrl, { responseType: 'arraybuffer' });
        const buffer = Buffer.from(imageResponse.data, 'binary');

        // Upload to WordPress
        const formData = new FormData();
        formData.append('file', new Blob([buffer]), 'featured-image.jpg');

        const uploadResponse = await wpApi.post('/media', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });

        return uploadResponse.data.id;
    } catch (error) {
        console.error('Error uploading featured image:', error.message);
        return null;
    }
}

/**
 * Publish article to WordPress
 */
export async function publishToWordPress(article) {
    try {
        console.log(`Publishing article to WordPress: ${article.title}`);

        // Upload featured image if exists
        let featuredMediaId = null;
        if (article.featuredImage?.url) {
            featuredMediaId = await uploadFeaturedImage(article.featuredImage.url);
        }

        // Prepare post data
        const postData = {
            title: article.title,
            content: article.content,
            excerpt: article.excerpt,
            status: 'publish',
            featured_media: featuredMediaId,
            categories: [], // You can map your categories to WordPress category IDs
            meta: {
                search_volume: article.searchVolume,
                original_timestamp: article.timestamp,
                keywords: article.keywords // Store keywords as meta instead
            }
        };

        // Create post
        const response = await wpApi.post('/posts', postData);

        console.log(`✓ Article published to WordPress: ${response.data.link}`);
        return {
            success: true,
            wpPostId: response.data.id,
            wpPostUrl: response.data.link
        };

    } catch (error) {
        console.error('Error publishing to WordPress:', error.response?.data || error.message);
        throw new Error(`Failed to publish to WordPress: ${error.message}`);
    }
}

// Test the WordPress connection
export async function testWordPressConnection() {
    try {
        const response = await wpApi.get('/');
        console.log('WordPress connection successful!');
        return true;
    } catch (error) {
        console.error('WordPress connection failed:', error.message);
        return false;
    }
} 