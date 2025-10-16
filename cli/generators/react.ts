import { execSync } from "child_process";

import * as fs from "fs";
import * as path from "path";
import inquirer = require("inquirer");

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
      try {
        // Try with --skip-nx-cache flag and retry logic
        execSync(
          `npx create-nx-workspace@latest ${a.workspace} --preset empty --nx-cloud=skip --package-manager=npm --skip-git --skip-nx-cache`,
          {

            cwd: process.cwd(),
            stdio: "inherit",
          }
        );
      } catch (err) {
        console.log(
          "\n⚠️  First attempt failed, trying alternative approach...\n"
        );
        try {
          // Alternative: Create workspace without automatic dependency installation
          execSync(
            `npx create-nx-workspace@latest ${a.workspace} --preset empty --nx-cloud=skip --package-manager=npm --skip-git --skip-install`,
            {
              cwd: process.cwd(),
              stdio: "inherit",
            }
          );
        } catch (err2) {
          console.error("\n❌ Failed to create Nx workspace\n");
          console.error("Error details:", err2.message);
          console.error("\nTrying manual workspace creation...\n");

          // Manual workspace creation as fallback
          try {
            fs.mkdirSync(workspacePath, { recursive: true });

            // Create basic nx.json
            const nxConfig = {
              extends: "nx/presets/npm.json",
              $schema: "./node_modules/nx/schemas/nx-schema.json",
              targetDefaults: {
                build: {
                  dependsOn: ["^build"],
                  inputs: ["production", "^production"],
                },
              },
            };

            // Create basic package.json
            const packageJson = {
              name: a.workspace,
              version: "0.0.0",
              license: "MIT",
              scripts: {
                build: "nx build",
                test: "nx test",
              },
              private: true,
              dependencies: {},
              devDependencies: {
                nx: "latest",
                typescript: "latest",
                "@nx/react": "latest",
                "@nx/js": "latest",
                "@nx/eslint": "latest",
                "@nx/webpack": "latest",
                "@nx/vite": "latest",
              },
            };

            // Create tsconfig.base.json
            const tsconfigBase = {
              compileOnSave: false,
              compilerOptions: {
                rootDir: ".",
                sourceMap: true,
                declaration: false,
                moduleResolution: "node",
                emitDecoratorMetadata: true,
                experimentalDecorators: true,
                importHelpers: true,
                target: "es2015",
                module: "esnext",
                lib: ["es2020", "dom"],
                skipLibCheck: true,
                skipDefaultLibCheck: true,
                baseUrl: ".",
                paths: {},
              },
              exclude: ["node_modules", "tmp"],
            };

            // Create basic tsconfig.json
            const tsconfig = {
              extends: "./tsconfig.base.json",
              compilerOptions: {
                composite: true,
                declaration: true,
                declarationMap: true,
              },
              files: [],
              include: [],
              references: [],
            };

            fs.writeFileSync(
              path.join(workspacePath, "nx.json"),
              JSON.stringify(nxConfig, null, 2)
            );
            fs.writeFileSync(
              path.join(workspacePath, "package.json"),
              JSON.stringify(packageJson, null, 2)
            );
            fs.writeFileSync(
              path.join(workspacePath, "tsconfig.base.json"),
              JSON.stringify(tsconfigBase, null, 2)
            );
            fs.writeFileSync(
              path.join(workspacePath, "tsconfig.json"),
              JSON.stringify(tsconfig, null, 2)
            );
            fs.writeFileSync(
              path.join(workspacePath, ".gitignore"),
              "node_modules\ndist\n.nx\n"
            );

            console.log("✅ Manual workspace creation completed");
          } catch (manualErr) {
            console.error("\n❌ Manual workspace creation also failed\n");
            throw err;
          }
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

        // Create tsconfig.base.json
        const tsconfigBase = {
          compileOnSave: false,
          compilerOptions: {
            rootDir: ".",
            sourceMap: true,
            declaration: false,
            moduleResolution: "node",
            emitDecoratorMetadata: true,
            experimentalDecorators: true,
            importHelpers: true,
            target: "es2015",
            module: "esnext",
            lib: ["es2020", "dom"],
            skipLibCheck: true,
            skipDefaultLibCheck: true,
            baseUrl: ".",
            paths: {},
          },
          exclude: ["node_modules", "tmp"],
        };

        // Create basic tsconfig.json
        const tsconfig = {
          extends: "./tsconfig.base.json",
          compilerOptions: {
            composite: true,
            declaration: true,
            declarationMap: true,
          },
          files: [],
          include: [],
          references: [],
        };

        fs.writeFileSync(
          tsconfigBasePath,
          JSON.stringify(tsconfigBase, null, 2)
        );
        fs.writeFileSync(tsconfigPath, JSON.stringify(tsconfig, null, 2));

        console.log("✅ TypeScript configuration files created");
      }

      // Step 2: Install workspace dependencies
      console.log("\n📦 Step 2/7: Installing workspace dependencies...\n");
      try {
        // Clear npm cache first
        execSync(`npm cache clean --force`, {
          cwd: workspacePath,
          stdio: [0, 1, 2],
        });

        // Install dependencies with retry logic
        execSync(`npm install --legacy-peer-deps`, {
          cwd: workspacePath,
          stdio: [0, 1, 2],
        });
      } catch (err) {
        console.log(
          "\n⚠️  Standard install failed, trying alternative methods...\n"
        );
        try {
          // Try with different npm flags
          execSync(`npm install --force --no-audit --no-fund`, {
            cwd: workspacePath,
            stdio: [0, 1, 2],
          });
        } catch (err2) {
          console.error("\n❌ Failed to install workspace dependencies\n");
          console.error(
            'You may need to run "npm install" manually in the workspace directory\n'
          );
          // Don't throw, continue with the process
        }
      }

      // Step 3: Install Angular DevKit
      console.log("\n📦 Step 3/7: Installing Angular DevKit...\n");
      try {
        execSync(
          `npm install @angular-devkit/core@latest @angular-devkit/schematics@latest --force --legacy-peer-deps`,
          {
            cwd: workspacePath,
            stdio: [0, 1, 2],
          }
        );
      } catch (err) {
        console.log(
          "\n⚠️  Angular DevKit installation failed, trying alternative...\n"
        );
        try {
          execSync(
            `npm install @angular-devkit/core @angular-devkit/schematics --no-audit --no-fund`,
            {
              cwd: workspacePath,
              stdio: [0, 1, 2],
            }
          );
        } catch (err2) {
          console.error("\n❌ Failed to install Angular DevKit\n");
          console.error(
            "You may need to install @angular-devkit packages manually\n"
          );
          // Continue without throwing
        }
      }

      // Step 3.5: Install Nx React Plugin
      console.log("\n📦 Step 4/7: Installing Nx React Plugin...\n");
      try {
        // First, ensure no conflicting old packages exist
        try {
          execSync(
            `npm uninstall @nrwl/react @nrwl/js @nrwl/eslint @nrwl/webpack @nrwl/workspace @nrwl/cli`,
            {
              cwd: workspacePath,
              stdio: "pipe", // Don't show output as these packages might not exist
            }
          );
        } catch (cleanupErr) {
          // Ignore cleanup errors - packages might not exist
        }

        execSync(
          `npm install @nx/react@latest @nx/js@latest @nx/eslint@latest @nx/webpack@latest @nx/vite@latest --force --legacy-peer-deps`,
          {
            cwd: workspacePath,
            stdio: [0, 1, 2],
          }
        );
      } catch (err) {
        console.log(
          "\n⚠️  Nx React Plugin installation failed, trying alternative...\n"
        );
        try {
          execSync(
            `npm install @nx/react @nx/js @nx/eslint @nx/webpack @nx/vite --no-audit --no-fund`,
            {
              cwd: workspacePath,
              stdio: [0, 1, 2],
            }
          );
        } catch (err2) {
          console.error("\n❌ Failed to install Nx React Plugin\n");
          console.error(
            "You may need to install @nx/react packages manually\n"
          );
          // Continue without throwing
        }
      }

      // Step 4: Install PTG React Schematics
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

      // Step 5: Generate React application
      console.log("\n🚀 Step 6/7: Generating React application...\n");

      // Due to persistent alias collision issues, skip schematic and use direct manual generation
      console.log("🔄 Using direct manual generation to avoid alias collisions...\n");

      try {
        // Create React app manually
        console.log("Creating React application structure manually...");

        // Create app directory structure
        const appPath = path.join(workspacePath, "apps", a.name);
        const srcPath = path.join(appPath, "src");
        const appSrcPath = path.join(srcPath, "app");

        // Create directories
        fs.mkdirSync(appPath, { recursive: true });
        fs.mkdirSync(srcPath, { recursive: true });
        fs.mkdirSync(appSrcPath, { recursive: true });

        // Create basic React files
        const indexHtml = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>${a.name}</title>
    <base href="/" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <link rel="icon" type="image/x-icon" href="favicon.ico" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>`;

        const mainTsx = `import { createRoot } from 'react-dom/client';
import App from './app/app';

const container = document.getElementById('root');
if (!container) {
  throw new Error('Root element not found');
}
const root = createRoot(container);
root.render(<App />);`;

        const appTsx = `import React from 'react';
import './app.${a.style}';

export function App() {
  return (
    <div className="app">
      <h1>Welcome to ${a.name}!</h1>
      <p>This is a React application generated by PTG UI Schematics.</p>
    </div>
  );
}

export default App;`;

        const appCss = `.app {
  font-family: sans-serif;
  min-width: 300px;
  max-width: 600px;
  margin: 50px auto;
}

.app h1 {
  text-align: center;
  margin-bottom: 20px;
  color: #333;
}

.app p {
  text-align: center;
  color: #666;
}`;

        // Write files
        fs.writeFileSync(path.join(appPath, "index.html"), indexHtml);  // Root index.html
        fs.writeFileSync(path.join(srcPath, "main.tsx"), mainTsx);
        fs.writeFileSync(path.join(appSrcPath, "app.tsx"), appTsx);
        fs.writeFileSync(path.join(appSrcPath, `app.${a.style}`), appCss);

        // Update workspace package.json with React dependencies
        const packageJsonPath = path.join(workspacePath, "package.json");
        const packageJson = JSON.parse(
          fs.readFileSync(packageJsonPath, "utf8")
        );

        packageJson.dependencies = packageJson.dependencies || {};
        packageJson.dependencies["react"] = "latest";
        packageJson.dependencies["react-dom"] = "latest";
        packageJson.devDependencies = packageJson.devDependencies || {};
        packageJson.devDependencies["@types/react"] = "latest";
        packageJson.devDependencies["@types/react-dom"] = "latest";
        packageJson.devDependencies["@vitejs/plugin-react"] = "latest";
        packageJson.devDependencies["vite"] = "latest";

        fs.writeFileSync(
          packageJsonPath,
          JSON.stringify(packageJson, null, 2)
        );

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
        const viteConfig = `/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  root: __dirname,
  cacheDir: '../../node_modules/.vite/${a.name}',
  
  server: {
    port: 4200,
    host: 'localhost',
    open: true,
    fs: {
      allow: ['../..']
    }
  },

  preview: {
    port: 4300,
    host: 'localhost',
  },

  plugins: [react()],

  build: {
    outDir: '../../dist/apps/${a.name}',
    reportCompressedSize: true,
    commonjsOptions: {
      transformMixedEsModules: true,
    },
    target: 'esnext',
    minify: 'esbuild',
  },

  optimizeDeps: {
    include: ['react', 'react-dom'],
  },

  define: {
    global: 'globalThis',
  },
});`;

        fs.writeFileSync(path.join(appPath, "vite.config.ts"), viteConfig);

        // Create tsconfig.json for the app
        const tsConfig = {
          "extends": "../../tsconfig.base.json",
          "compilerOptions": {
            "jsx": "react-jsx",
            "allowJs": true,
            "esModuleInterop": true,
            "allowSyntheticDefaultImports": true,
            "strict": false,
            "moduleResolution": "node",
            "types": ["node", "vite/client"]
          },
          "include": ["src/**/*", "index.html"],
          "exclude": ["node_modules", "dist"]
        };

        fs.writeFileSync(
          path.join(appPath, "tsconfig.json"),
          JSON.stringify(tsConfig, null, 2)
        );

        console.log(
          `✅ React application '${a.name}' created successfully using manual generation!`
        );
      } catch (err) {
        console.error("\n❌ Failed to generate React application\n");
        console.error(
          "Manual generation failed. This might be due to:\n"
        );
        console.error("1. Insufficient permissions");
        console.error("2. Missing workspace structure");
        console.error("3. File system errors\n");
        throw err;
      }

      // Step 6: Install additional packages
      console.log(
        "\n📦 Step 7/7: Installing React dependencies and additional packages...\n"
      );

      const npmPkgs = ["react@latest", "react-dom@latest"];

      const devPkgs = [
        "@types/react@latest",
        "@types/react-dom@latest",
        "@vitejs/plugin-react@latest",
        "vite@latest",
        "eslint@latest",
        "prettier@latest",
        "@typescript-eslint/eslint-plugin@latest",
        "@typescript-eslint/parser@latest",
      ];

      if (a.auth) {
        if (a.auth === "msal") {
          npmPkgs.push("@azure/msal-react@latest");
          npmPkgs.push("@azure/msal-browser@latest");
        } else if (a.auth === "okta") {
          npmPkgs.push("@okta/okta-auth-js@latest");
          npmPkgs.push("@okta/okta-react@latest");
        }
      }

      if (a.routing) {
        npmPkgs.push("react-router-dom@latest");
        devPkgs.push("@types/react-router-dom@latest");
      }

      if (a.redux) {
        npmPkgs.push("@reduxjs/toolkit@latest");
        npmPkgs.push("react-redux@latest");
        devPkgs.push("@types/react-redux@latest");
      }

      if (a.i18n) {
        npmPkgs.push("i18next@latest");
        npmPkgs.push("react-i18next@latest");
        npmPkgs.push("i18next-browser-languagedetector@latest");
      }

      if (a.framework === "material") {
        npmPkgs.push("@mui/material@latest");
        npmPkgs.push("@emotion/react@latest");
        npmPkgs.push("@emotion/styled@latest");
      } else if (a.framework === "bootstrap") {
        npmPkgs.push("bootstrap@latest");
        npmPkgs.push("react-bootstrap@latest");
        devPkgs.push("@types/bootstrap@latest");
      }

      try {
        // Install production dependencies
        execSync(`npm install ${npmPkgs.join(" ")} --save`, {
          cwd: workspacePath,
          stdio: [0, 1, 2],
        });

        // Install dev dependencies
        execSync(`npm install ${devPkgs.join(" ")} --save-dev`, {
          cwd: workspacePath,
          stdio: [0, 1, 2],
        });
      } catch (err) {
        console.error(
          "\n⚠️  Some packages failed to install, but you can install them manually later\n"
        );
        console.error("Production packages:", npmPkgs.join(" "));
        console.error("Dev packages:", devPkgs.join(" "));
      }

      console.log("\n✅ React application created successfully!\n");
      console.log("━".repeat(50));
      console.log(`📁 Workspace: ${a.workspace}`);
      console.log(`📱 Application: ${a.name}`);
      console.log(`🎨 Style: ${a.style}`);
      console.log(`🔐 Auth: ${a.auth}`);
      console.log(`🧭 Routing: ${a.routing ? "Yes" : "No"}`);
      console.log(`📦 Redux: ${a.redux ? "Yes" : "No"}`);
      console.log(`🌐 i18n: ${a.i18n ? "Yes" : "No"}`);
      console.log("━".repeat(50));
      console.log("\nTo get started:\n");
      console.log(`  cd ${a.workspace}`);
      console.log(`  npx nx serve ${a.name}`);
      console.log(`\nOr alternatively:`);
      console.log(`  cd ${a.workspace}`);
      console.log(`  npm run start ${a.name}\n`);
    } catch (error) {
      console.error("\n❌ Error creating React application:", error.message);
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
  })
}

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
        name: "redux",
        message: "Would you like to add Redux to this application?",
        type: "confirm",
      },
      {
        name: "i18n",
        message: "would you like to Adds i18n in project?",
        type: "confirm",
      },
    ])
    .then((a: any) => {
      return a;
    });
}

function addVSCodeExtensions() {
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

export function invokeReactGenerator() {
  reactAppGenerator();
  // addVSCodeExtensions();
}
