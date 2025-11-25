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
import { addImportToAppModule, ensureAssetsInBuild } from "../utils/utils";

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
import { setAuthentication } from "./features/authentication";
import { setFormBuilder } from "./features/forms";
import { setCRUD, updateSharedModuleForCrud } from "./features/crud";

// CI/CD Configuration
function addCIConfigToProject(options: ApplicationOptions): Rule {
  return (host: Tree, context: SchematicContext) => {
    if (!options.ci) {
      return host;
    }

    context.logger.info('🔄 Adding CI/CD configuration...');

    return mergeWith(
      apply(url('./ci'), [
        applyTemplates({
          ...options,
        }),
        move('./'),
      ]),
      MergeStrategy.Overwrite
    );
  };
}

export function application(options: ApplicationOptions): Rule {
 return async (host: Tree, context: SchematicContext) => {
  const workspace = await getWorkspace(host);
  const newProjectRoot = (workspace.extensions.newProjectRoot as string | undefined) ?? "";
  const isRootApp = options.projectRoot !== undefined;
  const appDir = isRootApp
   ? normalize(options.projectRoot || "")
   : join(normalize(newProjectRoot), strings.dasherize(options.name));
  
  options.appDir = appDir;
  
  // Convert single prompts to boolean flags for feature functions
  options.enableLinting = options.lintingStyle !== 'none';
  options.seo = options.seoType !== 'none';
  
  const originalOptions = JSON.parse(JSON.stringify(options));
  const keysToDelete = ["framework", "ngrx", "i18n", "appDir", "enableLinting", "lintingStyle", "husky", "seo", "seoType", "authentication", "ci", "formBuilder", "crud"];
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
   
   // Ensure assets are always included
   ensureAssetsInBuild(),
   
   // Configure optional features
   originalOptions.i18n ? addI18n() : noop,
   originalOptions.i18n ? addI18nFiles(originalOptions, appDir, isRootApp) : noop,
   setFramework(originalOptions, isRootApp, appDir, originalOptions.i18n),
   setNGRX(originalOptions),
   setLinting(originalOptions),
   setHusky(originalOptions),
   setSEO(originalOptions),
   setAuthentication(originalOptions),
   addCIConfigToProject(originalOptions),
   setFormBuilder(originalOptions),
   setCRUD(originalOptions),
   originalOptions.crud ? updateSharedModuleForCrud(originalOptions) : noop,
  ]);
 };
}