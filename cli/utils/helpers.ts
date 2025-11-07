/**
 * Utility Helper Functions
 * Extracted from react.ts - Contains utility functions for file operations, package installation, and setup tasks
 * 
 * This file contains:
 * - File creation and command execution helpers
 * - Package installation with retry logic
 * - Nx workspace utilities
 * - Test file updates
 * - Lint fixing
 * - Husky git hooks setup
 */

import { execSync } from "child_process";
import * as fs from "fs";
import * as path from "path";
import { getHuskyPreCommitHook, getLintStagedConfig } from "../configs/eslint-configs";

/**
 * Normalize style option for Nx compatibility
 * Nx only supports: css, scss, less, tailwind, styled-components, @emotion/styled, styled-jsx, none
 * Maps unsupported styles (like Stylus) to css as fallback
 * 
 * @param style - The style option selected by user
 * @returns Normalized style compatible with Nx
 */
export function getNormalizedStyleForNx(style: string): string {
  const nxSupportedStyles = ['css', 'scss', 'less', 'tailwind', 'styled-components', '@emotion/styled', 'styled-jsx', 'none'];
  
  // If style is supported by Nx, return as is
  if (nxSupportedStyles.includes(style)) {
    return style;
  }
  
  // Map unsupported styles to css as fallback
  if (style === 'styl') {
    console.warn(`\n⚠️  Warning: Stylus (.styl) is not supported by Nx. Using CSS as fallback for Nx generation.`);
    console.warn(`   Your application will still be configured to use Stylus files.\n`);
    return 'css';
  }
  
  // Default fallback
  return 'css';
}

/**
 * Create a file with error handling
 * @param filePath - Absolute path to the file
 * @param content - File content
 * @param description - Human-readable description for error messages
 * @returns true if successful, false otherwise
 */
export const createFileWithErrorHandling = (filePath: string, content: string, description: string): boolean => {
  try {
    // Ensure directory exists
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    fs.writeFileSync(filePath, content);
    return true;
  } catch (error: any) {
    console.error(`❌ Failed to create ${description}:`, error.message);
    return false;
  }
};

/**
 * Execute a command with error handling
 * @param command - Command to execute
 * @param options - exec options (cwd, stdio, etc.)
 * @param description - Human-readable description for error messages
 * @returns true if successful, false otherwise
 */
export const executeCommand = (command: string, options: any, description: string): boolean => {
  try {
    execSync(command, options);
    return true;
  } catch (error: any) {
    console.error(`❌ Failed to ${description}:`, error.message);
    return false;
  }
};

/**
 * Install npm packages with multiple retry strategies
 * Tries legacy-peer-deps, force flags, and standard install in order
 * 
 * @param packages - Array of package names to install (empty array = npm install)
 * @param isDev - Whether to use --save-dev flag
 * @param workspacePath - Path to workspace directory
 * @param description - Human-readable description for logging
 * @returns true if any strategy succeeded, false if all failed
 */
export const installPackagesWithRetry = (packages: string[], isDev: boolean, workspacePath: string, description: string): boolean => {
  // If no packages specified, run npm install to install all dependencies from package.json
  const saveFlag = isDev ? "--save-dev" : "--save";
  const command = packages.length === 0 
    ? "npm install" 
    : `npm install ${packages.join(" ")} ${saveFlag}`;
  
  const strategies = [
    { cmd: `${command} --legacy-peer-deps`, desc: "with legacy peer deps" },
    { cmd: `${command} --force --no-audit --no-fund`, desc: "with force flags" },
    { cmd: command, desc: "standard install" }
  ];

  for (const strategy of strategies) {
    console.log(`📦 Trying to install ${description} ${strategy.desc}...`);
    if (executeCommand(strategy.cmd, { cwd: workspacePath, stdio: [0, 1, 2] }, `install ${description}`)) {
      return true;
    }
  }
  
  console.error(`\n⚠️  Failed to install ${description}. You may need to install manually:`);
  console.error(`${command}\n`);
  return false;
};

/**
 * Remove Nx welcome file from generated app
 * @param workspacePath - Path to workspace directory
 * @param a - Application configuration object
 */
export function removeNxWelcomeFile(workspacePath: string, a: any): void {
  try {
    // Detect app structure
    const standaloneAppPath = path.join(workspacePath, "src");
    const multiAppPath = path.join(workspacePath, "apps", a.name);

    let appSrcPath: string;

    if (fs.existsSync(standaloneAppPath)) {
      appSrcPath = path.join(standaloneAppPath, "app");
    } else if (fs.existsSync(multiAppPath)) {
      appSrcPath = path.join(multiAppPath, "src", "app");
    } else {
      return;
    }

    // Remove nx-welcome.tsx if it exists
    const nxWelcomePath = path.join(appSrcPath, "nx-welcome.tsx");
    if (fs.existsSync(nxWelcomePath)) {
      fs.unlinkSync(nxWelcomePath);
      console.log("✅ Removed nx-welcome.tsx file");
    }
  } catch (error: any) {
    console.warn("⚠️  Could not remove nx-welcome file:", error.message);
  }
}

/**
 * Update test files with proper formatting
 * @param workspacePath - Path to workspace directory
 * @param a - Application configuration object
 */
export function updateTestFiles(workspacePath: string, a: any): void {
  if (a.unitTestRunner === 'none') {
    return;
  }

  try {
    // Detect app structure
    const standaloneAppPath = path.join(workspacePath, "src");
    const multiAppPath = path.join(workspacePath, "apps", a.name);

    let appSrcPath: string;

    if (fs.existsSync(standaloneAppPath)) {
      appSrcPath = path.join(standaloneAppPath, "app");
    } else if (fs.existsSync(multiAppPath)) {
      appSrcPath = path.join(multiAppPath, "src", "app");
    } else {
      return;
    }

    // Update app.spec.tsx
    const specPath = path.join(appSrcPath, "app.spec.tsx");
    if (fs.existsSync(specPath)) {
      const updatedSpec = `import { render } from '@testing-library/react';

import App from './app';

describe('App', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<App />);
    expect(baseElement).toBeTruthy();
  });

  it('should have a greeting', () => {
    const { getAllByText } = render(<App />);
    expect(
      getAllByText(new RegExp('Welcome', 'gi')).length
    ).toBeGreaterThan(0);
  });
});
`;
      fs.writeFileSync(specPath, updatedSpec);
      console.log("✅ Updated test file with proper formatting");
    }
  } catch (error: any) {
    console.warn("⚠️  Could not update test files:", error.message);
  }
}

/**
 * Auto-fix lint issues in the workspace
 * @param workspacePath - Path to workspace directory
 * @param a - Application configuration object
 */
export function fixLintIssues(workspacePath: string, a: any): void {
  if (!a.linter || a.linter === 'none') {
    return;
  }

  try {
    console.log("\n🔧 Auto-fixing lint issues...");
    
    // Run lint fix
    execSync('npm run lint:fix', {
      cwd: workspacePath,
      stdio: 'pipe', // Use pipe to suppress output
    });
    
    console.log("✅ Lint issues fixed automatically");
  } catch (error) {
    // It's okay if some issues can't be auto-fixed
    console.log("✅ Lint auto-fix completed (some issues may need manual review)");
  }
}

/**
 * Add lint and format scripts to package.json
 * @param workspacePath - Path to workspace directory
 * @param a - Application configuration object
 */
export function addLintScriptsToPackageJson(workspacePath: string, a: any): void {
  if (!a.linter || a.linter === 'none') {
    return;
  }

  try {
    const packageJsonPath = path.join(workspacePath, "package.json");
    if (!fs.existsSync(packageJsonPath)) {
      console.warn("⚠️  package.json not found, skipping lint scripts");
      return;
    }

    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
    
    // Initialize scripts if not present
    packageJson.scripts = packageJson.scripts || {};

    // Add lint scripts - use paths that work on both Windows and Unix
    packageJson.scripts.lint = `eslint "src/**/*.{js,jsx,ts,tsx}"`;
    packageJson.scripts["lint:fix"] = `eslint "src/**/*.{js,jsx,ts,tsx}" --fix`;

    // Add format scripts if prettier is enabled
    if (a.prettier) {
      packageJson.scripts.format = `prettier --write "src/**/*.{js,jsx,ts,tsx,json,css,scss,md}"`;
      packageJson.scripts["format:check"] = `prettier --check "src/**/*.{js,jsx,ts,tsx,json,css,scss,md}"`;
    }

    // Write back to package.json
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
    console.log("✅ Lint scripts added to package.json");
  } catch (error: any) {
    console.warn("⚠️  Failed to add lint scripts to package.json:", error.message);
  }
}

/**
 * Setup Husky git hooks
 * @param workspacePath - Path to workspace directory
 * @param a - Application configuration object
 */
export function setupHusky(workspacePath: string, a: any): void {
  if (!a.husky) {
    return;
  }

  try {
    console.log("\n🐶 Setting up Husky...");

    // Initialize Husky
    try {
      execSync("npx husky init", {
        cwd: workspacePath,
        stdio: [0, 1, 2],
      });
    } catch (error) {
      // Husky init might fail if already initialized, continue anyway
      console.warn("⚠️  Husky init warning (may already be initialized)");
    }

    // Create .husky directory if it doesn't exist
    const huskyDir = path.join(workspacePath, ".husky");
    if (!fs.existsSync(huskyDir)) {
      fs.mkdirSync(huskyDir, { recursive: true });
    }

    // Create pre-commit hook
    const preCommitPath = path.join(huskyDir, "pre-commit");
    const preCommitContent = getHuskyPreCommitHook(
      a.linter && a.linter !== 'none',
      a.prettier
    );
    
    fs.writeFileSync(preCommitPath, preCommitContent, { mode: 0o755 });
    console.log("✅ Created pre-commit hook");

    // Add lint-staged configuration to package.json
    const packageJsonPath = path.join(workspacePath, "package.json");
    if (fs.existsSync(packageJsonPath)) {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
      
      // Parse the lint-staged config and add it to package.json
      const lintStagedConfigStr = getLintStagedConfig(
        a.linter && a.linter !== 'none',
        a.prettier
      );
      packageJson["lint-staged"] = JSON.parse(lintStagedConfigStr);
      
      // Add prepare script for husky
      packageJson.scripts = packageJson.scripts || {};
      packageJson.scripts.prepare = "husky";
      
      fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
      console.log("✅ Added lint-staged configuration to package.json");
    }

    console.log("✅ Husky setup completed successfully!");
  } catch (error: any) {
    console.error("❌ Failed to setup Husky:", error.message);
    console.warn("You can setup Husky manually later by running:");
    console.warn("  npx husky init");
  }
}
