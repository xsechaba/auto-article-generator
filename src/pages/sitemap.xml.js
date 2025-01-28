import fs from 'fs/promises';
import path from 'path';

function generateSiteMap(articles) {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    
    return `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
        <!-- Static Pages -->
        <url>
            <loc>${baseUrl}</loc>
            <changefreq>hourly</changefreq>
            <priority>1.0</priority>
        </url>
        
        <!-- Dynamic Article Pages -->
        ${articles.map(({ id, timestamp }) => `
            <url>
                <loc>${baseUrl}/article/${id}</loc>
                <lastmod>${new Date(timestamp).toISOString()}</lastmod>
                <changefreq>weekly</changefreq>
                <priority>0.8</priority>
            </url>
        `).join('')}
    </urlset>`;
}

export async function getServerSideProps({ res }) {
    try {
        // Get all articles
        const articlesDir = path.join(process.cwd(), 'data/articles');
        const files = await fs.readdir(articlesDir);
        
        const articles = await Promise.all(
            files
                .filter(file => file.endsWith('.json'))
                .map(async (file) => {
                    const content = await fs.readFile(path.join(articlesDir, file), 'utf-8');
                    return JSON.parse(content);
                })
        );

        // Generate sitemap
        const sitemap = generateSiteMap(articles);

        // Set headers
        res.setHeader('Content-Type', 'text/xml');
        res.setHeader('Cache-Control', 'public, s-maxage=1200, stale-while-revalidate=600');
        
        // Send the XML
        res.write(sitemap);
        res.end();

        return {
            props: {},
        };
    } catch (error) {
        console.error('Error generating sitemap:', error);
        res.statusCode = 500;
        res.end();
        return {
            props: {},
        };
    }
}

// Default export to prevent next.js errors
export default function Sitemap() {
    return null;
} 