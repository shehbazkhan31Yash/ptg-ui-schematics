import { Rule, SchematicContext, Tree, apply, url, applyTemplates, move, mergeWith, MergeStrategy, noop } from '@angular-devkit/schematics';
import { strings } from '@angular-devkit/core';
import { ApplicationOptions } from '../types';
import { addPackageJsonDependency, NodeDependency, NodeDependencyType } from '@schematics/angular/utility/dependencies';

export function setAuthentication(options: ApplicationOptions): Rule {
  return (tree: Tree, context: SchematicContext) => {
    if (!options.authentication || options.authentication === 'none') {
      return noop();
    }

    context.logger.info(`Setting up ${options.authentication} authentication...`);

    switch (options.authentication) {
      case 'msal':
        return setupMSAL(options);
      case 'okta':
        return setupOkta(options);
      case 'custom':
        return setupCustomAuth(options);
      default:
        return noop();
    }
  };
}

function setupMSAL(options: ApplicationOptions): Rule {
  return (tree: Tree, context: SchematicContext) => {
    const dependencies: NodeDependency[] = [
      {
        type: NodeDependencyType.Default,
        version: '^3.0.0',
        name: '@azure/msal-browser'
      },
      {
        type: NodeDependencyType.Default,
        version: '^3.0.0',
        name: '@azure/msal-angular'
      }
    ];

    dependencies.forEach(dependency => {
      addPackageJsonDependency(tree, dependency);
    });

    return mergeWith(
      apply(url('./auth-files/msal'), [
        applyTemplates({
          utils: strings,
          ...options,
        }),
        move(options.appDir || '')
      ]),
      MergeStrategy.Overwrite
    );
  };
}

function setupOkta(options: ApplicationOptions): Rule {
  return (tree: Tree, context: SchematicContext) => {
    const dependencies: NodeDependency[] = [
      {
        type: NodeDependencyType.Default,
        version: '^6.0.0',
        name: '@okta/okta-angular'
      },
      {
        type: NodeDependencyType.Default,
        version: '^7.0.0',
        name: '@okta/okta-auth-js'
      }
    ];

    dependencies.forEach(dependency => {
      addPackageJsonDependency(tree, dependency);
    });

    return mergeWith(
      apply(url('./auth-files/okta'), [
        applyTemplates({
          utils: strings,
          ...options,
        }),
        move(options.appDir || '')
      ]),
      MergeStrategy.Overwrite
    );
  };
}

function setupCustomAuth(options: ApplicationOptions): Rule {
  return (tree: Tree, context: SchematicContext) => {
    return mergeWith(
      apply(url('./auth-files/custom'), [
        applyTemplates({
          utils: strings,
          ...options,
        }),
        move(options.appDir || '')
      ]),
      MergeStrategy.Overwrite
    );
  };
}