import { useRouter } from 'next/router';
import fs from 'fs/promises';
import path from 'path';
import SEO from '../../components/SEO';
import JsonLd, { generateArticleSchema, generateBreadcrumbSchema } from '../../components/JsonLd';
import styles from '../../styles/Article.module.css';

export default function Article({ article }) {
    const router = useRouter();
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

    // Handle fallback state
    if (router.isFallback) {
        return <div className={styles.loading}>Loading...</div>;
    }

    // Handle 404
    if (!article) {
        return <div className={styles.error}>Article not found</div>;
    }

    // Generate canonical URL
    const canonicalUrl = `${baseUrl}/article/${article.id}`;

    // Generate breadcrumb data
    const breadcrumbItems = [
        { name: 'Home', url: baseUrl },
        { name: article.title, url: canonicalUrl }
    ];

    return (
        <>
            <SEO 
                title={article.title}
                description={article.excerpt}
                image={article.featuredImage?.url}
                article={true}
                publishedTime={article.timestamp}
                keywords={article.keywords || []}
                canonicalUrl={canonicalUrl}
            />
            
            <JsonLd 
                data={generateArticleSchema({
                    title: article.title,
                    description: article.excerpt,
                    imageUrl: article.featuredImage?.url,
                    datePublished: article.timestamp,
                    url: canonicalUrl
                })}
            />
            
            <JsonLd data={generateBreadcrumbSchema(breadcrumbItems)} />

            <div className={styles.container}>
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
                                {article.featuredImage.photographer && (
                                    <div className={styles.imageCredit}>
                                        Photo by{' '}
                                        <a href={article.featuredImage.photographerUrl} target="_blank" rel="noopener noreferrer">
                                            {article.featuredImage.photographer}
                                        </a>
                                        {' '}on{' '}
                                        <a href="https://www.pexels.com" target="_blank" rel="noopener noreferrer">
                                            Pexels
                                        </a>
                                    </div>
                                )}
                            </div>
                        )}
                        
                        <div className={styles.metadata}>
                            <time dateTime={article.timestamp}>
                                {new Date(article.timestamp).toLocaleDateString()}
                            </time>
                            <span className={styles.searchVolume}>
                                {article.searchVolume} searches
                            </span>
                        </div>

                        <div 
                            className={styles.content}
                            dangerouslySetInnerHTML={{ __html: article.content }}
                        />

                        {article.keywords && article.keywords.length > 0 && (
                            <div className={styles.keywords}>
                                {article.keywords.map(keyword => (
                                    <span key={keyword} className={styles.keyword}>
                                        {keyword}
                                    </span>
                                ))}
                            </div>
                        )}

                        <div className={styles.navigation}>
                            <a href="/" className={styles.backLink}>
                                ← Back to Articles
                            </a>
                        </div>
                    </article>
                </main>
            </div>
        </>
    );
}

export async function getStaticPaths() {
    try {
        const articlesDir = path.join(process.cwd(), 'data/articles');
        const files = await fs.readdir(articlesDir);
        
        const paths = files
            .filter(file => file.endsWith('.json'))
            .map(file => ({
                params: { id: file.replace('.json', '') }
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
        const articlePath = path.join(process.cwd(), 'data/articles', `${params.id}.json`);
        const articleData = await fs.readFile(articlePath, 'utf-8');
        const article = JSON.parse(articleData);

        return {
            props: {
                article
            },
            revalidate: 60 // Revalidate every minute
        };
    } catch (error) {
        console.error('Error getting article:', error);
        return {
            notFound: true
        };
    }
} 