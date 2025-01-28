import fs from 'fs/promises';
import path from 'path';

export const STATIC_ARTICLES = [
  {
    id: 1,
    title: "The Future of Artificial Intelligence in Healthcare",
    excerpt: "Exploring how AI is revolutionizing medical diagnosis, treatment planning, and patient care through advanced algorithms and machine learning.",
    content: `Artificial Intelligence is transforming healthcare in unprecedented ways. From improving diagnostic accuracy to streamlining patient care, AI technologies are becoming an integral part of modern medicine. Machine learning algorithms can now analyze medical images with remarkable precision, often detecting conditions earlier than human practitioners.

Recent developments have shown AI systems capable of predicting patient outcomes, optimizing treatment plans, and even discovering new drug combinations. These advances are particularly crucial in areas with limited access to healthcare professionals, where AI can provide initial screening and basic diagnostic services.

However, the integration of AI in healthcare also raises important questions about data privacy, ethical considerations, and the role of human medical professionals. As we move forward, striking the right balance between technological advancement and human expertise will be crucial for optimal patient care.`,
    timestamp: "2024-01-25",
    categories: ["Technology", "Health"],
    searchVolume: "High",
    keywords: ["AI in healthcare", "medical technology", "machine learning", "digital health"]
  },
  {
    id: 2,
    title: "Sustainable Business Practices in the Digital Age",
    excerpt: "How companies are leveraging technology to reduce their environmental impact while maintaining profitability and growth.",
    content: `The intersection of sustainability and digital transformation is creating new opportunities for businesses to thrive while reducing their environmental impact. Companies are increasingly adopting cloud computing, remote work solutions, and digital processes to minimize their carbon footprint.

Leading organizations are implementing smart energy management systems, utilizing blockchain for supply chain transparency, and developing innovative recycling programs. These initiatives not only benefit the environment but also lead to significant cost savings and improved operational efficiency.

The transition to sustainable practices is being accelerated by consumer demand, regulatory pressures, and technological advancements. Businesses that embrace this change are finding themselves better positioned for long-term success in an increasingly environmentally conscious market.`,
    timestamp: "2024-01-26",
    categories: ["Environment", "Business"],
    searchVolume: "Medium",
    keywords: ["sustainable business", "green technology", "corporate responsibility", "digital transformation"]
  },
  {
    id: 3,
    title: "The Rise of Quantum Computing in Finance",
    excerpt: "Understanding how quantum computing is set to revolutionize financial modeling, cryptography, and risk assessment in the banking sector.",
    content: `Quantum computing is poised to revolutionize the financial sector by solving complex calculations that are currently impossible for classical computers. Major financial institutions are investing heavily in quantum research and development, recognizing its potential to transform everything from portfolio optimization to risk analysis.

The technology's ability to process vast amounts of data simultaneously could lead to more accurate market predictions, better fraud detection, and enhanced cybersecurity measures. Early applications are already showing promising results in portfolio optimization and trading strategies.

However, challenges remain in terms of quantum computer stability and error correction. Despite these obstacles, the finance industry continues to push forward with quantum initiatives, understanding that early adoption could provide significant competitive advantages.`,
    timestamp: "2024-01-27",
    categories: ["Business", "Technology"],
    searchVolume: "High",
    keywords: ["quantum computing", "fintech", "banking technology", "financial innovation"]
  },
  {
    id: 4,
    title: "Revolutionizing Education Through Virtual Reality",
    excerpt: "How VR technology is creating immersive learning experiences and transforming traditional educational methods.",
    content: `Virtual Reality is revolutionizing education by creating immersive learning environments that were previously impossible. Students can now take virtual field trips to ancient civilizations, explore the human body from the inside, or conduct dangerous scientific experiments safely in a virtual lab.

Educational institutions are increasingly adopting VR technology to enhance student engagement and understanding. The technology has shown particular promise in fields like medicine, engineering, and architecture, where hands-on experience is crucial but often difficult to provide in traditional settings.

Research indicates that VR-based learning can improve retention rates and provide more engaging educational experiences. As the technology becomes more accessible and affordable, we're likely to see wider adoption across all levels of education.`,
    timestamp: "2024-01-28",
    categories: ["Technology", "Education"],
    searchVolume: "Medium",
    keywords: ["virtual reality", "education technology", "immersive learning", "edtech"]
  },
  {
    id: 5,
    title: "Green Energy Innovations Reshaping Our Future",
    excerpt: "Exploring breakthrough technologies in renewable energy that are accelerating the transition to a sustainable future.",
    content: `Recent innovations in green energy technology are accelerating the world's transition to sustainable power sources. From more efficient solar panels to advanced energy storage solutions, these developments are making renewable energy more accessible and affordable than ever before.

Breakthrough technologies in wind power, including floating offshore wind farms and more efficient turbine designs, are opening up new possibilities for clean energy generation. Meanwhile, advances in battery technology are solving the intermittency challenges that have historically limited renewable energy adoption.

These innovations are not just technical achievements – they're driving economic growth and creating new job opportunities in the green energy sector. As costs continue to decrease and efficiency improves, we're moving closer to a future powered entirely by renewable sources.`,
    timestamp: "2024-01-29",
    categories: ["Technology", "Environment"],
    searchVolume: "High",
    keywords: ["renewable energy", "green technology", "sustainability", "clean power"]
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