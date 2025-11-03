import { strings } from "@angular-devkit/core";
import {
 apply,
 applyTemplates,
 chain,
 externalSchematic,
 MergeStrategy,
 mergeWith,
 move,
 noop,
 Rule,
 SchematicContext,
 Tree,
 url,
} from "@angular-devkit/schematics";

import { getWorkspace } from "@schematics/angular/utility/workspace";
import { join, normalize } from "path";
import { addImportToAppModule } from "../utils/utils";

// Types
import { ApplicationOptions } from "./types";

// Utils
import { deleteKeys } from "./utils/package-utils";

// Features
import { setFramework } from "./features/framework";
import { setNGRX } from "./features/ngrx";
import { setLinting } from "./features/linting";
import { setHusky } from "./features/husky";
import { addI18n, addI18nFiles } from "./features/i18n";
import { setSEO } from "./features/seo";

export function application(options: ApplicationOptions): Rule {
 return async (host: Tree, context: SchematicContext) => {
  const workspace = await getWorkspace(host);
  const newProjectRoot = (workspace.extensions.newProjectRoot as string | undefined) ?? "";
  const isRootApp = options.projectRoot !== undefined;
  const appDir = isRootApp
   ? normalize(options.projectRoot || "")
   : join(normalize(newProjectRoot), strings.dasherize(options.name));
  
  options.appDir = appDir;
  
  // Handle conditional prompts
  const inquirer = require('inquirer');
  
  // Handle conditional ESLint style prompt
  if (options.enableLinting && !options.lintingStyle) {
    const lintAnswer = await inquirer.prompt([
      {
        name: 'lintingStyle',
        message: 'Which ESLint configuration would you like to use?',
        type: 'list',
        choices: [
          {
            value: 'airbnb',
            name: 'Airbnb - Strict and comprehensive rules'
          },
          {
            value: 'standard',
            name: 'Standard - Popular JavaScript style guide'
          },
          {
            value: 'custom',
            name: 'Custom - Basic TypeScript ESLint setup'
          }
        ]
      }
    ]);
    options.lintingStyle = lintAnswer.lintingStyle;
  }
  
  // Handle conditional SEO type prompt
  if (options.seo && !options.seoType) {
    const seoAnswer = await inquirer.prompt([
      {
        name: 'seoType',
        message: 'Which SEO implementation would you like?',
        type: 'list',
        choices: [
          {
            value: 'basic',
            name: 'Basic - Meta tags and SEO service only'
          },
          {
            value: 'ssg',
            name: 'SSG - Static Site Generation with Angular Universal prerendering'
          },
          {
            value: 'ssr',
            name: 'SSR - Server-Side Rendering with Angular Universal'
          }
        ]
      }
    ]);
    options.seoType = seoAnswer.seoType;
  }
  
  const originalOptions = JSON.parse(JSON.stringify(options));
  const keysToDelete = ["framework", "ngrx", "i18n", "appDir", "enableLinting", "lintingStyle", "husky", "seo", "seoType"];
  const schemaCompatibleOptions = deleteKeys(options, keysToDelete);

  return chain([
   // Create base Angular application
   externalSchematic("@schematics/angular", "application", {
    ...schemaCompatibleOptions,
    style: "scss",
    skipInstall: true,
    strict: true,
    standalone: false,
   }),
   
   // Add core modules
   addImportToAppModule("SharedModule", "./shared/shared.module"),
   addImportToAppModule("CoreModule", "./core/core.module"),
   
   // Apply base templates
   mergeWith(
    apply(url("./files"), [
     applyTemplates({
      utils: strings,
      ...originalOptions,
      appName: originalOptions.name,
      isRootApp,
     }),
     move(appDir),
    ]),
    MergeStrategy.Overwrite
   ),
   
   // Configure optional features
   originalOptions.i18n ? addI18n() : noop,
   originalOptions.i18n ? addI18nFiles(originalOptions, appDir, isRootApp) : noop,
   setFramework(originalOptions, isRootApp, appDir, originalOptions.i18n),
   setNGRX(originalOptions),
   setLinting(originalOptions),
   setHusky(originalOptions),
   setSEO(originalOptions),
  ]);
 };
}