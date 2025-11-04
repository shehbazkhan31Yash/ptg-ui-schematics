import { chain, noop, Rule, Tree, apply, url, applyTemplates, move, mergeWith, MergeStrategy } from "@angular-devkit/schematics";
import { strings } from '@angular-devkit/core';
import { ApplicationOptions } from "../types";
import { addDepsToPackageJson } from "../utils/package-utils";

function updateAngularJsonAssets(tree: Tree, assetPath: string): void {
  const angularJsonPath = 'angular.json';
  if (tree.exists(angularJsonPath)) {
    const angularJson = JSON.parse(tree.read(angularJsonPath)!.toString());
    const projectName = Object.keys(angularJson.projects)[0];
    if (projectName && angularJson.projects[projectName]) {
      const assets = angularJson.projects[projectName].architect.build.options.assets;
      if (assets && !assets.includes(assetPath)) {
        assets.push(assetPath);
      }
    }
    tree.overwrite(angularJsonPath, JSON.stringify(angularJson, null, 2));
  }
}

function updateIndexHtmlForSEO(): Rule {
 return (tree: Tree) => {
  // Index.html template is included in seo-files
  return tree;
 };
}



function addSSGArchitectConfig(angularJson: any, projectName: string): void {
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

export function setSEO(options: ApplicationOptions): Rule {
 if (!options.seoType || options.seoType === 'none') return noop;

 const seoType = options.seoType || 'basic';
 
 return chain([
  addSEODependencies(seoType),
  createSEOService(options),
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

function createSEOService(options: ApplicationOptions): Rule {
 return mergeWith(
  apply(url('./seo-files'), [
   applyTemplates({
    ...strings,
    ...options,
    appName: options.name,
    currentDate: new Date().toISOString().split('T')[0]
   }),
   move('.')
  ]),
  MergeStrategy.Overwrite
 );
}

function createSEOExampleComponent(): Rule {
 return noop; // Components are created via seo-files template
}

function updateAppModuleForSEO(): Rule {
 return (tree: Tree) => {
  // SeoService is provided in root, no need to import in app.module.ts
  return tree;
 };
}

function updateSharedModuleForSEO(): Rule {
 return noop; // SharedModule is handled by seo-files template
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


function createRobotsTxt(): Rule {
 return (tree: Tree) => {
  updateAngularJsonAssets(tree, 'src/robots.txt');
  return tree;
 };
}

function createXMLSitemap(): Rule {
 return (tree: Tree) => {
  updateAngularJsonAssets(tree, 'src/sitemap.xml');
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
    addSSGArchitectConfig(angularJson, projectName);
   }
   tree.overwrite(angularJsonPath, JSON.stringify(angularJson, null, 2));
  }
  

  
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