import { chain, noop, Rule, Tree } from "@angular-devkit/schematics";
import { ApplicationOptions } from "../types";
import { addDepsToPackageJson } from "../utils/package-utils";

export function setHusky(options: ApplicationOptions): Rule {
 if (!options.husky) return noop;

 return chain([
  addHuskyDependencies(),
  createHuskyConfig(),
  addHuskyScripts(),
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
  const preCommitHook = `npx lint-staged\n`;
  
  if (!tree.exists('.husky')) {
   tree.create('.husky/.gitignore', '_');
  }
  tree.create('.husky/pre-commit', preCommitHook);
  
  const lintStagedConfig = {
   "*.{ts,html}": [
    "eslint --fix",
    "prettier --write"
   ],
   "*.{scss,css,json,md}": [
    "prettier --write"
   ]
  };
  
  const packageJsonPath = "package.json";
  if (tree.exists(packageJsonPath)) {
   const packageJson = JSON.parse(tree.read(packageJsonPath)!.toString());
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
   const packageJson = JSON.parse(tree.read(packageJsonPath)!.toString());
   packageJson.scripts = packageJson.scripts || {};
   packageJson.scripts.prepare = "husky";
   tree.overwrite(packageJsonPath, JSON.stringify(packageJson, null, 2));
  }
  return tree;
 };
}