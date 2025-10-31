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
   "@nguniversal/express-engine": "^18.0.0",
   "express": "^4.18.0"
  });
 }
 
 if (seoType === 'ssg') {
  return addDepsToPackageJson({
   ...baseDeps,
   "@angular/platform-server": "^18.2.13"
  });
 }
 
 return addDepsToPackageJson(baseDeps);
}

function createSEOService(): Rule {
 return (tree: Tree) => {
  const seoServiceContent = `import { Injectable } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';

@Injectable({
  providedIn: 'root'
})
export class SeoService {
  constructor(
    private meta: Meta,
    private title: Title
  ) {}

  updateTitle(title: string): void {
    this.title.setTitle(title);
  }

  updateMetaTags(tags: { [key: string]: string }): void {
    Object.keys(tags).forEach(key => {
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
    Object.keys(ogTags).forEach(key => {
      this.meta.updateTag({ property: \`og:\${key}\`, content: ogTags[key] });
    });
  }

  updateTwitterTags(twitterTags: { [key: string]: string }): void {
    Object.keys(twitterTags).forEach(key => {
      this.meta.updateTag({ name: \`twitter:\${key}\`, content: twitterTags[key] });
    });
  }

  updateCanonicalUrl(url: string): void {
    let link: HTMLLinkElement = document.querySelector("link[rel='canonical']") as HTMLLinkElement;
    if (link) {
      link.setAttribute('href', url);
    } else {
      link = document.createElement('link');
      link.setAttribute('rel', 'canonical');
      link.setAttribute('href', url);
      document.head.appendChild(link);
    }
  }

  generateStructuredData(data: any): void {
    let script = document.querySelector('script[type="application/ld+json"]') as HTMLScriptElement;
    if (script) {
      script.innerHTML = JSON.stringify(data);
    } else {
      script = document.createElement('script');
      (script as HTMLScriptElement).type = 'application/ld+json';
      script.innerHTML = JSON.stringify(data);
      document.head.appendChild(script);
    }
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
    <div class="seo-example">
      <h2>SEO Example Component</h2>
      <p>This component demonstrates how to use the SEO service.</p>
      <button (click)="updateSEO()">Update SEO Tags</button>
    </div>
  \`,
  styles: [\`
    .seo-example {
      padding: 20px;
      border: 1px solid #ddd;
      border-radius: 8px;
      margin: 20px 0;
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
  \`]
})
export class SeoExampleComponent implements OnInit {

  constructor(private seoService: SeoService) { }

  ngOnInit(): void {
    this.seoService.updateTitle('Angular SEO Example');
    this.seoService.updateDescription('This is an example of SEO optimization in Angular');
    this.seoService.updateKeywords('angular, seo, optimization, example');
  }

  updateSEO(): void {
    this.seoService.updateTitle('Updated SEO Title');
    this.seoService.updateMetaTags({
      'description': 'Updated description for better SEO',
      'keywords': 'angular, seo, dynamic, update'
    });

    this.seoService.updateOGTags({
      'title': 'Updated SEO Title',
      'description': 'Updated description for better SEO',
      'type': 'website'
    });

    this.seoService.updateTwitterTags({
      'title': 'Updated SEO Title',
      'description': 'Updated description for better SEO'
    });

    const structuredData = {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": "Updated SEO Title",
      "description": "Updated description for better SEO"
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

function updateIndexHtmlForSEO(): Rule {
 return (tree: Tree) => {
  const indexPath = 'src/index.html';
  if (!tree.exists(indexPath)) return tree;
  
  let content = tree.read(indexPath)!.toString();
  
  const metaTags = `  <meta name="description" content="Generated Angular application with SEO optimization">
  <meta name="keywords" content="angular, typescript, web application">
  <meta name="author" content="PTG UI Schematics">
  <meta name="robots" content="index, follow">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  
  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="website">
  <meta property="og:title" content="Angular Application">
  <meta property="og:description" content="Generated Angular application with SEO optimization">
  
  <!-- Twitter -->
  <meta property="twitter:card" content="summary_large_image">
  <meta property="twitter:title" content="Angular Application">
  <meta property="twitter:description" content="Generated Angular application with SEO optimization">
  
  <!-- Canonical URL -->
  <link rel="canonical" href="/">`;
  
  const headEndIndex = content.indexOf('</head>');
  if (headEndIndex > 0) {
   content = content.slice(0, headEndIndex) + metaTags + '\n' + content.slice(headEndIndex);
  }
  
  tree.overwrite(indexPath, content);
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
      "outputPath": `dist/${projectName}/server`,
      "main": "server.ts",
      "tsConfig": "tsconfig.server.json"
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
  
  const serverContent = `import 'zone.js/dist/zone-node';
import { ngExpressEngine } from '@nguniversal/express-engine';
import express from 'express';
import { join } from 'path';
import { AppServerModule } from './src/main.server';
import { APP_BASE_HREF } from '@angular/common';
import { existsSync } from 'fs';

const app = express();
const PORT = process.env['PORT'] || 4000;
const DIST_FOLDER = join(process.cwd(), 'dist');

app.engine('html', ngExpressEngine({
  bootstrap: AppServerModule,
}));

app.set('view engine', 'html');
app.set('views', DIST_FOLDER);

app.get('*.*', express.static(DIST_FOLDER));

app.get('*', (req, res) => {
  res.render('index', { req, providers: [{ provide: APP_BASE_HREF, useValue: req.baseUrl }] });
});

app.listen(PORT, () => {
  console.log(\`Server ready at http://localhost:\${PORT}\`);
});
`;
  
  tree.create('server.ts', serverContent);
  
  const tsConfigServer = {
   "extends": "./tsconfig.json",
   "compilerOptions": {
    "outDir": "./out-tsc/server",
    "target": "es2022",
    "types": ["node"]
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
   packageJson.scripts['serve:ssr'] = 'node dist/server';
   tree.overwrite(packageJsonPath, JSON.stringify(packageJson, null, 2));
  }
  
  return tree;
 };
}