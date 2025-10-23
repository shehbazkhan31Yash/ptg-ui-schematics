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

async function createSandbox() {
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
  console.error("Error creating package.json", error);
 }

 try {
  execSync(`npm install`, {
   cwd: tmpDir,
   stdio: [0, 1, 2],
  });
 } catch (error) {
  cleanup(tmpDir);
  console.error("error on dependency installation", error);
 }

 try {
  execSync(`npm link @ptg-ui/angular-schematics --force`, {
   cwd: tmpDir,
   stdio: [0, 1, 2],
  });
 } catch (error) {
  cleanup(tmpDir);
  console.error("Error on adding @ptg-ui/angular-schematics", error);
 }
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
async function getLintingPreferences() {
 const enableLinting = await inquirer.prompt([
  {
   name: "enableLinting",
   message: "Enable code linting?",
   type: "confirm",
   default: true,
  },
 ]);

 if (!enableLinting.enableLinting) {
  return { enableLinting: false };
 }

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

 return {
  enableLinting: true,
  lintingStyle: lintingStyle.lintingStyle,
 };
}

async function createApp(tmpDir: string) {
 const lintingOptions = await getLintingPreferences();
 const collection = `${tmpDir}/node_modules/@ptg-ui/angular-schematics/src/collection.json`;
 const command = `${tmpDir}/node_modules/.bin/ng new --collection=${collection} --strict false`;
 try {
  execSync(`${command}`, {
   stdio: [0, 1, 2],
   cwd: process.cwd(),
  });
  
  // Apply linting configuration after project creation if enabled
  if (lintingOptions.enableLinting) {
   await applyLintingConfig(lintingOptions.lintingStyle);
  }
 } catch (err) {
  cleanup(tmpDir);
  console.log({ err });
 }
 cleanup(tmpDir);
}

async function applyLintingConfig(lintingStyle: string) {
 // Wait a moment for the project to be fully created
 await new Promise(resolve => setTimeout(resolve, 2000));
 
 // Find the newly created project directory
 const currentDir = process.cwd();
 const directories = readdirSync(currentDir).filter(item => 
  lstatSync(path.join(currentDir, item)).isDirectory() && 
  existsSync(path.join(currentDir, item, 'package.json')) &&
  existsSync(path.join(currentDir, item, 'angular.json'))
 );
 
 if (directories.length === 0) {
  console.warn("Warning: Could not find the created Angular project");
  console.log("Available directories:", readdirSync(currentDir));
  return;
 }
 
 // Use the most recently created directory (assuming it's the new project)
 const projectPath = path.join(currentDir, directories[directories.length - 1]);
 console.log(`Configuring linting for project at: ${projectPath}`);
 
 try {
  // Install linting dependencies
  const baseDeps = "@typescript-eslint/eslint-plugin@^6.21.0 @typescript-eslint/parser@^6.21.0 eslint@^8.57.0";
  let styleDeps = "";
  
  if (lintingStyle === "airbnb") {
   styleDeps = " eslint-config-airbnb-base@^15.0.0 eslint-config-airbnb-typescript@^17.1.0 eslint-plugin-import@^2.29.0";
  } else if (lintingStyle === "standard") {
   styleDeps = " eslint-config-standard@^17.1.0 eslint-plugin-import@^2.29.0 eslint-plugin-n@^16.6.0 eslint-plugin-promise@^6.1.0";
  }
  
  console.log("Installing ESLint dependencies...");
  execSync(`npm install --save-dev ${baseDeps}${styleDeps} --legacy-peer-deps`, {
   cwd: projectPath,
   stdio: [0, 1, 2],
   shell: process.platform === "win32" ? "cmd.exe" : "/bin/sh"
  });
  
  // Create ESLint config
  const eslintConfig = createEslintConfig(lintingStyle);
  writeFileSync(path.join(projectPath, ".eslintrc.json"), JSON.stringify(eslintConfig, null, 2));
  console.log("Created .eslintrc.json");
  
  // Add lint scripts to package.json
  const packageJsonPath = path.join(projectPath, "package.json");
  const packageJson = JSON.parse(require("fs").readFileSync(packageJsonPath, "utf8"));
  packageJson.scripts = packageJson.scripts || {};
  packageJson.scripts.lint = "eslint src/**/*.ts";
  packageJson.scripts["lint:fix"] = "eslint src/**/*.ts --fix";
  writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
  console.log("Added lint scripts to package.json");
  
  console.log(`\n🔍 ${lintingStyle} linting configuration added`);
  console.log('📝 Run "npm run lint" to check your code');
 } catch (error) {
  console.warn("Warning: Could not configure linting:", error.message);
  console.error(error);
 }
}

function createEslintConfig(lintingStyle: string) {
 if (lintingStyle === "airbnb") {
  return {
   extends: ["@typescript-eslint/recommended", "airbnb-base", "airbnb-typescript/base"],
   parser: "@typescript-eslint/parser",
   parserOptions: { project: "./tsconfig.json" },
   plugins: ["@typescript-eslint"],
   rules: {}
  };
 } else if (lintingStyle === "standard") {
  return {
   extends: ["@typescript-eslint/recommended", "standard"],
   parser: "@typescript-eslint/parser",
   parserOptions: { project: "./tsconfig.json" },
   plugins: ["@typescript-eslint"],
   rules: {}
  };
 } else {
  return {
   extends: ["@typescript-eslint/recommended"],
   parser: "@typescript-eslint/parser",
   parserOptions: { project: "./tsconfig.json" },
   plugins: ["@typescript-eslint"],
   rules: {}
  };
 }
}

function addVSCodeExtensions() {
 try {
  const extensionsList = [
   "simontest.simontest", 
   "nrwl.angular-console",
   "mrmlnc.vscode-scss",
   "esbenp.prettier-vscode",
   "ms-vscode.vscode-typescript-tslint-plugin",
   "vscode-icons-team.vscode-icons",
   "Angular.ng-template",
  ];
  const extensions = extensionsList
   .map((ext) => `--install-extension ${ext}`)
   .join(" ");
  execSync(`code ${extensions}`, {
   // stdio: [0, 1, 2],
   cwd: process.cwd(),
  });
  console.log("VS Code extensions installed successfully");
 } catch (error) {
  console.warn("Warning: Could not install VS Code extensions:", error.message);
  // Continue execution even if extension installation fails
 }
}

//cleanup function
function cleanup(dirPath: string) {
 if (existsSync(dirPath)) {
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
 } else {
  console.warn(`Directory does not exist: ${dirPath}`);
 }
}

export async function invokeAngularGenerator() {
 const temp = await createSandbox();
 createApp(temp);
//  addVSCodeExtensions();
}
