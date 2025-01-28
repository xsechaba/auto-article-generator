import fs from 'fs/promises';
import path from 'path';

export const STATIC_ARTICLES = [
  {
    id: "article-1",
    title: "The Rise of AI in Healthcare: Transforming Patient Care",
    excerpt: "Artificial Intelligence is revolutionizing healthcare delivery, from diagnosis to treatment planning. This article explores the latest developments and their impact on patient care.",
    content: "<h2>Introduction</h2><p>The healthcare industry is witnessing a dramatic transformation through the integration of Artificial Intelligence (AI) technologies...</p>",
    timestamp: "2024-01-27T10:00:00Z",
    searchVolume: "450,000+",
    keywords: ["AI", "Healthcare", "Technology", "Medicine"]
  },
  {
    id: "article-2",
    title: "Climate Change: Global Initiatives and Economic Impact",
    excerpt: "An in-depth look at how countries worldwide are addressing climate change and its effects on the global economy.",
    content: "<h2>Global Climate Action</h2><p>Nations across the globe are implementing ambitious policies to combat climate change...</p>",
    timestamp: "2024-01-26T15:30:00Z",
    searchVolume: "380,000+",
    keywords: ["Climate Change", "Economy", "Environment", "Policy"]
  },
  {
    id: "article-3",
    title: "The Future of Work: Remote vs. Hybrid Models",
    excerpt: "Analyzing the evolving workplace landscape and how companies are adapting to new work models in the post-pandemic era.",
    content: "<h2>Workplace Evolution</h2><p>The traditional office environment continues to evolve as organizations embrace flexible work arrangements...</p>",
    timestamp: "2024-01-25T09:15:00Z",
    searchVolume: "320,000+",
    keywords: ["Remote Work", "Business", "Employment", "Technology"]
  },
  {
    id: "article-4",
    title: "Digital Privacy in the Age of Big Data",
    excerpt: "Exploring the challenges and solutions in maintaining personal privacy as data collection becomes increasingly prevalent.",
    content: "<h2>Privacy Concerns</h2><p>As our lives become more digitally integrated, the importance of data privacy has never been more critical...</p>",
    timestamp: "2024-01-24T14:45:00Z",
    searchVolume: "290,000+",
    keywords: ["Privacy", "Technology", "Data Security", "Digital Rights"]
  },
  {
    id: "article-5",
    title: "Sustainable Energy: Innovations Shaping Our Future",
    excerpt: "Discover the latest breakthroughs in renewable energy technology and their impact on sustainable development.",
    content: "<h2>Energy Innovation</h2><p>The renewable energy sector is experiencing unprecedented growth and technological advancement...</p>",
    timestamp: "2024-01-23T11:20:00Z",
    searchVolume: "275,000+",
    keywords: ["Renewable Energy", "Sustainability", "Technology", "Innovation"]
  }
];

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 6;
    const start = (page - 1) * limit;
    const end = start + limit;

    const paginatedArticles = STATIC_ARTICLES.slice(start, end);
    
    res.status(200).json(paginatedArticles);
  } catch (error) {
    console.error('Error fetching articles:', error);
    res.status(500).json({ message: 'Error fetching articles' });
  }
} 