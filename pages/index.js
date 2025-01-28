import { useState, useEffect } from 'react';
import Head from 'next/head';
import styles from '../styles/Home.module.css';
import SearchBar from '../components/SearchBar';
import Categories from '../components/Categories';
import fs from 'fs/promises';
import path from 'path';

// Helper function to format dates consistently
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
}

export default function Home({ articles: initialArticles }) {
  const [isClient, setIsClient] = useState(false);
  const [articles, setArticles] = useState(initialArticles);
  const [searchResults, setSearchResults] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Set isClient to true once component mounts
  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleSearch = (data) => {
    if (data.query) {
      setSearchResults(data);
      setSelectedCategory('All'); // Reset category when searching
    } else {
      setSearchResults(null);
    }
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setSearchResults(null); // Clear search when changing category
  };

  // Filter articles based on search and category
  const filteredArticles = (searchResults ? searchResults.results : articles).filter(article => {
    if (selectedCategory === 'All') return true;
    return article.categories && article.categories.includes(selectedCategory);
  });

  const noResultsMessage = searchResults && searchResults.count === 0 
    ? `No articles found for "${searchResults.query}"`
    : selectedCategory !== 'All' && filteredArticles.length === 0
    ? `No articles in the ${selectedCategory} category`
    : "No articles yet. Check back soon!";

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

        {isClient && (
          <>
            <SearchBar onSearch={handleSearch} />
            <Categories 
              selectedCategory={selectedCategory} 
              onCategoryChange={handleCategoryChange}
            />

            {searchResults && (
              <p className={styles.searchInfo}>
                Found {searchResults.count} article{searchResults.count !== 1 ? 's' : ''} for "{searchResults.query}"
              </p>
            )}
          </>
        )}

        <div className={styles.grid}>
          {!isClient ? (
            <p className={styles.loading}>Loading...</p>
          ) : filteredArticles.length > 0 ? (
            filteredArticles.map((article) => (
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
                      onClick={() => handleCategoryChange(category)}
                    >
                      {category}
                    </span>
                  ))}
                </div>
                <a href={`/article/${article.id}`}>Read more →</a>
              </article>
            ))
          ) : (
            <p className={styles.noArticles}>{noResultsMessage}</p>
          )}
        </div>
      </main>

      <footer className={styles.footer}>
        <p>NewsFlow - Your Source for Trending News</p>
      </footer>
    </div>
  );
}

export async function getStaticProps() {
  try {
    const articlesDirectory = path.join(process.cwd(), 'data/articles');
    
    // Create the directory if it doesn't exist
    try {
      await fs.access(articlesDirectory);
    } catch {
      await fs.mkdir(articlesDirectory, { recursive: true });
    }
    
    // Read all article files
    const files = await fs.readdir(articlesDirectory);
    const articles = await Promise.all(
      files
        .filter(file => file.endsWith('.json'))
        .map(async (file) => {
          const content = await fs.readFile(path.join(articlesDirectory, file), 'utf8');
          return JSON.parse(content);
        })
    );

    // Sort by timestamp, newest first
    articles.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    return {
      props: {
        articles
      },
      revalidate: 60
    };
  } catch (error) {
    console.error('Error fetching articles:', error);
    return {
      props: {
        articles: []
      },
      revalidate: 60
    };
  }
} 