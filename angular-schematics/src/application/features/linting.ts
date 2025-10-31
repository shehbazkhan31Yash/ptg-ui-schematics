import { chain, noop, Rule, Tree } from "@angular-devkit/schematics";
import { ApplicationOptions } from "../types";
import { addDepsToPackageJson } from "../utils/package-utils";
import { ESLINT_CONFIGS, ESLINT_DEPENDENCIES } from "../../eslint-configs/eslint-configs";

export function setLinting(options: ApplicationOptions): Rule {
 if (!options.enableLinting) return noop;

 return chain([
  addLintingDependencies(options.lintingStyle || 'airbnb'),
  createLintingConfig(options.lintingStyle || 'airbnb'),
  createPrettierConfig(),
  createGitAttributes(),
  createEslintIgnore(),
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
  const lastAtIndex = dep.lastIndexOf('@');
  if (lastAtIndex === -1) {
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

  const packageJsonPath = "package.json";
  if (tree.exists(packageJsonPath)) {
   const packageJson = JSON.parse(tree.read(packageJsonPath)!.toString());
   packageJson.scripts = packageJson.scripts || {};
   packageJson.scripts.lint = "eslint \"src/**/*.{ts,html}\" --quiet";
   packageJson.scripts["lint:fix"] = "eslint \"src/**/*.{ts,html}\" --fix --quiet";
   packageJson.scripts["lint:check"] = "eslint \"src/**/*.{ts,html}\" --max-warnings=0";
   packageJson.scripts.format = "prettier --write src/**/*.{ts,html,scss,css,json}";
   packageJson.scripts["format:check"] = "prettier --check src/**/*.{ts,html,scss,css,json}";
   tree.overwrite(packageJsonPath, JSON.stringify(packageJson, null, 2));
  }

  return tree;
 };
}

function createPrettierConfig(): Rule {
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