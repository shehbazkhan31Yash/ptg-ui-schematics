import { chain, noop, Rule, Tree } from "@angular-devkit/schematics";
import { ApplicationOptions } from "../types";
import { addDepsToPackageJson } from "../utils/package-utils";

export function setSEO(options: ApplicationOptions): Rule {
 if (!options.seo) return noop;

 const seoType = options.seoType || 'basic';
 
 return chain([
  addSEODependencies(seoType),
  createSEOService(),
  createSEOExampleComponent(),
  updateAppModuleForSEO(),
  updateSharedModuleForSEO(),
  updateIndexHtmlForSEO(),
  ensureAssetsInBuild(),
  createRobotsTxt(),
  createXMLSitemap(),
  seoType === 'ssg' ? addSSGSupport() : noop,
  seoType === 'ssr' ? addSSRSupport() : noop,
 ]);
}

function addSEODependencies(seoType: string): Rule {
 const baseDeps = {
  "@angular/platform-browser": "^18.2.13"
 };
 
 if (seoType === 'ssr') {
  return addDepsToPackageJson({
   ...baseDeps,
   "@angular/ssr": "^18.2.13",
   "express": "^4.18.0"
  });
 }
 
 if (seoType === 'ssg') {
  return addDepsToPackageJson({
   ...baseDeps,
   "@angular/ssr": "^18.2.13"
  });
 }
 
 return addDepsToPackageJson(baseDeps);
}

function createSEOService(): Rule {
 return (tree: Tree) => {
  const seoServiceContent = `import { Injectable } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class SeoService {
  constructor(
    private meta: Meta,
    private title: Title,
    private router: Router
  ) {
    // Update canonical URL on route changes
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.updateCanonicalUrl(event.url);
      });
  }

  updateTitle(title: string): void {
    this.title.setTitle(title);
  }

  updateMetaTags(tags: { [key: string]: string }): void {
    Object.keys(tags).forEach((key) => {
      this.meta.updateTag({ name: key, content: tags[key] });
    });
  }

  updateDescription(description: string): void {
    this.meta.updateTag({ name: 'description', content: description });
  }

  updateKeywords(keywords: string): void {
    this.meta.updateTag({ name: 'keywords', content: keywords });
  }

  updateOGTags(ogTags: { [key: string]: string }): void {
    Object.keys(ogTags).forEach((key) => {
      this.meta.updateTag({ property: \`og:\${key}\`, content: ogTags[key] });
    });
  }

  updateTwitterTags(twitterTags: { [key: string]: string }): void {
    Object.keys(twitterTags).forEach((key) => {
      this.meta.updateTag({ name: \`twitter:\${key}\`, content: twitterTags[key] });
    });
  }

  updateCanonicalUrl(url: string): void {
    // Ensure URL is absolute and properly formatted
    let absoluteUrl: string;
    if (url.startsWith('http')) {
      absoluteUrl = url;
    } else {
      // Remove leading slash if present to avoid double slashes
      const cleanUrl = url.startsWith('/') ? url : '/' + url;
      absoluteUrl = \`\${window.location.origin}\${cleanUrl}\`;
    }
    
    let link: HTMLLinkElement = document.querySelector(
      "link[rel='canonical']"
    ) as HTMLLinkElement;
    if (link) {
      link.setAttribute('href', absoluteUrl);
    } else {
      link = document.createElement('link');
      link.setAttribute('rel', 'canonical');
      link.setAttribute('href', absoluteUrl);
      document.head.appendChild(link);
    }
  }

  generateStructuredData(data: any): void {
    // Remove existing dynamic structured data
    const existingScript = document.querySelector(
      'script[type="application/ld+json"][data-seo="dynamic"]'
    ) as HTMLScriptElement;
    if (existingScript) {
      existingScript.remove();
    }
    
    // Add new structured data
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.setAttribute('data-seo', 'dynamic');
    script.innerHTML = JSON.stringify(data);
    document.head.appendChild(script);
  }

  updatePageSEO(config: {
    title?: string;
    description?: string;
    keywords?: string;
    canonicalUrl?: string;
    structuredData?: any;
    ogTags?: { [key: string]: string };
    twitterTags?: { [key: string]: string };
  }): void {
    if (config.title) this.updateTitle(config.title);
    if (config.description) this.updateDescription(config.description);
    if (config.keywords) this.updateKeywords(config.keywords);
    if (config.canonicalUrl) this.updateCanonicalUrl(config.canonicalUrl);
    if (config.ogTags) this.updateOGTags(config.ogTags);
    if (config.twitterTags) this.updateTwitterTags(config.twitterTags);
    if (config.structuredData) this.generateStructuredData(config.structuredData);
  }
}
`;

  const seoServicePath = 'src/app/core/services/seo.service.ts';
  if (!tree.exists('src/app/core/services')) {
   tree.create('src/app/core/services/.gitkeep', '');
  }
  tree.create(seoServicePath, seoServiceContent);
  return tree;
 };
}

function createSEOExampleComponent(): Rule {
 return (tree: Tree) => {
  const componentContent = `import { Component, OnInit } from '@angular/core';
import { SeoService } from '../../core/services/seo.service';

@Component({
  selector: 'app-seo-example',
  template: \`
    <article class="seo-example" itemscope itemtype="http://schema.org/Article">
      <img src="assets/images/YashLogo.jpg" alt="SEO optimization example - Angular application logo" class="seo-image" itemprop="image" />
      <h2 itemprop="headline">SEO Example Component</h2>
      <p itemprop="description">This component demonstrates how to use the SEO service for dynamic meta tag management and structured data implementation.</p>
      <div class="author" itemscope itemtype="http://schema.org/Person">
        <span itemprop="name">PTG UI Schematics</span>
      </div>
      <button (click)="updateSEO()" type="button">Update SEO Tags</button>
    </article>
  \`,
  styles: [
    \`
      .seo-example {
        padding: 20px;
        border: 1px solid #ddd;
        border-radius: 8px;
        margin: 20px 0;
      }

      .seo-image {
        width: 60px;
        height: 60px;
        margin-bottom: 15px;
        display: block;
      }

      button {
        background-color: #007bff;
        color: white;
        border: none;
        padding: 10px 20px;
        border-radius: 4px;
        cursor: pointer;
      }

      button:hover {
        background-color: #0056b3;
      }
    \`,
  ],
})
export class SeoExampleComponent implements OnInit {
  constructor(private seoService: SeoService) {}

  ngOnInit(): void {
    // Use the new updatePageSEO method for comprehensive SEO setup
    this.seoService.updatePageSEO({
      title: 'Angular SEO Example',
      description: 'This is an example of SEO optimization in Angular',
      keywords: 'angular, seo, optimization, example',
      canonicalUrl: window.location.pathname,
      structuredData: {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: 'Angular SEO Example',
        description: 'This is an example of SEO optimization in Angular',
        url: window.location.href,
        isPartOf: {
          '@type': 'WebSite',
          name: 'Angular Application',
          url: window.location.origin
        }
      },
      ogTags: {
        title: 'Angular SEO Example',
        description: 'This is an example of SEO optimization in Angular',
        type: 'website',
        url: window.location.href
      },
      twitterTags: {
        card: 'summary',
        title: 'Angular SEO Example',
        description: 'This is an example of SEO optimization in Angular'
      }
    });
  }

  updateSEO(): void {
    this.seoService.updateTitle('Updated SEO Title');
    this.seoService.updateMetaTags({
      description: 'Updated description for better SEO',
      keywords: 'angular, seo, dynamic, update',
    });

    this.seoService.updateOGTags({
      title: 'Updated SEO Title',
      description: 'Updated description for better SEO',
      type: 'website',
    });

    this.seoService.updateTwitterTags({
      title: 'Updated SEO Title',
      description: 'Updated description for better SEO',
    });

    const structuredData = {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: 'Updated SEO Title',
      description: 'Updated description for better SEO',
    };
    this.seoService.generateStructuredData(structuredData);

    console.log('SEO tags updated successfully!');
  }
}
`;

  const componentPath = 'src/app/shared/components/seo-example.component.ts';
  tree.create(componentPath, componentContent);
  return tree;
 };
}

function updateAppModuleForSEO(): Rule {
 return (tree: Tree) => {
  // SeoService is provided in root, no need to import in app.module.ts
  return tree;
 };
}

function updateSharedModuleForSEO(): Rule {
 return (tree: Tree) => {
  const sharedModulePath = 'src/app/shared/shared.module.ts';
  if (!tree.exists(sharedModulePath)) return tree;
  
  let content = tree.read(sharedModulePath)!.toString();
  
  if (!content.includes('SeoExampleComponent')) {
   const importLine = "import { SeoExampleComponent } from './components/seo-example.component';";
   const lines = content.split('\n');
   let lastImportIndex = -1;
   for (let i = lines.length - 1; i >= 0; i--) {
    if (lines[i].trim().startsWith('import ')) {
     lastImportIndex = i;
     break;
    }
   }
   
   if (lastImportIndex >= 0) {
    lines.splice(lastImportIndex + 1, 0, importLine);
    content = lines.join('\n');
   } else {
    // If no imports found, add after the first line
    lines.splice(1, 0, importLine);
    content = lines.join('\n');
   }
   
   content = content.replace(
    /declarations:\s*\[([^\]]*)\]/,
    (match, p1) => {
      const trimmed = p1.trim();
      return trimmed ? `declarations: [${trimmed}, SeoExampleComponent]` : 'declarations: [SeoExampleComponent]';
    }
   );
   content = content.replace(
    /exports:\s*\[([^\]]*)\]/,
    (match, p1) => {
      const trimmed = p1.trim();
      return trimmed ? `exports: [${trimmed}, SeoExampleComponent]` : 'exports: [CommonModule, FormsModule, SeoExampleComponent]';
    }
   );
  }
  
  tree.overwrite(sharedModulePath, content);
  return tree;
 };
}

function ensureAssetsInBuild(): Rule {
 return (tree: Tree) => {
  const angularJsonPath = 'angular.json';
  if (!tree.exists(angularJsonPath)) return tree;
  
  const angularJson = JSON.parse(tree.read(angularJsonPath)!.toString());
  const projectName = Object.keys(angularJson.projects)[0];
  
  if (projectName && angularJson.projects[projectName]) {
   const buildOptions = angularJson.projects[projectName].architect.build.options;
   if (buildOptions.assets) {
    const assetsFolder = 'src/assets';
    if (!buildOptions.assets.includes(assetsFolder)) {
     buildOptions.assets.push(assetsFolder);
    }
   }
  }
  
  tree.overwrite(angularJsonPath, JSON.stringify(angularJson, null, 2));
  return tree;
 };
}

function updateIndexHtmlForSEO(): Rule {
 return (tree: Tree) => {
  const indexPath = 'src/index.html';
  if (!tree.exists(indexPath)) return tree;
  
  let content = tree.read(indexPath)!.toString();
  
  const metaTags = `  <meta
    name="description"
    content="Modern Angular application built with TypeScript, featuring comprehensive SEO optimization, responsive design, and enterprise-ready architecture. Includes advanced routing, state management, and performance optimizations for scalable web development."
  />
  <meta name="keywords" content="angular, typescript, web application" />
  <meta name="author" content="PTG UI Schematics" />
  <meta name="robots" content="index, follow" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />

  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="website" />
  <meta property="og:title" content="Angular Application" />
  <meta
    property="og:description"
    content="Modern Angular application built with TypeScript, featuring comprehensive SEO optimization, responsive design, and enterprise-ready architecture. Includes advanced routing, state management, and performance optimizations for scalable web development."
  />

  <!-- Twitter -->
  <meta property="twitter:card" content="summary_large_image" />
  <meta property="twitter:title" content="Angular Application" />
  <meta
    property="twitter:description"
    content="Modern Angular application built with TypeScript, featuring comprehensive SEO optimization, responsive design, and enterprise-ready architecture. Includes advanced routing, state management, and performance optimizations for scalable web development."
  />

  <!-- Canonical URL - will be updated by SEO service -->
  <link rel="canonical" href="" />
  
  <!-- Base Schema.org structured data -->
  <script type="application/ld+json" data-seo="base">
  {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Angular Application",
    "description": "Generated Angular application with SEO optimization",
    "applicationCategory": "WebApplication",
    "operatingSystem": "Any"
  }
  </script>`;
  
  const headEndIndex = content.indexOf('</head>');
  if (headEndIndex > 0) {
   content = content.slice(0, headEndIndex) + metaTags + '\n' + content.slice(headEndIndex);
  }
  
  tree.overwrite(indexPath, content);
  return tree;
 };
}

function createRobotsTxt(): Rule {
 return (tree: Tree) => {
  const robotsContent = `User-agent: *\nAllow: /\n\nSitemap: /sitemap.xml`;
  tree.create('src/robots.txt', robotsContent);
  
  const angularJsonPath = 'angular.json';
  if (tree.exists(angularJsonPath)) {
   const angularJson = JSON.parse(tree.read(angularJsonPath)!.toString());
   const projectName = Object.keys(angularJson.projects)[0];
   if (projectName && angularJson.projects[projectName]) {
    const assets = angularJson.projects[projectName].architect.build.options.assets;
    if (assets && !assets.includes('src/robots.txt')) {
     assets.push('src/robots.txt');
    }
   }
   tree.overwrite(angularJsonPath, JSON.stringify(angularJson, null, 2));
  }
  
  return tree;
 };
}

function createXMLSitemap(): Rule {
 return (tree: Tree) => {
  const sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url>\n    <loc>/</loc>\n    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>1.0</priority>\n  </url>\n</urlset>`;
  tree.create('src/sitemap.xml', sitemapContent);
  
  const angularJsonPath = 'angular.json';
  if (tree.exists(angularJsonPath)) {
   const angularJson = JSON.parse(tree.read(angularJsonPath)!.toString());
   const projectName = Object.keys(angularJson.projects)[0];
   if (projectName && angularJson.projects[projectName]) {
    const assets = angularJson.projects[projectName].architect.build.options.assets;
    if (assets && !assets.includes('src/sitemap.xml')) {
     assets.push('src/sitemap.xml');
    }
   }
   tree.overwrite(angularJsonPath, JSON.stringify(angularJson, null, 2));
  }
  
  return tree;
 };
}

function addSSGSupport(): Rule {
 return (tree: Tree) => {
  const angularJsonPath = 'angular.json';
  if (tree.exists(angularJsonPath)) {
   const angularJson = JSON.parse(tree.read(angularJsonPath)!.toString());
   
   const projectName = Object.keys(angularJson.projects)[0];
   if (projectName && angularJson.projects[projectName]) {
    angularJson.projects[projectName].architect.prerender = {
     "builder": "@angular-devkit/build-angular:prerender",
     "options": {
      "routes": ["/"]
     },
     "configurations": {
      "production": {
       "browserTarget": `${projectName}:build:production`,
       "serverTarget": `${projectName}:server:production`
      }
     }
    };
    
    angularJson.projects[projectName].architect.server = {
     "builder": "@angular-devkit/build-angular:server",
     "options": {
      "outputPath": `dist/${projectName}`,
      "main": "server.ts",
      "tsConfig": "tsconfig.server.json",
      "externalDependencies": ["express"]
     },
     "configurations": {
      "production": {
       "outputHashing": "media",
       "fileReplacements": [{
        "replace": "src/environments/environment.ts",
        "with": "src/environments/environment.prod.ts"
       }]
      }
     }
    };
   }
   
   tree.overwrite(angularJsonPath, JSON.stringify(angularJson, null, 2));
  }
  
  const serverContent = `import { APP_BASE_HREF } from '@angular/common';
import { CommonEngine } from '@angular/ssr';
import express from 'express';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';
import bootstrap from './src/main.server';

const server = express();
const serverDistFolder = dirname(fileURLToPath(import.meta.url));
const browserDistFolder = resolve(serverDistFolder, '../browser');
const indexHtml = join(serverDistFolder, 'index.server.html');

const commonEngine = new CommonEngine();

server.set('view engine', 'html');
server.set('views', browserDistFolder);

server.get('*.*', express.static(browserDistFolder, {
  maxAge: '1y'
}));

server.get('*', (req, res, next) => {
  const { protocol, originalUrl, baseUrl, headers } = req;

  commonEngine
    .render({
      bootstrap,
      documentFilePath: indexHtml,
      url: \`\${protocol}://\${headers.host}\${originalUrl}\`,
      publicPath: browserDistFolder,
      providers: [{ provide: APP_BASE_HREF, useValue: baseUrl }],
    })
    .then((html) => res.send(html))
    .catch((err) => next(err));
});

const port = process.env['PORT'] || 4000;

server.listen(port, () => {
  console.log(\`Node Express server listening on http://localhost:\${port}\`);
});
`;
  
  tree.create('server.ts', serverContent);
  
  // Create main.server.ts
  const mainServerContent = `import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { config } from './app/app.config.server';

const bootstrap = () => bootstrapApplication(AppComponent, config);

export default bootstrap;`;
  
  tree.create('src/main.server.ts', mainServerContent);
  
  // Create app.config.server.ts
  const appConfigServerContent = `import { mergeApplicationConfig, ApplicationConfig } from '@angular/core';
import { provideServerRendering } from '@angular/platform-server';
import { appConfig } from './app.config';

const serverConfig: ApplicationConfig = {
  providers: [
    provideServerRendering()
  ]
};

export const config = mergeApplicationConfig(appConfig, serverConfig);`;
  
  tree.create('src/app/app.config.server.ts', appConfigServerContent);
  
  const tsConfigServer = {
   "extends": "./tsconfig.json",
   "compilerOptions": {
    "outDir": "./out-tsc/server",
    "target": "es2022",
    "types": ["node"],
    "module": "ESNext",
    "moduleResolution": "bundler"
   },
   "files": ["src/main.server.ts", "server.ts"]
  };
  
  tree.create('tsconfig.server.json', JSON.stringify(tsConfigServer, null, 2));
  
  const packageJsonPath = 'package.json';
  if (tree.exists(packageJsonPath)) {
   const packageJson = JSON.parse(tree.read(packageJsonPath)!.toString());
   packageJson.scripts = packageJson.scripts || {};
   const projectName = Object.keys(JSON.parse(tree.read('angular.json')!.toString()).projects)[0];
   packageJson.scripts['build:ssg'] = `ng build && ng run ${projectName}:prerender`;
   packageJson.scripts['serve:ssg'] = 'cd dist && http-server';
   tree.overwrite(packageJsonPath, JSON.stringify(packageJson, null, 2));
  }
  
  return tree;
 };
}

function addSSRSupport(): Rule {
 return (tree: Tree) => {
  const packageJsonPath = 'package.json';
  if (tree.exists(packageJsonPath)) {
   const packageJson = JSON.parse(tree.read(packageJsonPath)!.toString());
   packageJson.scripts = packageJson.scripts || {};
   const projectName = Object.keys(JSON.parse(tree.read('angular.json')!.toString()).projects)[0];
   packageJson.scripts['build:ssr'] = `ng build && ng run ${projectName}:server`;
   packageJson.scripts['serve:ssr'] = `node dist/${projectName}/server/server.mjs`;
   tree.overwrite(packageJsonPath, JSON.stringify(packageJson, null, 2));
  }
  
  return tree;
 };
}