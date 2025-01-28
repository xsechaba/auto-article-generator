import fs from 'fs/promises';
import path from 'path';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { id } = req.query;

  try {
    const articlePath = path.join(process.cwd(), 'data/articles', `${id}.json`);
    const content = await fs.readFile(articlePath, 'utf8');
    const article = JSON.parse(content);

    res.status(200).json(article);
  } catch (error) {
    console.error('Error fetching article:', error);
    res.status(404).json({ message: 'Article not found' });
  }
} 