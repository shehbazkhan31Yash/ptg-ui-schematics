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
  i18nextVersion,
  i18nextBrowserLanguagedetectorVersion,
  reactI18nextVersion,
  materialUICoreVersion,
  muiMaterialVersion,
  emotionReactVersion,
  emotionStyledVersion,
  bootstrapVersion,
  reactBootstrapVersion,
} from "../utils/version";
import { workspaces } from '@angular-devkit/core';

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
      setReduxTpPackageJson(originalOptionsObject),
      setI18nToPackageJson(originalOptionsObject),
      (originalOptionsObject.redux)
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
      originalOptionsObject.redux
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
    ]);
  };
}

type PackageJson = {
  dependencies?: { [key: string]: string };
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

export function setReduxTpPackageJson(options: any): Rule {
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

