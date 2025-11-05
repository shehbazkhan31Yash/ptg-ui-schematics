import { strings } from "@angular-devkit/core";
import { apply, applyTemplates, chain, MergeStrategy, mergeWith, move, noop, Rule, Tree, url } from "@angular-devkit/schematics";
import { ApplicationOptions } from "../types";
import { addDepsToPackageJson } from "../utils/package-utils";

export function setFramework(
 options: ApplicationOptions,
 isRootApp: boolean,
 appDir: string,
 isI18nSelected: boolean
): Rule {
 const { framework } = options;
 
 switch (framework) {
  case "material":
   return chain([addMaterialToPackageJson(), updateStyles(options)]);
  case "bootstrap":
   return chain([addBootstrapToPackageJson(), updateStyles(options)]);
  case "tailwind":
   return chain([
    addTailwindToPackageJson(),
    updateStyles(options),
    createTailwindConfig(options, isRootApp, appDir, isI18nSelected),
   ]);
  default:
   return noop;
 }
}

function addMaterialToPackageJson(): Rule {
 return addDepsToPackageJson({
  "@angular/material": "^18.2.13",
  "@angular/cdk": "^18.2.13",
 }, {}, false);
}

function addBootstrapToPackageJson(): Rule {
 return addDepsToPackageJson({ bootstrap: "^5.3.0" }, {}, false);
}

function addTailwindToPackageJson(): Rule {
 return addDepsToPackageJson({
  tailwindcss: "^3.4.0",
  autoprefixer: "^10.4.0",
  postcss: "^8.4.0",
 }, {}, false);
}

function updateStyles(options: ApplicationOptions): Rule {
 return (host: Tree) => {
  let content = `@import './app/app.theme';\n\n@include app-theme();\n`;
  
  switch (options.framework) {
   case "material":
    content = `@import "@angular/material/prebuilt-themes/indigo-pink.css";\n\nbody {\n  height: 100%;\n  margin: 0;\n  font-family: Roboto, "Helvetica Neue", sans-serif;\n}\n\n${content}`;
    break;
   case "bootstrap":
    content = `@import "bootstrap/dist/css/bootstrap.css";\n\n${content}`;
    break;
   case "tailwind":
    content = `@import 'tailwindcss/base';\n@import 'tailwindcss/components';\n@import 'tailwindcss/utilities';\n\n${content}`;
    break;
  }
  
  host.overwrite(`src/styles.scss`, content);
  return host;
 };
}

function createTailwindConfig(
 options: ApplicationOptions,
 isRootApp: boolean,
 appDir: string,
 isI18nSelected: boolean
): Rule {
 const inputUrl = isI18nSelected
  ? "./tailwind-files/tailwind+i18n-files/"
  : "./tailwind-files/tailwind-i18n-files/";
  
 return mergeWith(
  apply(url(inputUrl), [
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