# PTG UI Angular Schematics

A comprehensive schematic collection for generating modern Angular applications with enterprise-ready configurations and best practices. This package provides Angular-specific schematics for the PTG UI CLI tool.

## 🚀 Quick Start

### Installation

1. **Install the PTG UI CLI globally:**
```bash
npm install -g @ptg-ui/cli
```

2. **Generate a new Angular application:**
```bash
ptg-ui-cli
```

3. **Select Angular and configure your application:**
```bash
? Select Application Type › 
❯ Angular  Generate a new Angular application
  React    Generate a new React application  
  Vue      Generate a new Vue application
```

## ⚙️ Features

### Core Features
- **Modern Angular 18+** with TypeScript
- **Standalone Components** support
- **Routing** with lazy loading
- **Shared & Core Modules** architecture
- **Demo Pages** with interactive examples
- **Responsive Design** with mobile-first approach

### Framework Options
- **Angular Material** - Material Design components
- **Bootstrap** - Popular CSS framework
- **Tailwind CSS** - Utility-first CSS framework
- **None** - Custom styling

### Styling Options
- **SCSS/Sass** - Enhanced CSS with variables and mixins
- **CSS** - Standard CSS
- **Less** - Dynamic stylesheet language
- **Stylus** - Expressive CSS preprocessor

### Optional Features
- **NgRx** - State management with Redux pattern
- **Internationalization (i18n)** - Multi-language support
- **SEO Optimization** - Meta tags, structured data, analytics
- **ESLint** - Code quality and consistency
- **Husky** - Git hooks for code quality

### Authentication Options
- **MSAL** - Microsoft Authentication Library for Azure AD integration
- **Okta** - Enterprise identity platform with OIDC/OAuth2 support
- **Custom** - JWT-based custom authentication with login forms and guards
- **None** - Skip authentication setup

## 🔧 Configuration Options

### Example Configuration Flow
```bash
$ ptg-ui-cli

? Select Application Type › 
❯ Angular  Generate a new Angular application
  React    Generate a new React application  
  Vue      Generate a new Vue application

? Workspace name (e.g., org name) › my-company
? What name would you like to use for the application? › dashboard
? Would you like to use standalone components? › Yes
? Would you like to add NgRx for state management? › Yes
? Which Authentication you would like to add? › MSAL
? Which stylesheet format would you like to use? › SCSS
? Which framework would you like to use? › Bootstrap
? Enable SEO features? › Yes
? Which SEO implementation would you like? › SSG - Static Site Generation
? Which ESLint configuration would you like to use? › Standard
? Would you like to add Husky for Git hooks? › Yes
? Would you like to add internationalization (i18n) support? › Yes
```

## 📱 Generated Application Structure

```
my-workspace/
├── src/
│   ├── app/
│   │   ├── core/                 # Core services and guards
│   │   ├── shared/               # Shared components and modules
│   │   │   └── components/
│   │   │       ├── seo-example/  # SEO demonstration
│   │   │       └── language-example/ # i18n demonstration
│   │   ├── home/                 # Home page component
│   │   ├── about/                # About page component
│   │   ├── features/             # Features documentation
│   │   ├── demo/                 # Interactive demo page
│   │   ├── app-routing.module.ts # Application routing
│   │   ├── app.component.*       # Root component
│   │   └── app.module.ts         # Root module
│   ├── assets/
│   │   ├── images/               # Application images
│   │   └── i18n/                 # Translation files (if i18n enabled)
│   ├── environments/             # Environment configurations
│   ├── styles.scss               # Global styles
│   └── main.ts                   # Application bootstrap
├── angular.json                  # Angular CLI configuration
├── package.json                  # Dependencies and scripts
└── tsconfig.json                 # TypeScript configuration
```

## 🎯 Demo Pages

Generated applications include interactive demo pages:

- **Home** (`/`) - Welcome page with feature overview
- **About** (`/about`) - Application information and tech stack
- **Features** (`/features`) - Setup guides and usage examples
- **Demo** (`/demo`) - Interactive demonstrations of all features

### Demo Features Include:
- **Language Switching** - i18n demonstration (if enabled)
- **SEO & Analytics** - Meta tags and Google Analytics (if enabled)
- **Framework Components** - Material/Bootstrap examples
- **State Management** - NgRx examples (if enabled)
- **HTTP Client** - API interaction examples
- **Routing** - Navigation demonstrations

## 🔧 Setup Instructions

### Google Analytics (if SEO enabled)
1. Add your Measurement ID in `src/environments/environment.ts`:
```typescript
export const environment = {
  production: false,
  googleAnalyticsId: 'G-XXXXXXXXXX' // Replace with your GA4 ID
};
```

### Husky Git Hooks (if enabled)
1. Enable Husky after installation:
```bash
npm run prepare
```

### Internationalization (if enabled)
1. Extract translation messages:
```bash
npm run extract-i18n
```

## 🛠️ Development Commands

### Running Generated Applications
```bash
# Start development server
ng serve
# or
npm start

# Build for production
ng build
# or
npm run build

# Run unit tests
ng test
# or
npm test

# Run linting (if ESLint enabled)
npm run lint
npm run lint:fix
```

### SEO Build Commands (if enabled)
```bash
# Static Site Generation
npm run build:ssg
npm run serve:ssg

# Server-Side Rendering
npm run build:ssr
npm run serve:ssr
```

### Local Schematic Development
```bash
# Install dependencies
npm install

# Build schematics
npm run build

# Link for local testing
npm link

# Test schematic generation
schematics @ptg-ui/angular-schematics:application --name=test-app
```

## 🔍 Key Features Explained

### Framework Integration
- **Bootstrap**: Responsive grid system, utility classes, component library
- **Material**: Google's Material Design components and theming
- **Tailwind**: Utility-first CSS with responsive design utilities

### SEO Optimization
- **Meta Tags**: Dynamic title, description, keywords management
- **Structured Data**: JSON-LD schema markup for rich snippets
- **Social Media**: Open Graph and Twitter Card integration
- **Analytics**: Google Analytics 4 integration with event tracking

### State Management (NgRx)
- **Actions**: Type-safe action creators
- **Reducers**: Pure functions for state updates
- **Selectors**: Memoized state selection
- **Effects**: Side effect management

### Internationalization
- **Translation Files**: JSON-based translation management
- **Language Switching**: Runtime language switching
- **Locale Support**: Date, number, and currency formatting
- **Extraction Tools**: Automated translation key extraction

## 📚 Documentation

For complete documentation, visit the [PTG UI Schematics Documentation](../documentations/)

- [Authentication Implementation](../documentations/ANGULAR_AUTHENTICATION.md)
- [SEO Complete Guide](../documentations/ANGULAR_SEO_COMPLETE_GUIDE.md)
- [ESLint Fixes](../documentations/ANGULAR_ESLINT_FIXES.md)
- [Google Analytics Integration](../documentations/ANGULAR_GOOGLE_ANALYTICS.md)


## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test with local development setup
5. Submit a pull request

## 📝 License

MIT License - see LICENSE file for details.

## 🔗 Related Packages

- [@ptg-ui/cli](../cli/) - Main CLI tool
- [@ptg-ui/react-schematics](../react-schematics/) - React schematics
- [PTG UI Schematics](../) - Complete documentation