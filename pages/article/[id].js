import Head from 'next/head';
import { useRouter } from 'next/router';
import styles from '../../styles/Article.module.css';

// Helper function to format dates consistently
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
}

export default function Article({ article }) {
  const router = useRouter();

  if (router.isFallback) {
    return <div className={styles.loading}>Loading...</div>;
  }

  if (!article) {
    return (
      <div className={styles.container}>
        <div className={styles.main}>
          <h1>Article not found</h1>
          <p>The requested article could not be found.</p>
          <div className={styles.navigation}>
            <a href="/" className={styles.backLink}>← Back to Home</a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Head>
        <title>{article.title} - Trending News</title>
        <meta name="description" content={article.excerpt} />
      </Head>

      <main className={styles.main}>
        <article className={styles.article}>
          <h1>{article.title}</h1>
          
          {article.featuredImage && (
            <div className={styles.featuredImage}>
              <img 
                src={article.featuredImage.url} 
                alt={article.featuredImage.alt}
                width={article.featuredImage.width}
                height={article.featuredImage.height}
              />
              <div className={styles.imageCredit}>
                Photo by <a href={article.featuredImage.photographerUrl} target="_blank" rel="noopener noreferrer">
                  {article.featuredImage.photographer}
                </a> on <a href="https://www.pexels.com" target="_blank" rel="noopener noreferrer">Pexels</a>
              </div>
            </div>
          )}

          <div className={styles.metadata}>
            <span>🔍 {article.searchVolume} searches</span>
            <span>📅 {formatDate(article.timestamp)}</span>
          </div>
          <div 
            className={styles.content}
            dangerouslySetInnerHTML={{ __html: article.content }} 
          />

          <div className={styles.keywords}>
            {article.keywords?.map((keyword, index) => (
              <span key={index} className={styles.keyword}>
                {keyword}
              </span>
            ))}
          </div>
        </article>

        <div className={styles.navigation}>
          <a href="/" className={styles.backLink}>
            ← Back to all articles
          </a>
        </div>
      </main>
    </div>
  );
}

export async function getStaticPaths() {
  try {
    const res = await fetch('http://localhost:3000/api/articles');
    const articles = await res.json();
    
    const paths = articles.map(article => ({
      params: { id: article.id.toString() }
    }));

    return {
      paths,
      fallback: true
    };
  } catch (error) {
    console.error('Error getting static paths:', error);
    return {
      paths: [],
      fallback: true
    };
  }
}

export async function getStaticProps({ params }) {
  try {
    const res = await fetch(`http://localhost:3000/api/articles/${params.id}`);
    if (!res.ok) throw new Error('Article not found');
    const article = await res.json();

    return {
      props: {
        article
      },
      revalidate: 60
    };
  } catch (error) {
    console.error('Error getting article:', error);
    return {
      props: {
        article: null
      },
      revalidate: 60
    };
  }
} 