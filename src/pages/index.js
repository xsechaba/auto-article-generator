import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import fs from 'fs/promises';
import path from 'path';
import styles from '../styles/Home.module.css';

const ARTICLES_PER_PAGE = 6;

export default function Home({ initialArticles, totalArticles }) {
  const [articles, setArticles] = useState(initialArticles);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const hasMore = articles.length < totalArticles;

  const loadMore = async () => {
    setLoading(true);
    try {
      const nextPage = page + 1;
      const res = await fetch(`/api/articles?page=${nextPage}&limit=${ARTICLES_PER_PAGE}`);
      const newArticles = await res.json();
      if (newArticles.length > 0) {
        setArticles(prevArticles => [...prevArticles, ...newArticles]);
        setPage(nextPage);
      }
    } catch (error) {
      console.error('Error loading more articles:', error);
    }
    setLoading(false);
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>Trending News & Articles</title>
        <meta name="description" content="Latest trending news and articles" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>Trending News & Articles</h1>

        {articles.length === 0 ? (
          <div className={styles.noArticles}>
            No articles yet. Check back soon!
          </div>
        ) : (
          <>
            <div className={styles.grid}>
              {articles.map((article) => (
                <Link href={`/article/${article.id}`} key={article.id}>
                  <div className={styles.card}>
                    {article.featuredImage && (
                      <div className={styles.cardImage}>
                        <img
                          src={article.featuredImage.url}
                          alt={article.featuredImage.alt}
                          width={400}
                          height={225}
                        />
                      </div>
                    )}
                    <h2>{article.title}</h2>
                    <p>{article.excerpt}</p>
                    <div className={styles.metadata}>
                      <span className={styles.searchVolume}>
                        🔍 {article.searchVolume} searches
                      </span>
                      <time dateTime={article.timestamp}>
                        📅 {new Date(article.timestamp).toLocaleDateString()}
                      </time>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {hasMore && (
              <button 
                className={styles.loadMore}
                onClick={loadMore}
                disabled={loading}
              >
                {loading ? 'Loading...' : 'Load More Articles'}
              </button>
            )}
          </>
        )}
      </main>
    </div>
  );
}

export async function getStaticProps() {
  try {
    const articlesDir = path.join(process.cwd(), 'data/articles');
    await fs.mkdir(articlesDir, { recursive: true });
    
    const files = await fs.readdir(articlesDir);
    const jsonFiles = files.filter(file => file.endsWith('.json'));
    
    const allArticles = await Promise.all(
      jsonFiles.map(async (file) => {
        const content = await fs.readFile(path.join(articlesDir, file), 'utf-8');
        return JSON.parse(content);
      })
    );

    // Sort articles by timestamp in descending order
    allArticles.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    return {
      props: {
        initialArticles: allArticles.slice(0, ARTICLES_PER_PAGE),
        totalArticles: allArticles.length
      },
      revalidate: 60
    };
  } catch (error) {
    console.error('Error in getStaticProps:', error);
    return {
      props: {
        initialArticles: [],
        totalArticles: 0
      },
      revalidate: 60
    };
  }
} 