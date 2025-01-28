import axios from 'axios';

const PEXELS_API_KEY = 'dbhBo4u0vIfODU9Ghz1vEgk2dcpEDrfTqSxS14G4nOrHWmr7YPB9kr0g';

async function testPexelsAPI() {
  const testQueries = [
    'Artificial Intelligence Technology',
    'Climate Change Impact',
    'Space Exploration',
    'Global Economy',
    'Public Health'
  ];

  console.log('Testing Pexels API Integration...\n');

  for (const query of testQueries) {
    try {
      console.log(`Testing query: "${query}"`);
      
      const response = await axios.get('https://api.pexels.com/v1/search', {
        headers: {
          'Authorization': PEXELS_API_KEY
        },
        params: {
          query: query,
          per_page: 1,
          orientation: 'landscape'
        }
      });

      if (response.data.photos && response.data.photos.length > 0) {
        const photo = response.data.photos[0];
        console.log('✓ Image found:');
        console.log('  - URL:', photo.src.large);
        console.log('  - Photographer:', photo.photographer);
        console.log('  - Dimensions:', `${photo.width}x${photo.height}`);
        console.log('  - Alt:', photo.alt || 'No alt text available');
      } else {
        console.log('✗ No images found for this query');
      }
    } catch (error) {
      console.error('✗ Error fetching image:', error.response?.data || error.message);
    }
    console.log('-'.repeat(50) + '\n');
  }
}

// Run the test
testPexelsAPI()
  .then(() => console.log('Test completed!'))
  .catch(error => {
    console.error('Test failed:', error);
    process.exit(1);
  }); 