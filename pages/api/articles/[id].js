import { STATIC_ARTICLES } from '../articles';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { id } = req.query;

  try {
    const article = STATIC_ARTICLES.find(article => article.id === id);
    
    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }

    res.status(200).json(article);
  } catch (error) {
    console.error('Error fetching article:', error);
    res.status(404).json({ message: 'Article not found' });
  }
} 