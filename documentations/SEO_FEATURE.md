# SEO Feature for Angular Applications

## Overview
The SEO feature adds comprehensive search engine optimization capabilities to your Angular application, including meta tag management, structured data, Open Graph support, and SSG/SSR options.

## SEO Implementation Types

### 1. Basic SEO
- Meta tag management service
- Dynamic title and description updates
- Open Graph and Twitter Card support
- Structured data (JSON-LD)
- Client-side SEO optimization

### 2. SSG (Static Site Generation)
- All Basic SEO features
- Pre-rendered static pages for better SEO
- Faster initial page loads
- Better search engine crawling
- Build scripts for static generation

### 3. SSR (Server-Side Rendering)
- All Basic SEO features
- Server-side rendering with Angular Universal
- Dynamic content rendering on server
- Real-time SEO optimization
- Express server setup

## What's Included

### 1. SEO Service (`src/app/core/services/seo.service.ts`)
A comprehensive service that provides methods for:
- **Title Management**: Update page titles dynamically
- **Meta Tags**: Manage description, keywords, and custom meta tags
- **Open Graph Tags**: Social media sharing optimization
- **Twitter Cards**: Twitter-specific meta tags
- **Canonical URLs**: Prevent duplicate content issues
- **Structured Data**: JSON-LD schema markup for rich snippets

### 2. Enhanced Index.html
Pre-configured with essential SEO meta tags:
- Basic meta tags (description, keywords, author, robots)
- Open Graph tags for Facebook sharing
- Twitter Card tags
- Canonical URL link

### 3. SEO Example Component
A demonstration component showing how to use the SEO service effectively.

## Usage Examples

### Basic SEO Setup
```typescript
import { SeoService } from './core/services/seo.service';

constructor(private seoService: SeoService) {}

ngOnInit() {
  this.seoService.updateTitle('My Page Title');
  this.seoService.updateDescription('This is my page description');
  this.seoService.updateKeywords('angular, seo, optimization');
}
```

### Dynamic Meta Tags
```typescript
updateSEO() {
  this.seoService.updateMetaTags({
    'description': 'Updated description',
    'keywords': 'new, keywords, here',
    'author': 'Your Name'
  });
}
```

### Social Media Optimization
```typescript
setSocialTags() {
  // Open Graph tags
  this.seoService.updateOGTags({
    'title': 'My Page Title',
    'description': 'Page description for social sharing',
    'image': 'https://example.com/image.jpg',
    'url': 'https://example.com/page'
  });

  // Twitter tags
  this.seoService.updateTwitterTags({
    'card': 'summary_large_image',
    'title': 'My Page Title',
    'description': 'Page description for Twitter'
  });
}
```

### Structured Data
```typescript
addStructuredData() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "Article Title",
    "description": "Article description",
    "author": {
      "@type": "Person",
      "name": "Author Name"
    },
    "datePublished": "2024-01-01"
  };
  
  this.seoService.generateStructuredData(structuredData);
}
```

## Best Practices

1. **Set SEO tags in component lifecycle hooks** (ngOnInit, ngAfterViewInit)
2. **Update meta tags when route changes** for SPA navigation
3. **Use meaningful, unique titles and descriptions** for each page
4. **Include relevant keywords** without keyword stuffing
5. **Set canonical URLs** to prevent duplicate content issues
6. **Add structured data** for rich snippets in search results

## Integration with Routing

For dynamic SEO based on routes, consider using route resolvers or guards:

```typescript
// In your route component
ngOnInit() {
  this.route.data.subscribe(data => {
    if (data.seo) {
      this.seoService.updateTitle(data.seo.title);
      this.seoService.updateDescription(data.seo.description);
    }
  });
}
```

## Build Commands

### Basic SEO
```bash
ng build
ng serve
```

### SSG (Static Site Generation)
```bash
npm run build:ssg  # Build and prerender static pages
npm run serve:ssg  # Serve static files
```

### SSR (Server-Side Rendering)
```bash
npm run build:ssr  # Build for server-side rendering
npm run serve:ssr  # Start SSR server
```

## Dependencies Added

### Basic SEO
- `@angular/platform-browser`: For Meta and Title services

### SSG
- `@angular/platform-server`: For server-side rendering support

### SSR
- `@nguniversal/express-engine`: Angular Universal Express engine
- `express`: Node.js web framework