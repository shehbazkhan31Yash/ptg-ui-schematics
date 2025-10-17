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

// Local implementation of addDepsToPackageJson (replaces @nx/workspace)
function addDepsToPackageJson(
  dependencies: { [key: string]: string },
  devDependencies: { [key: string]: string } = {}
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
        packageJson.dependencies[pkg] = dependencies[pkg];
      });
    }

    // Add devDependencies
    if (Object.keys(devDependencies).length > 0) {
      packageJson.devDependencies = packageJson.devDependencies || {};
      Object.keys(devDependencies).forEach(pkg => {
        packageJson.devDependencies[pkg] = devDependencies[pkg];
      });
    }

    tree.overwrite(packageJsonPath, JSON.stringify(packageJson, null, 2));
    return tree;
  };
}

// You don't have to export the function as default. You can also have more than one rule factory
// per file.
export function ngAdd(options: any): Rule {
  return async (host: Tree, _context: SchematicContext) => {
    const workspace = await getWorkspace(host);
    const newProjectRoot =
      (workspace.extensions.newProjectRoot as string | undefined) ?? "";
    const isRootApp = options.projectRoot !== undefined;
    const appDir = isRootApp
      ? normalize(options.projectRoot || "")
      : join(normalize(newProjectRoot), strings.dasherize(options.name));

    return chain([
      externalSchematic("@schematics/angular", "module", {
        name: "shared",
        project: options.name,
        module: "app.module.ts",
      }),
      externalSchematic("@schematics/angular", "module", {
        name: "core",
        project: options.name,
        module: "app.module.ts",
      }),
      setFramework(options, host),
      setNGRX(options),
      mergeWith(
        apply(url("./files"), [
          applyTemplates({
            utils: strings,
            ...options,
            appName: options.name,
            isRootApp,
          }),
          move(appDir),
        ]),
        MergeStrategy.Overwrite
      ),
    ]);
  };
}

export function setFramework(_options: any, host: Tree): Rule {
  if (_options.framework === "material") {
    return chain([addMaterialToPackageJson(), updateStyles(host)]);
  }

  if (_options.framework === "bootstrap") {
    return chain([addBootstrapToPackageJson(), updateStyles(host)]);
  }

  return noop;
}

export function setNGRX(_options: any): Rule {
  if (!_options.ngrx) {
    return noop;
  }
  return chain([
    addDepsToPackageJson({
      "@ngrx/store": "^18.1.1",
      "@ngrx/effects": "^18.1.1",
      "@ngrx/entity": "^18.1.1",
      "@ngrx/store-devtools": "^18.1.1",
    }),
    // Run NgRx store setup - let NgRx find the correct module path
    externalSchematic("@ngrx/schematics", "store", {
      project: _options.name,
      name: "app",
      root: true,
    }),
    // Run NgRx effects setup - let NgRx find the correct module path
    externalSchematic("@ngrx/schematics", "effects", {
      project: _options.name,
      name: "app",
      root: true,
    }),
  ]);
}

export function addMaterialToPackageJson(): Rule {
  return addDepsToPackageJson({
    "@angular/material": "^18.2.13",
    "@angular/cdk": "^18.2.13",
  });
}

export function addBootstrapToPackageJson(): Rule {
  return addDepsToPackageJson({
    bootstrap: "^5.3.0",
    "@angular/cdk": "^18.2.13",
  });
}

export function addNrwlToPackageJson(): Rule {
  return noop; // No longer needed
}

export function updateStyles(options: any) {
  let content = `
    @import './app/app.theme';

    @include app-theme();

  `;
  if (options.framework === "material") {
    content =
      content +
      `
    @import "@angular/material/prebuilt-themes/indigo-pink.css";
    body {
      height: 100%;
    }
    body {
      margin: 0;
      font-family: Roboto, "Helvetica Neue", sans-serif;
    }

    `;
  }
  if (options.framework === "bootstrap") {
    content =
      content +
      `
    @import "~bootstrap/dist/css/bootstrap.css"
    `;
  }
  return (host: Tree) => {
    host.overwrite(`src/styles.scss`, content);
    return host;
  };
}