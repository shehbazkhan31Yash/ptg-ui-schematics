# SEO Feature Architecture

## Component Hierarchy

```
main.tsx (Entry Point)
    │
    ├── HelmetProvider (when SEO enabled)
    │   │
    │   └── Router (when routing enabled)
    │       │
    │       └── App Component
    │           │
    │           ├── SEO Component (Dynamic Meta Tags)
    │           │   ├── Title
    │           │   ├── Meta Description
    │           │   ├── Keywords
    │           │   ├── Open Graph Tags
    │           │   └── Twitter Cards
    │           │
    │           ├── App Header
    │           ├── Navigation (if routing)
    │           └── Content Routes
```

## Data Flow

```
User Input (CLI)
    │
    ├─> SEO Enabled? (Yes/No)
    │
    ├─> Yes
    │   │
    │   ├─> Install Dependencies
    │   │   ├── react-helmet-async
    │   │   └── @types/react-helmet
    │   │
    │   ├─> Generate Files
    │   │   ├── components/SEO.tsx
    │   │   ├── utils/seo.ts
    │   │   ├── utils/sitemap.config.ts
    │   │   └── public/robots.txt
    │   │
    │   ├─> Update Templates
    │   │   ├── index.html (add base meta tags)
    │   │   ├── main.tsx (add HelmetProvider)
    │   │   └── app.tsx (add SEO component)
    │   │
    │   └─> Application Ready
    │
    └─> No
        │
        └─> Skip SEO Setup
```

## File Interaction

```
┌─────────────────────────────────────────────────────────┐
│                    Application Layer                     │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  ┌─────────────┐         ┌──────────────┐              │
│  │   app.tsx   │────────>│ SEO.tsx      │              │
│  │             │  uses   │ (Component)  │              │
│  └─────────────┘         └──────────────┘              │
│         │                       │                        │
│         │                       │ uses                  │
│         │                       ▼                        │
│         │                ┌──────────────┐              │
│         │                │  seo.ts      │              │
│         │                │  (Utilities) │              │
│         │                └──────────────┘              │
│         │                       │                        │
│         └───────────────────────┴──> Page Meta Data    │
│                                                           │
└─────────────────────────────────────────────────────────┘
                              │
                              │ outputs
                              ▼
┌─────────────────────────────────────────────────────────┐
│                      Document Head                       │
├─────────────────────────────────────────────────────────┤
│  <title>Page Title | App Name</title>                   │
│  <meta name="description" content="...">                │
│  <meta property="og:title" content="...">               │
│  <meta property="og:image" content="...">               │
│  <meta name="twitter:card" content="...">               │
│  <link rel="canonical" href="...">                      │
└─────────────────────────────────────────────────────────┘
                              │
                              │ consumed by
                              ▼
┌─────────────────────────────────────────────────────────┐
│                  Search Engines & Social                │
├─────────────────────────────────────────────────────────┤
│  ✓ Google, Bing, DuckDuckGo (Search Ranking)           │
│  ✓ Facebook, LinkedIn (Social Sharing Previews)        │
│  ✓ Twitter (Twitter Card Previews)                     │
│  ✓ Slack, Discord (Link Unfurling)                     │
└─────────────────────────────────────────────────────────┘
```

## SEO Component API

```typescript
interface SEOProps {
  // Basic Meta
  title?: string              // Page title
  description?: string        // Meta description
  keywords?: string          // Meta keywords
  author?: string            // Content author
  
  // Social Media
  image?: string             // OG image URL
  url?: string               // Canonical URL
  type?: string              // OG type (website, article)
  
  // Twitter Specific
  twitterCard?: string       // Twitter card type
}

// Usage Example
<SEO
  title="About Us"
  description="Learn about our company mission"
  keywords="company, mission, about"
  image="/images/about-og.png"
  url="https://example.com/about"
  type="website"
  twitterCard="summary_large_image"
/>
```

## Integration Points

### 1. Build Time
```
CLI Prompt → Template Generation → File Creation
```

### 2. Runtime
```
App Load → HelmetProvider Init → SEO Component Render → Meta Tags Update
```

### 3. Route Changes (with React Router)
```
Route Change → Component Mount → SEO Component Update → Meta Tags Refresh
```

## Feature Dependencies

```
SEO Feature
    │
    ├─> Required
    │   ├── react-helmet-async (runtime)
    │   └── @types/react-helmet (dev)
    │
    ├─> Recommended
    │   └── react-router-dom (for per-page SEO)
    │
    └─> Optional
        ├── i18next (for multilingual SEO)
        └── State Management (for dynamic content)
```

## Generated File Dependencies

```
components/SEO.tsx
    ├─> Depends on: react-helmet-async
    └─> Used by: app.tsx, page components

utils/seo.ts
    ├─> Depends on: None (pure utilities)
    └─> Used by: components/SEO.tsx, pages

utils/sitemap.config.ts
    ├─> Depends on: None (configuration)
    └─> Used by: Build scripts, documentation

public/robots.txt
    ├─> Depends on: None (static file)
    └─> Used by: Search engine crawlers
```

## Performance Considerations

### Bundle Impact
- react-helmet-async: ~14 KB (minified)
- @types/react-helmet: 0 KB (dev only)
- Generated components: ~8 KB (unminified)
- **Total Runtime Impact**: ~14 KB

### Runtime Performance
- Async rendering (non-blocking)
- Efficient DOM updates
- Minimal re-renders
- No layout thrashing

### Best Practices Implemented
✓ Lazy loading compatible
✓ SSR/SSG ready
✓ Code splitting friendly
✓ Tree-shaking optimized

## Testing Strategy

```
Unit Tests
    ├── SEO Component rendering
    ├── Utility function outputs
    └── Props validation

Integration Tests
    ├── HelmetProvider integration
    ├── Route-based meta updates
    └── Dynamic content rendering

E2E Tests
    ├── Meta tags in browser
    ├── Social media previews
    └── Search engine validation

Manual Testing
    ├── Facebook Sharing Debugger
    ├── Twitter Card Validator
    ├── Google Search Console
    └── Lighthouse SEO Audit
```

---

## Quick Reference

### Enable SEO in New Project
```bash
ptg-ui-cli
# Select React
# Answer "Yes" to "Would you like to enable SEO features?"
```

### Use SEO Component
```tsx
import { SEO } from './components/SEO';

<SEO title="My Page" description="Page description" />
```

### Update Default Meta
```typescript
// src/app/utils/seo.ts
export const defaultMeta = {
  title: 'Your App',
  description: 'Your description',
  // ...
};
```

### Test SEO
1. Open DevTools → Elements → `<head>`
2. Verify meta tags present
3. Use Facebook/Twitter debuggers
4. Run Lighthouse audit
