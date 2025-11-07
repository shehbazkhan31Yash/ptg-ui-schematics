/**
 * Configuration Templates
 * Extracted from react.ts - Contains all configuration file template generation functions
 * 
 * This file contains template generators for:
 * - i18n configuration
 * - State management (Redux, Zustand)
 * - Styling (CSS/SCSS/Less/Stylus)
 * - Build tools (Vite, Webpack)
 * - Linting (ESLint, Prettier)
 * - HTML and entry points
 */

import { getEslintConfig as getEslintConfigFromShared } from "../configs/eslint-configs";
import { getPrettierConfig as getPrettierConfigFromShared } from "../configs/config-templates";

/**
 * Generates i18n (internationalization) configuration file
 * @param appName - Application name
 * @returns i18n config code as a string
 */
export const getI18nContent = (appName: string) => `import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  en: {
    translation: {
      welcome: 'Welcome to ${appName}!',
      home: 'Home',
      about: 'About',
      features: 'Features'
    }
  },
  es: {
    translation: {
      welcome: '¡Bienvenido a ${appName}!',
      home: 'Inicio',
      about: 'Acerca de',
      features: 'Características'
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;`;

/**
 * Generates Redux Toolkit store configuration
 * @returns Redux store code as a string
 */
export const getReduxStoreContent = () => `import { configureStore, createSlice } from '@reduxjs/toolkit';

// Example slice
const initialState = {
  count: 0,
};

const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    increment: (state) => {
      state.count += 1;
    },
    decrement: (state) => {
      state.count -= 1;
    },
  },
});

export const { increment, decrement } = appSlice.actions;

export const store = configureStore({
  reducer: {
    app: appSlice.reducer,
  },
});

// Infer the \`RootState\` and \`AppDispatch\` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
`;

/**
 * Generates Zustand store configuration
 * @returns Zustand store code as a string
 */
export const getZustandStoreContent = () => `import { create } from 'zustand';

// Define the store state interface
interface AppState {
  count: number;
  increment: () => void;
  decrement: () => void;
  reset: () => void;
}

// Create the Zustand store
export const useAppStore = create<AppState>((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
  decrement: () => set((state) => ({ count: state.count - 1 })),
  reset: () => set({ count: 0 }),
}));
`;

/**
 * Generates complete CSS/SCSS styling for the application
 * @param a - Application configuration object
 * @returns Complete stylesheet content as a string
 */
export const getStyleContent = (a: any) => {
  let baseStyles = `* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body, #root {
  width: 100%;
  overflow-x: hidden;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* Navigation Bar Styles */
.main-navigation {
  background: #fff;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  width: 100%;
}

.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 70px;
}

.nav-brand {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-shrink: 0;
}

.nav-logo {
  width: 50px;
  height: 50px;
  border-radius: 8px;
  object-fit: contain;
}

.brand-text {
  font-size: 1.25rem;
  font-weight: 600;
  color: #333;
}

.nav-links {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  flex-wrap: nowrap;
}

.nav-link {
  padding: 0.5rem 1rem;
  text-decoration: none;
  color: #666;
  border-radius: 25px;
  transition: all 0.3s ease;
  font-weight: 500;
  font-size: 0.9rem;
  white-space: nowrap;
  border: 1px solid transparent;
}

.nav-link:hover {
  color: #007bff;
  border-color: #007bff;
  background-color: rgba(0, 123, 255, 0.1);
}

.nav-link.active {
  color: #007bff;
  background-color: rgba(0, 123, 255, 0.1);
  border-color: #007bff;
}

.nav-auth {
  margin-left: auto;
  display: flex;
  align-items: center;
}

.auth-buttons {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.loginBtn, .logoutBtn {
  padding: 0.5rem 1.5rem;
  border-radius: 25px;
  border: none;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9rem;
}

.loginBtn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.loginBtn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.logoutBtn {
  background-color: #dc3545;
  color: white;
  margin-left: 0.5rem;
}

.logoutBtn:hover {
  background-color: #c82333;
  transform: translateY(-2px);
}

.auth-info {
  margin-top: 1rem;
  padding: 1.5rem;
  background: linear-gradient(135deg, #667eea15 0%, #764ba215 100%);
  border-radius: 8px;
  border-left: 4px solid #667eea;
}

.auth-info h4 {
  margin: 0 0 1rem 0;
  color: #333;
  font-size: 1.1rem;
}

.auth-info p {
  margin: 0.5rem 0;
  color: #666;
  font-size: 0.95rem;
}

.auth-info strong {
  color: #333;
  font-weight: 600;
}

.auth-demo {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem;
}

/* Main Content Area */
.app {
  min-height: 100vh;
  width: 100%;
}

.app-main {
  margin-top: 70px;
  background-color: #f8f9fa;
  min-height: calc(100vh - 70px);
}

/* Container Styles */
.container-full {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  width: 100%;
}

/* Page Header Styles */
.app-header, .page-header {
  text-align: center;
  margin-bottom: 3rem;
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.app-header h1, .page-header h1 {
  color: #333;
  font-size: 2.5rem;
  margin-bottom: 1rem;
}

.app-header .author, .page-header .author {
  color: #666;
  margin: 0.5rem 0;
}

.app-header .published, .page-header .published {
  color: #999;
  font-size: 0.9rem;
}

/* Content Sections */
.main-content {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
}

.intro {
  margin-bottom: 2rem;
}

.intro p {
  color: #666;
  line-height: 1.8;
  margin-bottom: 1rem;
  text-align: justify;
}

.entry-summary {
  font-size: 1.1rem;
  font-weight: 500;
  color: #333;
  margin-bottom: 1.5rem;
}

/* Features List */
.features {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  margin: 2rem 0;
}

.features h2 {
  color: #333;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #007bff;
}

.features ul {
  list-style: none;
  padding: 0;
}

.features ul li {
  padding: 0.5rem 0;
  color: #666;
  font-size: 1rem;
}

/* Getting Started Section */
.getting-started {
  margin: 3rem 0;
  text-align: center;
  padding: 2rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.getting-started h2, .getting-started h3 {
  color: #333;
  margin-bottom: 1rem;
  font-size: 2rem;
}

.getting-started p {
  font-size: 1.1rem;
  color: #666;
}

.getting-started a {
  color: #007bff;
  text-decoration: none;
  font-weight: 600;
}

.getting-started a:hover {
  text-decoration: underline;
}

/* Tech Stack & Content Sections */
.content-section {
  margin: 2rem 0;
}

.content-section h2, .content-section h3 {
  color: #333;
  margin: 1.5rem 0 1rem 0;
}

.content-section h4 {
  color: #555;
  margin: 1rem 0 0.5rem 0;
}

.content-section p {
  color: #666;
  line-height: 1.6;
  margin-bottom: 1rem;
}

.content-section ul {
  color: #666;
  line-height: 1.8;
  margin-left: 1.5rem;
  margin-bottom: 1rem;
}

/* Features Page Styles */
.features-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  margin-top: 70px;
  min-height: calc(100vh - 70px);
  background-color: #f8f9fa;
}

.features-header {
  text-align: center;
  margin-bottom: 3rem;
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.features-header h1 {
  color: #333;
  font-size: 2.5rem;
  margin-bottom: 1rem;
}

.features-header p {
  color: #666;
  font-size: 1.1rem;
}

.usage-example {
  background: white;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.usage-example h3 {
  color: #333;
  margin-bottom: 1rem;
}

.setup-step {
  color: #666;
  margin: 0.5rem 0;
  font-weight: 500;
}

.usage-example code {
  display: block;
  background: #f4f4f4;
  padding: 1rem;
  border-radius: 4px;
  margin: 0.5rem 0;
  font-family: 'Courier New', monospace;
  color: #333;
  overflow-x: auto;
}

/* Demo Page Styles */
.demo-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  margin-top: 70px;
  min-height: calc(100vh - 70px);
  background-color: #f8f9fa;
}

.demo-header {
  text-align: center;
  margin-bottom: 3rem;
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.demo-header h1 {
  color: #333;
  font-size: 2.5rem;
  margin-bottom: 1rem;
}

.demo-header p {
  color: #666;
  font-size: 1.1rem;
}

.demo-section {
  margin: 3rem 0;
}

.demo-section h2 {
  color: #333;
  margin-bottom: 1.5rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #007bff;
}

.demo-examples {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

/* Demo Components */
.i18n-demo, .ngrx-demo, .http-demo, .routing-demo {
  text-align: center;
  padding: 1rem;
}

.i18n-demo p, .ngrx-demo p {
  font-size: 1.5rem;
  margin: 1rem 0;
  font-weight: 600;
  color: #333;
}

.language-switcher {
  margin: 1rem 0;
  text-align: center;
}

.language-switcher button {
  margin: 0 0.5rem;
  padding: 0.5rem 1rem;
  border: 1px solid #007bff;
  background: white;
  color: #007bff;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 1rem;
}

.language-switcher button:hover {
  background: #007bff;
  color: white;
}

.ngrx-demo button, .routing-demo button, .http-demo button {
  margin: 0.5rem;
  padding: 0.5rem 1rem;
  border: 1px solid #007bff;
  background: white;
  color: #007bff;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 1rem;
}

.ngrx-demo button:hover, .routing-demo button:hover, .http-demo button:hover {
  background: #007bff;
  color: white;
}

.http-demo ul {
  list-style-type: none;
  padding: 0;
  text-align: left;
  max-width: 600px;
  margin: 1rem auto;
}

.http-demo ul li {
  padding: 0.5rem;
  margin: 0.25rem 0;
  background: #f8f9fa;
  border-radius: 4px;
  color: #666;
}

.seo-info ul {
  list-style-type: none;
  padding: 0;
  text-align: left;
}

.seo-info ul li {
  padding: 0.25rem 0;
  color: #666;
}

.seo-info ul li::before {
  content: "✓ ";
  color: #28a745;
  font-weight: bold;
}

/* Grid Demo */
.grid-demo {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
}

.grid-item {
  background: #007bff;
  color: white;
  padding: 2rem;
  text-align: center;
  border-radius: 8px;
  font-weight: 600;
}

.grid-demo + p {
  text-align: center;
  color: #666;
  font-style: italic;
}

/* Responsive Design */
@media (max-width: 768px) {
  .nav-container {
    padding: 0 0.5rem;
  }
  
  .nav-links {
    gap: 0.25rem;
  }
  
  .nav-link {
    padding: 0.4rem 0.8rem;
    font-size: 0.85rem;
  }
  
  .brand-text {
    display: none;
  }
  
  .container-full, .features-container, .demo-container {
    padding: 1rem;
  }
  
  .app-header h1, .page-header h1, .features-header h1, .demo-header h1 {
    font-size: 2rem;
  }
  
  .demo-examples {
    padding: 1rem;
  }
}`;

  // Add framework-specific styles
  if (a.framework === "bootstrap") {
    baseStyles += `

/* Bootstrap customizations */
.btn-primary {
  background: linear-gradient(45deg, #667eea, #764ba2);
  border: none;
}`;
  } else if (a.framework === "material") {
    baseStyles += `

/* Material-UI customizations */
.MuiButton-root {
  background: linear-gradient(45deg, #667eea, #764ba2);
}`;
  }

  return baseStyles;
};

/**
 * Generates main.tsx entry point file
 * @param a - Application configuration object
 * @returns main.tsx content as a string
 */
export const getMainTsx = (a: any) => {
  // Build the component nesting structure
  let appWrapper = '<App />';
  
  if (a.routing) {
    appWrapper = `<Router>${appWrapper}</Router>`;
  }
  
  return `import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './app/app';
${a.routing ? "import { BrowserRouter as Router } from 'react-router-dom';" : ''}

const container = document.getElementById('root') as HTMLElement;
const root = createRoot(container);

root.render(
  <StrictMode>
    ${appWrapper}
  </StrictMode>
);
`;
};

/**
 * Generates index.html file
 * @param appName - Application name
 * @param seoEnabled - Whether SEO features are enabled
 * @returns HTML content as a string
 */
export const getIndexHtml = (appName: string, seoEnabled: boolean = false) => `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>${appName}</title>
    <base href="/" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <link rel="icon" type="image/x-icon" href="favicon.ico" />
    ${seoEnabled ? `<meta name="description" content="A React application built with PTG UI Schematics" />
    <meta name="keywords" content="react, typescript, web application" />
    <meta name="author" content="PTG Digital" />
    <meta name="robots" content="index, follow" />
    <meta property="og:title" content="${appName}" />
    <meta property="og:description" content="A React application built with PTG UI Schematics" />
    <meta property="og:type" content="website" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${appName}" />
    <meta name="twitter:description" content="A React application built with PTG UI Schematics" />` : ''}
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>`;

/**
 * Generates basic App.tsx for fallback/manual generation
 * @param a - Application configuration object
 * @returns Basic App component code as a string
 */
export const getBasicAppTsx = (a: any) => `import React from 'react';
import './app.${a.style}';

export function App() {
  return (
    <div className="app">
      <h1>Welcome to ${a.name}!</h1>
      <p>This is a React application generated by PTG UI Schematics.</p>
      <p>Generated with manual fallback method.</p>
    </div>
  );
}

export default App;`;

/**
 * Generates basic CSS for fallback/manual generation
 * @returns Basic CSS content as a string
 */
export const getBasicAppCss = () => `.app {
  font-family: sans-serif;
  min-width: 300px;
  max-width: 600px;
  margin: 50px auto;
}

.app h1 {
  text-align: center;
  margin-bottom: 20px;
  color: #333;
}

.app p {
  text-align: center;
  color: #666;
}`;

/**
 * Generates Vite configuration file
 * @param appName - Application name
 * @param seoEnabled - Whether SEO features are enabled
 * @param bundler - Selected bundler
 * @returns Vite config content as a string
 */
export const getViteConfig = (appName: string, seoEnabled: boolean = false, bundler: string = 'vite') => `/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
${seoEnabled && bundler === 'vite' ? "import ssr from 'vite-plugin-ssr/plugin';" : ''}

export default defineConfig({
  root: __dirname,
  cacheDir: '../../node_modules/.vite/${appName}',
  
  server: {
    port: 4200,
    host: 'localhost',
    open: true,
    fs: {
      allow: ['../..']
    }
  },

  preview: {
    port: 4300,
    host: 'localhost',
  },

  plugins: [
    react(),
    ${seoEnabled && bundler === 'vite' ? 'ssr({ prerender: true }), // Enable SSR/SSG for better SEO' : ''}
  ],

  build: {
    outDir: '../../dist/apps/${appName}',
    reportCompressedSize: true,
    commonjsOptions: {
      transformMixedEsModules: true,
    },
    target: 'esnext',
    minify: 'esbuild',
  },

  optimizeDeps: {
    include: ['react', 'react-dom'],
  },

  define: {
    global: 'globalThis',
  },
});`;

/**
 * Generates ESLint configuration
 * @param linterType - Type of ESLint config ('eslint', 'airbnb', 'custom')
 * @param hasTypeScript - Whether TypeScript is enabled
 * @returns ESLint config code as a string
 */
export const getEslintConfig = (linterType: string, hasTypeScript: boolean = true) => {
  return getEslintConfigFromShared(linterType);
};

/**
 * Generates Prettier configuration
 * @returns Prettier config as a string
 */
export const getPrettierConfig = () => getPrettierConfigFromShared();
