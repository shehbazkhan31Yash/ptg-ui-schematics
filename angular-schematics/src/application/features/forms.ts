import {
  apply,
  applyTemplates,
  chain,
  MergeStrategy,
  mergeWith,
  move,
  Rule,
  SchematicContext,
  Tree,
  url,
} from '@angular-devkit/schematics';
import { strings } from '@angular-devkit/core';
import { join, normalize } from 'path';
import { ApplicationOptions } from '../types';

/**
 * Adds Reactive Forms components to the Angular application
 */
export function setFormBuilder(options: ApplicationOptions): Rule {
  return (host: Tree, context: SchematicContext) => {
    if (!options.formBuilder || options.formBuilder === 'none') {
      return host;
    }

    context.logger.info('📝 Adding Reactive Forms components...');

    const appDir = options.appDir || '';
    const style = options.style || 'css';

    return chain([
      // Copy form components with templates
      mergeWith(
        apply(url('./form-files/src'), [
          applyTemplates({
            ...options,
            utils: strings,
            style,
          }),
          move(join(normalize(appDir), 'src')),
        ]),
        MergeStrategy.Overwrite
      ),
      // Import forms module in app module
      addFormsModuleImport(options),
    ]);
  };
}

/**
 * Adds FormsFeatureModule import to app.module.ts
 */
function addFormsModuleImport(options: ApplicationOptions): Rule {
  return (host: Tree, context: SchematicContext) => {
    const appDir = options.appDir || '';
    const appModulePath = join(normalize(appDir), 'src', 'app', 'app.module.ts');

    if (!host.exists(appModulePath)) {
      context.logger.warn('⚠️ app.module.ts not found, skipping forms module import');
      return host;
    }

    const content = host.read(appModulePath);
    if (!content) {
      return host;
    }

    let sourceText = content.toString('utf-8');

    // Add import statement
    const importStatement = `import { FormsFeatureModule } from './forms/forms-feature.module';\n`;
    
    // Find the last import statement
    const lastImportIndex = sourceText.lastIndexOf('import ');
    const nextLineIndex = sourceText.indexOf('\n', lastImportIndex);
    
    if (nextLineIndex !== -1 && !sourceText.includes('FormsFeatureModule')) {
      sourceText = 
        sourceText.slice(0, nextLineIndex + 1) + 
        importStatement + 
        sourceText.slice(nextLineIndex + 1);
    }

    // Add to imports array
    if (!sourceText.includes('FormsFeatureModule')) {
      // Find imports array - match multi-line with capturing group
      const importsRegex = /imports:\s*\[([\s\S]*?)\]/;
      const importsMatch = sourceText.match(importsRegex);
      if (importsMatch) {
        const importsContent = importsMatch[1];
        const newImportsContent = importsContent.trim() 
          ? `${importsContent.trim()},\n    FormsFeatureModule`
          : `\n    FormsFeatureModule\n  `;
        sourceText = sourceText.replace(
          importsRegex,
          `imports: [${newImportsContent}]`
        );
      }
    }

    host.overwrite(appModulePath, sourceText);
    context.logger.info('✅ Forms module imported in app.module.ts');

    return host;
  };
}
