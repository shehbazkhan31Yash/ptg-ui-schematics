# Husky Integration for PTG UI Schematics

## Overview
Husky has been successfully integrated into the PTG UI Schematics React generator. Users can now opt to add Git hooks (pre-commit) during the React application setup process.

## Changes Made

### 1. Schema Configuration (`react-schematics/src/application/schema.json`)
- Added `husky` property as a boolean option with default value `false`
- Added x-prompt configuration to ask users if they want Husky for Git hooks
- Updated required fields to include `husky`

### 2. Utility Functions (`react-schematics/src/utils/eslint-configs.ts` and `cli/configs/eslint-configs.ts`)
Added the following helper functions:

#### `getHuskyDependencies(huskyEnabled: boolean)`
Returns an object/array with Husky-related dependencies:
- `husky@latest`
- `lint-staged@latest`

#### `getHuskyPreCommitHook(hasLinter: boolean, hasPrettier: boolean)`
Generates the pre-commit hook script that:
- Runs `npm run lint:fix` if linter is enabled
- Runs `npm run format` if Prettier is enabled
- Executes `npx lint-staged` for staged files
- Falls back to a simple echo command if neither linter nor Prettier is enabled

#### `getLintStagedConfig(hasLinter: boolean, hasPrettier: boolean)`
Generates the lint-staged configuration object that:
- Runs ESLint on staged `.{js,jsx,ts,tsx}` files if linter is enabled
- Runs Prettier on staged files if Prettier is enabled
- Combines both if both are enabled
- Returns the configuration as a JSON string

### 3. CLI Generator (`cli/generators/react.ts`)
#### Updated Imports
- Added `getHuskyDependencies`, `getHuskyPreCommitHook`, and `getLintStagedConfig` to imports

#### User Prompts
- Added Husky prompt in the `getArgs()` function with confirmation type
- Default value is `false`

#### Template Updates
- Added Husky to the feature list in `getAppContent` template
- Shows "✅ Husky Git Hooks" when enabled

#### Dependency Management
- Updated `getDependenciesByFeature()` to include Husky dependencies in `baseDevPkgs` when enabled

#### Setup Function
Added `setupHusky(workspacePath: string, a: any)` function that:
1. Initializes Husky with `npx husky init`
2. Creates `.husky` directory
3. Creates `pre-commit` hook file with executable permissions
4. Adds `lint-staged` configuration to `package.json`
5. Adds `prepare` script to run Husky
6. Handles errors gracefully with informative messages

#### Generator Flow
- Called `setupHusky()` after installing dependencies
- Added Husky status to the final success message

### 4. Schematic Rules (`react-schematics/src/application/index.ts`)
#### New Functions

##### `setHuskyToPackageJson(options: any): Rule`
Adds Husky dependencies to `package.json` when Husky is enabled

##### `addHuskyConfigToProject(options: any): Rule`
- Creates `.husky/pre-commit` hook file
- Adds `lint-staged` configuration to `package.json`
- Adds `prepare` script for Husky initialization

#### Chain Updates
- Added `setHuskyToPackageJson(originalOptionsObject)` to the rule chain
- Added `addHuskyConfigToProject(originalOptionsObject)` to the rule chain

## How It Works

### User Flow
1. User runs the CLI to create a new React application
2. User is prompted with: "Would you like to add Husky for Git hooks (pre-commit)?"
3. If user selects "Yes":
   - Husky and lint-staged packages are added to devDependencies
   - `.husky` directory is created with a `pre-commit` hook
   - `lint-staged` configuration is added to `package.json`
   - `prepare` script is added to automatically setup Husky on npm install

### Pre-commit Hook Behavior
When a commit is attempted:
1. Husky intercepts the commit
2. Runs configured commands based on user selections:
   - If linter enabled: Runs `npm run lint:fix`
   - If Prettier enabled: Runs `npm run format`
3. Runs `npx lint-staged` to check only staged files
4. Commit proceeds only if all checks pass

### Lint-staged Configuration
Based on user selections, lint-staged will:
- Run ESLint with `--fix` on staged TypeScript/JavaScript files
- Run Prettier with `--write` on staged files
- Only process files that are actually staged for commit

## Benefits
1. **Code Quality**: Ensures code meets quality standards before commits
2. **Consistency**: Automatically formats and lints code before committing
3. **Team Collaboration**: Prevents bad code from entering the repository
4. **Flexibility**: Works with or without linter/Prettier
5. **Automatic Setup**: Zero configuration required from developers after project creation

## Example Package.json Additions

```json
{
  "scripts": {
    "prepare": "husky"
  },
  "lint-staged": {
    "*.{js,jsx,ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{json,css,scss,md}": [
      "prettier --write"
    ]
  },
  "devDependencies": {
    "husky": "^9.0.0",
    "lint-staged": "^15.0.0"
  }
}
```

## Pre-commit Hook Example

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

npm run lint:fix
npm run format
npx lint-staged
```

## Testing
To test the integration:
1. Create a new React app with the CLI
2. Select "Yes" for Husky when prompted
3. After setup, try committing a file with linting errors
4. Observe that the pre-commit hook runs and fixes issues automatically

## Notes
- Husky requires Git to be initialized in the project
- The `prepare` script ensures Husky is set up after `npm install`
- Pre-commit hooks are stored in `.husky` directory (should be committed to Git)
- Lint-staged only processes staged files for better performance
