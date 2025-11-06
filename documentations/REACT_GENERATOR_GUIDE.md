# React Application Generator - User Guide

## 📖 Overview

The PTG UI Schematics React Application Generator is a powerful CLI tool that creates modern React applications with best practices, customizable features, and enterprise-ready configurations. It leverages Nx workspace architecture for scalable development and includes optional integrations for routing, state management, internationalization, and authentication.

## 🚀 Quick Start

### Prerequisites

Before using the React generator, ensure you have the following installed:

- **Node.js**: Version 18.x or higher
- **npm**: Version 8.x or higher (comes with Node.js)
- **Git**: For version control (recommended)

### Installation

1. **Install the PTG UI Schematics CLI globally:**
   ```bash
   npm install -g @ptg-ui/schematics-cli
   ```

2. **Verify installation:**
   ```bash
   ptg-cli --version
   ```

### Creating Your First React Application

1. **Navigate to your desired directory:**
   ```bash
   cd /path/to/your/projects
   ```

2. **Run the React generator:**
   ```bash
   ptg-ui-cli
   ```

3. **Follow the interactive prompts** (see Configuration Options below)

4. **Navigate to your new application:**
   ```bash
   cd your-workspace-name
   ```

5. **Start the development server:**
   ```bash
   npm start
   ```

## ⚙️ Configuration Options

The generator will prompt you for the following configuration options:

### 📁 Workspace & Application Names
- **Workspace name**: The root directory name (e.g., `my-company`, `ptg-apps`)
- **Application name**: The specific app name within the workspace (e.g., `dashboard`, `portal`)

### 🎨 UI Framework
Choose from the following UI frameworks:
- **None**: Pure React without additional UI libraries
- **Material**: Material-UI (MUI) for Google's Material Design
- **Bootstrap**: Bootstrap React components

### 🔐 Authentication
Select your preferred authentication method:
- **Custom**: Implement your own authentication logic
- **MSAL**: Microsoft Authentication Library for Azure AD
- **Okta**: Okta authentication integration

### 🎯 Styling Options
Choose your preferred stylesheet format:
- **CSS**: Standard CSS files
- **SCSS**: Sass with SCSS syntax
- **LESS**: LESS CSS preprocessor
- **Stylus**: Stylus CSS preprocessor

### 🧭 Additional Features
Enable or disable these optional features:

#### React Router
- **Yes**: Adds React Router for client-side routing
- **No**: Single-page application without routing

#### State Management
Choose your state management solution:
- **Redux Toolkit**: Popular, powerful state management with Redux
- **Zustand**: Lightweight, simple state management
- **None**: Use React's built-in state management only

#### Internationalization (i18n)
- **Yes**: Adds react-i18next for multi-language support
- **No**: English-only application

#### SEO Features (NEW)
- **Yes**: Adds comprehensive SEO capabilities including:
  - React Helmet Async for dynamic meta tags
  - Open Graph protocol support for social media sharing
  - Twitter Cards integration
  - SEO utility functions and components
  - Robots.txt and sitemap configuration templates
  - Structured data (JSON-LD) support
- **No**: Basic application without advanced SEO features

### 🛠️ Build & Development Tools

#### Bundler Selection
Choose your preferred build tool:
- **Vite** (Recommended): Lightning-fast development server and build tool
- **Webpack**: Traditional and highly configurable bundler
- **esbuild**: Extremely fast JavaScript bundler

#### Unit Test Runner
Select your testing framework:
- **Vitest** (Recommended): Fast unit test framework designed for Vite
- **Jest**: Popular JavaScript testing framework
- **None**: Skip unit testing setup

#### End-to-End Testing
Choose your E2E testing solution:
- **Cypress**: Developer-friendly E2E testing framework
- **Playwright**: Cross-browser automation framework
- **None**: Skip E2E testing setup

#### Code Quality Tools
Configure development tools:
- **ESLint**: Enable code linting for consistency and error detection
- **Prettier**: Enable automatic code formatting

## 📋 Example Configuration

Here's an example of a typical configuration session:

```
? Workspace name (e.g., org name) › my-company
? What name would you like to use for the application? › dashboard
? Which framework would you like to use? › Material
? Which Authentication you would like to add to this Application? › MSAL
? Which stylesheet format would you like to use? › SCSS
? Would you like to add React Router to this application? › Yes
? Which state management library would you like to use? › Redux Toolkit
? would you like to Adds i18n in project? › Yes
? Would you like to enable SEO features? (Meta tags, Open Graph, Twitter Cards) › Yes
? Which bundler would you like to use? › Vite (Recommended)
? Which unit test runner would you like to use? › Vitest (Recommended)
? Which test runner would you like to use for end to end tests? › Cypress
? Which linter would you like to use? › Standard
? Would you like to use Prettier for code formatting? › Yes
? Would you like to add Husky for Git hooks (pre-commit)? › Yes
```

## 🏗️ Generated Project Structure

The generator creates a modern Nx workspace with the following structure:

```
my-company/
├── apps/
│   └── dashboard/
│       ├── src/
│       │   ├── app/
│       │   │   ├── app.tsx          # Main application component
│       │   │   ├── app.scss         # Application styles
│       │   │   └── store/           # Redux store (if enabled)
│       │   ├── assets/              # Static assets
│       │   ├── i18n/                # Internationalization files (if enabled)
│       │   └── main.tsx             # Application entry point
│       ├── project.json             # Nx project configuration
│       └── tsconfig.json            # TypeScript configuration
├── libs/                            # Shared libraries (for future expansion)
├── nx.json                          # Nx workspace configuration
├── package.json                     # Dependencies and scripts
├── tsconfig.base.json               # Base TypeScript configuration
└── README.md                        # Project documentation
```

## 🎨 Features Included

### 📱 Modern React Setup
- **React 18+**: Latest React features and concurrent rendering
- **TypeScript**: Full TypeScript support with strict configuration
- **Configurable Bundler**: Choose between Vite (default), Webpack, or esbuild
- **Flexible Testing**: Optional Vitest/Jest for unit tests, Cypress/Playwright for E2E
- **Code Quality**: Optional ESLint for linting and Prettier for formatting

### 🏢 Enterprise-Ready Architecture
- **Nx Workspace**: Monorepo architecture for scalability
- **Module Federation**: Ready for micro-frontend architecture
- **Incremental Builds**: Optimized build processes
- **Dependency Graph**: Visual project dependencies

### 🎯 PTG Customizations
- **Branded Landing Page**: Custom PTG-styled welcome page
- **Feature Showcase**: Visual display of enabled features
- **Responsive Design**: Mobile-first responsive layouts
- **Accessibility**: WCAG 2.1 AA compliance ready

## 🛠️ Development Commands

Once your application is generated, use these commands:

### Development
```bash
# Start development server
npm start
# or
npx nx serve dashboard

# Start with specific port
npx nx serve dashboard --port 4200
```

### Building
```bash
# Build for production
npm run build
# or
npx nx build dashboard

# Build with specific configuration
npx nx build dashboard --configuration production
```

### Testing
```bash
# Run unit tests
npm test
# or
npx nx test dashboard

# Run tests in watch mode
npx nx test dashboard --watch

# Run e2e tests (if configured)
npx nx e2e dashboard-e2e
```

### Linting & Formatting
```bash
# Lint the application
npx nx lint dashboard

# Auto-fix linting issues
npx nx lint dashboard --fix
```

## 📦 Dependencies Included

The generator automatically installs and configures:

### Core Dependencies
- `react` & `react-dom`: React library
- `@nx/react`: Nx React plugin
- `typescript`: TypeScript compiler

### Build Tool Dependencies (based on your choice)
- `vite`: Lightning-fast development server and build tool (if Vite selected)
- `webpack`: Traditional bundler with extensive plugin ecosystem (if Webpack selected)
- `esbuild`: Extremely fast JavaScript bundler (if esbuild selected)

### Testing Dependencies (based on your choices)
- `vitest`: Fast unit test framework designed for Vite (if Vitest selected)
- `jest`: Popular JavaScript testing framework (if Jest selected)
- `@playwright/test`: Cross-browser automation framework (if Playwright selected)
- `cypress`: Developer-friendly E2E testing framework (if Cypress selected)

### Code Quality Dependencies (based on your choices)
- `eslint` & `@typescript-eslint/*`: Code linting tools (if ESLint enabled)
- `prettier`: Code formatting tool (if Prettier enabled)

### Optional Feature Dependencies (based on your selections)
- `react-router-dom`: Client-side routing
- `@reduxjs/toolkit` & `react-redux`: Redux state management
- `zustand`: Zustand state management (lightweight alternative)
- `react-i18next`: Internationalization
- `react-helmet-async`: SEO and dynamic meta tag management
- `@mui/material`: Material-UI components
- `bootstrap` & `react-bootstrap`: Bootstrap components
- `@azure/msal-browser` & `@azure/msal-react`: MSAL authentication
- `@okta/okta-auth-js` & `@okta/okta-react`: Okta authentication

## 🔍 SEO Features (New)

When you enable SEO features during project generation, the following components and capabilities are automatically configured:

### What's Included

#### 1. React Helmet Async Integration
- Dynamic management of document head
- Async rendering to prevent blocking
- Support for multiple instances on a single page

#### 2. SEO Component (`src/app/components/SEO.tsx`)
A fully-featured, reusable SEO component with support for:
- Custom page titles and descriptions
- Meta keywords and author information
- Open Graph tags for social media sharing (Facebook, LinkedIn, etc.)
- Twitter Card meta tags for Twitter sharing
- Canonical URL management
- Custom meta tag injection

**Usage Example:**
```tsx
import { SEO } from './components/SEO';

function HomePage() {
  return (
    <>
      <SEO
        title="Home - My Awesome App"
        description="Welcome to our application"
        keywords="react, app, awesome"
        image="/images/home-og.png"
      />
      {/* Your page content */}
    </>
  );
}
```

#### 3. SEO Utilities (`src/app/utils/seo.ts`)
Helper functions for managing SEO across your application:
- `defaultMeta`: Default meta tags configuration
- `pageMeta`: Page-specific meta configurations
- `getPageMeta(page)`: Retrieve meta tags for specific pages
- `getStructuredData()`: Generate JSON-LD structured data

**Usage Example:**
```tsx
import { getPageMeta } from './utils/seo';

const meta = getPageMeta('about');
<SEO {...meta} />
```

#### 4. Robots.txt Configuration
Automatically generated `public/robots.txt` with:
- Search engine crawling permissions
- Sitemap reference
- Customizable rules

#### 5. Sitemap Configuration Template
Pre-configured sitemap setup in `src/app/utils/sitemap.config.ts`:
- Route definitions
- Hostname configuration
- Exclusion patterns

#### 6. Enhanced HTML Template
The base `index.html` includes SEO-friendly meta tags:
- Basic meta description and keywords
- Open Graph tags
- Twitter Card tags
- Proper viewport and charset configuration

### SEO Best Practices Implemented

✅ **Unique Titles**: Each page should have a unique title tag  
✅ **Meta Descriptions**: Under 160 characters for optimal display  
✅ **Open Graph**: Proper social media sharing previews  
✅ **Canonical URLs**: Prevent duplicate content issues  
✅ **Structured Data**: JSON-LD for better search engine understanding  
✅ **Mobile-Friendly**: Proper viewport meta tags  
✅ **Accessibility**: Semantic HTML structure support

### Testing Your SEO Implementation

Use these tools to validate your SEO setup:
- **Google Search Console**: Monitor search performance
- **Facebook Sharing Debugger**: Test Open Graph tags
- **Twitter Card Validator**: Validate Twitter Cards
- **Google Lighthouse**: Audit SEO score
- **Google Rich Results Test**: Validate structured data

For detailed SEO implementation guide, see [SEO_INTEGRATION_GUIDE.md](./SEO_INTEGRATION_GUIDE.md)

## 🔧 Customization

### Adding New Components
```bash
# Generate a new React component
npx nx generate @nx/react:component my-component --project=dashboard

# Generate a component with tests
npx nx generate @nx/react:component my-component --project=dashboard --withTests
```

### Adding New Libraries
```bash
# Create a shared library
npx nx generate @nx/react:library shared-ui

# Generate a library with specific features
npx nx generate @nx/react:library shared-utils --unitTestRunner=jest --buildable
```

### Environment Configuration
Modify environment variables in:
- `apps/dashboard/src/environments/environment.ts` (development)
- `apps/dashboard/src/environments/environment.prod.ts` (production)

## 🚨 Troubleshooting

### Common Issues

#### 1. Port Already in Use
```
Error: Port 4200 is already in use
```
**Solution:** Use a different port
```bash
npx nx serve dashboard --port 4201
```

#### 2. Node Version Compatibility
```
Error: Unsupported Node.js version
```
**Solution:** Update Node.js to version 18.x or higher

#### 3. Permission Issues (Windows)
```
Error: EACCES: permission denied
```
**Solution:** Run command prompt as Administrator or use:
```bash
npm config set cache C:\tmp\npm-cache --global
```

#### 4. Corporate Network/Proxy Issues
```
Error: Request timeout
```
**Solution:** Configure npm for corporate proxy:
```bash
npm config set registry https://registry.npmjs.org/
npm config set proxy http://proxy.company.com:8080
npm config set https-proxy http://proxy.company.com:8080
```

#### 5. Module Not Found Errors
```
Error: Cannot resolve module
```
**Solution:** Clear cache and reinstall:
```bash
rm -rf node_modules package-lock.json
npm install
```

### Getting Help

If you encounter issues:

1. **Check the logs** in the terminal for specific error messages
2. **Verify prerequisites** (Node.js version, npm version)
3. **Clear npm cache**: `npm cache clean --force`
4. **Try with a fresh directory** to rule out permission issues
5. **Check your network connection** and proxy settings

## 🔄 Migration Guide

### From Previous Versions
If you're upgrading from an older version of PTG UI Schematics:

1. **Update the CLI:**
   ```bash
   npm update -g @ptg-ui/schematics-cli
   ```

2. **Generate a new application** to see the latest features
3. **Compare configurations** with your existing project
4. **Migrate custom code** to the new structure

### From Create React App
If you're migrating from Create React App:

1. **Generate a new PTG React application**
2. **Copy your src/components** to the new structure
3. **Update imports** to match the new file structure
4. **Migrate package.json dependencies**
5. **Update build scripts** to use Nx commands

## 📈 Best Practices

### Project Organization
- Keep components small and focused
- Use shared libraries for reusable code
- Follow the feature-based folder structure
- Maintain consistent naming conventions

### Performance
- Use React.lazy() for code splitting
- Implement proper memoization with React.memo()
- Optimize bundle size with tree shaking
- Monitor bundle analysis with `npx nx build dashboard --stats-json`

### Testing
- Write unit tests for all components
- Use integration tests for complex workflows
- Implement e2e tests for critical user paths
- Maintain test coverage above 80%

### Security
- Keep dependencies updated regularly
- Follow security best practices for authentication
- Validate all user inputs
- Use HTTPS in production


## 📞 Support

For additional support or questions:

- **Documentation**: Check this guide and inline help
- **Issues**: Report bugs via the GitHub issue tracker
- **Community**: Join our developer community discussions

Happy coding with PTG UI Schematics! 🚀