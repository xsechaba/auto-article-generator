import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import styles from '../styles/Home.module.css';
import { STATIC_ARTICLES } from './api/articles';

// Helper function to format dates consistently
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
}

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Filter articles based on category
  const filteredArticles = STATIC_ARTICLES.filter(article => {
    if (selectedCategory === 'All') return true;
    return article.categories && article.categories.includes(selectedCategory);
  });

  return (
    <div className={styles.container}>
      <Head>
        <title>Trending News & Articles</title>
        <meta name="description" content="Latest trending news and articles" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>
          Trending News
        </h1>

        <div className={styles.categories}>
          <button 
            className={`${styles.category} ${selectedCategory === 'All' ? styles.active : ''}`}
            onClick={() => setSelectedCategory('All')}
          >
            All
          </button>
          {['Technology', 'Business', 'Environment', 'Health', 'Education'].map(category => (
            <button
              key={category}
              className={`${styles.category} ${selectedCategory === category ? styles.active : ''}`}
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>

        <div className={styles.grid}>
          {filteredArticles.map((article) => (
            <article key={article.id} className={styles.card}>
              <h2>{article.title}</h2>
              <p>{article.excerpt}</p>
              <div className={styles.metadata}>
                <span>🔍 {article.searchVolume}</span>
                <span>📅 {formatDate(article.timestamp)}</span>
              </div>
              <div className={styles.categories}>
                {article.categories?.map(category => (
                  <span 
                    key={category} 
                    className={styles.category}
                    onClick={() => setSelectedCategory(category)}
                  >
                    {category}
                  </span>
                ))}
              </div>
              <Link href={`/article/${article.id}`}>
                <a>Read more →</a>
              </Link>
            </article>
          ))}
        </div>
      </main>

      <footer className={styles.footer}>
        <p>NewsFlow - Your Source for Trending News</p>
      </footer>
    </div>
  );
} 