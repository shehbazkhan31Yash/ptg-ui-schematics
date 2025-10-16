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
async function createApp(tmpDir: string) {
 const collection = `${tmpDir}/node_modules/@ptg-ui/angular-schematics/src/collection.json`;
 const command = `${tmpDir}/node_modules/.bin/ng new --collection=${collection} --strict false`;
 try {
  execSync(`${command}`, {
   stdio: [0, 1, 2],
   cwd: process.cwd(),
  });
 } catch (err) {
  cleanup(tmpDir);
  console.log({ err });
 }
 cleanup(tmpDir);
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
 addVSCodeExtensions();
}
