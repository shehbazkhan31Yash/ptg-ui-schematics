/**
 * PTG React Generator - Main Entry Point
 * Refactored from 3623-line monolith into modular structure
 * 
 * This file orchestrates the React workspace generation process by:
 * - Gathering user inputs via CLI prompts
 * - Coordinating workspace creation with Nx
 * - Applying PTG customizations
 * - Installing dependencies
 * 
 * Template generation logic extracted to:
 * - templates/react-components.ts - React component templates
 * - templates/auth-templates.ts - MSAL/Okta auth configs
 * - templates/seo-templates.ts - SEO optimization features
 * - templates/config-templates.ts - Configuration file templates
 * 
 * Utility functions extracted to:
 * - utils/helpers.ts - File operations, command execution, package installation
 * - utils/dependencies.ts - Package dependency management
 * - generators/setup-functions.ts - Workspace creation, auth setup, customizations
 */

import { execSync } from "child_process";
import * as fs from "fs";
import * as path from "path";
import inquirer = require("inquirer");

// Import configuration utilities
import { 
  getEslintConfig, 
  getEslintDependencies, 
  getPrettierDependencies, 
  getHuskyDependencies 
} from "../configs/eslint-configs";
import { 
  getPrettierConfig, 
  CONFIG as TEMPLATE_CONFIG 
} from "../configs/config-templates";

// Import template generators
import {
  getAppContent
} from '../templates/react-components';
import {
  getMsalConfig,
  getOktaConfig,
  getMsalLoginButton,
  getOktaLoginButton,
  getAuthReadme
} from '../templates/auth-templates';
import {
  getSEOComponent,
  getGoogleAnalytics,
  getSEOUtils,
  getRobotsTxt,
  getSitemapXml,
  getSitemapConfig
} from '../templates/seo-templates';
import {
  getI18nContent,
  getReduxStoreContent,
  getZustandStoreContent,
  getStyleContent,
  getMainTsx,
  getIndexHtml,
  getBasicAppTsx,
  getBasicAppCss,
  getViteConfig,
  getEslintConfig as getEslintConfigTemplate,
  getPrettierConfig as getPrettierConfigTemplate
} from '../templates/config-templates';

// Import utility functions
import {
  getNormalizedStyleForNx,
  createFileWithErrorHandling,
  executeCommand,
  installPackagesWithRetry,
  removeNxWelcomeFile,
  updateTestFiles,
  fixLintIssues,
  addLintScriptsToPackageJson,
  setupHusky
} from '../utils/helpers';
import {
  getDependenciesByFeature
} from '../utils/dependencies';

// Import setup and customization functions
import {
  createWorkspaceWithRetry,
  createManualWorkspace,
  setupAuthentication,
  applyPTGCustomizations,
  addVSCodeExtensions
} from './setup-functions';

// Re-export all template functions in TEMPLATES object for backward compatibility
export const TEMPLATES = {
  // React Components
  getAppContent,
  
  // Authentication
  getMsalConfig,
  getOktaConfig,
  getMsalLoginButton,
  getOktaLoginButton,
  getAuthReadme,
  
  // SEO
  getSEOComponent,
  getGoogleAnalytics,
  getSEOUtils,
  getRobotsTxt,
  getSitemapXml,
  getSitemapConfig,
  
  // Configuration
  getI18nContent,
  getReduxStoreContent,
  getZustandStoreContent,
  getStyleContent,
  getMainTsx,
  getIndexHtml,
  getBasicAppTsx,
  getBasicAppCss,
  getViteConfig,
  getEslintConfig: getEslintConfigTemplate,
  getPrettierConfig: getPrettierConfigTemplate
};

/**
 * Main React Application Generator Function
 * Orchestrates the entire workspace creation and customization process
 * 
 * Steps:
 * 1. Create Nx workspace with retry strategies
 * 2. Install workspace dependencies
 * 3. Install Angular DevKit (for schematics)
 * 4. Install Nx React Plugin
 * 5. Install PTG React Schematics
 * 6. Generate React application
 * 7. Install feature-specific dependencies
 */
export function reactAppGenerator() {
  getArgs().then((a: any) => {
    try {
      const workspacePath = path.join(process.cwd(), a.workspace);

      // Check if workspace already exists
      if (fs.existsSync(workspacePath)) {
        console.error(
          `\n❌ Error: Directory "${a.workspace}" already exists. Please choose a different name or remove the existing directory.\n`
        );
        process.exit(1);
      }

      // Step 1: Create Nx workspace
      console.log("\n🚀 Step 1/7: Creating Nx workspace...\n");
      
      if (!createWorkspaceWithRetry(workspacePath, a)) {
        console.log("\n⚠️  All Nx presets failed, creating minimal workspace manually...\n");
        if (!createManualWorkspace(workspacePath, a)) {
          throw new Error("All workspace creation methods failed");
        }
      }

      // Check if workspace directory was created
      if (!fs.existsSync(workspacePath)) {
        console.error("\n❌ Workspace directory was not created. Exiting...\n");
        process.exit(1);
      }

      // Ensure TypeScript configuration files exist
      const tsconfigBasePath = path.join(workspacePath, "tsconfig.base.json");
      const tsconfigPath = path.join(workspacePath, "tsconfig.json");

      if (!fs.existsSync(tsconfigBasePath) && !fs.existsSync(tsconfigPath)) {
        console.log("\n⚠️  TypeScript configuration missing, creating...\n");
        createFileWithErrorHandling(tsconfigBasePath, JSON.stringify(TEMPLATE_CONFIG.TSCONFIG_BASE, null, 2), "tsconfig.base.json");
        createFileWithErrorHandling(tsconfigPath, JSON.stringify(TEMPLATE_CONFIG.TSCONFIG, null, 2), "tsconfig.json");
        console.log("✅ TypeScript configuration files created");
      }

      // Step 2: Install workspace dependencies
      console.log("\n📦 Step 2/7: Installing workspace dependencies...\n");
      installPackagesWithRetry([], false, workspacePath, "workspace dependencies");

      // Step 3: Install Angular DevKit
      console.log("\n📦 Step 3/7: Installing Angular DevKit...\n");
      installPackagesWithRetry(["@angular-devkit/core@latest", "@angular-devkit/schematics@latest"], true, workspacePath, "Angular DevKit");

      // Step 4: Install Nx React Plugin
      console.log("\n📦 Step 4/7: Installing Nx React Plugin...\n");
      
      // Clean up old packages first
      executeCommand(
        `npm uninstall @nrwl/react @nrwl/js @nrwl/eslint @nrwl/webpack @nrwl/workspace @nrwl/cli`,
        { cwd: workspacePath, stdio: "pipe" },
        "cleanup old packages"
      );
      
      // Prepare bundler-specific packages
      const nxPlugins = [
        "@nx/react@latest", 
        "@nx/js@latest", 
        "@nx/eslint@latest"
      ];
      
      // Add bundler-specific plugins
      if (a.bundler === 'webpack') {
        nxPlugins.push("@nx/webpack@latest");
      } else if (a.bundler === 'vite' || a.bundler === 'esbuild') {
        nxPlugins.push("@nx/vite@latest");
      } else if (a.bundler === 'rspack') {
        nxPlugins.push("@nx/rspack@latest");
      } else if (a.bundler === 'rsbuild') {
        nxPlugins.push("@nx/rsbuild@latest");
      }
      
      installPackagesWithRetry(nxPlugins, true, workspacePath, "Nx React Plugin");

      // Step 5: Install PTG React Schematics
      console.log("\n📦 Step 5/7: Installing PTG React Schematics...\n");
      try {
        // For local development, use npm link instead of npm install
        execSync(`npm link @ptg-ui/react-schematics --force`, {
          cwd: workspacePath,
          stdio: [0, 1, 2],
        });
      } catch (err) {
        console.log(
          "\n⚠️  PTG React Schematics linking failed, trying alternative approaches...\n"
        );
        try {
          // Try installing from local path
          const localSchematicsPath = path.resolve(
            __dirname,
            "../../react-schematics"
          );
          if (fs.existsSync(localSchematicsPath)) {
            execSync(
              `npm install "${localSchematicsPath}" --no-audit --no-fund`,
              {
                cwd: workspacePath,
                stdio: [0, 1, 2],
              }
            );
          } else {
            throw new Error("Local react-schematics path not found");
          }
        } catch (err2) {
          console.log(
            "\n⚠️  Local installation failed, trying npm registry...\n"
          );
          try {
            execSync(
              `npm install @ptg-ui/react-schematics --no-audit --no-fund`,
              {
                cwd: workspacePath,
                stdio: [0, 1, 2],
              }
            );
          } catch (err3) {
            console.error("\n❌ Failed to install PTG React Schematics\n");
            console.error("This appears to be a local development setup.\n");
            console.error(
              "Please ensure you have run the following commands in the react-schematics directory:\n"
            );
            console.error("1. cd react-schematics");
            console.error("2. npm install");
            console.error("3. npm run build");
            console.error("4. npm link\n");
            console.error("Then try running the CLI again.\n");
            throw err3;
          }
        }
      }

      // Step 6: Generate React application
      console.log("\n🚀 Step 6/7: Generating React application...\n");

      // Check if app was already created by the preset
      const appPath = path.join(workspacePath, "apps", a.name);
      const standaloneAppPath = path.join(workspacePath, "src");

      if (fs.existsSync(appPath) || fs.existsSync(standaloneAppPath)) {
        // If using SCSS, ensure SASS is installed
        if (a.style === 'scss') {
          try {
            execSync('npm install --save-dev sass', {
              cwd: workspacePath,
              stdio: [0, 1, 2],
            });
          } catch (error) {
            console.warn("⚠️ Failed to install SASS. You may need to install it manually: npm install --save-dev sass");
          }
        }
        
        // If using Stylus, ensure stylus is installed
        if (a.style === 'styl') {
          try {
            execSync('npm install --save-dev stylus', {
              cwd: workspacePath,
              stdio: [0, 1, 2],
            });
            console.log("✅ Stylus installed successfully");
          } catch (error) {
            console.warn("⚠️ Failed to install Stylus. You may need to install it manually: npm install --save-dev stylus");
          }
        }

        // Apply PTG customizations to the preset-generated app
        console.log(
          "🎨 Applying PTG customizations to preset-generated app..."
        );
        applyPTGCustomizations(workspacePath, a);
      } else {
        console.log("🚀 Creating React application using Nx generator...");

        // Normalize style for Nx compatibility
        const nxStyle = getNormalizedStyleForNx(a.style);

        try {
          // Use Nx React generator to create the application
          execSync(
            `npx nx generate @nx/react:application ${a.name} --style=${nxStyle} --routing=${a.routing} --bundler=${a.bundler} --unitTestRunner=${a.unitTestRunner} --e2eTestRunner=${a.e2eTestRunner} --linter=${a.linter !== 'none' ? 'eslint' : 'none'} --skipFormat=true --no-interactive`,
            {
              cwd: workspacePath,
              stdio: [0, 1, 2],
            }
          );
          console.log(
            `✅ React application '${a.name}' created successfully using Nx generator!`
          );

          // Apply PTG customizations to the generated app
          console.log("🎨 Applying PTG customizations...");
          applyPTGCustomizations(workspacePath, a);
        } catch (err) {
          console.log(
            "\n⚠️  Nx React generator failed, trying alternative approach...\n"
          );

          try {
            // Try without some optional parameters
            execSync(
              `npx nx generate @nx/react:app ${a.name} --style=${nxStyle} --routing=${a.routing} --linter=${a.linter === 'none' ? 'none' : 'eslint'} --no-interactive`,
              {
                cwd: workspacePath,
                stdio: [0, 1, 2],
              }
            );
            console.log(
              `✅ React application '${a.name}' created successfully with fallback command!`
            );

            // Apply PTG customizations to the generated app
            console.log("🎨 Applying PTG customizations...");
            applyPTGCustomizations(workspacePath, a);
          } catch (err2) {
            console.log(
              "\n⚠️  Standard Nx generators failed, trying PTG React Schematics...\n"
            );

            try {
              // Try using the custom PTG React schematic
              // Note: PTG schematic handles the original style option internally
              execSync(
                `npx nx generate @ptg-ui/react-schematics:application ${a.name} --style=${a.style} --routing=${a.routing} --framework=${a.framework} --auth=${a.auth} --stateManagement=${a.stateManagement} --i18n=${a.i18n} --linter=${a.linter} --no-interactive`,
                {
                  cwd: workspacePath,
                  stdio: [0, 1, 2],
                }
              );
              console.log(
                `✅ React application '${a.name}' created successfully using PTG React Schematics!`
              );

              // PTG schematics should already include customizations, but apply any additional ones
              console.log("🎨 Applying additional PTG customizations...");
              applyPTGCustomizations(workspacePath, a);
            } catch (err3) {
              console.error("\n❌ All React generation methods failed\n");
              console.error("Nx generator error:", (err2 as Error).message);
              console.error("PTG schematic error:", (err3 as Error).message);
              console.error("\nFalling back to manual creation...\n");

              // Manual creation as last resort
              createManualReactApp(workspacePath, a);
            }
          }
        }
      }

      // Step 7: Install additional packages
      console.log("\n📦 Step 7/7: Installing React dependencies and additional packages...\n");

      const dependencies = getDependenciesByFeature(a);
      
      // Add specific note for SEO
      if (a.seo) {
        if (a.bundler === 'vite') {
          console.log("✅ SEO enabled with custom React hook + vite-plugin-ssr for SSR/SSG");
          console.log("   - Client-side: Custom hook for dynamic meta tags");
          console.log("   - Server-side: vite-plugin-ssr for prerendering and SSR\n");
        } else {
          console.log("✅ SEO enabled with custom React hook (client-side only)");
          console.log("   - Dynamic meta tags via custom hook");
          console.log(`   - Note: SSR/SSG requires Vite bundler (you selected ${a.bundler})\n`);
        }
      }
      
      installPackagesWithRetry(dependencies.production, false, workspacePath, "production dependencies");
      installPackagesWithRetry(dependencies.development, true, workspacePath, "development dependencies");

      // Add lint scripts to package.json
      addLintScriptsToPackageJson(workspacePath, a);

      // Setup Husky if enabled
      setupHusky(workspacePath, a);

      console.log("\n✅ React application created successfully!\n");
      console.log("━".repeat(50));
      console.log(`📁 Workspace: ${a.workspace}`);
      console.log(`📱 Application: ${a.name}`);
      console.log(`🎨 Style: ${a.style}`);
      console.log(`🔐 Auth: ${a.auth}`);
      console.log(`🧭 Routing: ${a.routing ? "Yes" : "No"}`);
      console.log(`📦 State Management: ${a.stateManagement === 'redux' ? 'Redux Toolkit' : a.stateManagement === 'zustand' ? 'Zustand' : 'None'}`);
      console.log(`🌐 i18n: ${a.i18n ? "Yes" : "No"}`);
      console.log(`🔍 SEO: ${a.seo ? (a.bundler === 'vite' ? "Yes (with vite-plugin-ssr for SSR/SSG)" : "Yes (client-side only)") : "No"}`);
      console.log(`🔧 Linter: ${a.linter === 'none' ? 'None' : a.linter === 'airbnb' ? 'ESLint with Airbnb' : a.linter === 'custom' ? 'ESLint with Custom Rules' : 'ESLint'}`);
      console.log(`✨ Prettier: ${a.prettier ? "Yes" : "No"}`);
      console.log(`🐶 Husky: ${a.husky ? "Yes" : "No"}`);
      console.log("━".repeat(50));
      console.log("\nTo get started:\n");
      console.log(`  cd ${a.workspace}`);
      console.log(`  npx nx serve ${a.name}`);
      console.log(`\nOr alternatively:`);
      console.log(`  cd ${a.workspace}`);
      console.log(`  npm run start ${a.name}\n`);
      
      // Add SEO-specific instructions if enabled
      if (a.seo) {
        console.log("📝 SEO Features:");
        console.log("   - Meta tags configured in src/app/components/SEO.tsx");
        console.log("   - Google Analytics 4 (GA4) / Google Tag Manager (GTM) ready");
        console.log("   - Component: src/app/components/GoogleAnalytics.tsx");
        console.log("   ⚠️  Replace 'G-XXXXXXXXXX' with your GA4 ID or 'GTM-XXXXXXX' with your GTM ID in App.tsx");
        console.log("   - Customize SEO defaults in src/app/utils/seo.ts");
        console.log("   - robots.txt available in public/robots.txt");
        console.log("   - sitemap.xml available in public/sitemap.xml");
        console.log("   - Schema.org structured data (JSON-LD) included");
        if (a.bundler === 'vite') {
          console.log("   - SSR/SSG enabled via vite-plugin-ssr (prerendering)");
          console.log("   - Run 'npm run build' to generate static HTML with meta tags");
        } else {
          console.log(`   - Note: Using ${a.bundler} bundler (SSR/SSG requires Vite)`);
          console.log("   - Meta tags updated dynamically on client-side");
        }
        console.log("   - See SEO_INTEGRATION_GUIDE.md for detailed usage\n");
      }
    } catch (error) {
      console.error("\n❌ Error creating React application:", (error as Error).message);
      console.error("\nTroubleshooting tips:");
      console.error("1. Clear npm cache: npm cache clean --force");
      console.error("2. Check your internet connection");
      console.error("3. Try using a different network or VPN");
      console.error("4. Check npm registry: npm config get registry");
      console.error(
        "5. Try running with different Node.js version (use nvm if available)"
      );
      console.error(
        "6. Check if you have write permissions in the current directory"
      );
      console.error("7. Try running the command with administrator privileges");
      console.error("8. Disable any antivirus software temporarily");
      console.error(
        "9. Try running: npm config set registry https://registry.npmjs.org/"
      );
      console.error("10. If on corporate network, check proxy settings\n");
      process.exit(1);
    }
  });
}

/**
 * Gathers user inputs via CLI prompts
 * Returns configuration object with all user selections
 */
function getArgs() {
  const frameWorkOptions: { value: string; label: string }[] = [
    {
      value: "none",
      label: "None",
    },
    {
      value: "material",
      label: "Material",
    },
    {
      value: "bootstrap",
      label: "Bootstrap",
    },
  ];
  const styleOptions: { value: string; label: string }[] = [
    {
      value: "css",
      label: "CSS",
    },
    {
      value: "scss",
      label: "SASS(.scss)",
    },
    {
      value: "styl",
      label: "Stylus(.styl)",
    },
    {
      value: "less",
      label: "LESS",
    },
  ];
  const authOptions: { value: string; label: string }[] = [
    {
      value: "custom",
      label: "Custom",
    },
    {
      value: "msal",
      label: "Msal",
    },
    {
      value: "okta",
      label: "Okta",
    },
  ];
  const bundlerOptions: { value: string; label: string }[] = [
    {
      value: "vite",
      label: "Vite (Recommended)",
    },
    {
      value: "webpack",
      label: "Webpack",
    },
  ];
  const unitTestOptions: { value: string; label: string }[] = [
    {
      value: "vitest",
      label: "Vitest (Recommended)",
    },
    {
      value: "jest",
      label: "Jest",
    },
    {
      value: "none",
      label: "None",
    },
  ];
  const e2eTestOptions: { value: string; label: string }[] = [
    {
      value: "cypress",
      label: "Cypress",
    },
    {
      value: "playwright",
      label: "Playwright",
    },
    {
      value: "none",
      label: "None",
    },
  ];
  const stateManagementOptions: { value: string; label: string }[] = [
    {
      value: "redux",
      label: "Redux Toolkit - Popular, powerful state management",
    },
    {
      value: "zustand",
      label: "Zustand - Lightweight, simple state management",
    },
    {
      value: "none",
      label: "None - No state management library",
    },
  ];
  const linterOptions: { value: string; label: string }[] = [
    {
      value: "eslint",
      label: "Standard - Popular JavaScript style guide",
    },
    {
      value: "airbnb",
      label: "Airbnb - Strict and comprehensive rules",
    },
    {
      value: "custom",
      label: "Custom - Basic TypeScript ESLint setup",
    },
    {
      value: "none",
      label: "None",
    },
  ];
  return (inquirer as any)
    .prompt([
      {
        name: "workspace",
        message: `Workspace name (e.g., org name)`,
        type: "string",
      },
      {
        name: "name",
        message: `What name would you like to use for the application?`,
        type: "string",
      },
      {
        name: "framework",
        message: `Which framework would you like to use?`,
        type: "list",
        default: "none",
        choices: frameWorkOptions,
      },
      {
        name: "auth",
        message: `Which Authentication you would like to add to this Application??`,
        type: "list",
        default: "custom",
        choices: authOptions,
      },
      {
        name: "style",
        message: `Which stylesheet format would you like to use?`,
        type: "list",
        default: "css",
        choices: styleOptions,
      },
      {
        name: "routing",
        message: "Would you like to add React Router to this application?",
        type: "confirm",
      },
      {
        name: "stateManagement",
        message: "Which state management library would you like to use?",
        type: "list",
        default: "none",
        choices: stateManagementOptions,
      },
      {
        name: "i18n",
        message: "would you like to Adds i18n in project?",
        type: "confirm",
      },
      {
        name: "bundler",
        message: "Which bundler would you like to use?",
        type: "list",
        default: "vite",
        choices: bundlerOptions,
      },
      {
        name: "unitTestRunner",
        message: "Which unit test runner would you like to use?",
        type: "list",
        default: "vitest",
        choices: unitTestOptions,
      },
      {
        name: "e2eTestRunner",
        message: "Which test runner would you like to use for end to end tests?",
        type: "list",
        default: "none",
        choices: e2eTestOptions,
      },
      {
        name: "linter",
        message: "Which linter would you like to use?",
        type: "list",
        default: "eslint",
        choices: linterOptions,
      },
      {
        name: "prettier",
        message: "Would you like to use Prettier for code formatting?",
        type: "confirm",
        default: true,
      },
      {
        name: "husky",
        message: "Would you like to add Husky for Git hooks (pre-commit)?",
        type: "confirm",
        default: false,
      },
      {
        name: "seo",
        message: "Would you like to enable SEO features? (Meta tags, Open Graph, GA4/GTM, Sitemap)",
        type: "confirm",
        default: true,
      },
    ])
    .then((a: any) => {
      return a;
    });
}

/**
 * Creates a React application manually when all Nx generators fail
 * Last resort fallback that creates minimal working React app structure
 * @param workspacePath - Absolute path to workspace directory
 * @param a - Configuration object with app settings
 */
function createManualReactApp(workspacePath: string, a: any) {
  console.log("📁 Creating React application structure manually...");

  // Create app directory structure
  const appPath = path.join(workspacePath, "apps", a.name);
  const srcPath = path.join(appPath, "src");
  const appSrcPath = path.join(srcPath, "app");

  // Create directories
  fs.mkdirSync(appPath, { recursive: true });
  fs.mkdirSync(srcPath, { recursive: true });
  fs.mkdirSync(appSrcPath, { recursive: true });

  // Create basic React files
  const indexHtml = TEMPLATES.getIndexHtml(a.name, a.seo);
  const mainTsx = TEMPLATES.getMainTsx(a);
  const appTsx = TEMPLATES.getBasicAppTsx(a);
  const appCss = TEMPLATES.getBasicAppCss();

  // Write files
  fs.writeFileSync(path.join(appPath, "index.html"), indexHtml);
  fs.writeFileSync(path.join(srcPath, "main.tsx"), mainTsx);
  fs.writeFileSync(path.join(appSrcPath, "app.tsx"), appTsx);
  fs.writeFileSync(path.join(appSrcPath, `app.${a.style}`), appCss);

  // Update workspace package.json with React dependencies
  const packageJsonPath = path.join(workspacePath, "package.json");
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));

  packageJson.type = "module";
  packageJson.dependencies = packageJson.dependencies || {};
  packageJson.dependencies["react"] = "latest";
  packageJson.dependencies["react-dom"] = "latest";
  packageJson.devDependencies = packageJson.devDependencies || {};
  packageJson.devDependencies["@types/react"] = "latest";
  packageJson.devDependencies["@types/react-dom"] = "latest";
  packageJson.devDependencies["@vitejs/plugin-react"] = "latest";
  packageJson.devDependencies["vite"] = "latest";

  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));

  // Update nx.json to include the new project
  const nxJsonPath = path.join(workspacePath, "nx.json");
  let nxJson: any = {};
  if (fs.existsSync(nxJsonPath)) {
    nxJson = JSON.parse(fs.readFileSync(nxJsonPath, "utf8"));
  }

  nxJson.projects = nxJson.projects || {};
  nxJson.projects[a.name] = `apps/${a.name}`;

  fs.writeFileSync(nxJsonPath, JSON.stringify(nxJson, null, 2));

  // Create project.json for the app
  const projectJson = {
    name: a.name,
    sourceRoot: `apps/${a.name}/src`,
    projectType: "application",
    targets: {
      build: {
        executor: "@nx/vite:build",
        outputs: [`{options.outputPath}`],
        options: {
          outputPath: `dist/apps/${a.name}`,
        },
      },
      serve: {
        executor: "@nx/vite:dev-server",
        defaultConfiguration: "development",
        options: {
          buildTarget: `${a.name}:build`,
        },
        configurations: {
          development: {
            buildTarget: `${a.name}:build:development`,
            hmr: true,
          },
          production: {
            buildTarget: `${a.name}:build:production`,
            hmr: false,
          },
        },
      },
      preview: {
        executor: "@nx/vite:preview-server",
        defaultConfiguration: "development",
        options: {
          buildTarget: `${a.name}:build`,
        },
      },
      test: {
        executor: "@nx/vite:test",
        outputs: [`{options.reportsDirectory}`],
        options: {
          passWithNoTests: true,
          reportsDirectory: `../../coverage/apps/${a.name}`,
        },
      },
      lint: {
        executor: "@nx/eslint:lint",
        outputs: [`{options.outputFile}`],
        options: {
          lintFilePatterns: [`apps/${a.name}/**/*.{ts,tsx,js,jsx}`],
        },
      },
    },
  };

  fs.writeFileSync(
    path.join(appPath, "project.json"),
    JSON.stringify(projectJson, null, 2)
  );

  // Create vite.config.ts
  const viteConfig = TEMPLATES.getViteConfig(a.name, a.seo, a.bundler);

  fs.writeFileSync(path.join(appPath, "vite.config.ts"), viteConfig);

  // Create tsconfig.json for the app
  fs.writeFileSync(
    path.join(appPath, "tsconfig.json"),
    JSON.stringify(TEMPLATE_CONFIG.APP_TSCONFIG, null, 2)
  );

  // Setup ESLint and Prettier if requested
  if (a.linter !== 'none') {
    const eslintConfigPath = path.join(appPath, "eslint.config.js");
    const eslintConfig = TEMPLATES.getEslintConfig(a.linter);
    createFileWithErrorHandling(eslintConfigPath, eslintConfig, "ESLint configuration");
  }

  if (a.prettier) {
    const prettierConfigPath = path.join(appPath, ".prettierrc");
    const prettierConfig = TEMPLATES.getPrettierConfig();
    createFileWithErrorHandling(prettierConfigPath, prettierConfig, "Prettier configuration");
  }

  console.log(
    `✅ React application '${a.name}' created successfully using manual fallback!`
  );
}

/**
 * Main export function that invokes the React generator
 * Can optionally install VS Code extensions (currently disabled)
 */
export function invokeReactGenerator() {
  reactAppGenerator();
  // addVSCodeExtensions(); // Disabled by default
}
