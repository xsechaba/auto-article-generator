export default function JsonLd({ data }) {
    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
        />
    );
}

export function generateArticleSchema({
    title,
    description,
    imageUrl,
    datePublished,
    dateModified,
    authorName = 'Auto Article Generator',
    publisherName = 'Auto Article Generator',
    publisherLogo = '/logo.png',
    url
}) {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    
    return {
        '@context': 'https://schema.org',
        '@type': 'NewsArticle',
        headline: title,
        description: description,
        image: imageUrl ? [imageUrl] : undefined,
        datePublished: datePublished,
        dateModified: dateModified || datePublished,
        author: {
            '@type': 'Organization',
            name: authorName,
            url: baseUrl
        },
        publisher: {
            '@type': 'Organization',
            name: publisherName,
            logo: {
                '@type': 'ImageObject',
                url: `${baseUrl}${publisherLogo}`
            }
        },
        mainEntityOfPage: {
            '@type': 'WebPage',
            '@id': url || baseUrl
        }
    };
}

export function generateWebsiteSchema() {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    
    return {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: 'Auto Article Generator',
        description: 'Latest news and articles on trending topics',
        url: baseUrl,
        potentialAction: {
            '@type': 'SearchAction',
            target: `${baseUrl}/search?q={search_term_string}`,
            'query-input': 'required name=search_term_string'
        }
    };
}

export function generateBreadcrumbSchema(items) {
    return {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: items.map((item, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: item.name,
            item: item.url
        }))
    };
} 