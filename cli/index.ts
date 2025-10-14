#!/usr/bin/env node
import inquirer = require("inquirer");
import { invokeAngularGenerator } from "./generators/angular";
import { invokeReactGenerator } from "./generators/react";
/**
 * Executions Starts
 */

getArgs().then((appType: any) => {
 invokeCli(appType);
});

/**
 * Executions Ends
 */

function invokeCli(appType: string) {
 switch (appType) {
  case "angular":
   invokeAngularGenerator();
   break;
  case "react":
   invokeReactGenerator();
   break;
  default:
   console.log(`${appType} generator is under development`);
   break;
 }
}

function getArgs() {
 const options: { value: string; name: string }[] = [
  {
   name: "Angular",
   value: "angular",
  },
  {
   name: "ReactS",
   value: "react",
  },
  {
   name: "Vue",
   value: "vue",
  },
 ];
 return (inquirer as any)
  .prompt([
   {
    name: "ApplicationType",
    message: `Select Application Type`,
    type: "list",
    default: "angular",
    choices: options,
   },
  ])
  .then((a: any) => {
   return a.ApplicationType;
  });
}
