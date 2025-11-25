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
} from "@angular-devkit/schematics";
import { ApplicationOptions } from "../types";

/**
 * Add CRUD functionality to Angular application
 * Includes:
 * - API Client Service with HttpClient
 * - Auth Interceptor for automatic token management
 * - Generic CRUD Service
 * - User and Post services
 * - CRUD Demo Component
 * - Environment configuration
 */
export function setCRUD(options: ApplicationOptions): Rule {
  if (!options.crud) {
    return noop;
  }

  return (host: Tree, context: SchematicContext) => {
    context.logger.info('🔧 Adding CRUD functionality...');

    return chain([
      // Add services to core module
      addCrudServices(options),
      
      // Add CRUD demo component to shared module
      addCrudDemoComponent(options),
      
      // Add environment configuration
      addCrudEnvironment(options),
      
      // Update app.module to include HTTP interceptor
      addHttpInterceptor(options),
    ]);
  };
}

/**
 * Add CRUD services (API Client, Auth Interceptor, CRUD Service)
 */
function addCrudServices(options: ApplicationOptions): Rule {
  return (host: Tree, context: SchematicContext) => {
    context.logger.info('  📦 Adding CRUD services...');

    return mergeWith(
      apply(url('./crud-files/services'), [
        applyTemplates({
          utils: strings,
          ...options,
        }),
        move(`${options.appDir}/src/app/core/services`),
      ]),
      MergeStrategy.Overwrite
    );
  };
}

/**
 * Add CRUD Demo Component
 */
function addCrudDemoComponent(options: ApplicationOptions): Rule {
  return (host: Tree, context: SchematicContext) => {
    context.logger.info('  📦 Adding CRUD demo component...');

    return mergeWith(
      apply(url('./crud-files/components'), [
        applyTemplates({
          utils: strings,
          ...options,
          style: options.style || 'scss'
        }),
        move(`${options.appDir}/src/app/shared/components`),
      ]),
      MergeStrategy.Overwrite
    );
  };
}

/**
 * Add environment configuration for API URL
 */
function addCrudEnvironment(options: ApplicationOptions): Rule {
  return (host: Tree, context: SchematicContext) => {
    context.logger.info('  📦 Adding environment configuration...');

    const environmentPath = `${options.appDir}/src/environments/environment.ts`;
    const environmentProdPath = `${options.appDir}/src/environments/environment.prod.ts`;

    // Update development environment
    if (host.exists(environmentPath)) {
      const content = host.read(environmentPath);
      if (content) {
        let envContent = content.toString('utf-8');
        
        // Add apiUrl if not exists
        if (!envContent.includes('apiUrl')) {
          envContent = envContent.replace(
            'export const environment = {',
            `export const environment = {\n  apiUrl: 'https://jsonplaceholder.typicode.com',`
          );
          host.overwrite(environmentPath, envContent);
          context.logger.info('    ✅ Updated environment.ts with apiUrl');
        }
      }
    }

    // Update production environment
    if (host.exists(environmentProdPath)) {
      const content = host.read(environmentProdPath);
      if (content) {
        let envContent = content.toString('utf-8');
        
        // Add apiUrl if not exists
        if (!envContent.includes('apiUrl')) {
          envContent = envContent.replace(
            'export const environment = {',
            `export const environment = {\n  apiUrl: 'https://your-api.com/api',`
          );
          host.overwrite(environmentProdPath, envContent);
          context.logger.info('    ✅ Updated environment.prod.ts with apiUrl');
        }
      }
    }

    return host;
  };
}

/**
 * Add HTTP Interceptor to app.module
 */
function addHttpInterceptor(options: ApplicationOptions): Rule {
  return (host: Tree, context: SchematicContext) => {
    context.logger.info('  📦 Configuring HTTP interceptor...');

    const appModulePath = `${options.appDir}/src/app/app.module.ts`;

    if (!host.exists(appModulePath)) {
      context.logger.warn('    ⚠️  app.module.ts not found, skipping interceptor setup');
      return host;
    }

    const content = host.read(appModulePath);
    if (!content) {
      return host;
    }

    let appModuleContent = content.toString('utf-8');

    // Add imports if not exists
    if (!appModuleContent.includes('HTTP_INTERCEPTORS')) {
      const importStatement = `import { HTTP_INTERCEPTORS } from '@angular/common/http';\n`;
      appModuleContent = importStatement + appModuleContent;
    }

    if (!appModuleContent.includes('AuthInterceptor')) {
      const importStatement = `import { AuthInterceptor } from './core/services/auth.interceptor';\n`;
      appModuleContent = importStatement + appModuleContent;
    }

    // Add to providers array
    if (!appModuleContent.includes('useClass: AuthInterceptor')) {
      const providersRegex = /providers:\s*\[([^\]]*)\]/;
      const match = appModuleContent.match(providersRegex);

      if (match) {
        const existingProviders = match[1].trim();
        const interceptorProvider = `
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    }`;

        const newProviders = existingProviders 
          ? `${existingProviders},${interceptorProvider}`
          : interceptorProvider;

        appModuleContent = appModuleContent.replace(
          providersRegex,
          `providers: [${newProviders}]`
        );
        context.logger.info('    ✅ Added AuthInterceptor to providers');
      }
    }

    host.overwrite(appModulePath, appModuleContent);
    return host;
  };
}

/**
 * Update shared module to declare CRUD demo component
 */
export function updateSharedModuleForCrud(options: ApplicationOptions): Rule {
  return (host: Tree, context: SchematicContext) => {
    const sharedModulePath = `${options.appDir}/src/app/shared/shared.module.ts`;

    if (!host.exists(sharedModulePath)) {
      context.logger.warn('    ⚠️  shared.module.ts not found, skipping component declaration');
      return host;
    }

    const content = host.read(sharedModulePath);
    if (!content) {
      return host;
    }

    let sharedModuleContent = content.toString('utf-8');

    // Add component import
    if (!sharedModuleContent.includes('CrudDemoComponent')) {
      const importStatement = `import { CrudDemoComponent } from './components/crud-demo/crud-demo.component';\n`;
      sharedModuleContent = importStatement + sharedModuleContent;
    }

    // Add FormsModule import if not exists
    if (!sharedModuleContent.includes('FormsModule')) {
      const importStatement = `import { FormsModule } from '@angular/forms';\n`;
      sharedModuleContent = importStatement + sharedModuleContent;
    }

    // Add to declarations
    if (!sharedModuleContent.includes('declarations:')) {
      sharedModuleContent = sharedModuleContent.replace(
        '@NgModule({',
        `@NgModule({\n  declarations: [CrudDemoComponent],`
      );
    } else {
      const declarationsRegex = /declarations:\s*\[([^\]]*)\]/;
      const match = sharedModuleContent.match(declarationsRegex);

      if (match && !match[1].includes('CrudDemoComponent')) {
        const existingDeclarations = match[1].trim();
        const newDeclarations = existingDeclarations 
          ? `${existingDeclarations}, CrudDemoComponent`
          : 'CrudDemoComponent';

        sharedModuleContent = sharedModuleContent.replace(
          declarationsRegex,
          `declarations: [${newDeclarations}]`
        );
      }
    }

    // Add to imports
    const importsRegex = /imports:\s*\[([^\]]*)\]/;
    const match = sharedModuleContent.match(importsRegex);

    if (match && !match[1].includes('FormsModule')) {
      const existingImports = match[1].trim();
      const newImports = existingImports 
        ? `${existingImports}, FormsModule`
        : 'FormsModule';

      sharedModuleContent = sharedModuleContent.replace(
        importsRegex,
        `imports: [${newImports}]`
      );
    }

    // Add to exports
    const exportsRegex = /exports:\s*\[([^\]]*)\]/;
    const exportMatch = sharedModuleContent.match(exportsRegex);

    if (exportMatch && !exportMatch[1].includes('CrudDemoComponent')) {
      const existingExports = exportMatch[1].trim();
      const newExports = existingExports 
        ? `${existingExports}, CrudDemoComponent`
        : 'CrudDemoComponent';

      sharedModuleContent = sharedModuleContent.replace(
        exportsRegex,
        `exports: [${newExports}]`
      );
    } else if (!sharedModuleContent.includes('exports:')) {
      sharedModuleContent = sharedModuleContent.replace(
        '@NgModule({',
        `@NgModule({\n  exports: [CrudDemoComponent],`
      );
    }

    host.overwrite(sharedModulePath, sharedModuleContent);
    context.logger.info('    ✅ Updated shared.module.ts with CrudDemoComponent');

    return host;
  };
}
