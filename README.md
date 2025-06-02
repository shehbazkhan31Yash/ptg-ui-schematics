# Introduction 
This project is useful for generating applications(React, Angular, Vue) using cli.

# Getting Started
To use ptg-ui-schematics locally, follow below steps,

Clone the repo from the below link,
git@github.com:shehbazkhan31Yash/ptg-ui-schematics.git

Go to cli/generators/react.ts and check for below code
`npm link @ptg-ui/react-schematics --force`
For local setup, it should be `npm link @ptg-ui/react-schematics --force`. Make sure to change it it to `npm install @ptg-ui/react-schematics --force` before publishing.

Follow the same steps for Angular schematics.

CLI folder setup
Step 1 : npm install
After code change,
Step 2 : npm run build
Step 3 : npm link

Angular folder schematic setup
Step 1 : npm install
After code change,
Step 2 : npm run build
Step 3 : npm link

React schematic folder setup
Step 1 : npm install
After code change,
Step 2 : npm run build
Step 3 : npm link

# Build and Test
After runnig `npm run build` and `npm link`, to test the changes,

Create a new folder and open it with cmd or gitbash.
Type `ptg-ui-cli` and select the options you need to create the application.
It will generate the basic application with dummy setup for the options you have selected.
Check the changes that you have built.

# Contribute
After the changes are finalized,

Before publishing it on npm registry,
Go to cli/generators/react.ts and check for below code, 
`npm link @ptg-ui/react-schematics --force`
Make sure to change it it to `npm install @ptg-ui/react-schematics --force` before publishing.

Follow the same steps for Angular schematics.

Publish the changes on npm registry,
Go to respective folder(cli, angular-schematics or react-schematics) change the version in package.json file and run `npm publish`, it should publish with your updated version.

To use ptg-ui-schematics from npm registry, you need to install below package globally

`npm install -g @ptg-ui/cli`

After that create a new folder and open it with cmd or gitbash.
Type `ptg-ui-cli` and select the options you need to create the application.
It will generate the basic application with dummy setup for the options you have selected.
