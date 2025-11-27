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
} from "@angular-devkit/schematics";
import { strings } from "@angular-devkit/core";
import { ApplicationOptions } from "../types";
import { addPackageJsonDependency, NodeDependencyType } from "@schematics/angular/utility/dependencies";

/**
 * Adds accessibility tools and components to the Angular application
 * Includes axe-core for automated testing and accessible UI components
 */
export function setAccessibility(options: ApplicationOptions): Rule {
  return (host: Tree, context: SchematicContext) => {
    if (!options.accessibility) {
      return host;
    }

    context.logger.info("♿ Adding accessibility tools and components...");

    return chain([
      // Add accessibility dependencies to package.json
      addAccessibilityDependencies(),
      
      // Copy accessibility files (components, services, module)
      mergeWith(
        apply(url("./accessibility-files"), [
          applyTemplates({
            utils: strings,
            ...options,
          }),
          move(`${options.appDir}/src/app/accessibility`),
        ]),
        MergeStrategy.Default
      ),
      
      // Update package.json with accessibility packages
      (tree: Tree) => {
        context.logger.info("📦 Adding accessibility packages to package.json...");
        
        addPackageJsonDependency(tree, {
          type: NodeDependencyType.Default,
          name: "axe-core",
          version: "^4.8.3",
        });

        // Note: Angular accessibility linting is built into @angular-eslint/eslint-plugin-template
        // which is already included in Angular projects by default

        context.logger.info("✅ Accessibility tools configured successfully!");
        context.logger.info("   - Accessible components created in src/app/accessibility/");
        context.logger.info("   - AccessibilityModule ready to import");
        context.logger.info("   - axe-core added for automated testing");
        context.logger.info("   - @angular-eslint includes template accessibility rules");
        context.logger.info("   📝 See src/app/accessibility/ACCESSIBILITY_GUIDE.md for usage");
        
        return tree;
      },
    ]);
  };
}

/**
 * Helper function to add accessibility dependencies
 */
function addAccessibilityDependencies(): Rule {
  return (host: Tree, context: SchematicContext) => {
    context.logger.info("📦 Configuring accessibility dependencies...");
    return host;
  };
}

/**
 * Updates the SharedModule to export accessibility components
 * This makes the components available throughout the application
 */
export function updateSharedModuleForAccessibility(options: ApplicationOptions): Rule {
  return (host: Tree, context: SchematicContext) => {
    if (!options.accessibility) {
      return host;
    }

    const sharedModulePath = `${options.appDir}/src/app/shared/shared.module.ts`;

    if (!host.exists(sharedModulePath)) {
      context.logger.warn("⚠️  SharedModule not found. Skipping accessibility module integration.");
      return host;
    }

    let content = host.read(sharedModulePath)!.toString("utf-8");

    // Add AccessibilityModule import
    const importStatement = `import { AccessibilityModule } from '../accessibility/accessibility.module';\n`;
    
    if (!content.includes("AccessibilityModule")) {
      // Find the last import statement
      const lastImportIndex = content.lastIndexOf("import ");
      const endOfLastImport = content.indexOf("\n", lastImportIndex) + 1;
      content = content.slice(0, endOfLastImport) + importStatement + content.slice(endOfLastImport);

      // Add to imports array
      const importsMatch = content.match(/imports:\s*\[([\s\S]*?)\]/);
      if (importsMatch) {
        const importsContent = importsMatch[1];
        const updatedImports = importsContent.trim()
          ? `${importsContent.trim()},\n    AccessibilityModule`
          : `AccessibilityModule`;
        content = content.replace(
          /imports:\s*\[([\s\S]*?)\]/,
          `imports: [\n    ${updatedImports}\n  ]`
        );
      }

      // Add to exports array
      const exportsMatch = content.match(/exports:\s*\[([\s\S]*?)\]/);
      if (exportsMatch) {
        const exportsContent = exportsMatch[1];
        const updatedExports = exportsContent.trim()
          ? `${exportsContent.trim()},\n    AccessibilityModule`
          : `AccessibilityModule`;
        content = content.replace(
          /exports:\s*\[([\s\S]*?)\]/,
          `exports: [\n    ${updatedExports}\n  ]`
        );
      }

      host.overwrite(sharedModulePath, content);
      context.logger.info("✅ AccessibilityModule added to SharedModule");
    }

    return host;
  };
}
