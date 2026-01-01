import fs from 'fs';

const html = String.raw;

export interface SEOConfig {
    title: string;
    description: string;
    keywords: string;
    url: string;
    image: string;
    siteName: string;
}

export const defaultSEO: SEOConfig = {
    title: 'Z-Running | 跑者與健身計算工具',
    description: 'Z-Running 提供跑者配速計算、重量單位換算及多種運動健身工具，幫助您更精確地規劃訓練目標。',
    keywords: '跑者計算機, 配速計算, 重量換算, 公斤磅換算, 健身工具, Z-Running',
    url: 'https://z-running.com/',
    image: 'https://z-running.com/runner_icon.jpg',
    siteName: 'Z-Running 運動工具箱',
};

export const generateSEOTags = (config: SEOConfig = defaultSEO) => {
    // JSON-LD Structured Data for Google
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Z-Running',
        url: config.url,
        description: config.description,
        applicationCategory: 'HealthApplication',
        operatingSystem: 'Any',
        abstract: 'Professional running and fitness calculation tools.',
        image: config.image,
        author: {
            '@type': 'Organization',
            name: 'Z-Running Team',
        },
    };

    return html`
        <title>${config.title}</title>
        <meta name="description" content="${config.description}" />
        <meta name="keywords" content="${config.keywords}" />

        <!-- Open Graph / Facebook / LINE -->
        <meta property="og:type" content="website" />
        <meta property="og:url" content="${config.url}" />
        <meta property="og:site_name" content="${config.siteName}" />
        <meta property="og:title" content="${config.title}" />
        <meta property="og:description" content="${config.description}" />
        <meta property="og:image" content="${config.image}" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:locale" content="zh_TW" />

        <!-- Twitter -->
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content="${config.url}" />
        <meta name="twitter:title" content="${config.title}" />
        <meta name="twitter:description" content="${config.description}" />
        <meta name="twitter:image" content="${config.image}" />

        <!-- Mobile & Apple -->
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="${config.siteName}" />
        <meta name="format-detection" content="telephone=no" />
        <link rel="apple-touch-icon" href="${config.image}" />

        <!-- Google Structured Data -->
        <script type="application/ld+json">
            ${JSON.stringify(jsonLd)}
        </script>
    `;
};

export const renderHTMLWithSEO = (htmlPath: string, seoConfig?: SEOConfig) => {
    try {
        let html = fs.readFileSync(htmlPath, 'utf8');
        const seoTags = generateSEOTags(seoConfig);

        // Replace the placeholders
        const regex = /<!-- SEO_TAGS_INSERT_START -->[\s\S]*<!-- SEO_TAGS_INSERT_END -->/;
        return html.replace(regex, `<!-- SEO_TAGS_INSERT_START -->${seoTags}<!-- SEO_TAGS_INSERT_END -->`);
    } catch (error) {
        console.error('Error rendering HTML with SEO:', error);
        return fs.readFileSync(htmlPath, 'utf8');
    }
};
