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
 
 const imports = [
  "import { HttpClient, HttpClientModule } from '@angular/common/http';",
  "import { TranslateLoader, TranslateModule } from '@ngx-translate/core';",
  "import { TranslateHttpLoader } from '@ngx-translate/http-loader';",
  ""
 ];
 
 const lines = content.split('\n');
 const insertIndex = lines.findIndex(line => 
  line.trim().startsWith('import ') && line.includes('./')
 );
 
 if (insertIndex >= 0) {
  lines.splice(insertIndex, 0, ...imports);
  content = lines.join('\n');
 }
 
 content = addToI18nImportsArray(content, 'HttpClientModule');
 const translateModuleConfig = `TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: translateHttpLoaderFactory,
        deps: [HttpClient],
      },
    })`;
 content = addToI18nImportsArray(content, translateModuleConfig);
 
 const factoryFunction = `export function translateHttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http);
}

`;
 
 const ngModuleIndex = content.indexOf('@NgModule');
 if (ngModuleIndex > 0) {
  content = content.slice(0, ngModuleIndex) + factoryFunction + content.slice(ngModuleIndex);
 }
 
 host.overwrite(appModulePath, content);
}