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
import { addImportToAppModule, insertStatement } from "../utils/utils";

// Local implementation of addDepsToPackageJson (replaces @nx/workspace)
function addDepsToPackageJson(
  dependencies: { [key: string]: string },
  devDependencies: { [key: string]: string } = {},
  overwrite: boolean = true
): Rule {
  return (tree: Tree) => {
    const packageJsonPath = "package.json";
    if (!tree.exists(packageJsonPath)) {
      return tree;
    }

    const packageJsonContent = tree.read(packageJsonPath)!.toString();
    const packageJson = JSON.parse(packageJsonContent);

    // Add dependencies
    if (Object.keys(dependencies).length > 0) {
      packageJson.dependencies = packageJson.dependencies || {};
      Object.keys(dependencies).forEach(pkg => {
        if (overwrite || !packageJson.dependencies[pkg]) {
          packageJson.dependencies[pkg] = dependencies[pkg];
        }
      });
    }

    // Add devDependencies
    if (Object.keys(devDependencies).length > 0) {
      packageJson.devDependencies = packageJson.devDependencies || {};
      Object.keys(devDependencies).forEach(pkg => {
        if (overwrite || !packageJson.devDependencies[pkg]) {
          packageJson.devDependencies[pkg] = devDependencies[pkg];
        }
      });
    }

    tree.overwrite(packageJsonPath, JSON.stringify(packageJson, null, 2));
    return tree;
  };
}

// You don't have to export the function as default. You can also have more than one rule factory
// per file.
export function application(options: any): Rule {
 return async (host: Tree, _context: SchematicContext) => {
  const workspace = await getWorkspace(host);
  const newProjectRoot =
   (workspace.extensions.newProjectRoot as string | undefined) ?? "";
  const isRootApp = options.projectRoot !== undefined;
  const appDir = isRootApp
   ? normalize(options.projectRoot || "")
   : join(normalize(newProjectRoot), strings.dasherize(options.name));
  options.appDir = appDir;

  let originalOptionsObject = JSON.parse(JSON.stringify(options));
  const keysToDelete = ["framework", "ngrx", "i18n", "appDir"];
  /*--get schema compatible with application schema---*/
  let inputToApplicationSchema = deleteKeys(options, keysToDelete);

  return chain([
   externalSchematic("@schematics/angular", "application", {
    ...inputToApplicationSchema,
    style: "scss",
    skipInstall: true,
    strict: true,
    standalone: false, // Force NgModule-based application since our schematic expects app.module.ts
   }),
   addImportToAppModule("SharedModule", "./shared/shared.module"),
   addImportToAppModule("CoreModule", "./core/core.module"),
   originalOptionsObject.i18n ? addI18n() : noop,
   mergeWith(
    apply(url("./files"), [
     applyTemplates({
      utils: strings,
      ...originalOptionsObject,
      appName: originalOptionsObject.name,
      isRootApp,
     }),
     move(appDir),
    ]),
    MergeStrategy.Overwrite
   ),
   originalOptionsObject.i18n
    ? mergeWith(
       apply(url("./i18n-files"), [
        applyTemplates({
         utils: strings,
         ...originalOptionsObject,
         appName: originalOptionsObject.name,
         isRootApp,
        }),
        move(appDir),
       ]),
       MergeStrategy.Overwrite
      )
    : noop,
   addDevdependenciesToPackageJSON(),
   setFramework(
    originalOptionsObject,
    isRootApp,
    appDir,
    originalOptionsObject.i18n
   ),
   setNGRX(originalOptionsObject),

   (tree: Tree) => tree,
  ]);
 };
}

export function addDevdependenciesToPackageJSON() {
 return noop;
}

export function setFramework(
 _options: any,
 isRootApp: boolean,
 appDir: string,
 isI18nSeleted: boolean
): Rule {
 if (_options.framework === "material") {
  return chain([addMaterialToPackageJson(), updateStyles(_options)]);
 }

 if (_options.framework === "bootstrap") {
  return chain([addBootstrapToPackageJson(), updateStyles(_options)]);
 }

 if (_options.framework === "tailwind") {
  return chain([
   addTailwindToPackageJson(),
   updateStyles(_options),
   createTailwindConfig(_options, isRootApp, appDir, isI18nSeleted),
  ]);
 }

 return noop;
}

export function setNGRX(_options: any): Rule {
 if (!_options.ngrx) {
  return noop;
 }
 
 // For now, just add the dependencies to package.json
 // NgRx setup will be done manually after project creation
 return chain([
  addDepsToPackageJson({
   "@ngrx/store": "^18.1.1",
   "@ngrx/effects": "^18.1.1",
   "@ngrx/entity": "^18.1.1",
   "@ngrx/store-devtools": "^18.1.1",
  }),
  // Log instructions for manual NgRx setup
  (tree: Tree, context: SchematicContext) => {
   context.logger.info('\n🎯 NgRx dependencies added to package.json');
   context.logger.info('📝 To set up NgRx, run these commands after project creation:');
   context.logger.info(`   cd ${_options.name}`);
   context.logger.info('   ng add @ngrx/store');
   context.logger.info('   ng add @ngrx/effects');
   context.logger.info('   ng add @ngrx/store-devtools');
   return tree;
  },
 ]);
}

export function addMaterialToPackageJson(): Rule {
 return addDepsToPackageJson(
  {
   "@angular/material": "^18.2.13",
   "@angular/cdk": "^18.2.13",
  },
  {},
  false
 );
}

export function addBootstrapToPackageJson(): Rule {
 return addDepsToPackageJson(
  {
   bootstrap: "^5.3.0",
  },
  {},
  false
 );
}
export function addTailwindToPackageJson(): Rule {
 return addDepsToPackageJson(
  {
   tailwindcss: "^3.4.0",
   autoprefixer: "^10.4.0",
   postcss: "^8.4.0",
  },
  {},
  false
 );
}

export function updateStyles(options: any) {
 return (host: Tree) => {
  let content = `
    @import './app/app.theme';

    @include app-theme();


  `;
  if (options.framework === "material") {
   content = `
    @import "@angular/material/prebuilt-themes/indigo-pink.css";
    body {
      height: 100%;
    }
    body {
      margin: 0;
      font-family: Roboto, "Helvetica Neue", sans-serif;
    }
    ${content}
    ${content}
    `;
  }
  if (options.framework === "bootstrap") {
   content = `
    @import "~bootstrap/dist/css/bootstrap.css";
    ${content}
    `;
  }
  if (options.framework === "tailwind") {
   content = `
      @import 'tailwindcss/base';
      @import 'tailwindcss/components';
      @import 'tailwindcss/utilities';
    ${content}
    `;
  }
  host.overwrite(`src/styles.scss`, content);
  return host;
 };
}

export function createTailwindConfig(
 _options: any,
 isRootApp: boolean,
 appDir: string,
 isI18nSeleted: boolean
): Rule {
 let inputUrl = isI18nSeleted
  ? "./tailwind-files/tailwind+i18n-files/"
  : "./tailwind-files/tailwind-i18n-files/";
 return mergeWith(
  apply(url(inputUrl), [
   applyTemplates({
    utils: strings,
    ..._options,
    appName: _options.name,
    isRootApp,
   }),
   move(appDir),
  ]),
  MergeStrategy.Overwrite
 );
}

export function addI18n(): Rule {
 return chain([
  addDepsToPackageJson({
   "@ngx-translate/core": "^15.0.0",
   "@ngx-translate/http-loader": "^8.0.0",
  }),
  addImportToAppModule(
   `
         TranslateModule,
         TranslateLoader
         `,
   "@ngx-translate/core",
   `
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useFactory: translateHttpLoaderFactory,
            deps: [HttpClient]
          }
        })
        `
  ),
  addImportToAppModule(`HttpClientModule`, "@angular/common/http"),
  addImportToAppModule(`HttpClient`, "@angular/common/http", undefined, true),
  addImportToAppModule(
   `TranslateHttpLoader`,
   "@ngx-translate/http-loader",
   undefined,
   true
  ),
  insertStatement(
   "src/app/app.module.ts",
   `export function translateHttpLoaderFactory(http: HttpClient) {
          return new TranslateHttpLoader(http);
        }`
  ),
  noop,
 ]);
}

function deleteKeys(inputObj: any, keysToDelete: string[]): any {
 keysToDelete.forEach((key) => delete inputObj[key]);
 return inputObj;
}

