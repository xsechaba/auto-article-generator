import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Fallback topics in case of API issues
const FALLBACK_TOPICS = [
  { title: 'Artificial Intelligence Advances', searchVolume: '500,000+' },
  { title: 'Climate Change Impact', searchVolume: '400,000+' },
  { title: 'Space Exploration', searchVolume: '300,000+' },
  { title: 'Global Economy', searchVolume: '250,000+' },
  { title: 'Public Health', searchVolume: '200,000+' }
];

export async function getTrendingTopics() {
  try {
    console.log('Fetching trending topics from Google Trends...');
    
    const pythonScript = path.join(__dirname, 'trends_service.py');
    
    // Run Python script and collect output
    const result = await new Promise((resolve, reject) => {
      let dataString = '';
      let errorString = '';
      
      const pythonProcess = spawn('python', [pythonScript]);
      
      pythonProcess.stdout.on('data', (data) => {
        dataString += data.toString();
      });
      
      pythonProcess.stderr.on('data', (data) => {
        errorString += data.toString();
      });
      
      pythonProcess.on('close', (code) => {
        if (code !== 0) {
          console.error('Python script error:', errorString);
          reject(new Error(`Python script exited with code ${code}`));
          return;
        }
        
        try {
          const jsonData = JSON.parse(dataString);
          if (jsonData.error) {
            reject(new Error(jsonData.error));
          } else {
            resolve(jsonData.trends);
          }
        } catch (error) {
          reject(new Error('Failed to parse Python script output'));
        }
      });
    });
    
    if (!result || result.length === 0) {
      console.log('No trends found, using fallback topics');
      return FALLBACK_TOPICS;
    }
    
    console.log(`Found ${result.length} trending topics`);
    return result;
    
  } catch (error) {
    console.error('Error fetching topics:', error.message);
    console.log('Using fallback topics due to error');
    return FALLBACK_TOPICS;
  }
} 