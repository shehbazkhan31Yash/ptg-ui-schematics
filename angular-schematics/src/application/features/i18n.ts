import { strings } from "@angular-devkit/core";
import { apply, applyTemplates, MergeStrategy, mergeWith, move, Rule, Tree, url } from "@angular-devkit/schematics";
import { ApplicationOptions } from "../types";
import { addToI18nImportsArray } from "../i18n-helpers";

export function addI18n(): Rule {
 return (host: Tree) => {
  const packageJsonPath = "package.json";
  if (host.exists(packageJsonPath)) {
   const packageJson = JSON.parse(host.read(packageJsonPath)!.toString());
   packageJson.dependencies = packageJson.dependencies || {};
   packageJson.dependencies["@ngx-translate/core"] = "^15.0.0";
   packageJson.dependencies["@ngx-translate/http-loader"] = "^8.0.0";
   host.overwrite(packageJsonPath, JSON.stringify(packageJson, null, 2));
  }
  
  updateAppModuleForI18n(host);
  return host;
 };
}

export function addI18nFiles(options: ApplicationOptions, appDir: string, isRootApp: boolean): Rule {
 return mergeWith(
  apply(url("./i18n-files"), [
   applyTemplates({
    utils: strings,
    ...options,
    appName: options.name,
    isRootApp,
   }),
   move(appDir),
  ]),
  MergeStrategy.Overwrite
 );
}

function updateAppModuleForI18n(host: Tree): void {
 const appModulePath = "src/app/app.module.ts";
 if (!host.exists(appModulePath)) return;

 let content = host.read(appModulePath)!.toString();
 
 // Check if imports already exist to avoid duplicates
 const needsHttpClient = !content.includes('HttpClient') && !content.includes('HttpClientModule');
 const needsTranslate = !content.includes('TranslateModule') && !content.includes('TranslateLoader');
 const needsHttpLoader = !content.includes('TranslateHttpLoader');
 
 if (needsHttpClient || needsTranslate || needsHttpLoader) {
  const imports = [];
  if (needsHttpClient) {
   imports.push("import { HttpClient, HttpClientModule } from '@angular/common/http';");
  }
  if (needsTranslate) {
   imports.push("import { TranslateLoader, TranslateModule } from '@ngx-translate/core';");
  }
  if (needsHttpLoader) {
   imports.push("import { TranslateHttpLoader } from '@ngx-translate/http-loader';");
  }
  imports.push("");
  
  const lines = content.split('\n');
  const insertIndex = lines.findIndex(line => 
   line.trim().startsWith('import ') && line.includes('./')
  );
  
  if (insertIndex >= 0) {
   lines.splice(insertIndex, 0, ...imports);
   content = lines.join('\n');
  }
 }
 
 // Only add to imports array if not already present
 const importsMatch = content.match(/imports:\s*\[([^\]]*?)\]/);
 const currentImports = importsMatch ? importsMatch[1] : '';
 if (!currentImports.includes('HttpClientModule')) {
  content = addToI18nImportsArray(content, 'HttpClientModule');
 }
 
 const translateModuleConfig = `TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: translateHttpLoaderFactory,
        deps: [HttpClient],
      },
    })`;
 if (!currentImports.includes('TranslateModule.forRoot')) {
  content = addToI18nImportsArray(content, translateModuleConfig);
 }
 
 // Only add factory function if not already present
 if (!content.includes('translateHttpLoaderFactory')) {
  const factoryFunction = `export function translateHttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http);
}

`;
  
  const ngModuleIndex = content.indexOf('@NgModule');
  if (ngModuleIndex > 0) {
   content = content.slice(0, ngModuleIndex) + factoryFunction + content.slice(ngModuleIndex);
  }
 }
 
 host.overwrite(appModulePath, content);
}