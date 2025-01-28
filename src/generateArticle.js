import axios from 'axios';
import fs from 'fs/promises';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

// Load environment variables
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });

const PERPLEXITY_API_KEY = process.env.PERPLEXITY_API_KEY;
const PEXELS_API_KEY = 'dbhBo4u0vIfODU9Ghz1vEgk2dcpEDrfTqSxS14G4nOrHWmr7YPB9kr0g';

if (!PERPLEXITY_API_KEY) {
  throw new Error('PERPLEXITY_API_KEY environment variable is not set');
}

// Predefined categories for better organization
const CATEGORIES = [
  'Technology',
  'Science',
  'Business',
  'Politics',
  'Environment',
  'Health',
  'Sports',
  'Entertainment',
  'Education'
];

async function fetchArticleImage(topic, keywords) {
  try {
    // Combine topic and keywords for better search results
    const searchQuery = `${topic} ${keywords.join(' ')}`;
    console.log(`Fetching image for query: "${searchQuery}"`);
    
    const response = await axios.get('https://api.pexels.com/v1/search', {
      headers: {
        'Authorization': PEXELS_API_KEY
      },
      params: {
        query: searchQuery,
        per_page: 1,
        orientation: 'landscape'
      }
    });

    if (response.data.photos && response.data.photos.length > 0) {
      const photo = response.data.photos[0];
      console.log('✓ Image found:', photo.src.large);
      return {
        url: photo.src.large,
        width: photo.width,
        height: photo.height,
        photographer: photo.photographer,
        photographerUrl: photo.photographer_url,
        alt: `${topic} - ${photo.alt || 'Article featured image'}`
      };
    }
    return null;
  } catch (error) {
    console.error('Error fetching image:', error.message);
    return null;
  }
}

function cleanJsonContent(content) {
    try {
        // Remove any BOM or hidden characters
        content = content.replace(/^\uFEFF/, '');
        
        // Find the first { and last } to extract the JSON object
        const start = content.indexOf('{');
        const end = content.lastIndexOf('}') + 1;
        if (start === -1 || end === 0) {
            throw new Error('No JSON object found in content');
        }
        
        // Extract and parse the JSON object
        const jsonStr = content.slice(start, end);
        return JSON.parse(jsonStr);
    } catch (error) {
        console.error('Error cleaning JSON content:', error);
        throw new Error('Failed to parse article JSON');
    }
}

export async function generateArticle(topic, searchVolume) {
  try {
    console.log(`Generating article for topic: ${topic}`);

        // Generate article content using Perplexity
    const response = await axios.post('https://api.perplexity.ai/chat/completions', {
      model: 'sonar',
      messages: [{
        role: 'system',
                content: 'You are a professional news article writer. Generate articles in valid JSON format with proper HTML structure and semantic tags.'
      }, {
        role: 'user',
                content: `Write a detailed news article about "${topic}". Include a title, excerpt, and well-structured HTML content with proper semantic tags. Format the response as a JSON object with fields: title, excerpt, and content. Make sure all quotes and special characters are properly escaped.`
            }],
    }, {
      headers: {
                'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
            }
        });

        if (!response.data || !response.data.choices || !response.data.choices[0]) {
            throw new Error('Invalid response from Perplexity API');
        }

        const content = response.data.choices[0].message.content;
        console.log('Cleaned content:', content.substring(0, 100) + '...');

        // Parse and validate the article JSON
        const article = cleanJsonContent(content);
        
        if (!article.title || !article.content) {
            throw new Error('Generated article missing required fields');
        }

        // Fetch a relevant image
        const imageQuery = `${topic} ${article.title.split(':')[0]} ${article.excerpt?.split('.')[0] || ''}`;
        console.log('Fetching image for query:', imageQuery);
        
        const image = await fetchArticleImage(imageQuery);
    if (image) {
            console.log('✓ Image found:', image.url);
            article.featuredImage = image;
        }

        // Add metadata
        article.searchVolume = searchVolume;
        article.timestamp = new Date().toISOString();
        
        console.log('✓ Article generated successfully:', article.title);
        return article;

  } catch (error) {
        console.error('Error generating article:', error.message);
        throw new Error('Failed to generate properly formatted article');
  }
}

// For testing purposes
if (process.argv[1] === fileURLToPath(import.meta.url)) {
    const testTopic = {
        title: "Biden pardons",
        traffic: "500,000+ searches",
        url: "https://trends.google.com/trends/trendingsearches/daily?geo=US#Biden%20pardons",
        description: "Joe Biden, Biden, fauci pardon, Fauci, biden pardons today, Biden pardons Fauci, who did biden pardon today, anthony fauci, Liz Cheney, Mark Milley",
        timestamp: new Date().toISOString()
    };

    generateArticle(testTopic, testTopic.traffic)
        .then(article => {
            console.log('\nGenerated Article:');
            console.log('Title:', article.title);
            console.log('\nContent:');
            console.log(article.content);
            console.log('\nExcerpt:', article.excerpt);
            console.log('\nCategories:', article.categories.join(', '));
            console.log('\nKeywords:', article.keywords.join(', '));
            console.log('\nGeneration Timestamp:', article.timestamp);
            console.log('\nSearch Volume:', article.searchVolume);
        })
        .catch(error => {
            console.error('Failed to generate article:', error.message);
            process.exit(1);
        });
} 