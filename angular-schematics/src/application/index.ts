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
import { addToI18nImportsArray } from "./i18n-helpers";
import { ESLINT_CONFIGS, ESLINT_DEPENDENCIES } from "../eslint-configs/eslint-configs";

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
  const keysToDelete = ["framework", "ngrx", "i18n", "appDir", "enableLinting", "lintingStyle", "husky"];
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
   setLinting(originalOptionsObject),
   setHusky(originalOptionsObject),

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

export function setLinting(_options: any): Rule {
 if (!_options.enableLinting) {
  return noop;
 }

 return chain([
  addLintingDependencies(_options.lintingStyle),
  createLintingConfig(_options.lintingStyle),
  createPrettierConfig(_options.lintingStyle),
  createGitAttributes(),
  createEslintIgnore(),
  (tree: Tree, context: SchematicContext) => {
   context.logger.info(`\n🔍 ${_options.lintingStyle.toUpperCase()} ESLint configuration added`);
   context.logger.info('📝 Available commands:');
   context.logger.info('   • npm run lint      - Check your code for issues');
   context.logger.info('   • npm run lint:fix  - Automatically fix linting issues');
   return tree;
  },
 ]);
}

function addLintingDependencies(lintingStyle: string): Rule {
 const baseDeps = {
  "@typescript-eslint/eslint-plugin": "^7.18.0",
  "@typescript-eslint/parser": "^7.18.0",
  "eslint": "^8.57.0",
  "prettier": "^3.0.0",
 };

 const styleDeps = ESLINT_DEPENDENCIES[lintingStyle as keyof typeof ESLINT_DEPENDENCIES] || [];
 const styleDepsObj = styleDeps.reduce((acc, dep) => {
  // Handle scoped packages correctly
  const lastAtIndex = dep.lastIndexOf('@');
  if (lastAtIndex === -1) {
    // No version specified
    acc[dep] = 'latest';
  } else {
    const name = dep.substring(0, lastAtIndex);
    const version = dep.substring(lastAtIndex + 1);
    acc[name] = `^${version}`;
  }
  return acc;
 }, {} as Record<string, string>);

 return addDepsToPackageJson({}, { ...baseDeps, ...styleDepsObj });
}

function createLintingConfig(lintingStyle: string): Rule {
 return (tree: Tree) => {
  const eslintConfig = ESLINT_CONFIGS[lintingStyle as keyof typeof ESLINT_CONFIGS] || ESLINT_CONFIGS.custom;

  tree.create(".eslintrc.json", JSON.stringify(eslintConfig, null, 2));

  // Add lint script to package.json
  const packageJsonPath = "package.json";
  if (tree.exists(packageJsonPath)) {
   const packageJsonContent = tree.read(packageJsonPath)!.toString();
   const packageJson = JSON.parse(packageJsonContent);
   packageJson.scripts = packageJson.scripts || {};
   packageJson.scripts.lint = "eslint \"src/**/*.{ts,html}\" --quiet";
   packageJson.scripts["lint:fix"] = "eslint \"src/**/*.{ts,html}\" --fix --quiet";
   packageJson.scripts["lint:check"] = "eslint \"src/**/*.{ts,html}\" --max-warnings=0";
   packageJson.scripts.format = "prettier --write src/**/*.{ts,html,scss,css,json}";
   tree.overwrite(packageJsonPath, JSON.stringify(packageJson, null, 2));
  }

  return tree;
 };
}

function createPrettierConfig(lintingStyle: string): Rule {
 return (tree: Tree) => {
  const prettierConfig = {
   "endOfLine": "auto",
   "singleQuote": true,
   "trailingComma": "es5",
   "tabWidth": 2,
   "semi": true,
   "printWidth": 80
  };
  tree.create(".prettierrc", JSON.stringify(prettierConfig, null, 2));
  return tree;
 };
}

function createGitAttributes(): Rule {
 return (tree: Tree) => {
  const gitAttributes = `* text=auto`;
  tree.create(".gitattributes", gitAttributes);
  return tree;
 };
}

function createEslintIgnore(): Rule {
 return (tree: Tree) => {
  const eslintIgnore = `# Dependencies
node_modules/

# Build outputs
dist/
build/
*.js
*.d.ts

# Generated files
projects/

# Environment files
.env
.env.local
.env.*.local

# IDE files
.vscode/
.idea/
*.swp
*.swo

# OS files
.DS_Store
Thumbs.db`;
  tree.create(".eslintignore", eslintIgnore);
  return tree;
 };
}

export function setHusky(_options: any): Rule {
 if (!_options.husky) {
  return noop;
 }

 return chain([
  addHuskyDependencies(),
  createHuskyConfig(),
  addHuskyScripts(),
  (tree: Tree, context: SchematicContext) => {
   context.logger.info('\n🐶 Husky pre-commit hooks configured');
   context.logger.info('📝 Available hooks:');
   context.logger.info('   • pre-commit: Runs linting and formatting');
   context.logger.info('   • Hooks will be set up automatically during npm install');
   return tree;
  },
 ]);
}

function addHuskyDependencies(): Rule {
 return addDepsToPackageJson({}, {
  "husky": "^9.0.0",
  "lint-staged": "^15.0.0"
 });
}

function createHuskyConfig(): Rule {
 return (tree: Tree) => {
  // Create .husky directory and pre-commit hook
  const preCommitHook = `npx lint-staged
`;
  
  if (!tree.exists('.husky')) {
   tree.create('.husky/.gitignore', '_');
  }
  tree.create('.husky/pre-commit', preCommitHook);
  
  // Create lint-staged configuration
  const lintStagedConfig = {
   "*.{ts,html}": [
    "eslint --fix",
    "prettier --write"
   ],
   "*.{scss,css,json,md}": [
    "prettier --write"
   ]
  };
  
  // Add lint-staged config to package.json
  const packageJsonPath = "package.json";
  if (tree.exists(packageJsonPath)) {
   const packageJsonContent = tree.read(packageJsonPath)!.toString();
   const packageJson = JSON.parse(packageJsonContent);
   packageJson["lint-staged"] = lintStagedConfig;
   tree.overwrite(packageJsonPath, JSON.stringify(packageJson, null, 2));
  }
  
  return tree;
 };
}

function addHuskyScripts(): Rule {
 return (tree: Tree) => {
  const packageJsonPath = "package.json";
  if (tree.exists(packageJsonPath)) {
   const packageJsonContent = tree.read(packageJsonPath)!.toString();
   const packageJson = JSON.parse(packageJsonContent);
   packageJson.scripts = packageJson.scripts || {};
   packageJson.scripts.prepare = "husky";
   packageJson.scripts.postinstall = "husky";
   tree.overwrite(packageJsonPath, JSON.stringify(packageJson, null, 2));
  }
  return tree;
 };
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
 return (host: Tree) => {
  // Add dependencies
  const packageJsonPath = "package.json";
  if (host.exists(packageJsonPath)) {
   const packageJsonContent = host.read(packageJsonPath)!.toString();
   const packageJson = JSON.parse(packageJsonContent);
   packageJson.dependencies = packageJson.dependencies || {};
   packageJson.dependencies["@ngx-translate/core"] = "^15.0.0";
   packageJson.dependencies["@ngx-translate/http-loader"] = "^8.0.0";
   host.overwrite(packageJsonPath, JSON.stringify(packageJson, null, 2));
  }
  
  // Update app.module.ts with proper formatting
  const appModulePath = "src/app/app.module.ts";
  if (host.exists(appModulePath)) {
   let content = host.read(appModulePath)!.toString();
   
   // Add imports at the correct position (after Angular imports, before local imports)
   const imports = [
    "import { HttpClient, HttpClientModule } from '@angular/common/http';",
    "import { TranslateLoader, TranslateModule } from '@ngx-translate/core';",
    "import { TranslateHttpLoader } from '@ngx-translate/http-loader';",
    ""
   ];
   
   // Find position after Angular imports but before local imports
   const lines = content.split('\n');
   let insertIndex = -1;
   
   for (let i = 0; i < lines.length; i++) {
     const line = lines[i].trim();
     if (line.startsWith('import ') && line.includes('./')) {
       insertIndex = i;
       break;
     }
   }
   
   if (insertIndex >= 0) {
     lines.splice(insertIndex, 0, ...imports);
     content = lines.join('\n');
   }
   
   // Add HttpClientModule to imports
   content = addToI18nImportsArray(content, 'HttpClientModule');
   
   // Add TranslateModule.forRoot to imports
   const translateModuleConfig = `TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: translateHttpLoaderFactory,
        deps: [HttpClient],
      },
    })`;
   content = addToI18nImportsArray(content, translateModuleConfig);
   
   // Add the factory function before the NgModule with proper formatting
   const factoryFunction = `export function translateHttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http);
}

`;
   
   // Insert factory function before @NgModule
   const ngModuleIndex = content.indexOf('@NgModule');
   if (ngModuleIndex > 0) {
     content = content.slice(0, ngModuleIndex) + factoryFunction + content.slice(ngModuleIndex);
   } else {
     content += factoryFunction;
   }
   
   host.overwrite(appModulePath, content);
  }
  
  return host;
 };
}

function deleteKeys(inputObj: any, keysToDelete: string[]): any {
 keysToDelete.forEach((key) => delete inputObj[key]);
 return inputObj;
}

