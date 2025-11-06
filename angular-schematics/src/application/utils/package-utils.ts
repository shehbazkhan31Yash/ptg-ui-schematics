import { Rule, Tree } from "@angular-devkit/schematics";

export function addDepsToPackageJson(
 dependencies: { [key: string]: string },
 devDependencies: { [key: string]: string } = {},
 overwrite: boolean = true
): Rule {
 return (tree: Tree) => {
  const packageJsonPath = "package.json";
  if (!tree.exists(packageJsonPath)) return tree;

  const packageJson = JSON.parse(tree.read(packageJsonPath)!.toString());

  if (Object.keys(dependencies).length > 0) {
   packageJson.dependencies = packageJson.dependencies || {};
   Object.keys(dependencies).forEach(pkg => {
    if (overwrite || !packageJson.dependencies[pkg]) {
     packageJson.dependencies[pkg] = dependencies[pkg];
    }
   });
  }

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

export function deleteKeys(inputObj: any, keysToDelete: string[]): any {
 keysToDelete.forEach((key) => delete inputObj[key]);
 return inputObj;
}