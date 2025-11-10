# PTG UI React Schematics

A powerful schematic collection for generating modern React applications with PTG UI's best practices and enterprise-ready configurations. This tool is part of the PTG UI Schematics suite and provides a seamless way to scaffold React applications with various features and configurations.

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
❯ React    Generate a new React application
  Angular  Generate a new Angular application
  Vue      Generate a new Vue application
```

4. **Select 'React' and continue with the configuration prompts**

The CLI will guide you through the setup process with interactive prompts for all configuration options.

## ⚙️ Features

### Core Features
- Modern React 18+ setup with TypeScript
- Nx workspace architecture for scalability
- Configurable UI frameworks (Material-UI, Bootstrap)
- Multiple authentication options (Custom, MSAL, Okta)
- Flexible styling options (CSS, SCSS, LESS, Stylus)

### Build & Development Tools
- **Bundler Options**:
  - Vite (recommended) - Lightning-fast dev server
  - Webpack - Traditional bundling
  - esbuild - Ultra-fast builds

- **Testing Infrastructure**:
  - Unit Testing: Vitest or Jest
  - E2E Testing: Cypress or Playwright
  - Coverage reporting

- **Code Quality**:
  - ESLint configuration
  - Prettier formatting
  - TypeScript strict mode

### Optional Features
- React Router for navigation
- Redux Toolkit or Zustand for state management
- i18n support for internationalization
- Authentication integrations (MSAL, Okta)
- Husky for Git hooks (pre-commit linting)
- Docker configuration for containerization

## 🔧 Configuration Options

After selecting "React" as your application type, you'll be prompted to configure:

1. **Project Structure**
   - Workspace name
   - Application name

2. **UI Framework**
   - None (plain React)
   - Material-UI
   - Bootstrap

3. **Authentication**
   - Custom implementation
   - MSAL (Microsoft Authentication)
   - Okta

4. **Styling**
   - CSS
   - SCSS
   - LESS
   - Stylus

5. **Build Tools**
   - Choice of bundler
   - Testing frameworks
   - Code quality tools

### Example Configuration Flow
```bash
$ ptg-ui-cli

? Select Application Type › 
❯ React    Generate a new React application
  Angular  Generate a new Angular application
  Vue      Generate a new Vue application

? Workspace name (e.g., org name) › my-company
? What name would you like to use for the application? › dashboard
? Which framework would you like to use? › Material
? Which Authentication you would like to add to this Application? › MSAL
? Which stylesheet format would you like to use? › SCSS
? Would you like to add React Router to this application? › Yes
? Would you like to add Redux to this application? › Yes
? Would you like to add i18n to this project? › Yes
? Which bundler would you like to use? › Vite (Recommended)
? Which unit test runner would you like to use? › Vitest (Recommended)
? Which test runner would you like to use for end to end tests? › Cypress
? Which linter would you like to use? › Standard
? Would you like to use Prettier for code formatting? › Yes
? Would you like to add Husky for Git hooks (pre-commit)? › No
? Would you like to add Docker configuration? › Yes
```

## 🔐 Authentication Setup

### Okta Integration
1. Select 'okta' when prompted for authentication
2. Configure in `okta.config.ts`:
   ```typescript
   const ISSUER = 'https://{yourOktaDomain}/oauth2/default';
   const CLIENT_ID = '{clientId}';
   ```

### MSAL Integration
1. Select 'msal' when prompted for authentication
2. Configure in `msal.config.ts`:
   ```typescript
   const config = {
     auth: {
       clientId: '{your-client-id}',
       authority: '{your-authority-url}'
     }
   };
   ```

## 🐳 Docker Support

When Docker configuration is enabled, the following files are generated:

- **Dockerfile**: Multi-stage build with Node.js and Nginx
- **.dockerignore**: Optimized build context
- **docker-compose.yml**: Easy service orchestration
- **nginx.conf**: Production-ready Nginx configuration
- **DOCKER_README.md**: Comprehensive Docker documentation

### Docker Commands

```bash
# Build Docker image
npm run docker:build

# Run with Docker Compose
npm run docker:up

# View logs
npm run docker:logs

# Stop services
npm run docker:down
```

### Features
- ✅ Multi-stage build for optimized image size
- ✅ Production-ready Nginx configuration
- ✅ Security headers and gzip compression
- ✅ Health check endpoint
- ✅ SPA routing support

## 🛠️ Development

### Local Testing
1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Build the schematics:
   ```bash
   npm run build
   ```
4. Link for local testing:
   ```bash
   npm link
   ```
5. Run tests:
   ```bash
   npm test
   ```

### Running Generated Applications
```bash
# Start development server
npm start

# Build for production
npm run build

# Run tests
npm test
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
│       │   │   ├── app.tsx
│       │   │   ├── app.[style]
│       │   │   └── components/
│       │   ├── assets/
│       │   └── main.tsx
│       ├── project.json
│       └── tsconfig.json
├── libs/
├── nx.json
└── package.json
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.
