# SEO: Robots.txt and XML Sitemap

## Added Features

### 1. Robots.txt File
**Generated file**: `src/robots.txt`
```
User-agent: *
Allow: /

Sitemap: /sitemap.xml
```

### 2. XML Sitemap
**Generated file**: `src/sitemap.xml`
```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>/</loc>
    <lastmod>2024-01-01</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>
```

## Implementation
- Both files are automatically added to `angular.json` assets
- Files are served at `/robots.txt` and `/sitemap.xml`
- Robots.txt references the sitemap location
- Sitemap includes current date as lastmod

## Benefits
- Improves SEO compliance
- Helps search engines crawl and index the site
- Provides clear crawling instructions