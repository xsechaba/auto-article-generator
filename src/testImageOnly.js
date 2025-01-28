import axios from 'axios';

const PEXELS_API_KEY = 'dbhBo4u0vIfODU9Ghz1vEgk2dcpEDrfTqSxS14G4nOrHWmr7YPB9kr0g';

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

async function testImageFetching() {
  const testCases = [
    {
      topic: "Artificial Intelligence",
      keywords: ["machine learning", "technology", "innovation"]
    },
    {
      topic: "Climate Change",
      keywords: ["environment", "global warming", "sustainability"]
    }
  ];

  console.log('Testing Image Fetching...\n');

  for (const test of testCases) {
    console.log(`Testing topic: "${test.topic}"`);
    const image = await fetchArticleImage(test.topic, test.keywords);
    
    if (image) {
      console.log('✓ Image found:');
      console.log('  URL:', image.url);
      console.log('  Photographer:', image.photographer);
      console.log('  Dimensions:', `${image.width}x${image.height}`);
      console.log('  Alt:', image.alt);
    } else {
      console.log('✗ No image found');
    }
    console.log('-'.repeat(50) + '\n');
  }
}

// Run the test
testImageFetching()
  .then(() => console.log('Image fetching test completed!'))
  .catch(error => {
    console.error('Test failed:', error);
    process.exit(1);
  }); 