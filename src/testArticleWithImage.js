import { generateArticle } from './generateArticle.js';

async function testArticleGeneration() {
  const testTopic = {
    title: "Artificial Intelligence Technology",
    traffic: "500,000+ searches"
  };

  try {
    console.log('Generating test article...\n');
    const article = await generateArticle(testTopic.title, testTopic.traffic);
    
    console.log('\nArticle Generation Results:');
    console.log('-'.repeat(50));
    console.log('Title:', article.title);
    console.log('Categories:', article.categories.join(', '));
    console.log('Keywords:', article.keywords.join(', '));
    
    if (article.featuredImage) {
      console.log('\nFeatured Image:');
      console.log('URL:', article.featuredImage.url);
      console.log('Photographer:', article.featuredImage.photographer);
      console.log('Dimensions:', `${article.featuredImage.width}x${article.featuredImage.height}`);
    } else {
      console.log('\n✗ No featured image was added to the article');
    }
    
    console.log('\n✓ Article saved successfully!');
  } catch (error) {
    console.error('Error generating article:', error);
  }
}

testArticleGeneration(); 