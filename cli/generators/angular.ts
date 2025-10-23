import { execSync } from "child_process";
import {
 writeFileSync,
 existsSync,
 readdirSync,
 lstatSync,
 unlinkSync,
 rmdirSync,
} from "fs";
import * as path from "path";
import { dirSync } from "tmp";
import { ESLINT_CONFIGS, ESLINT_DEPENDENCIES } from "../configs/eslint-configs";
const inquirer = require("inquirer");

/**
 * Creates a temporary sandbox environment for Angular CLI operations
 * This ensures clean dependency resolution and prevents conflicts
 */
async function createSandbox() {
 console.log("\n🏗️  Creating temporary sandbox environment...");
 const tmpDir = dirSync().name;
 console.log(`📁 Sandbox directory: ${tmpDir}`);
 
 try {
  console.log("📝 Creating package.json with Angular dependencies...");
  writeFileSync(
   path.join(tmpDir, "package.json"),
   JSON.stringify({
    dependencies: {
     "@angular/cli": "^18.2.12",
     "@schematics/angular": "^18.2.12",
     "@ngrx/schematics": "^18.1.1",
     typescript: "^5.7.2",
    },
    license: "MIT",
   })
  );
  console.log("✅ package.json created successfully");
 } catch (error) {
  cleanup(tmpDir);
  console.error("❌ Error creating package.json:", error);
  throw error;
 }

 try {
  console.log("📦 Installing Angular CLI dependencies...");
  execSync(`npm install`, {
   cwd: tmpDir,
   stdio: [0, 1, 2],
  });
  console.log("✅ Dependencies installed successfully");
 } catch (error) {
  cleanup(tmpDir);
  console.error("❌ Error during dependency installation:", error);
  throw error;
 }

 try {
  console.log("🔗 Linking PTG Angular Schematics...");
  execSync(`npm link @ptg-ui/angular-schematics --force`, {
   cwd: tmpDir,
   stdio: [0, 1, 2],
  });
  console.log("✅ PTG Angular Schematics linked successfully");
 } catch (error) {
  cleanup(tmpDir);
  console.error("❌ Error linking @ptg-ui/angular-schematics:", error);
  throw error;
 }
 
 console.log("✅ Sandbox environment ready!");
 return tmpDir;
}

//open when require to take name by inquirer
// async function takeAppName(){
//   return inquirer
//   .prompt([
//     {
//       name: "ApplicationName",
//       message: `Enter Application Name`,
//       type: "input",
//     },
//   ])
//   .then((a) => {
//     return a.ApplicationName;
//   });
// }
/**
 * Prompts user for linting preferences and configuration
 * Supports multiple linting styles: Airbnb, Standard, and Custom
 */
async function getLintingPreferences() {
 console.log("\n🔍 Configuring code linting preferences...");
 
 const enableLinting = await inquirer.prompt([
  {
   name: "enableLinting",
   message: "Enable code linting?",
   type: "confirm",
   default: true,
  },
 ]);

 if (!enableLinting.enableLinting) {
  console.log("⚠️  Linting disabled - skipping linting configuration");
  return { enableLinting: false };
 }

 console.log("✅ Linting enabled - selecting style...");
 const lintingStyle = await inquirer.prompt([
  {
   name: "lintingStyle",
   message: "Choose linting style:",
   type: "list",
   choices: [
    { name: "Airbnb", value: "airbnb" },
    { name: "Standard", value: "standard" },
    { name: "Custom", value: "custom" },
   ],
   default: "airbnb",
  },
 ]);

 console.log(`🎯 Selected linting style: ${lintingStyle.lintingStyle}`);
 return {
  enableLinting: true,
  lintingStyle: lintingStyle.lintingStyle,
 };
}

/**
 * Creates the Angular application using PTG schematics
 * Handles linting configuration if enabled by user
 */
async function createApp(tmpDir: string) {
 console.log("\n🚀 Starting Angular application creation...");
 
 // Get user preferences for linting
 const lintingOptions = await getLintingPreferences();
 
 // Prepare Angular CLI command with PTG schematics
 const collection = `${tmpDir}/node_modules/@ptg-ui/angular-schematics/src/collection.json`;
 const command = `${tmpDir}/node_modules/.bin/ng new --collection=${collection} --strict false`;
 
 let projectName = null;
 
 try {
  console.log("\n🏗️  Executing Angular project creation...");
  execSync(`${command}`, {
   stdio: [0, 1, 2],
   cwd: process.cwd(),
  });
  console.log("✅ Angular project created successfully!");
  
  // Find the created project directory
  const currentDir = process.cwd();
  const directories = readdirSync(currentDir).filter(item => 
   lstatSync(path.join(currentDir, item)).isDirectory() && 
   existsSync(path.join(currentDir, item, 'package.json')) &&
   existsSync(path.join(currentDir, item, 'angular.json'))
  );
  
  if (directories.length > 0) {
   projectName = directories[directories.length - 1];
  }
  
  // Apply linting configuration after project creation if enabled
  if (lintingOptions.enableLinting) {
   console.log("\n🔍 Applying linting configuration...");
   await applyLintingConfig(lintingOptions.lintingStyle);
  } else {
   console.log("\n⚠️  Skipping linting configuration (disabled by user)");
  }
  
 } catch (err) {
  console.error("\n❌ Angular project creation failed:");
  console.error(err);
  cleanup(tmpDir);
  throw err;
 }
 
 console.log("\n🧹 Cleaning up sandbox environment...");
 cleanup(tmpDir);
 
 return projectName;
}

/**
 * Applies linting configuration to the newly created Angular project
 * Installs ESLint dependencies and creates configuration files
 */
async function applyLintingConfig(lintingStyle: string) {
 console.log(`\n🔍 Step 1/4: Preparing ${lintingStyle} linting configuration...`);
 
 // Wait a moment for the project to be fully created
 console.log("⏳ Waiting for project creation to complete...");
 await new Promise(resolve => setTimeout(resolve, 2000));
 
 console.log("\n🔍 Step 2/4: Locating Angular project directory...");
 // Find the newly created project directory in current working directory
 const currentDir = process.cwd();
 
 const directories = readdirSync(currentDir).filter(item => 
  lstatSync(path.join(currentDir, item)).isDirectory() && 
  existsSync(path.join(currentDir, item, 'package.json')) &&
  existsSync(path.join(currentDir, item, 'angular.json'))
 );
 
 if (directories.length === 0) {
  console.warn("\n⚠️  Warning: Could not find the created Angular project");
  console.log("❌ Linting configuration skipped");
  return;
 }
 
 // Use the most recently created directory (assuming it's the new project)
 const projectPath = path.join(currentDir, directories[directories.length - 1]);
 console.log(`✅ Found Angular project: ${directories[directories.length - 1]}`);
 
 try {
  console.log("\n🔍 Step 3/4: Installing ESLint dependencies...");
  
  // Prepare dependency lists
  const baseDeps = "@typescript-eslint/eslint-plugin@^6.21.0 @typescript-eslint/parser@^6.21.0 eslint@^8.57.0";
  const styleDeps = ESLINT_DEPENDENCIES[lintingStyle as keyof typeof ESLINT_DEPENDENCIES] || [];
  const allDeps = `${baseDeps} ${styleDeps.join(" ")}`;
  
  console.log("\n⬇️  Installing dependencies...");
  execSync(`npm install --save-dev ${allDeps} --legacy-peer-deps`, {
   cwd: projectPath,
   stdio: [0, 1, 2],
   shell: process.platform === "win32" ? "cmd.exe" : "/bin/sh"
  });
  console.log("✅ ESLint dependencies installed successfully");
  
  console.log("\n🔍 Step 4/4: Creating configuration files...");
  
  // Create ESLint config
  const eslintConfig = createEslintConfig(lintingStyle);
  writeFileSync(path.join(projectPath, ".eslintrc.json"), JSON.stringify(eslintConfig, null, 2));
  
  // Add lint scripts to package.json
  const packageJsonPath = path.join(projectPath, "package.json");
  const packageJson = JSON.parse(require("fs").readFileSync(packageJsonPath, "utf8"));
  packageJson.scripts = packageJson.scripts || {};
  packageJson.scripts.lint = "eslint src/**/*.ts";
  packageJson.scripts["lint:fix"] = "eslint src/**/*.ts --fix";
  writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
  console.log("✅ Configuration files created successfully");
  
  console.log(`\n🎉 ${lintingStyle.toUpperCase()} linting configuration completed!`);
  console.log("\n📋 Available lint commands:");
  console.log('   📝 npm run lint      - Check your code for issues');
  console.log('   🔧 npm run lint:fix  - Automatically fix linting issues');
  
 } catch (error) {
  console.error("\n❌ Linting configuration failed:");
  console.error(`   Error: ${error.message}`);
  console.warn("⚠️  Project created successfully, but linting setup incomplete");
  console.log("💡 You can manually configure ESLint later if needed");
 }
}

function createEslintConfig(lintingStyle: string) {
 return ESLINT_CONFIGS[lintingStyle as keyof typeof ESLINT_CONFIGS] || ESLINT_CONFIGS.custom;
}

/**
 * Installs recommended VS Code extensions for Angular development
 * This function is currently disabled but can be enabled if needed
 */
function addVSCodeExtensions() {
 console.log("\n🔧 Installing recommended VS Code extensions...");
 
 try {
  const extensionsList = [
   "simontest.simontest",           // Simon Test extension
   "nrwl.angular-console",          // Nx Console for Angular
   "mrmlnc.vscode-scss",            // SCSS IntelliSense
   "esbenp.prettier-vscode",        // Prettier code formatter
   "ms-vscode.vscode-typescript-tslint-plugin", // TypeScript linting
   "vscode-icons-team.vscode-icons", // File icons
   "Angular.ng-template",           // Angular template support
  ];
  
  console.log("📦 Extensions to install:");
  extensionsList.forEach(ext => console.log(`   • ${ext}`));
  
  const extensions = extensionsList
   .map((ext) => `--install-extension ${ext}`)
   .join(" ");
   
  console.log("\n⬇️  Installing extensions...");
  execSync(`code ${extensions}`, {
   // stdio: [0, 1, 2],
   cwd: process.cwd(),
  });
  console.log("✅ VS Code extensions installed successfully");
  
 } catch (error) {
  console.warn("\n⚠️  Warning: Could not install VS Code extensions:");
  console.warn(`   ${error.message}`);
  console.log("💡 You can manually install these extensions later from VS Code");
  // Continue execution even if extension installation fails
 }
}

/**
 * Recursively cleans up temporary directories and files
 * Used to remove the sandbox environment after project creation
 */
function cleanup(dirPath: string) {
 if (existsSync(dirPath)) {
  try {
   readdirSync(dirPath).forEach((file) => {
    const curPath = path.join(dirPath, file);
    if (lstatSync(curPath).isDirectory()) {
     // Recursively delete directory
     cleanup(curPath);
    } else {
     // Delete file
     unlinkSync(curPath);
    }
   });
   // Remove the empty directory
   rmdirSync(dirPath);
  } catch (error) {
   console.warn("⚠️  Cleanup warning:", error.message);
  }
 }
}

/**
 * Main entry point for Angular project generation
 * Orchestrates the entire project creation process
 */
export async function invokeAngularGenerator() {
 console.log("\n🚀 PTG Angular Project Generator");
 console.log("==================================\n");
 
 console.log("📋 Process Overview:");
 console.log("   1️⃣  Create sandbox environment");
 console.log("   2️⃣  Configure linting preferences");
 console.log("   3️⃣  Generate Angular project");
 console.log("   4️⃣  Apply linting configuration");
 console.log("   5️⃣  Cleanup and finalize\n");
 
 try {
  // Step 1: Create sandbox environment
  console.log("\n🏗️  Step 1/2: Setting up build environment...");
  const temp = await createSandbox();
  
  // Step 2: Create the Angular application
  console.log("\n🚀 Step 2/2: Creating Angular application...");
  const projectName = await createApp(temp);
  
  // Optional: VS Code extensions (currently disabled)
  // console.log("\n🔧 Installing VS Code extensions...");
  // addVSCodeExtensions();
  
  console.log("\n🎉 Angular project generation completed successfully!");
  console.log("\n📋 Next steps:");
  if (projectName) {
   console.log(`   1. cd ${projectName}`);
   console.log("   2. npm start");
  } else {
   console.log("   1. Navigate to your project directory");
   console.log("   2. Run 'npm start' to start the development server");
  }
  console.log("   3. Open http://localhost:4200 in your browser");
  console.log("   4. Start building your Angular application!\n");
  
 } catch (error) {
  console.error("\n❌ Angular project generation failed:");
  console.error(`   ${error.message}`);
  console.log("\n💡 Troubleshooting tips:");
  console.log("   • Ensure you have Node.js and npm installed");
  console.log("   • Check your internet connection");
  console.log("   • Verify you have write permissions in the current directory");
  console.log("   • Try running the command again\n");
  process.exit(1);
 }
}
