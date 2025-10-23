# PTG UI Angular Schematics

A comprehensive schematic collection for generating modern Angular applications with PTG UI's enterprise-ready configurations and best practices. This tool is part of the PTG UI Schematics suite, providing a robust way to scaffold Angular applications with various features and configurations.

## 🚀 Quick Start

### Installation

1. **Install the PTG UI CLI globally:**
```bash
npm install -g @ptg-ui/schematics-cli
```

2. **Generate a new application:**
```bash
ptg-ui-cli
```

3. **Follow the CLI prompts:**
```bash
? Select Application Type › 
  React    Generate a new React application
❯ Angular  Generate a new Angular application
  Vue      Generate a new Vue application
```

4. **Select 'Angular' and continue with the configuration prompts**

## ⚙️ Features

### Core Features
- Modern Angular 16+ setup with TypeScript
- Nx workspace architecture for scalability
- NgRx integration for state management
- Standalone components support
- Multiple authentication options
- Comprehensive testing setup

### Build & Development Tools
- **Build Configuration**:
  - Development and production builds
  - Advanced optimization options
  - Source maps configuration
  - Asset management

- **Testing Infrastructure**:
  - Unit Testing with Jasmine
  - E2E Testing with Cypress/Protractor
  - Code coverage reporting
  - Component testing utilities

- **Code Quality**:
  - ESLint configuration
  - Prettier formatting
  - TypeScript strict mode
  - Angular coding standards

### Optional Features
- NgRx for state management
- Internationalization (i18n)
- PWA support
- Authentication integrations
- Dynamic form generation

## 🔧 Configuration Options

After selecting "Angular" as your application type, you'll be prompted to configure:

1. **Project Structure**
   - Workspace name
   - Application name
   - Standalone vs NgModule-based
   - Directory structure preferences

2. **Features**
   - Routing configuration
   - State management (NgRx)
   - Internationalization (i18n)
   - PWA features

3. **Authentication**
   - Custom implementation
   - MSAL (Microsoft Authentication)
   - Okta
   - Auth0

4. **Styling**
   - CSS
   - SCSS
   - Less
   - Tailwind CSS

### Example Configuration Flow
```bash
$ ptg-ui-cli

? Select Application Type › 
  React    Generate a new React application
❯ Angular  Generate a new Angular application
  Vue      Generate a new Vue application

? Workspace name (e.g., org name) › my-company
? What name would you like to use for the application? › dashboard
? Would you like to use standalone components? › Yes
? Would you like to add NgRx for state management? › Yes
? Which Authentication you would like to add to this Application? › MSAL
? Which stylesheet format would you like to use? › SCSS
? Would you like to add i18n support? › Yes
? Would you like to add PWA support? › Yes
? Would you like to use ESLint for linting? › Yes
? Would you like to use Prettier for code formatting? › Yes
```

## 🔐 Authentication Setup

### MSAL Integration
1. Select 'msal' when prompted for authentication
2. Configure in `auth.config.ts`:
   ```typescript
   export const msalConfig = {
     auth: {
       clientId: '{your-client-id}',
       authority: 'https://login.microsoftonline.com/{your-tenant-id}',
       redirectUri: 'http://localhost:4200'
     }
   };
   ```

### Okta Integration
1. Select 'okta' when prompted for authentication
2. Configure in `okta.config.ts`:
   ```typescript
   export const oktaConfig = {
     issuer: 'https://{yourOktaDomain}/oauth2/default',
     clientId: '{clientId}',
     redirectUri: window.location.origin + '/callback'
   };
   ```

## 🛠️ Development

### Local Development Setup
1. **Install global dependencies:**
   ```bash
   npm install -g @angular/cli
   npm install -g @angular-devkit/schematics-cli
   npm install -g typescript
   ```

2. **Clone and setup the repository:**
   ```bash
   npm install
   npm run build
   npm link   # Run in a separate terminal
   ```

### Testing the Schematics
```bash
# Run unit tests
npm test

# Test schematic generation
schematics @ptg/angular:application

# Debug mode
schematics @ptg/angular:application --debug=true
```

### Running Generated Applications
```bash
# Start development server
npm start

# Build for production
npm run build

# Run tests
npm test

# Run e2e tests
npm run e2e
```

## 📦 Publishing

1. **Update version in package.json**

2. **Build the project:**
```bash
npm run build
```

3. **Publish to NPM:**
```bash
npm publish --access public
```

## 🔄 Workspace Structure

Generated applications follow this structure:
```
my-workspace/
├── apps/
│   └── my-app/
│       ├── src/
│       │   ├── app/
│       │   │   ├── app.component.ts
│       │   │   ├── app.module.ts
│       │   │   └── components/
│       │   ├── assets/
│       │   └── main.ts
│       ├── project.json
│       └── tsconfig.json
├── libs/
├── nx.json
└── package.json
```


## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

 




