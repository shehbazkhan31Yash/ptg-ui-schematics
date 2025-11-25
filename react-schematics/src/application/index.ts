import { strings } from "@angular-devkit/core";
import {
  apply,
  applyTemplates,
  chain,
  MergeStrategy,
  mergeWith,
  move,
  noop,
  Rule,
  SchematicContext,
  Tree,
  url,
  SchematicsException
} from "@angular-devkit/schematics";
import { join, normalize } from "path";
import {
  reactReduxVersion,
  reduxVersion,
  zustandVersion,
  i18nextVersion,
  i18nextBrowserLanguagedetectorVersion,
  reactI18nextVersion,
  materialUICoreVersion,
  muiMaterialVersion,
  emotionReactVersion,
  emotionStyledVersion,
  bootstrapVersion,
  reactBootstrapVersion,
  axeCoreVersion,
  reactAxeVersion,
  eslintPluginJsxA11yVersion,
} from "../utils/version";
import { workspaces } from '@angular-devkit/core';
import { 
  getEslintConfig, 
  getEslintDependencies, 
  getPrettierDependencies,
  getPrettierConfig,
  getHuskyDependencies,
  getHuskyPreCommitHook,
  getLintStagedConfig
} from "../utils/eslint-configs";

// Instead of `any`, it would make sense here to get a schema-to-dts package and output the
// interfaces so you get type-safe options.

function createHost(tree: Tree): workspaces.WorkspaceHost {
  return {
    async readFile(path: string): Promise<string> {
      const data = tree.read(path);
      if (!data) {
        throw new SchematicsException('File not found.');
      }
      return data.toString('utf-8');
    },
    async writeFile(path: string, data: string): Promise<void> {
      return tree.overwrite(path, data);
    },
    async isDirectory(path: string): Promise<boolean> {
      return !tree.exists(path) && tree.getDir(path).subfiles.length > 0;
    },
    async isFile(path: string): Promise<boolean> {
      return tree.exists(path);
    },
  };
}

export default function (options: any): Rule {
  return async (host: Tree, _context: SchematicContext) => {
    const host1 = createHost(host);
    const { workspace } = await workspaces.readWorkspace('/', host1);
    const newProjectRoot =
      (workspace.extensions.newProjectRoot as string | undefined) ?? "";
    const isRootApp = options.projectRoot !== undefined;
    const appDir = isRootApp
      ? normalize(options.projectRoot || "")
      : join(normalize(newProjectRoot), strings.dasherize(options.name));
    options.appDir = appDir;
    let originalOptionsObject = JSON.parse(JSON.stringify(options));
  // The chain rule allows us to chain multiple rules and apply them one after the other.

    return chain([
      (_tree: Tree, context: SchematicContext) => {
        // Show the options for this Schematics.
        context.logger.info("Application->: " + JSON.stringify(options));
      },

      // Instead of calling external schematic that causes alias collision,
      // we'll create a simple rule that works with the existing manual generation
      (tree: Tree, context: SchematicContext) => {
        context.logger.info(`Creating React application: ${options.name}`);
        context.logger.warn('Using simplified generation to avoid alias collisions');
        context.logger.warn('The CLI manual generation will handle the actual app creation');
        return tree;
      },
      //schematic('my-other-schematic', { option: true }),
      setFramework(originalOptionsObject, isRootApp),
      setStateManagementToPackageJson(originalOptionsObject),
      setI18nToPackageJson(originalOptionsObject),
      setLinterToPackageJson(originalOptionsObject),
      setPrettierToPackageJson(originalOptionsObject),
      setHuskyToPackageJson(originalOptionsObject),
      setAccessibilityToPackageJson(originalOptionsObject),
      (originalOptionsObject.stateManagement === 'redux')
        ? addDashboardToProject(originalOptionsObject, isRootApp)
        : noop,
      // The mergeWith() rule merge two trees; one that's coming from a Source (a Tree with no
      // base), and the one as input to the rule. You can think of it like rebasing a Source on
      // top of your current set of changes. In this case, the Source is that apply function.
      // The apply() source takes a Source, and apply rules to it. In our case, the Source is
      // url(), which takes an URL and returns a Tree that contains all the files from that URL
      // in it. In this case, we use the relative path `./files`, and so two files are going to
      // be created (test1, and test2).
      // We then apply the template() rule, which takes a tree and apply two templates to it:
      //   path templates: this template replaces instances of __X__ in paths with the value of
      //                   X from the options passed to template(). If the value of X is a
      //                   function, the function will be called. If the X is undefined or it
      //                   returns null (not empty string), the file or path will be removed.
      //   content template: this is similar to EJS, but does so in place (there's no special
      //                     extension), does not support additional functions if you don't pass
      //                     them in, and only work on text files (we use an algorithm to detect
      //                     if a file is binary or not).

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
      mergeWith(
        apply(url("./common/"), [
          applyTemplates({
            utils: strings,
            ...originalOptionsObject,
            appName: originalOptionsObject.name,
            isRootApp,
          }),
          move(`apps/${options.name}/src/`),
        ]),
        MergeStrategy.Overwrite
      ),
      originalOptionsObject.i18n
        ? mergeWith(
          apply(url("./i18n/"), [
            applyTemplates({
              utils: strings,
              ...originalOptionsObject,
              appName: originalOptionsObject.name,
              isRootApp,
            }),
            move(`apps/${options.name}/src/app/`),
          ]),
          MergeStrategy.Overwrite
        )
        : noop,
      originalOptionsObject.stateManagement === 'redux'
        ? mergeWith(
          apply(url("./redux/"), [
            applyTemplates({
              utils: strings,
              ...originalOptionsObject,
              appName: originalOptionsObject.name,
              isRootApp,
            }),
            move(`apps/${options.name}/src/app/`),
          ]),
          MergeStrategy.Overwrite
        )
        : noop,
      originalOptionsObject.stateManagement === 'zustand'
        ? mergeWith(
          apply(url("./zustand/"), [
            applyTemplates({
              utils: strings,
              ...originalOptionsObject,
              appName: originalOptionsObject.name,
              isRootApp,
            }),
            move(`apps/${options.name}/src/app/`),
          ]),
          MergeStrategy.Overwrite
        )
        : noop,
      originalOptionsObject.auth === "okta"
        ? mergeWith(
          apply(url("./okta/"), [
            applyTemplates({}),
            move(`apps/${options.name}/src/app/okta/`),
          ]),
          MergeStrategy.Overwrite
        )
        : noop,
      originalOptionsObject.auth === "msal"
        ? mergeWith(
          apply(url("./config/"), [
            applyTemplates({}),
            move(`apps/${options.name}/src/app/config/`),
          ]),
          MergeStrategy.Overwrite
        )
        : noop,
      mergeWith(
        apply(url("./environments/"), [
          applyTemplates({ ...originalOptionsObject }),
          move(`apps/${options.name}/src/environments/`),
        ]),
        MergeStrategy.Overwrite
      ),
      addEslintConfigToProject(originalOptionsObject),
      addPrettierConfigToProject(originalOptionsObject),
      addHuskyConfigToProject(originalOptionsObject),
      addDockerConfigToProject(originalOptionsObject),
      addLintScriptsToPackageJson(originalOptionsObject),
      originalOptionsObject.docker
        ? mergeWith(
          apply(url("./docker/"), [
            applyTemplates({
              utils: strings,
              ...originalOptionsObject,
              appName: originalOptionsObject.name,
              isRootApp,
            }),
            move(`apps/${options.name}/`),
          ]),
          MergeStrategy.Overwrite
        )
        : noop,
      originalOptionsObject.accessibility
        ? mergeWith(
          apply(url("./accessibility/"), [
            applyTemplates({
              utils: strings,
              ...originalOptionsObject,
              appName: originalOptionsObject.name,
              isRootApp,
            }),
            move(`apps/${options.name}/src/app/accessibility/`),
          ]),
          MergeStrategy.Overwrite
        )
        : noop,
    ]);
  };
}

type PackageJson = {
  dependencies?: { [key: string]: string };
  scripts?: { [key: string]: string };
  [key: string]: any;
};

function addPackageToPackageJson(host: Tree, pkg: string, version: string): Tree {
  if (host.exists("package.json")) {
    const sourceText = host.read("package.json")!.toString("utf-8");
    const json = JSON.parse(sourceText) as PackageJson;
    json.dependencies ??= {};
    if (!json.dependencies[pkg]) {
      json.dependencies[pkg] = version;
      json.dependencies = sortObjectByKeys(json.dependencies);
    }
    host.overwrite("package.json", JSON.stringify(json, null, 2));
  }
  return host;
}

function addScriptToPackageJson(host: Tree, scriptName: string, scriptCommand: string): Tree {
  if (host.exists("package.json")) {
    const sourceText = host.read("package.json")!.toString("utf-8");
    const json = JSON.parse(sourceText) as PackageJson;
    json.scripts ??= {};
    // Always set/overwrite the script
    json.scripts[scriptName] = scriptCommand;
    json.scripts = sortObjectByKeys(json.scripts);
    host.overwrite("package.json", JSON.stringify(json, null, 2));
  }
  return host;
}
export function setFramework(options: any, isRootApp: boolean) {
  const tasks = [];
  if (options.framework === "material") {
    tasks.push(addMaterialToPackageJson());
  }
  if (options.auth === "custom") {
    tasks.push(
      addLoginToProject(
        options,
        isRootApp,
        "./login/",
        `apps/${options.name}/src/app/login/`
      )
    );
    tasks.push(addAuthServiceToProject(options, isRootApp));
  }
  if (options.auth === "msal") {
    tasks.push(
      addLoginToProject(
        options,
        isRootApp,
        "./config/",
        `apps/${options.name}/src/app/config/`
      )
    );
    tasks.push(addLoginToProject(options, isRootApp, "./documentation/", `/`));
  }
  if (options.framework === "bootstrap") {
    tasks.push(addBootstrapToPackageJson());
    tasks.push(updateStyles(options));
  }
  if (tasks.length > 0) return chain(tasks);
  else return noop;
}

export function setStateManagementToPackageJson(options: any): Rule {
  if (!options.stateManagement || options.stateManagement === 'none') {
    return noop;
  }
  
  if (options.stateManagement === 'redux') {
    return chain([
      (tree: Tree) => {
        tree = addPackageToPackageJson(tree, "react-redux", reactReduxVersion);
        tree = addPackageToPackageJson(tree, "redux", reduxVersion);
        return tree;
      },
    ]);
  }
  
  if (options.stateManagement === 'zustand') {
    return chain([
      (tree: Tree) => {
        tree = addPackageToPackageJson(tree, "zustand", zustandVersion);
        return tree;
      },
    ]);
  }
  
  return noop;
}

export function setReduxTpPackageJson(options: any): Rule {
  // Kept for backward compatibility
  if (!options.redux) {
    return noop;
  }
  return chain([
    (tree: Tree) => {
      tree = addPackageToPackageJson(tree, "react-redux", reactReduxVersion);
      tree = addPackageToPackageJson(tree, "redux", reduxVersion);
      return tree;
    },
  ]);
}

export function setI18nToPackageJson(options: any): Rule {
  if (!options.i18n) {
    return noop;
  }
  return chain([
    (tree: Tree) => addPackageToPackageJson(tree, "i18next", i18nextVersion),
    (tree: Tree) => addPackageToPackageJson(tree, "i18next-browser-languagedetector", i18nextBrowserLanguagedetectorVersion),
    (tree: Tree) => addPackageToPackageJson(tree, "react-i18next", reactI18nextVersion),
  ]);
}

export function setLinterToPackageJson(options: any): Rule {
  if (!options.linter || options.linter === 'none') {
    return noop;
  }
  
  return chain([
    (tree: Tree) => {
      const dependencies = getEslintDependencies(options.linter, options.accessibility);
      Object.entries(dependencies).forEach(([pkg, version]) => {
        tree = addPackageToPackageJson(tree, pkg, version);
      });
      return tree;
    },
  ]);
}

export function setPrettierToPackageJson(options: any): Rule {
  if (!options.prettier) {
    return noop;
  }
  
  return chain([
    (tree: Tree) => {
      const dependencies = getPrettierDependencies(options.prettier);
      Object.entries(dependencies).forEach(([pkg, version]) => {
        tree = addPackageToPackageJson(tree, pkg, version);
      });
      return tree;
    },
  ]);
}

export function setHuskyToPackageJson(options: any): Rule {
  if (!options.husky) {
    return noop;
  }
  
  return chain([
    (tree: Tree) => {
      const dependencies = getHuskyDependencies(options.husky);
      Object.entries(dependencies).forEach(([pkg, version]) => {
        tree = addPackageToPackageJson(tree, pkg, version);
      });
      return tree;
    },
  ]);
}

export function setAccessibilityToPackageJson(options: any): Rule {
  if (!options.accessibility) {
    return noop;
  }
  
  return chain([
    (tree: Tree) => {
      tree = addPackageToPackageJson(tree, "axe-core", axeCoreVersion);
      tree = addPackageToPackageJson(tree, "@axe-core/react", reactAxeVersion);
      tree = addPackageToPackageJson(tree, "eslint-plugin-jsx-a11y", eslintPluginJsxA11yVersion);
      return tree;
    },
  ]);
}

export function addEslintConfigToProject(options: any): Rule {
  if (!options.linter || options.linter === 'none') {
    return noop;
  }

  return (tree: Tree) => {
    const eslintConfigPath = `apps/${options.name}/eslint.config.js`;
    const eslintConfig = getEslintConfig(options.linter, options.accessibility);
    
    if (tree.exists(eslintConfigPath)) {
      tree.overwrite(eslintConfigPath, eslintConfig);
    } else {
      tree.create(eslintConfigPath, eslintConfig);
    }
    
    return tree;
  };
}

export function addPrettierConfigToProject(options: any): Rule {
  if (!options.prettier) {
    return noop;
  }

  return (tree: Tree) => {
    const prettierConfigPath = `apps/${options.name}/.prettierrc`;
    const prettierConfig = getPrettierConfig();
    
    if (tree.exists(prettierConfigPath)) {
      tree.overwrite(prettierConfigPath, prettierConfig);
    } else {
      tree.create(prettierConfigPath, prettierConfig);
    }
    
    return tree;
  };
}

export function addHuskyConfigToProject(options: any): Rule {
  if (!options.husky) {
    return noop;
  }

  return (tree: Tree) => {
    // Create .husky directory
    const huskyDir = `.husky`;
    
    // Create pre-commit hook
    const preCommitPath = `${huskyDir}/pre-commit`;
    const preCommitContent = getHuskyPreCommitHook(
      options.linter && options.linter !== 'none',
      options.prettier
    );
    
    if (tree.exists(preCommitPath)) {
      tree.overwrite(preCommitPath, preCommitContent);
    } else {
      tree.create(preCommitPath, preCommitContent);
    }
    
    // Add lint-staged configuration to package.json
    const packageJsonPath = 'package.json';
    if (tree.exists(packageJsonPath)) {
      const sourceText = tree.read(packageJsonPath)!.toString('utf-8');
      const packageJson = JSON.parse(sourceText);
      
      // Parse the lint-staged config and add it to package.json
      const lintStagedConfigStr = getLintStagedConfig(
        options.linter && options.linter !== 'none',
        options.prettier
      );
      packageJson['lint-staged'] = JSON.parse(lintStagedConfigStr);
      
      // Add prepare script for husky
      packageJson.scripts = packageJson.scripts || {};
      packageJson.scripts.prepare = 'husky';
      
      tree.overwrite(packageJsonPath, JSON.stringify(packageJson, null, 2));
    }
    
    return tree;
  };
}

export function addDockerConfigToProject(options: any): Rule {
  if (!options.docker) {
    return noop;
  }

  return (tree: Tree) => {
    const appName = options.name;
    const appPath = `apps/${appName}`;
    
    // Add Docker scripts to package.json
    const packageJsonPath = 'package.json';
    if (tree.exists(packageJsonPath)) {
      const sourceText = tree.read(packageJsonPath)!.toString('utf-8');
      const packageJson = JSON.parse(sourceText);
      
      packageJson.scripts = packageJson.scripts || {};
      packageJson.scripts["docker:build"] = `docker build -t ${appName}:latest ${appPath}`;
      packageJson.scripts["docker:run"] = `docker run -d -p 3000:80 --name ${appName}-app ${appName}:latest`;
      packageJson.scripts["docker:stop"] = `docker stop ${appName}-app`;
      packageJson.scripts["docker:up"] = `cd ${appPath} && docker-compose up -d`;
      packageJson.scripts["docker:down"] = `cd ${appPath} && docker-compose down`;
      packageJson.scripts["docker:logs"] = `cd ${appPath} && docker-compose logs -f`;
      
      tree.overwrite(packageJsonPath, JSON.stringify(packageJson, null, 2));
    }
    
    return tree;
  };
}

export function addLintScriptsToPackageJson(options: any): Rule {
  if (!options.linter || options.linter === 'none') {
    return noop;
  }

  return (tree: Tree) => {
    const appName = options.name;
    const lintPath = `src/**/*.{js,jsx,ts,tsx}`;
    
    // Add lint scripts with app-specific names
    tree = addScriptToPackageJson(tree, `lint:${appName}`, `eslint "${lintPath}"`);
    tree = addScriptToPackageJson(tree, `lint:${appName}:fix`, `eslint "${lintPath}" --fix`);
    
    // Also add generic lint script if it doesn't exist
    tree = addScriptToPackageJson(tree, "lint", `eslint "${lintPath}"`);
    tree = addScriptToPackageJson(tree, "lint:fix", `eslint "${lintPath}" --fix`);
    
    // Add format script if prettier is enabled
    if (options.prettier) {
      const formatPath = `src/**/*.{js,jsx,ts,tsx,json,css,scss,md}`;
      tree = addScriptToPackageJson(tree, `format:${appName}`, `prettier --write "${formatPath}"`);
      tree = addScriptToPackageJson(tree, `format:${appName}:check`, `prettier --check "${formatPath}"`);
      tree = addScriptToPackageJson(tree, "format", `prettier --write "${formatPath}"`);
      tree = addScriptToPackageJson(tree, "format:check", `prettier --check "${formatPath}"`);
    }
    
    return tree;
  };
}

export function addDashboardToProject(_options: any, isRootApp: boolean): Rule {
  const inputUrl = "./redux-i18-dashboard/";
  return mergeWith(
    apply(url(inputUrl), [
      applyTemplates({
        utils: strings,
        ..._options,
        appName: "components",
        isRootApp,
      }),
      move(`apps/${_options.name}/src/app/components/`),
    ]),
    MergeStrategy.Overwrite
  );
}

export function addLoginToProject(
  _options: any,
  isRootApp: boolean,
  inputUrl: string,
  outputPath: string
): Rule {
  return mergeWith(
    apply(url(inputUrl), [
      applyTemplates({
        utils: strings,
        ..._options,
        appName: "components",
        isRootApp,
      }),
      move(outputPath),
    ]),
    MergeStrategy.Overwrite
  );
}
export function addAuthServiceToProject(
  _options: any,
  isRootApp: boolean
): Rule {
  let inputUrl = "./services/";
  return mergeWith(
    apply(url(inputUrl), [
      applyTemplates({
        utils: strings,
        ..._options,
        appName: "components",
        isRootApp,
      }),
      move(`apps/${_options.name}/src/app/services/`),
    ]),
    MergeStrategy.Overwrite
  );
}

export function addMaterialToPackageJson(): Rule {
  return chain([
    (tree: Tree) => {
      tree = addPackageToPackageJson(tree, "@material-ui/core", materialUICoreVersion);
      tree = addPackageToPackageJson(tree, "@mui/material", muiMaterialVersion);
      tree = addPackageToPackageJson(tree, "@emotion/react", emotionReactVersion);
      tree = addPackageToPackageJson(tree, "@emotion/styled", emotionStyledVersion);
      return tree;
    },
  ]);
}

export function addBootstrapToPackageJson(): Rule {
  return chain([
    (tree: Tree) => {
      tree = addPackageToPackageJson(tree, "bootstrap", bootstrapVersion);
      tree = addPackageToPackageJson(tree, "react-bootstrap", reactBootstrapVersion);
      return tree;
    },
  ]);
}

export function updateStyles(options: any) {
  return (host: Tree) => {
    let content = ``;
    if (options.framework === "bootstrap") {
      content = `@import "~bootstrap/dist/css/bootstrap.css";`;
    }
    host.overwrite(`apps/${options.name}/src/styles.${options.style}`, content);
    return host;
  };
}
function sortObjectByKeys(dependencies: { [key: string]: string; }): { [key: string]: string; } {
  return Object.keys(dependencies)
    .sort()
    .reduce((acc, key) => {
      acc[key] = dependencies[key];
      return acc;
    }, {} as { [key: string]: string });
}

