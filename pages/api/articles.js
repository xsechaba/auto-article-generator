import fs from 'fs/promises';
import path from 'path';

export const STATIC_ARTICLES = [
  {
    id: "article-1",
    title: "The Rise of AI in Healthcare: Transforming Patient Care",
    excerpt: "Artificial Intelligence is revolutionizing healthcare delivery, from diagnosis to treatment planning. This article explores the latest developments and their impact on patient care.",
    content: "<h2>Introduction</h2><p>The healthcare industry is witnessing a dramatic transformation through the integration of Artificial Intelligence (AI) technologies. From improving diagnosis accuracy to streamlining patient care, AI is revolutionizing how healthcare is delivered.</p><h2>Key Applications</h2><p>AI is being deployed across various healthcare domains:</p><ul><li>Diagnostic Imaging Analysis</li><li>Patient Data Processing</li><li>Treatment Planning</li><li>Drug Discovery</li></ul><h2>Impact on Patient Care</h2><p>The implementation of AI technologies has led to significant improvements in patient outcomes, reduced medical errors, and more efficient healthcare delivery systems.</p>",
    timestamp: "2024-01-27T10:00:00Z",
    searchVolume: "450,000+",
    keywords: ["AI", "Healthcare", "Technology", "Medicine"],
    categories: ["Technology", "Health"]
  },
  {
    id: "article-2",
    title: "Climate Change: Global Initiatives and Economic Impact",
    excerpt: "An in-depth look at how countries worldwide are addressing climate change and its effects on the global economy.",
    content: "<h2>Global Climate Action</h2><p>Nations across the globe are implementing ambitious policies to combat climate change. These initiatives are reshaping industries and economic policies worldwide.</p><h2>Economic Implications</h2><p>The transition to sustainable practices is creating both challenges and opportunities:</p><ul><li>Renewable Energy Investment</li><li>Carbon Market Development</li><li>Green Job Creation</li></ul><h2>Future Outlook</h2><p>As countries accelerate their climate action plans, we're seeing a fundamental shift in how economies operate and grow sustainably.</p>",
    timestamp: "2024-01-26T15:30:00Z",
    searchVolume: "380,000+",
    keywords: ["Climate Change", "Economy", "Environment", "Policy"],
    categories: ["Environment", "Business"]
  },
  {
    id: "article-3",
    title: "The Future of Work: Remote vs. Hybrid Models",
    excerpt: "Analyzing the evolving workplace landscape and how companies are adapting to new work models in the post-pandemic era.",
    content: "<h2>Workplace Evolution</h2><p>The traditional office environment continues to evolve as organizations embrace flexible work arrangements. This shift is fundamentally changing how we think about work and productivity.</p><h2>Comparing Models</h2><p>Different approaches to modern work:</p><ul><li>Full Remote Operations</li><li>Hybrid Scheduling</li><li>Flexible Office Spaces</li></ul><h2>Technology Integration</h2><p>Digital tools and platforms are enabling seamless collaboration regardless of physical location.</p>",
    timestamp: "2024-01-25T09:15:00Z",
    searchVolume: "320,000+",
    keywords: ["Remote Work", "Business", "Employment", "Technology"],
    categories: ["Business", "Technology"]
  },
  {
    id: "article-4",
    title: "Digital Privacy in the Age of Big Data",
    excerpt: "Exploring the challenges and solutions in maintaining personal privacy as data collection becomes increasingly prevalent.",
    content: "<h2>Privacy Concerns</h2><p>As our lives become more digitally integrated, the importance of data privacy has never been more critical. This article examines the current landscape of digital privacy and emerging protection measures.</p><h2>Key Challenges</h2><p>Major privacy issues include:</p><ul><li>Data Collection Practices</li><li>Information Security</li><li>Regulatory Compliance</li></ul><h2>Protection Strategies</h2><p>Learn about the tools and practices that can help protect your digital privacy.</p>",
    timestamp: "2024-01-24T14:45:00Z",
    searchVolume: "290,000+",
    keywords: ["Privacy", "Technology", "Data Security", "Digital Rights"],
    categories: ["Technology", "Education"]
  },
  {
    id: "article-5",
    title: "Sustainable Energy: Innovations Shaping Our Future",
    excerpt: "Discover the latest breakthroughs in renewable energy technology and their impact on sustainable development.",
    content: "<h2>Energy Innovation</h2><p>The renewable energy sector is experiencing unprecedented growth and technological advancement. These innovations are paving the way for a sustainable future.</p><h2>Breakthrough Technologies</h2><p>Key developments include:</p><ul><li>Advanced Solar Systems</li><li>Wind Energy Optimization</li><li>Energy Storage Solutions</li></ul><h2>Future Impact</h2><p>These technologies are set to transform how we generate and consume energy.</p>",
    timestamp: "2024-01-23T11:20:00Z",
    searchVolume: "275,000+",
    keywords: ["Renewable Energy", "Sustainability", "Technology", "Innovation"],
    categories: ["Technology", "Environment"]
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