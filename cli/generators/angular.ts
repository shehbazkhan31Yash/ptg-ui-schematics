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

const inquirer = require("inquirer");

/**
 * Creates a temporary sandbox environment for Angular CLI operations
 * This ensures clean dependency resolution and prevents conflicts
 */
async function createSandbox() {
 console.log("\n🏗️  Creating temporary sandbox environment...");
 const tmpDir = dirSync().name;
 
 try {
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
 } catch (error) {
  cleanup(tmpDir);
  console.error("❌ Error during dependency installation:", error);
  throw error;
 }

 try {
  execSync(`npm link @ptg-ui/angular-schematics --force`, {
   cwd: tmpDir,
   stdio: [0, 1, 2],
  });
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
 * Creates the Angular application using PTG schematics
 */
async function createApp(tmpDir: string) {
 console.log("\n🚀 Starting Angular application creation...");
 
 // Get project name from user
 const projectName = await inquirer.prompt([
  {
   name: "name",
   message: "Enter project name:",
   type: "input",
   default: "my-angular-app",
   validate: (input: string) => {
    if (!input || input.trim().length === 0) {
     return "Project name is required";
    }
    if (!/^[a-zA-Z][a-zA-Z0-9-]*$/.test(input)) {
     return "Project name must start with a letter and contain only letters, numbers, and hyphens";
    }
    return true;
   }
  }
 ]).then((answers: any) => answers.name);
 
 // Prepare Angular CLI command with PTG schematics
 const collection = `@ptg-ui/angular-schematics`;
 const command = `${tmpDir}/node_modules/.bin/ng new ${projectName} --collection=${collection} --strict false`;
 
 let createdProjectName = projectName;
 
 try {
  execSync(`${command}`, {
   stdio: [0, 1, 2],
   cwd: process.cwd(),
  });
  console.log("✅ Angular project created successfully!");
  
  // Project should be created with the specified name
  createdProjectName = projectName;
  
 } catch (err) {
  console.error("\n❌ Angular project creation failed:");
  console.error(err);
  cleanup(tmpDir);
  throw err;
 }
 
 console.log("\n🧹 Cleaning up sandbox environment...");
 cleanup(tmpDir);
 
 return createdProjectName;
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
  console.log("\nTo get started:\n");
  if (projectName) {
   console.log(`  cd ${projectName}`);
   console.log("  ng serve");
   console.log("\nOr alternatively:");
   console.log(`  cd ${projectName}`);
   console.log("  npm start\n");
  } else {
   console.log("  Navigate to your project directory");
   console.log("  ng serve\n");
  }
  
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
