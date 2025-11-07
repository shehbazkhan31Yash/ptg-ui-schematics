/**
 * Setup Functions Module
 * Extracted from react.ts (lines 2165-2258, 3245-3623)
 * 
 * Contains major setup and customization functions for React workspace generation:
 * - createWorkspaceWithRetry: Workspace creation with multiple fallback strategies
 * - createManualWorkspace: Manual workspace creation without nx CLI
 * - setupAuthentication: MSAL/Okta authentication setup
 * - applyPTGCustomizations: Main orchestrator for app customizations
 * - addVSCodeExtensions: VS Code extension installation
 */

import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';
import { TEMPLATES } from './react';
import { createFileWithErrorHandling, executeCommand, removeNxWelcomeFile, updateTestFiles, fixLintIssues } from '../utils/helpers';

// Template configuration constants
const TEMPLATE_CONFIG = {
  NX_CONFIG: {
    "$schema": "./node_modules/nx/schemas/nx-schema.json",
    "targetDefaults": {
      "build": {
        "cache": true
      },
      "lint": {
        "cache": true
      }
    },
    "defaultProject": "app"
  },
  TSCONFIG_BASE: {
    "compileOnSave": false,
    "compilerOptions": {
      "rootDir": ".",
      "sourceMap": true,
      "declaration": false,
      "moduleResolution": "node",
      "emitDecoratorMetadata": true,
      "experimentalDecorators": true,
      "importHelpers": true,
      "target": "es2015",
      "module": "esnext",
      "lib": ["es2020", "dom"],
      "skipLibCheck": true,
      "skipDefaultLibCheck": true,
      "baseUrl": ".",
      "paths": {}
    },
    "exclude": ["node_modules", "tmp"]
  },
  TSCONFIG: {
    "extends": "./tsconfig.base.json",
    "compilerOptions": {
      "jsx": "react-jsx",
      "allowJs": false,
      "esModuleInterop": false,
      "allowSyntheticDefaultImports": true,
      "strict": true,
      "forceConsistentCasingInFileNames": true,
      "noFallthroughCasesInSwitch": true
    },
    "files": [],
    "include": [],
    "references": [
      {
        "path": "./tsconfig.app.json"
      }
    ]
  }
};

/**
 * Attempts to create an Nx workspace with multiple fallback strategies
 * Strategies: React standalone preset → Node preset
 * @param workspacePath - Absolute path to workspace directory
 * @param a - Configuration object with workspace settings
 * @returns boolean indicating success
 */
export const createWorkspaceWithRetry = (workspacePath: string, a: any): boolean => {
  const nxStyle = a.style === 'styled-components' || a.style === 'emotion' ? 'css' : a.style;

  const strategies = [
    {
      cmd: `npx create-nx-workspace@latest ${a.workspace} --preset react-standalone --appName ${a.name} --style ${nxStyle} --nx-cloud skip --packageManager npm --routing ${a.routing} --bundler ${a.bundler} --unitTestRunner ${a.unitTestRunner} --e2eTestRunner ${a.e2eTestRunner} --no-interactive`,
      desc: "React standalone preset"
    },
    {
      cmd: `npx create-nx-workspace@latest ${a.workspace} --preset node --nx-cloud skip --packageManager npm --no-interactive`,
      desc: "Node preset"
    }
  ];

  for (const strategy of strategies) {
    console.log(`🚀 Attempting workspace creation with ${strategy.desc}...`);
    
    // Clean up any partial directory
    if (fs.existsSync(workspacePath)) {
      fs.rmSync(workspacePath, { recursive: true, force: true });
    }

    if (executeCommand(strategy.cmd, { cwd: process.cwd(), stdio: "inherit" }, strategy.desc)) {
      console.log("✅ Nx workspace created successfully!");
      return true;
    }
  }
  
  return false;
};

/**
 * Creates a minimal Nx workspace manually without using nx CLI
 * Fallback when all nx workspace creation strategies fail
 * @param workspacePath - Absolute path to workspace directory
 * @param a - Configuration object with workspace settings
 * @returns boolean indicating success
 */
export const createManualWorkspace = (workspacePath: string, a: any): boolean => {
  try {
    fs.mkdirSync(workspacePath, { recursive: true });

    const scripts: { [key: string]: string } = {
      build: "nx build",
      test: "nx test",
      start: "nx serve",
    };

    // Add lint scripts if linter is enabled
    if (a.linter && a.linter !== 'none') {
      scripts.lint = `eslint "src/**/*.{js,jsx,ts,tsx}"`;
      scripts["lint:fix"] = `eslint "src/**/*.{js,jsx,ts,tsx}" --fix`;
    }

    // Add format scripts if prettier is enabled
    if (a.prettier) {
      scripts.format = `prettier --write "src/**/*.{js,jsx,ts,tsx,json,css,scss,md}"`;
      scripts["format:check"] = `prettier --check "src/**/*.{js,jsx,ts,tsx,json,css,scss,md}"`;
    }

    const packageJson = {
      name: a.workspace,
      version: "0.0.0",
      license: "MIT",
      type: "module",
      scripts,
      private: true,
      dependencies: {},
      devDependencies: {
        nx: "^21.6.5",
        typescript: "^5.5.0",
        "@nx/react": "^21.6.5",
        "@nx/js": "^21.6.5",
        "@nx/eslint": "^21.6.5",
        "@nx/webpack": "^21.6.5",
        "@nx/vite": "^21.6.5",
        "@nx/workspace": "^21.6.5",
      },
    };

    const filesToCreate = [
      { path: path.join(workspacePath, "nx.json"), content: JSON.stringify(TEMPLATE_CONFIG.NX_CONFIG, null, 2), desc: "nx.json" },
      { path: path.join(workspacePath, "package.json"), content: JSON.stringify(packageJson, null, 2), desc: "package.json" },
      { path: path.join(workspacePath, "tsconfig.base.json"), content: JSON.stringify(TEMPLATE_CONFIG.TSCONFIG_BASE, null, 2), desc: "tsconfig.base.json" },
      { path: path.join(workspacePath, "tsconfig.json"), content: JSON.stringify(TEMPLATE_CONFIG.TSCONFIG, null, 2), desc: "tsconfig.json" },
      { path: path.join(workspacePath, ".gitignore"), content: "node_modules\ndist\n.nx\n", desc: ".gitignore" }
    ];

    for (const file of filesToCreate) {
      if (!createFileWithErrorHandling(file.path, file.content, file.desc)) {
        throw new Error(`Failed to create ${file.desc}`);
      }
    }

    console.log("✅ Manual workspace creation completed");
    return true;
  } catch (error) {
    console.error("\n❌ Manual workspace creation failed:", (error as Error).message);
    return false;
  }
};

/**
 * Sets up authentication (MSAL or Okta) for the React application
 * Creates config files, components, and updates main.tsx with auth providers
 * @param workspacePath - Absolute path to workspace directory
 * @param a - Configuration object with auth settings
 */
export function setupAuthentication(workspacePath: string, a: any): void {
  if (!a.auth || a.auth === 'custom') {
    return; // No setup needed for custom auth
  }

  try {
    console.log(`\n🔐 Setting up ${a.auth.toUpperCase()} authentication...`);

    // Detect app structure
    const standaloneAppPath = path.join(workspacePath, "src");
    const multiAppPath = path.join(workspacePath, "apps", a.name);

    let appPath: string;
    let srcPath: string;

    if (fs.existsSync(standaloneAppPath)) {
      appPath = workspacePath;
      srcPath = standaloneAppPath;
    } else if (fs.existsSync(multiAppPath)) {
      appPath = multiAppPath;
      srcPath = path.join(appPath, "src");
    } else {
      console.warn("⚠️  Could not detect app structure for auth setup");
      return;
    }

    // Create config directory
    const configPath = path.join(srcPath, "config");
    fs.mkdirSync(configPath, { recursive: true });

    // Create components directory
    const componentsPath = path.join(srcPath, "components");
    fs.mkdirSync(componentsPath, { recursive: true });

    if (a.auth === 'msal') {
      // Create MSAL configuration
      const msalConfigPath = path.join(configPath, "msalConfig.ts");
      const msalConfigContent = TEMPLATES.getMsalConfig();
      createFileWithErrorHandling(msalConfigPath, msalConfigContent, "MSAL configuration");

      // Create MSAL Login Button component
      const msalButtonPath = path.join(componentsPath, "MsalLoginButton.tsx");
      const msalButtonContent = TEMPLATES.getMsalLoginButton();
      createFileWithErrorHandling(msalButtonPath, msalButtonContent, "MSAL Login Button component");

      // Update main.tsx to wrap with MsalProvider
      const mainTsxPath = path.join(srcPath, "main.tsx");
      if (fs.existsSync(mainTsxPath)) {
        const updatedMain = `import { StrictMode } from 'react';
import * as ReactDOM from 'react-dom/client';
import { MsalProvider } from '@azure/msal-react';
import { PublicClientApplication } from '@azure/msal-browser';
import { msalConfig } from './config/msalConfig';
import App from './app/app';

const msalInstance = new PublicClientApplication(msalConfig);

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <StrictMode>
    <MsalProvider instance={msalInstance}>
      <App />
    </MsalProvider>
  </StrictMode>
);`;
        fs.writeFileSync(mainTsxPath, updatedMain);
        console.log("✅ Updated main.tsx with MsalProvider");
      }

      console.log("✅ MSAL authentication setup completed!");
      console.log("   📝 Update src/config/msalConfig.ts with your Azure AD credentials");
      console.log("   📝 Use <MsalLoginButton /> component in your app");

    } else if (a.auth === 'okta') {
      // Create Okta configuration
      const oktaConfigPath = path.join(configPath, "oktaConfig.ts");
      const oktaConfigContent = TEMPLATES.getOktaConfig();
      createFileWithErrorHandling(oktaConfigPath, oktaConfigContent, "Okta configuration");

      // Create Okta Login Button component
      const oktaButtonPath = path.join(componentsPath, "OktaLoginButton.tsx");
      const oktaButtonContent = TEMPLATES.getOktaLoginButton();
      createFileWithErrorHandling(oktaButtonPath, oktaButtonContent, "Okta Login Button component");

      // Update main.tsx to wrap with Okta Security
      const mainTsxPath = path.join(srcPath, "main.tsx");
      if (fs.existsSync(mainTsxPath)) {
        const updatedMain = `import { StrictMode } from 'react';
import * as ReactDOM from 'react-dom/client';
import { OktaAuth } from '@okta/okta-auth-js';
import { Security } from '@okta/okta-react';
import { BrowserRouter as Router } from 'react-router-dom';
import oktaConfig from './config/oktaConfig';
import App from './app/app';

const oktaAuth = new OktaAuth(oktaConfig);

const restoreOriginalUri = async (_oktaAuth: any, originalUri: string) => {
  window.location.replace(originalUri || '/');
};

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <StrictMode>
    <Router>
      <Security oktaAuth={oktaAuth} restoreOriginalUri={restoreOriginalUri}>
        <App />
      </Security>
    </Router>
  </StrictMode>
);`;
        fs.writeFileSync(mainTsxPath, updatedMain);
        console.log("✅ Updated main.tsx with Okta Security provider");
      }

      console.log("✅ Okta authentication setup completed!");
      console.log("   📝 Update src/config/oktaConfig.ts with your Okta credentials");
      console.log("   📝 Use <OktaLoginButton /> component in your app");
    }

    // Create README for authentication
    const authReadmePath = path.join(srcPath, `${a.auth.toUpperCase()}_SETUP.md`);
    const authReadmeContent = TEMPLATES.getAuthReadme(a.auth);
    createFileWithErrorHandling(authReadmePath, authReadmeContent, "Authentication setup guide");

  } catch (error) {
    console.warn(`⚠️  Could not setup ${a.auth} authentication:`, (error as Error).message);
  }
}

/**
 * Main orchestrator function that applies all PTG customizations to the workspace
 * Coordinates all setup tasks: branding, i18n, state management, SEO, auth, linting, styling
 * @param workspacePath - Absolute path to workspace directory
 * @param a - Configuration object with all feature flags
 */
export function applyPTGCustomizations(workspacePath: string, a: any): void {
  try {
    console.log("🔧 Applying framework-specific customizations...");

    // Update package.json to include module type for Vite bundler
    // Note: Webpack requires CommonJS, so we only set "module" for Vite
    const packageJsonPath = path.join(workspacePath, "package.json");
    if (fs.existsSync(packageJsonPath)) {
      try {
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
        if (!packageJson.type && a.bundler === 'vite') {
          packageJson.type = "module";
          fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
          console.log("✅ Updated package.json with module type for Vite");
        }
      } catch (error) {
        console.warn("⚠️  Could not update package.json:", (error as Error).message);
      }
    }

    // Detect if it's a standalone app (src in root) or multi-app workspace (apps/appName)
    const standaloneAppPath = path.join(workspacePath, "src");
    const multiAppPath = path.join(workspacePath, "apps", a.name);

    let appPath: string;
    let srcPath: string;
    let appSrcPath: string;

    if (fs.existsSync(standaloneAppPath)) {
      // Standalone app structure
      appPath = workspacePath;
      srcPath = standaloneAppPath;
      appSrcPath = path.join(srcPath, "app");
      console.log("📁 Detected standalone app structure");
    } else if (fs.existsSync(multiAppPath)) {
      // Multi-app workspace structure
      appPath = multiAppPath;
      srcPath = path.join(appPath, "src");
      appSrcPath = path.join(srcPath, "app");
      console.log("📁 Detected multi-app workspace structure");
    } else {
      console.warn(
        "⚠️  Could not detect app structure, skipping customizations"
      );
      return;
    }

    // Remove Nx welcome file first
    removeNxWelcomeFile(workspacePath, a);

    // Update the main app component with PTG branding
    const appTsxPath = path.join(appSrcPath, "app.tsx");
    const appJsxPath = path.join(appSrcPath, "app.jsx");
    const mainAppPath = fs.existsSync(appTsxPath) ? appTsxPath : appJsxPath;

    if (fs.existsSync(mainAppPath)) {
      const appContent = TEMPLATES.getAppContent(a);
      fs.writeFileSync(mainAppPath, appContent);
      console.log("✅ App component updated with PTG features");
    } else {
      console.warn("⚠️  Could not find main app component file");
    }

    // Create i18n configuration if i18n is enabled
    if (a.i18n) {
      console.log("📦 Setting up i18n configuration...");
      const i18nPath = path.join(appSrcPath, "i18n.ts");
      const i18nContent = TEMPLATES.getI18nContent(a.name);
      createFileWithErrorHandling(i18nPath, i18nContent, "i18n configuration");
    }

    // Create state management store based on selection
    if (a.stateManagement === 'redux') {
      console.log("📦 Setting up Redux Toolkit store...");
      const storePath = path.join(appSrcPath, "store.ts");
      const storeContent = TEMPLATES.getReduxStoreContent();
      createFileWithErrorHandling(storePath, storeContent, "Redux store");
    } else if (a.stateManagement === 'zustand') {
      console.log("📦 Setting up Zustand store...");
      const storePath = path.join(appSrcPath, "store.ts");
      const storeContent = TEMPLATES.getZustandStoreContent();
      createFileWithErrorHandling(storePath, storeContent, "Zustand store");
    }

    // Create SEO components and utilities if SEO is enabled
    if (a.seo) {
      console.log("📦 Setting up SEO components and utilities...");
      
      // Create components directory
      const componentsPath = path.join(appSrcPath, "components");
      fs.mkdirSync(componentsPath, { recursive: true });
      
      // Create SEO component
      const seoComponentPath = path.join(componentsPath, "SEO.tsx");
      const seoComponentContent = TEMPLATES.getSEOComponent(a);
      createFileWithErrorHandling(seoComponentPath, seoComponentContent, "SEO component");
      
      // Create Google Analytics component
      const gaComponentPath = path.join(componentsPath, "GoogleAnalytics.tsx");
      const gaComponentContent = TEMPLATES.getGoogleAnalytics(a);
      createFileWithErrorHandling(gaComponentPath, gaComponentContent, "Google Analytics component");
      
      // Create SEO utils
      const utilsPath = path.join(appSrcPath, "utils");
      fs.mkdirSync(utilsPath, { recursive: true });
      
      const seoUtilsPath = path.join(utilsPath, "seo.ts");
      const seoUtilsContent = TEMPLATES.getSEOUtils(a);
      createFileWithErrorHandling(seoUtilsPath, seoUtilsContent, "SEO utilities");
      
      // Create sitemap config
      const sitemapConfigPath = path.join(utilsPath, "sitemap.config.ts");
      const sitemapConfigContent = TEMPLATES.getSitemapConfig(a);
      createFileWithErrorHandling(sitemapConfigPath, sitemapConfigContent, "Sitemap configuration");
      
      // Create public folder for SEO files
      const publicPath = path.join(appPath, "public");
      fs.mkdirSync(publicPath, { recursive: true });
      
      // Create assets/images folder and copy logo
      const assetsPath = path.join(publicPath, "assets", "images");
      fs.mkdirSync(assetsPath, { recursive: true });
      
      // Copy YashLogo from angular-schematics assets
      // When compiled: __dirname is cli/dist/generators, need to go up 3 levels to root
      const sourceLogoPath = path.join(__dirname, "..", "..", "..", "angular-schematics", "src", "application", "files", "src", "assets", "images", "YashLogo.jpg");
      const destLogoPath = path.join(assetsPath, "YashLogo.jpg");
      
      try {
        if (fs.existsSync(sourceLogoPath)) {
          fs.copyFileSync(sourceLogoPath, destLogoPath);
          console.log("✅ Logo copied to assets/images/YashLogo.jpg");
        } else {
          console.warn("⚠️  Warning: YashLogo.jpg not found at source location");
          console.warn(`   Searched at: ${sourceLogoPath}`);
        }
      } catch (error) {
        console.warn("⚠️  Warning: Could not copy logo:", (error as Error).message);
      }
      
      // Create robots.txt
      const robotsTxtPath = path.join(publicPath, "robots.txt");
      const robotsTxtContent = TEMPLATES.getRobotsTxt('https://yourdomain.com');
      createFileWithErrorHandling(robotsTxtPath, robotsTxtContent, "robots.txt");
      
      // Create sitemap.xml
      const sitemapXmlPath = path.join(publicPath, "sitemap.xml");
      const sitemapXmlContent = TEMPLATES.getSitemapXml('https://yourdomain.com');
      createFileWithErrorHandling(sitemapXmlPath, sitemapXmlContent, "sitemap.xml");
      
      console.log("✅ SEO setup completed:");
      console.log("   - Meta tags, Open Graph, Twitter Cards");
      console.log("   - Google Analytics 4 (GA4) / Google Tag Manager (GTM) integration");
      console.log("   - Schema.org structured data (JSON-LD)");
      console.log("   - sitemap.xml and robots.txt");
      console.log("   ⚠️  Replace 'G-XXXXXXXXXX' with your GA4 ID or 'GTM-XXXXXXX' with your GTM ID in App.tsx");
    }

    // Add enhanced styling
    fs.mkdirSync(appSrcPath, { recursive: true });
    const stylePath = path.join(appSrcPath, `app.${a.style}`);
    const styleContent = TEMPLATES.getStyleContent(a);
    createFileWithErrorHandling(stylePath, styleContent, "style file") ||
      createFileWithErrorHandling(path.join(srcPath, `app.${a.style}`), styleContent, "style file (fallback)");

    // Copy logo to public/assets/images for all apps
    if (!a.seo) {
      const publicPath = path.join(appPath, "public");
      fs.mkdirSync(publicPath, { recursive: true });
      
      const assetsPath = path.join(publicPath, "assets", "images");
      fs.mkdirSync(assetsPath, { recursive: true });
      
      // Copy YashLogo from angular-schematics assets
      // When compiled: __dirname is cli/dist/generators, need to go up 3 levels to root
      const sourceLogoPath = path.join(__dirname, "..", "..", "..", "angular-schematics", "src", "application", "files", "src", "assets", "images", "YashLogo.jpg");
      const destLogoPath = path.join(assetsPath, "YashLogo.jpg");
      
      try {
        if (fs.existsSync(sourceLogoPath)) {
          fs.copyFileSync(sourceLogoPath, destLogoPath);
          console.log("✅ Logo copied to public/assets/images/YashLogo.jpg");
        } else {
          console.warn("⚠️  Warning: YashLogo.jpg not found at source location");
          console.warn(`   Searched at: ${sourceLogoPath}`);
        }
      } catch (error) {
        console.warn("⚠️  Warning: Could not copy logo:", (error as Error).message);
      }
    }

    // Setup ESLint and Prettier configurations
    if (a.linter !== 'none') {
      console.log("📦 Setting up ESLint configuration...");
      // Use eslint.config.js for all configurations (ESLint v9 format)
      const eslintConfigPath = path.join(appPath, "eslint.config.js");
      const eslintConfig = TEMPLATES.getEslintConfig(a.linter);
      createFileWithErrorHandling(eslintConfigPath, eslintConfig, "ESLint configuration");
    }

    if (a.prettier) {
      console.log("📦 Setting up Prettier configuration...");
      const prettierConfigPath = path.join(appPath, ".prettierrc");
      const prettierConfig = TEMPLATES.getPrettierConfig();
      createFileWithErrorHandling(prettierConfigPath, prettierConfig, "Prettier configuration");
    }

    // Update test files with proper formatting
    updateTestFiles(workspacePath, a);

    // Setup authentication if MSAL or Okta selected
    setupAuthentication(workspacePath, a);

    // Fix lint issues after all customizations
    fixLintIssues(workspacePath, a);

    console.log("✅ PTG customizations applied successfully!");
  } catch (error) {
    console.warn("⚠️  Some customizations failed to apply:", (error as Error).message);
  }
}

/**
 * Installs recommended VS Code extensions for React development
 * Includes: SCSS, Prettier, TSLint, Icons, React snippets
 */
export function addVSCodeExtensions(): void {
  const extensionsList = [
    "mrmlnc.vscode-scss",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-typescript-tslint-plugin",
    "vscode-icons-team.vscode-icons",
    "dsznajder.es7-react-js-snippets",
    "burkeholland.simple-react-snippets",
  ];
  const extensions = extensionsList
    .map((ext) => `--install-extension ${ext}`)
    .join(" ");
  execSync(`code ${extensions}`, {
    cwd: process.cwd(),
  });
}
