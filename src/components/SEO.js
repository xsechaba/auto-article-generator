import Head from 'next/head';

export default function SEO({ 
    title, 
    description, 
    image, 
    article = false,
    publishedTime,
    modifiedTime,
    author,
    keywords = [],
    canonicalUrl
}) {
    // Base URL from environment variable or default
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    
    // Ensure title has site name
    const fullTitle = `${title} | Auto Article Generator`;
    
    // Clean description and ensure it's not too long
    const cleanDescription = description?.substring(0, 160) || 'Latest news and articles on trending topics';
    
    // Default image if none provided
    const ogImage = image || `${baseUrl}/default-og-image.jpg`;

    return (
        <Head>
            {/* Basic Meta Tags */}
            <title>{fullTitle}</title>
            <meta name="description" content={cleanDescription} />
            <meta name="keywords" content={keywords.join(', ')} />
            
            {/* Canonical URL */}
            {canonicalUrl && (
                <link rel="canonical" href={canonicalUrl} />
            )}
            
            {/* OpenGraph Tags */}
            <meta property="og:title" content={fullTitle} />
            <meta property="og:description" content={cleanDescription} />
            <meta property="og:image" content={ogImage} />
            <meta property="og:url" content={canonicalUrl || baseUrl} />
            <meta property="og:type" content={article ? 'article' : 'website'} />
            <meta property="og:site_name" content="Auto Article Generator" />
            
            {/* Twitter Card Tags */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={fullTitle} />
            <meta name="twitter:description" content={cleanDescription} />
            <meta name="twitter:image" content={ogImage} />
            
            {/* Article Specific Meta Tags */}
            {article && (
                <>
                    <meta property="article:published_time" content={publishedTime} />
                    {modifiedTime && (
                        <meta property="article:modified_time" content={modifiedTime} />
                    )}
                    {author && (
                        <meta property="article:author" content={author} />
                    )}
                    {keywords.map((keyword) => (
                        <meta property="article:tag" content={keyword} key={keyword} />
                    ))}
                </>
            )}
            
            {/* Robots Meta */}
            <meta name="robots" content="index, follow" />
            
            {/* Additional Meta Tags */}
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <meta httpEquiv="Content-Type" content="text/html; charset=utf-8" />
        </Head>
    );
} 