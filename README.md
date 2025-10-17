# PTG UI Schematics

A comprehensive CLI tool for generating modern web applications with enterprise-ready configurations and best practices. This monorepo contains schematics for React, Angular, and Vue applications with various authentication, styling, and feature options.

## 🚀 Quick Start

### Installation

**From NPM Registry:**
```bash
npm install -g @ptg-ui/cli
```

**Generate a new application:**
```bash
ptg-ui-cli
```

### Usage Example

```bash
$ ptg-ui-cli

? Select Application Type › 
❯ Angular  Generate a new Angular application
  React   Generate a new React application  
  Vue      Generate a new Vue application

# For Angular:
? Workspace name (e.g., org name) › my-company
? What name would you like to use for the application? › dashboard
? Would you like to use standalone components? › Yes
? Would you like to add NgRx for state management? › Yes
? Which Authentication you would like to add? › MSAL
? Which stylesheet format would you like to use? › SCSS

# For React:
? Workspace name (e.g., org name) › my-company
? What name would you like to use for the application? › dashboard
? Which framework would you like to use? › Material
? Which Authentication you would like to add? › MSAL
? Which stylesheet format would you like to use? › SCSS
? Would you like to add React Router? › Yes
? Would you like to add Redux? › Yes
```

## 📦 Project Structure

```
ptg-ui-schematics/
├── cli/                     # Main CLI package (@ptg-ui/cli)
│   ├── generators/
│   │   ├── angular.ts      # Angular app generator
│   │   └── react.ts        # React app generator
│   └── index.ts            # CLI entry point
├── angular-schematics/      # Angular schematics (@ptg-ui/angular-schematics)
│   └── src/
│       ├── application/    # Angular app templates
│       └── collection.json # Schematic definitions
├── react-schematics/        # React schematics (@ptg-ui/react-schematics)
│   └── src/
│       ├── application/    # React app templates
│       └── collection.json # Schematic definitions
└── package.json            # Root package dependencies
```

## ⚙️ Features

### Angular Applications
- Modern Angular 18+ with TypeScript
- Standalone components support
- NgRx state management
- Multiple authentication options (MSAL, Okta, Custom)
- Internationalization (i18n) support
- Material Design integration
- PWA capabilities
- Comprehensive testing setup

### React Applications
- Modern React 18+ with TypeScript
- Nx workspace architecture
- Redux Toolkit state management
- Multiple authentication options (MSAL, Okta, Custom)
- React Router for navigation
- Material-UI or Bootstrap integration
- Internationalization (i18next) support
- Vite/Webpack bundling options
- Comprehensive testing (Vitest/Jest, Cypress/Playwright)

### Authentication Options
- **MSAL**: Microsoft Authentication Library
- **Okta**: Okta authentication integration
- **Custom**: Custom authentication implementation

### Styling Options
- CSS
- SCSS/SASS
- Less
- Stylus
- Tailwind CSS (Angular)

## 🛠️ Local Development

### Prerequisites
```bash
node >= 18.0.0
npm >= 8.0.0
```

### Setup for Local Development

1. **Clone the repository:**
```bash
git clone git@github.com:shehbazkhan31Yash/ptg-ui-schematics.git
cd ptg-ui-schematics
```

2. **Install root dependencies:**
```bash
npm install
```

3. **Setup each package:**

**CLI Package:**
```bash
cd cli
npm install
npm run build
npm link
cd ..
```

**Angular Schematics:**
```bash
cd angular-schematics
npm install
npm run build
npm link
cd ..
```

**React Schematics:**
```bash
cd react-schematics
npm install
npm run build
npm link
cd ..
```

4. **Test the CLI:**
```bash
# Create a test directory
mkdir test-app && cd test-app

# Run the CLI
ptg-ui-cli
```

### Development Workflow

1. **Make changes** to any package
2. **Build the package:**
```bash
cd [package-folder]
npm run build
```
3. **Test changes:**
```bash
# In a new directory
ptg-ui-cli
```

### Important Notes for Local Development

- The CLI uses `npm link` for local development in `cli/generators/react.ts` and `cli/generators/angular.ts`
- Before publishing, change `npm link` to `npm install` in the generator files
- Each package has its own version in `package.json`

## 📋 Testing

### Test Generated Applications

**Angular:**
```bash
cd [generated-workspace]
npm start
# or
ng serve
```

**React:**
```bash
cd [generated-workspace]
npx nx serve [app-name]
# or
npm run start
```

### Run Unit Tests
```bash
# In each package directory
npm test
```

## 🚀 Publishing

### Pre-publish Checklist

1. **Update generator files** to use `npm install` instead of `npm link`:
   - `cli/generators/react.ts`: Change `npm link @ptg-ui/react-schematics` to `npm install @ptg-ui/react-schematics`
   - `cli/generators/angular.ts`: Change `npm link @ptg-ui/angular-schematics` to `npm install @ptg-ui/angular-schematics`

2. **Update versions** in each package's `package.json`

3. **Build all packages:**
```bash
# In each package directory
npm run build
```

### Publish to NPM Registry

```bash
# Publish each package separately
cd cli && npm publish
cd ../angular-schematics && npm publish
cd ../react-schematics && npm publish
```

### Post-publish

Revert generator files back to `npm link` for continued local development.

## 🔧 Configuration

### Registry Configuration
All packages are configured to publish to:
```
https://pkgs.dev.azure.com/YASHTech-UIUX/YASH-UIUX-Library/_packaging/UI-packages/npm/registry/
```

### Package Versions
Current version: `2.0.8` (synchronized across all packages)

## 📝 Generated Application Structure

### Angular Application
```
my-workspace/
├── src/
│   ├── app/
│   │   ├── core/           # Core module
│   │   ├── shared/         # Shared components
│   │   ├── app.component.* # Main app component
│   │   └── app.theme.scss  # Theme styles
│   └── assets/
├── angular.json
└── package.json
```

### React Application
```
my-workspace/
├── apps/
│   └── my-app/
│       ├── src/
│       │   ├── app/        # App components
│       │   └── main.tsx    # Entry point
│       ├── project.json    # Nx project config
│       └── vite.config.ts  # Vite configuration
├── nx.json
└── package.json
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test locally using the development setup
5. Update documentation if needed
6. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details
