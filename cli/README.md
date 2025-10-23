# PTG UI CLI

The main CLI package for generating React, Angular, and Vue applications with enterprise-ready configurations.

## 📦 Package Info

- **Package Name**: `@ptg-ui/cli`
- **Version**: `2.0.8`
- **Binary**: `ptg-ui-cli`

## 🚀 Installation

### Global Installation (Recommended)
```bash
npm install -g @ptg-ui/cli
```

### Usage
```bash
ptg-ui-cli
```

## 🛠️ Local Development

### Setup
```bash
npm install
npm run build
npm link
```

### Development with Watch Mode
```bash
# Terminal 1 - Build in watch mode
npm run build:watch

# Terminal 2 - Link the package
npm link
```

### Test CLI
```bash
# In a new directory
ptg-ui-cli
```

## 🎯 Supported Application Types

### Angular Applications
- Modern Angular 18+ setup
- Standalone components
- NgRx state management
- Authentication (MSAL, Okta, Custom)
- Material Design
- Internationalization
- PWA support

### React Applications
- React 18+ with TypeScript
- Nx workspace architecture
- Redux Toolkit
- Authentication (MSAL, Okta, Custom)
- Material-UI/Bootstrap
- React Router
- Internationalization
- Multiple bundlers (Vite, Webpack)

### Vue Applications
*(Under development)*

## 🔐 Authentication Setup

### MSAL (Microsoft Authentication)

If you select MSAL authentication during setup:

#### 1. Register Application in Azure Portal

1. Go to [Azure Portal](https://portal.azure.com)
2. Navigate to **Azure Active Directory** > **App registrations**
3. Click **New Registration**
4. Fill registration form:
   - **Name**: Your application name
   - **Supported account types**: Choose based on your needs
   - **Redirect URI**: `http://localhost:4200` (or your app URL)
5. Click **Register**

#### 2. Configure Generated Application

**For Angular:**
Update `src/app/auth.config.ts`:
```typescript
export const msalConfig = {
  auth: {
    clientId: 'your-client-id',
    authority: 'https://login.microsoftonline.com/your-tenant-id',
    redirectUri: 'http://localhost:4200'
  }
};
```

**For React:**
Update `src/config/msalConfig.ts`:
```typescript
export const msalConfig = {
  auth: {
    clientId: 'your-client-id',
    authority: 'https://login.microsoftonline.com/your-tenant-id',
    redirectUri: window.location.origin
  }
};
```

### Okta Authentication

If you select Okta authentication:

**For Angular:**
Update `src/app/okta.config.ts`

**For React:**
Update `src/okta/okta.config.ts`

## 📁 CLI Structure

```
cli/
├── generators/
│   ├── angular.ts    # Angular app generator
│   └── react.ts      # React app generator
├── index.ts          # Main CLI entry point
├── package.json      # Package configuration
└── tsconfig.json     # TypeScript config
```

## 🔧 Development Notes

- Uses `inquirer` for interactive prompts
- Generators create temporary sandboxes for dependency installation
- Links to `@ptg-ui/angular-schematics` and `@ptg-ui/react-schematics`
- Supports VS Code extension installation

## 📝 Publishing

1. Update version in `package.json`
2. Build the package: `npm run build`
3. Publish: `npm publish`

## 🤝 Contributing

See the main project README for contribution guidelines.