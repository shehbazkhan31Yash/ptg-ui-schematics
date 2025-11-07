/**
 * SEO Templates
 * Extracted from react.ts - Contains all SEO-related template generation functions
 * 
 * This file contains template generators for:
 * - SEO Component for meta tags and structured data
 * - Google Analytics 4 (GA4) and Google Tag Manager (GTM) integration
 * - SEO utility functions
 * - Robots.txt and Sitemap.xml generation
 * - Sitemap configuration
 */

/**
 * Generates SEO Component for managing meta tags, Open Graph, Twitter Cards, and JSON-LD
 * @param a - Application configuration object
 * @returns SEO Component code as a string
 */
export const getSEOComponent = (a: any) => `import { useEffect } from 'react';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  author?: string;
  image?: string;
  url?: string;
  type?: string;
  twitterCard?: string;
  structuredData?: Record<string, any>;
}

export const SEO: React.FC<SEOProps> = ({
  title = '${a.name}',
  description = 'A React application built with PTG UI Schematics',
  keywords = 'react, typescript, vite, ${a.framework !== 'none' ? a.framework + ',' : ''} web application',
  author = 'PTG Digital',
  image = '/og-image.png',
  url = typeof window !== 'undefined' ? window.location.href : '',
  type = 'website',
  twitterCard = 'summary_large_image',
  structuredData,
}) => {
  const fullTitle = title === '${a.name}' ? title : \`\${title} | ${a.name}\`;

  useEffect(() => {
    // Set document title
    document.title = fullTitle;

    // Helper function to set or update meta tags
    const setMetaTag = (name: string, content: string, isProperty = false) => {
      const attribute = isProperty ? 'property' : 'name';
      let element = document.querySelector(\`meta[\${attribute}="\${name}"]\`) as HTMLMetaElement;
      
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attribute, name);
        document.head.appendChild(element);
      }
      
      element.setAttribute('content', content);
    };

    // Set basic meta tags
    setMetaTag('description', description);
    setMetaTag('keywords', keywords);
    setMetaTag('author', author);

    // Set Open Graph tags
    setMetaTag('og:title', fullTitle, true);
    setMetaTag('og:description', description, true);
    setMetaTag('og:type', type, true);
    setMetaTag('og:url', url, true);
    setMetaTag('og:image', image, true);
    setMetaTag('og:site_name', '${a.name}', true);

    // Set Twitter Card tags
    setMetaTag('twitter:card', twitterCard);
    setMetaTag('twitter:title', fullTitle);
    setMetaTag('twitter:description', description);
    setMetaTag('twitter:image', image);
    setMetaTag('twitter:creator', author);

    // Set canonical link
    let canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', url);

    // Add Schema.org structured data (JSON-LD)
    const defaultStructuredData = {
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: '${a.name}',
      description: description,
      url: url,
      image: image,
      author: {
        '@type': 'Organization',
        name: author,
      },
      applicationCategory: 'WebApplication',
      operatingSystem: 'Any',
    };

    const jsonLdData = structuredData || defaultStructuredData;

    // Remove existing JSON-LD script if present
    const existingScript = document.querySelector('script[type="application/ld+json"]');
    if (existingScript) {
      existingScript.remove();
    }

    // Add new JSON-LD script
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify(jsonLdData);
    document.head.appendChild(script);

  }, [fullTitle, description, keywords, author, image, url, type, twitterCard, structuredData]);

  // This component doesn't render anything
  return null;
};

export default SEO;`;

/**
 * Generates robots.txt file for SEO
 * @param hostname - Website hostname/domain
 * @returns Robots.txt content as a string
 */
export const getRobotsTxt = (hostname: string = 'https://yourdomain.com') => `# https://www.robotstxt.org/robotstxt.html
User-agent: *
Disallow:

# Sitemap
Sitemap: ${hostname}/sitemap.xml`;

/**
 * Generates sitemap.xml file for SEO
 * @param hostname - Website hostname/domain
 * @returns Sitemap.xml content as a string
 */
export const getSitemapXml = (hostname: string = 'https://yourdomain.com') => {
  const currentDate = new Date().toISOString().split('T')[0];
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
  <!-- Homepage -->
  <url>
    <loc>${hostname}/</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <!-- About Page -->
  <url>
    <loc>${hostname}/about</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <!-- Add more URLs here as you create new pages -->
  <!-- 
  <url>
    <loc>${hostname}/contact</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  -->
</urlset>`;
};

/**
 * Generates sitemap configuration file
 * @param a - Application configuration object
 * @returns Sitemap config code as a string
 */
export const getSitemapConfig = (a: any) => `// Sitemap configuration
export const sitemapConfig = {
  hostname: 'https://yourdomain.com',
  routes: [
    { path: '/', priority: 1.0, changefreq: 'daily' },
    { path: '/about', priority: 0.8, changefreq: 'monthly' },
    // Add more routes here
  ],
  exclude: ['/admin', '/private'],
};

/**
 * Generate sitemap.xml content
 * @returns XML string for sitemap
 */
export function generateSitemap(): string {
  const { hostname, routes } = sitemapConfig;
  const currentDate = new Date().toISOString().split('T')[0];

  const urlEntries = routes
    .map((route) => {
      const url = typeof route === 'string' ? route : route.path;
      const priority = typeof route === 'object' ? route.priority || 0.5 : 0.5;
      const changefreq = typeof route === 'object' ? route.changefreq || 'weekly' : 'weekly';

      return \`  <url>
    <loc>\${hostname}\${url}</loc>
    <lastmod>\${currentDate}</lastmod>
    <changefreq>\${changefreq}</changefreq>
    <priority>\${priority}</priority>
  </url>\`;
    })
    .join('\\n');

  return \`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
\${urlEntries}
</urlset>\`;
}

export default sitemapConfig;`;

/**
 * Generates Google Analytics component with GA4 and GTM support
 * @param a - Application configuration object
 * @returns Google Analytics component code as a string
 */
export const getGoogleAnalytics = (a: any) => `import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface GoogleAnalyticsProps {
  measurementId: string;
  debug?: boolean;
}

type TrackingType = 'GA4' | 'GTM';

/**
 * Google Analytics 4 (GA4) & Google Tag Manager (GTM) Integration Component
 * 
 * Supports both:
 * - GA4: Measurement IDs starting with 'G-' (e.g., 'G-XXXXXXXXXX')
 * - GTM: Container IDs starting with 'GTM-' (e.g., 'GTM-XXXXXXX')
 * 
 * Usage:
 * 1. Get your ID from Google Analytics or Google Tag Manager
 * 2. Add this component to your App.tsx
 * 3. Replace the placeholder with your actual ID
 * 
 * @param measurementId - Your GA4 Measurement ID or GTM Container ID
 * @param debug - Enable debug mode for development (optional)
 */
export const GoogleAnalytics: React.FC<GoogleAnalyticsProps> = ({ 
  measurementId, 
  debug = false 
}) => {
  const location = useLocation();

  // Detect tracking type based on ID format
  const trackingType: TrackingType = measurementId.startsWith('GTM-') ? 'GTM' : 'GA4';

  useEffect(() => {
    // Skip analytics in development if debug is false
    if (process.env.NODE_ENV === 'development' && !debug) {
      console.log(\`[\${trackingType}] Skipped in development mode. Enable debug prop to test.\`);
      return;
    }

    if (trackingType === 'GTM') {
      // Google Tag Manager Implementation
      if (!window.dataLayer) {
        // Initialize dataLayer
        window.dataLayer = window.dataLayer || [];
        
        // GTM script injection
        const gtmScript = document.createElement('script');
        gtmScript.innerHTML = \`
          (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
          new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
          j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
          'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
          })(window,document,'script','dataLayer','\${measurementId}');
        \`;
        document.head.insertBefore(gtmScript, document.head.firstChild);

        // GTM noscript fallback
        const gtmNoscript = document.createElement('noscript');
        gtmNoscript.innerHTML = \`
          <iframe src="https://www.googletagmanager.com/ns.html?id=\${measurementId}"
          height="0" width="0" style="display:none;visibility:hidden"></iframe>
        \`;
        document.body.insertBefore(gtmNoscript, document.body.firstChild);

        if (debug) {
          console.log('[GTM] Initialized with Container ID:', measurementId);
        }
      }
    } else {
      // Google Analytics 4 (GA4) Implementation
      if (!window.gtag) {
        const script = document.createElement('script');
        script.async = true;
        script.src = \`https://www.googletagmanager.com/gtag/js?id=\${measurementId}\`;
        document.head.appendChild(script);

        // Initialize gtag
        window.dataLayer = window.dataLayer || [];
        window.gtag = function gtag() {
          window.dataLayer.push(arguments);
        };
        window.gtag('js', new Date());
        window.gtag('config', measurementId, {
          send_page_view: false, // We'll handle page views manually
        });

        if (debug) {
          console.log('[GA4] Initialized with ID:', measurementId);
        }
      }
    }
  }, [measurementId, debug, trackingType]);

  // Track page views on route change
  useEffect(() => {
    if (trackingType === 'GTM') {
      // GTM page view tracking via dataLayer
      if (window.dataLayer) {
        window.dataLayer.push({
          event: 'page_view',
          page_path: location.pathname + location.search,
          page_title: document.title,
          page_location: window.location.href,
        });

        if (debug) {
          console.log('[GTM] Page view tracked:', location.pathname);
        }
      }
    } else {
      // GA4 page view tracking via gtag
      if (window.gtag) {
        window.gtag('event', 'page_view', {
          page_path: location.pathname + location.search,
          page_title: document.title,
        });

        if (debug) {
          console.log('[GA4] Page view tracked:', location.pathname);
        }
      }
    }
  }, [location, debug, trackingType]);

  return null;
};

/**
 * Track custom events
 * Works with both GA4 and GTM
 * 
 * @example
 * trackEvent('button_click', { button_name: 'signup', page: 'home' });
 */
export const trackEvent = (
  eventName: string,
  eventParams?: Record<string, any>
) => {
  // Try GTM dataLayer first
  if (window.dataLayer) {
    window.dataLayer.push({
      event: eventName,
      ...eventParams,
    });
  }
  
  // Also try GA4 gtag (in case both are present)
  if (window.gtag) {
    window.gtag('event', eventName, eventParams);
  }
};

/**
 * Track user properties
 * Works with both GA4 and GTM
 * 
 * @example
 * setUserProperties({ user_type: 'premium', plan: 'pro' });
 */
export const setUserProperties = (properties: Record<string, any>) => {
  // GTM dataLayer
  if (window.dataLayer) {
    window.dataLayer.push({
      event: 'user_properties_set',
      user_properties: properties,
    });
  }
  
  // GA4 gtag
  if (window.gtag) {
    window.gtag('set', 'user_properties', properties);
  }
};

/**
 * Push custom data to GTM dataLayer
 * 
 * @example
 * pushToDataLayer({ event: 'custom_event', customData: 'value' });
 */
export const pushToDataLayer = (data: Record<string, any>) => {
  if (window.dataLayer) {
    window.dataLayer.push(data);
  }
};

// TypeScript declarations for gtag and dataLayer
declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}

export default GoogleAnalytics;`;

/**
 * Generates SEO utility functions file
 * @param a - Application configuration object
 * @returns SEO utilities code as a string
 */
export const getSEOUtils = (a: any) => `// SEO Utility Functions
export interface PageMeta {
  title: string;
  description: string;
  keywords?: string;
  image?: string;
  url?: string;
  structuredData?: Record<string, any>;
}

// Default meta tags for the application
export const defaultMeta: PageMeta = {
  title: '${a.name}',
  description: 'A modern React application built with PTG UI Schematics',
  keywords: 'react, typescript, ${a.framework !== 'none' ? a.framework + ',' : ''} web development',
  image: '/og-image.png',
  url: typeof window !== 'undefined' ? window.location.origin : '',
};

// Page-specific meta tags
export const pageMeta: Record<string, PageMeta> = {
  home: {
    title: 'Home',
    description: 'Welcome to ${a.name} - Your modern React application',
    keywords: 'home, welcome, react app',
  },
  about: {
    title: 'About Us',
    description: 'Learn more about ${a.name} and our mission',
    keywords: 'about, team, company',
  },
  // Add more page-specific meta tags here
};

/**
 * Get meta tags for a specific page
 * @param page - The page identifier
 * @returns PageMeta object with merged default and page-specific meta
 */
export function getPageMeta(page: string): PageMeta {
  const meta = pageMeta[page] || {};
  return {
    ...defaultMeta,
    ...meta,
    title: meta.title ? \`\${meta.title} | \${defaultMeta.title}\` : defaultMeta.title,
  };
}

/**
 * Generate WebApplication structured data (JSON-LD)
 */
export function getWebApplicationStructuredData() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: '${a.name}',
    description: defaultMeta.description,
    url: defaultMeta.url,
    image: defaultMeta.image,
    applicationCategory: 'WebApplication',
    operatingSystem: 'Any',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
  };
}

/**
 * Generate Organization structured data (JSON-LD)
 */
export function getOrganizationStructuredData() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: '${a.name}',
    url: defaultMeta.url,
    logo: defaultMeta.image,
    description: defaultMeta.description,
  };
}

/**
 * Generate Article structured data (JSON-LD) for blog posts
 */
export function getArticleStructuredData(article: {
  title: string;
  description: string;
  image: string;
  datePublished: string;
  dateModified?: string;
  author: string;
  url: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.description,
    image: article.image,
    datePublished: article.datePublished,
    dateModified: article.dateModified || article.datePublished,
    author: {
      '@type': 'Person',
      name: article.author,
    },
    publisher: {
      '@type': 'Organization',
      name: '${a.name}',
      logo: {
        '@type': 'ImageObject',
        url: defaultMeta.image,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': article.url,
    },
  };
}

/**
 * Generate BreadcrumbList structured data (JSON-LD)
 */
export function getBreadcrumbStructuredData(breadcrumbs: Array<{ name: string; url: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      item: crumb.url,
    })),
  };
}

/**
 * Generate Product structured data (JSON-LD) for e-commerce
 */
export function getProductStructuredData(product: {
  name: string;
  description: string;
  image: string;
  brand: string;
  price: number;
  currency: string;
  availability: 'InStock' | 'OutOfStock' | 'PreOrder';
  url: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: product.image,
    brand: {
      '@type': 'Brand',
      name: product.brand,
    },
    offers: {
      '@type': 'Offer',
      url: product.url,
      priceCurrency: product.currency,
      price: product.price,
      availability: \`https://schema.org/\${product.availability}\`,
    },
  };
}

export default {
  getPageMeta,
  getWebApplicationStructuredData,
  getOrganizationStructuredData,
  getArticleStructuredData,
  getBreadcrumbStructuredData,
  getProductStructuredData,
};`;
