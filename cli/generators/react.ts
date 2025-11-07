import { execSync } from "child_process";

import * as fs from "fs";
import * as path from "path";
import inquirer = require("inquirer");
import { getEslintConfig, getEslintDependencies, getPrettierDependencies, getHuskyDependencies, getHuskyPreCommitHook, getLintStagedConfig } from "../configs/eslint-configs";
import { getPrettierConfig, CONFIG as TEMPLATE_CONFIG } from "../configs/config-templates";

// Helper function to normalize style option for Nx compatibility
// Nx only supports: css, scss, less, tailwind, styled-components, @emotion/styled, styled-jsx, none
// styl (Stylus) is not supported, so we map it to css
function getNormalizedStyleForNx(style: string): string {
  const nxSupportedStyles = ['css', 'scss', 'less', 'tailwind', 'styled-components', '@emotion/styled', 'styled-jsx', 'none'];
  
  // If style is supported by Nx, return as is
  if (nxSupportedStyles.includes(style)) {
    return style;
  }
  
  // Map unsupported styles to css as fallback
  if (style === 'styl') {
    console.warn(`\n⚠️  Warning: Stylus (.styl) is not supported by Nx. Using CSS as fallback for Nx generation.`);
    console.warn(`   Your application will still be configured to use Stylus files.\n`);
    return 'css';
  }
  
  // Default fallback
  return 'css';
}

// Template constants for better maintainability
const TEMPLATES = {
  getAppContent: (a: any) => `import React, { useState } from 'react';
import './app.${a.style}';
${a.routing ? "import { Routes, Route, Link, useLocation } from 'react-router-dom';" : ''}
${a.stateManagement === 'redux' ? "import { Provider, useSelector, useDispatch } from 'react-redux';\nimport { store, RootState, increment, decrement } from './store';" : ''}
${a.stateManagement === 'zustand' ? "import { useAppStore } from './store';" : ''}
${a.i18n ? "import { useTranslation } from 'react-i18next';\nimport './i18n';" : ''}
${a.seo ? "import { SEO } from './components/SEO';\nimport { GoogleAnalytics } from './components/GoogleAnalytics';" : ''}

${a.routing ? `
// Home Page Component
const HomePage = () => {
  ${a.i18n ? "const { t } = useTranslation();" : ''}
  const getCurrentDate = () => new Date().toISOString().split('T')[0];
  
  return (
    <div className="container-full">
      <header className="app-header">
        <h1 className="entry-title">Welcome to ${a.name}!</h1>
        <div className="author">
          <span>PTG UI Schematics</span>
        </div>
        <time className="published">{getCurrentDate()}</time>
      </header>

      <main className="main-content">
        <section className="intro entry-content">
          <p className="entry-summary">Congratulations! Your React application is running successfully. This modern web application is built with the latest React framework, providing a robust foundation for scalable enterprise applications.</p>
          
          <p>This application demonstrates best practices in modern web development, including component-based architecture, reactive programming patterns, and comprehensive testing strategies.</p>
          
          <p>Built with performance and maintainability in mind, this application includes optimized build processes, code splitting capabilities, and progressive web app features to ensure excellent user experience across all devices and network conditions.</p>
        </section>

        <div className="features">
          <h2>Features included:</h2>
          <ul>
            <li>✅ React 18+ with TypeScript</li>
            <li>✅ React Router</li>
            <li>✅ ${a.style.toUpperCase()} Styling</li>
            <li>✅ ${a.bundler.charAt(0).toUpperCase() + a.bundler.slice(1)} Bundler</li>
            ${a.framework !== 'none' ? `<li>✅ ${a.framework.charAt(0).toUpperCase() + a.framework.slice(1)} UI Framework</li>` : ''}
            ${a.stateManagement === 'redux' ? '<li>✅ Redux Toolkit State Management</li>' : ''}
            ${a.stateManagement === 'zustand' ? '<li>✅ Zustand State Management</li>' : ''}
            ${a.i18n ? '<li>✅ Internationalization (i18n)</li>' : ''}
            ${a.seo ? '<li>✅ SEO Optimization with Google Analytics</li>' : ''}
            ${a.unitTestRunner !== 'none' ? `<li>✅ ${a.unitTestRunner.charAt(0).toUpperCase() + a.unitTestRunner.slice(1)} Unit Tests</li>` : ''}
            ${a.e2eTestRunner !== 'none' ? `<li>✅ ${a.e2eTestRunner.charAt(0).toUpperCase() + a.e2eTestRunner.slice(1)} E2E Tests</li>` : ''}
            ${a.linter !== 'none' ? '<li>✅ ESLint Linting</li>' : ''}
            ${a.prettier ? '<li>✅ Prettier Formatting</li>' : ''}
            ${a.husky ? '<li>✅ Husky Git Hooks</li>' : ''}
          </ul>
        </div>

        <section className="getting-started">
          <h2>Getting Started</h2>
          <p>Ready to start building your application! Visit the <Link to="/features">Features page</Link> to learn how to setup and use all included features.</p>
        </section>
      </main>
    </div>
  );
};

// About Page Component
const AboutPage = () => {
  return (
    <div className="container-full">
      <header className="page-header">
        <h1>About</h1>
        <p>Learn more about this application and its technology stack</p>
      </header>

      <main className="main-content">
        <section className="content-section">
          <h2>About This Application</h2>
          <p>Built with PTG UI Schematics - a powerful React application generator designed for enterprise applications.</p>
          
          <article className="tech-stack">
            <h3>Technology Stack</h3>
            <p>This application uses modern web technologies for optimal performance and developer experience.</p>
            
            <h4>Core Technologies</h4>
            <ul>
              <li>React 18+ for UI components and state management</li>
              <li>TypeScript for type safety and better developer experience</li>
              <li>${a.bundler.charAt(0).toUpperCase() + a.bundler.slice(1)} for fast builds and hot module replacement</li>
              <li>React Router for client-side routing</li>
            </ul>
            
            ${a.stateManagement !== 'none' ? `
            <h4>State Management</h4>
            <p>Using ${a.stateManagement === 'redux' ? 'Redux Toolkit' : 'Zustand'} for predictable state management and scalable application architecture.</p>` : ''}
            
            ${a.i18n ? `
            <h4>Internationalization</h4>
            <p>Built-in i18n support using react-i18next for multi-language applications.</p>` : ''}
            
            ${a.seo ? `
            <h4>SEO & Analytics</h4>
            <p>Comprehensive SEO optimization with meta tags, structured data, and Google Analytics integration.</p>` : ''}
          </article>
        </section>
      </main>
    </div>
  );
};

// Features Page Component
const FeaturesPage = () => {
  return (
    <div className="features-container">
      <header className="features-header">
        <h1>Features & Setup Guide</h1>
        <p>Learn how to setup and use all the features included in your application</p>
      </header>
      
      <main className="features-content">
        <section className="feature-usage">
          ${a.seo ? `
          <div className="usage-example">
            <h3>🔧 Google Analytics Setup</h3>
            <div className="setup-step">1. Add your Measurement ID in the GoogleAnalytics component</div>
            <code>&lt;GoogleAnalytics measurementId="G-XXXXXXXXXX" /&gt;</code>
            <div className="setup-step">2. Track custom events:</div>
            <code>trackEvent('button_click', &#123; button_name: 'signup' &#125;);</code>
          </div>` : ''}
          
          ${a.husky ? `
          <div className="usage-example setup-required">
            <h3>🔧 Husky Git Hooks Setup</h3>
            <div className="setup-step">1. Enable Husky:</div>
            <code>npm run prepare</code>
            <div className="setup-step">2. Hooks are now active for pre-commit and pre-push</div>
          </div>` : ''}
          
          ${a.i18n ? `
          <div className="usage-example">
            <h3>🔧 i18n Setup</h3>
            <div className="setup-step">1. Usage in components:</div>
            <code>const &#123; t, i18n &#125; = useTranslation();<br/>&#123;t('welcome')&#125;</code>
            <div className="setup-step">2. Change language:</div>
            <code>i18n.changeLanguage('es');</code>
          </div>` : ''}
          
          ${a.stateManagement === 'redux' ? `
          <div className="usage-example">
            <h3>Redux State Management</h3>
            <code>const dispatch = useDispatch();<br/>dispatch(increment());</code>
            <code>const count = useSelector((state: RootState) =&gt; state.app.count);</code>
          </div>` : ''}
          
          ${a.stateManagement === 'zustand' ? `
          <div className="usage-example">
            <h3>Zustand State Management</h3>
            <code>const &#123; count, increment &#125; = useAppStore();<br/>&lt;button onClick=&#123;increment&#125;&gt;+&lt;/button&gt;</code>
          </div>` : ''}
          
          <div className="usage-example">
            <h3>Routing</h3>
            <code>import &#123; useNavigate, Link &#125; from 'react-router-dom';<br/>const navigate = useNavigate();<br/>navigate('/about');</code>
            <code>&lt;Link to="/about"&gt;About&lt;/Link&gt;</code>
          </div>
          
          <div className="usage-example">
            <h3>HTTP Client</h3>
            <code>fetch('/api/users').then(res =&gt; res.json()).then(data =&gt; console.log(data));</code>
            <code>// Or use axios, fetch, or any HTTP library</code>
          </div>
        </section>
      </main>
    </div>
  );
};

// Demo Page Component
const DemoPage = () => {
  ${a.i18n ? "const { t, i18n } = useTranslation();" : ''}
  ${a.stateManagement === 'redux' ? "const dispatch = useDispatch();\n  const count = useSelector((state: RootState) => state.app.count);" : ''}
  ${a.stateManagement === 'zustand' ? "const { count, increment, decrement, reset } = useAppStore();" : ''}
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch('https://jsonplaceholder.typicode.com/users?_limit=5');
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="demo-container">
      <header className="demo-header">
        <h1>Live Demos</h1>
        <p>Interactive examples of all included features</p>
      </header>
      
      <main className="demo-content">
        ${a.i18n ? `
        <section className="demo-section">
          <h2>Internationalization Demo</h2>
          <div className="demo-examples">
            <div className="i18n-demo">
              <p>{t('welcome')}</p>
              <div className="language-switcher">
                <button onClick={() => i18n.changeLanguage('en')}>English</button>
                <button onClick={() => i18n.changeLanguage('es')}>Español</button>
              </div>
              <p>Current Language: {i18n.language}</p>
            </div>
          </div>
        </section>` : ''}

        ${a.seo ? `
        <section className="demo-section">
          <h2>SEO Features Demo</h2>
          <div className="demo-examples">
            <div className="seo-info">
              <p>This page includes:</p>
              <ul>
                <li>Meta tags for description and keywords</li>
                <li>Open Graph tags for social sharing</li>
                <li>Structured data markup</li>
                <li>Google Analytics tracking</li>
              </ul>
            </div>
          </div>
        </section>` : ''}

        ${a.stateManagement === 'redux' ? `
        <section className="demo-section">
          <h2>Redux State Demo</h2>
          <div className="demo-examples">
            <div className="ngrx-demo">
              <p>Counter: {count}</p>
              <button onClick={() => dispatch(decrement())}>-</button>
              <button onClick={() => dispatch(increment())}>+</button>
            </div>
          </div>
        </section>` : ''}

        ${a.stateManagement === 'zustand' ? `
        <section className="demo-section">
          <h2>Zustand State Demo</h2>
          <div className="demo-examples">
            <div className="ngrx-demo">
              <p>Counter: {count}</p>
              <button onClick={decrement}>-</button>
              <button onClick={increment}>+</button>
              <button onClick={reset}>Reset</button>
            </div>
          </div>
        </section>` : ''}

        <section className="demo-section">
          <h2>HTTP Client Demo</h2>
          <div className="demo-examples">
            <div className="http-demo">
              <button onClick={loadUsers}>Load Sample Data</button>
              {loading && <div>Loading...</div>}
              {users.length > 0 && (
                <div>
                  <h4>Sample Users:</h4>
                  <ul>
                    {users.map((user) => (
                      <li key={user.id}>{user.name} - {user.email}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="demo-section">
          <h2>Routing Demo</h2>
          <div className="demo-examples">
            <div className="routing-demo">
              <p>Navigate between pages:</p>
              <Link to="/"><button>Home</button></Link>
              <Link to="/about"><button>About</button></Link>
              <Link to="/features"><button>Features</button></Link>
            </div>
          </div>
        </section>

        <section className="demo-section">
          <h2>Responsive Grid Demo</h2>
          <div className="demo-examples">
            <div className="grid-demo">
              <div className="grid-item">Item 1</div>
              <div className="grid-item">Item 2</div>
              <div className="grid-item">Item 3</div>
              <div className="grid-item">Item 4</div>
            </div>
            <p>Resize browser to see responsive behavior</p>
          </div>
        </section>
      </main>
    </div>
  );
};

// Main App Component with Navigation
const AppContent = () => {
  const location = useLocation();
  
  return (
    <>
      ${a.seo ? `
      <SEO 
        title="${a.name}"
        description="A React application generated by PTG UI Schematics"
        keywords="react, typescript, ${a.framework !== 'none' ? a.framework + ',' : ''} web application"
      />
      <GoogleAnalytics 
        measurementId="G-XXXXXXXXXX" 
        debug={process.env.NODE_ENV === 'development'} 
      />` : ''}
      
      <div className="app">
        <nav className="main-navigation">
          <div className="nav-container">
            <div className="nav-brand">
              <img src="/assets/images/YashLogo.jpg" alt="Logo" className="nav-logo" />
              <span className="brand-text">PTG UI - React Schematics</span>
            </div>
            <div className="nav-links">
              <Link to="/" className={\`nav-link $\{location.pathname === '/' ? 'active' : ''}\`}>Home</Link>
              <Link to="/about" className={\`nav-link $\{location.pathname === '/about' ? 'active' : ''}\`}>About</Link>
              <Link to="/features" className={\`nav-link $\{location.pathname === '/features' ? 'active' : ''}\`}>Features</Link>
              <Link to="/demo" className={\`nav-link $\{location.pathname === '/demo' ? 'active' : ''}\`}>Demo</Link>
            </div>
          </div>
        </nav>

        <main className="app-main">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/features" element={<FeaturesPage />} />
            <Route path="/demo" element={<DemoPage />} />
          </Routes>
        </main>
      </div>
    </>
  );
};

const App = () => {
  return (
    ${a.stateManagement === 'redux' ? '<Provider store={store}><AppContent /></Provider>' : '<AppContent />'}
  );
};

export default App;
` : `const App = () => {
  ${a.i18n ? "const { t, i18n } = useTranslation();" : ''}

  return (
    ${a.stateManagement === 'redux' ? '<Provider store={store}>' : ''}
    ${a.stateManagement === 'redux' || a.seo ? '<>' : ''}
    ${a.seo ? `<SEO 
        title="${a.name}"
        description="A React application generated by PTG UI Schematics"
        keywords="react, typescript, ${a.framework !== 'none' ? a.framework + ',' : ''} web application"
      />
      <GoogleAnalytics 
        measurementId="G-XXXXXXXXXX" 
        debug={process.env.NODE_ENV === 'development'} 
      />` : ''}
    <div className="app">
      <div className="container-full">
        <header className="app-header">
          <h1>${a.i18n ? '{t("welcome")}' : `Welcome to ${a.name}!`}</h1>
          <div className="author">
            <span>PTG UI Schematics</span>
          </div>
        </header>

        <main className="main-content">
          <section className="intro">
            <p>Congratulations! Your React application is running successfully. This modern web application is built with the latest React framework.</p>
          </section>

          <div className="features">
            <h2>Features included:</h2>
            <ul>
              <li>✅ React 18+ with TypeScript</li>
              <li>✅ ${a.style.toUpperCase()} Styling</li>
              <li>✅ ${a.bundler.charAt(0).toUpperCase() + a.bundler.slice(1)} Bundler</li>
              ${a.framework !== 'none' ? `<li>✅ ${a.framework.charAt(0).toUpperCase() + a.framework.slice(1)} UI Framework</li>` : ''}
              ${a.stateManagement === 'redux' ? '<li>✅ Redux Toolkit</li>' : ''}
              ${a.stateManagement === 'zustand' ? '<li>✅ Zustand State Management</li>' : ''}
              ${a.i18n ? '<li>✅ Internationalization</li>' : ''}
              ${a.seo ? '<li>✅ SEO Optimization</li>' : ''}
              ${a.unitTestRunner !== 'none' ? `<li>✅ ${a.unitTestRunner.charAt(0).toUpperCase() + a.unitTestRunner.slice(1)} Unit Tests</li>` : ''}
              ${a.linter !== 'none' ? '<li>✅ ESLint Linting</li>' : ''}
              ${a.prettier ? '<li>✅ Prettier Formatting</li>' : ''}
              ${a.husky ? '<li>✅ Husky Git Hooks</li>' : ''}
            </ul>
          </div>

          <section className="getting-started">
            <h3>Getting Started</h3>
            <p>Start building your application with these resources:</p>
            <ul>
              <li><strong>Documentation:</strong> Check the README.md file</li>
              <li><strong>Development:</strong> Run <code>npm start</code> to begin</li>
              <li><strong>Testing:</strong> Use <code>npm test</code> for unit tests</li>
            </ul>
          </section>
        </main>
        
        ${a.i18n ? `
        <div className="language-switcher">
          <button onClick={() => i18n.changeLanguage('en')}>English</button>
          <button onClick={() => i18n.changeLanguage('es')}>Español</button>
        </div>` : ''}
      </div>
    </div>
    ${a.stateManagement === 'redux' || a.seo ? '</>' : ''}
    ${a.stateManagement === 'redux' ? '</Provider>' : ''}
  );
};

export default App;
`}`,

  getI18nContent: (appName: string) => `import i18n from 'i18next';
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

export default i18n;`,

  getReduxStoreContent: () => `import { configureStore, createSlice } from '@reduxjs/toolkit';

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
`,

  getZustandStoreContent: () => `import { create } from 'zustand';

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
`,

  getStyleContent: (a: any) => {
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
  },

  getMainTsx: (a: any) => {
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
  },

  getIndexHtml: (appName: string, seoEnabled: boolean = false) => `<!DOCTYPE html>
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
</html>`,

  getBasicAppTsx: (a: any) => `import React from 'react';
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

export default App;`,

  getBasicAppCss: () => `.app {
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
}`,

  getViteConfig: (appName: string, seoEnabled: boolean = false, bundler: string = 'vite') => `/// <reference types="vitest" />
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
});`,

  getEslintConfig: (linterType: string, hasTypeScript: boolean = true) => {
    return getEslintConfig(linterType);
  },

  getPrettierConfig: () => getPrettierConfig(),

  getSEOComponent: (a: any) => `import { useEffect } from 'react';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  author?: string;
  image?: string;
  url?: string;
  type?: string;
  twitterCard?: string;
  structuredData?: Record<string, any>;
}

export const SEO: React.FC<SEOProps> = ({
  title = '${a.name}',
  description = 'A React application built with PTG UI Schematics',
  keywords = 'react, typescript, vite, ${a.framework !== 'none' ? a.framework + ',' : ''} web application',
  author = 'PTG Digital',
  image = '/og-image.png',
  url = typeof window !== 'undefined' ? window.location.href : '',
  type = 'website',
  twitterCard = 'summary_large_image',
  structuredData,
}) => {
  const fullTitle = title === '${a.name}' ? title : \`\${title} | ${a.name}\`;

  useEffect(() => {
    // Set document title
    document.title = fullTitle;

    // Helper function to set or update meta tags
    const setMetaTag = (name: string, content: string, isProperty = false) => {
      const attribute = isProperty ? 'property' : 'name';
      let element = document.querySelector(\`meta[\${attribute}="\${name}"]\`) as HTMLMetaElement;
      
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attribute, name);
        document.head.appendChild(element);
      }
      
      element.setAttribute('content', content);
    };

    // Set basic meta tags
    setMetaTag('description', description);
    setMetaTag('keywords', keywords);
    setMetaTag('author', author);

    // Set Open Graph tags
    setMetaTag('og:title', fullTitle, true);
    setMetaTag('og:description', description, true);
    setMetaTag('og:type', type, true);
    setMetaTag('og:url', url, true);
    setMetaTag('og:image', image, true);
    setMetaTag('og:site_name', '${a.name}', true);

    // Set Twitter Card tags
    setMetaTag('twitter:card', twitterCard);
    setMetaTag('twitter:title', fullTitle);
    setMetaTag('twitter:description', description);
    setMetaTag('twitter:image', image);
    setMetaTag('twitter:creator', author);

    // Set canonical link
    let canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', url);

    // Add Schema.org structured data (JSON-LD)
    const defaultStructuredData = {
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: '${a.name}',
      description: description,
      url: url,
      image: image,
      author: {
        '@type': 'Organization',
        name: author,
      },
      applicationCategory: 'WebApplication',
      operatingSystem: 'Any',
    };

    const jsonLdData = structuredData || defaultStructuredData;

    // Remove existing JSON-LD script if present
    const existingScript = document.querySelector('script[type="application/ld+json"]');
    if (existingScript) {
      existingScript.remove();
    }

    // Add new JSON-LD script
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify(jsonLdData);
    document.head.appendChild(script);

  }, [fullTitle, description, keywords, author, image, url, type, twitterCard, structuredData]);

  // This component doesn't render anything
  return null;
};

export default SEO;`,

  getRobotsTxt: (hostname: string = 'https://yourdomain.com') => `# https://www.robotstxt.org/robotstxt.html
User-agent: *
Disallow:

# Sitemap
Sitemap: ${hostname}/sitemap.xml`,

  getSitemapXml: (hostname: string = 'https://yourdomain.com') => {
    const currentDate = new Date().toISOString().split('T')[0];
    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
  <!-- Homepage -->
  <url>
    <loc>${hostname}/</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <!-- About Page -->
  <url>
    <loc>${hostname}/about</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <!-- Add more URLs here as you create new pages -->
  <!-- 
  <url>
    <loc>${hostname}/contact</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  -->
</urlset>`;
  },

  getSitemapConfig: (a: any) => `// Sitemap configuration
export const sitemapConfig = {
  hostname: 'https://yourdomain.com',
  routes: [
    { path: '/', priority: 1.0, changefreq: 'daily' },
    { path: '/about', priority: 0.8, changefreq: 'monthly' },
    // Add more routes here
  ],
  exclude: ['/admin', '/private'],
};

/**
 * Generate sitemap.xml content
 * @returns XML string for sitemap
 */
export function generateSitemap(): string {
  const { hostname, routes } = sitemapConfig;
  const currentDate = new Date().toISOString().split('T')[0];

  const urlEntries = routes
    .map((route) => {
      const url = typeof route === 'string' ? route : route.path;
      const priority = typeof route === 'object' ? route.priority || 0.5 : 0.5;
      const changefreq = typeof route === 'object' ? route.changefreq || 'weekly' : 'weekly';

      return \`  <url>
    <loc>\${hostname}\${url}</loc>
    <lastmod>\${currentDate}</lastmod>
    <changefreq>\${changefreq}</changefreq>
    <priority>\${priority}</priority>
  </url>\`;
    })
    .join('\\n');

  return \`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
\${urlEntries}
</urlset>\`;
}

export default sitemapConfig;`,

  getGoogleAnalytics: (a: any) => `import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface GoogleAnalyticsProps {
  measurementId: string;
  debug?: boolean;
}

type TrackingType = 'GA4' | 'GTM';

/**
 * Google Analytics 4 (GA4) & Google Tag Manager (GTM) Integration Component
 * 
 * Supports both:
 * - GA4: Measurement IDs starting with 'G-' (e.g., 'G-XXXXXXXXXX')
 * - GTM: Container IDs starting with 'GTM-' (e.g., 'GTM-XXXXXXX')
 * 
 * Usage:
 * 1. Get your ID from Google Analytics or Google Tag Manager
 * 2. Add this component to your App.tsx
 * 3. Replace the placeholder with your actual ID
 * 
 * @param measurementId - Your GA4 Measurement ID or GTM Container ID
 * @param debug - Enable debug mode for development (optional)
 */
export const GoogleAnalytics: React.FC<GoogleAnalyticsProps> = ({ 
  measurementId, 
  debug = false 
}) => {
  const location = useLocation();

  // Detect tracking type based on ID format
  const trackingType: TrackingType = measurementId.startsWith('GTM-') ? 'GTM' : 'GA4';

  useEffect(() => {
    // Skip analytics in development if debug is false
    if (process.env.NODE_ENV === 'development' && !debug) {
      console.log(\`[\${trackingType}] Skipped in development mode. Enable debug prop to test.\`);
      return;
    }

    if (trackingType === 'GTM') {
      // Google Tag Manager Implementation
      if (!window.dataLayer) {
        // Initialize dataLayer
        window.dataLayer = window.dataLayer || [];
        
        // GTM script injection
        const gtmScript = document.createElement('script');
        gtmScript.innerHTML = \`
          (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
          new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
          j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
          'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
          })(window,document,'script','dataLayer','\${measurementId}');
        \`;
        document.head.insertBefore(gtmScript, document.head.firstChild);

        // GTM noscript fallback
        const gtmNoscript = document.createElement('noscript');
        gtmNoscript.innerHTML = \`
          <iframe src="https://www.googletagmanager.com/ns.html?id=\${measurementId}"
          height="0" width="0" style="display:none;visibility:hidden"></iframe>
        \`;
        document.body.insertBefore(gtmNoscript, document.body.firstChild);

        if (debug) {
          console.log('[GTM] Initialized with Container ID:', measurementId);
        }
      }
    } else {
      // Google Analytics 4 (GA4) Implementation
      if (!window.gtag) {
        const script = document.createElement('script');
        script.async = true;
        script.src = \`https://www.googletagmanager.com/gtag/js?id=\${measurementId}\`;
        document.head.appendChild(script);

        // Initialize gtag
        window.dataLayer = window.dataLayer || [];
        window.gtag = function gtag() {
          window.dataLayer.push(arguments);
        };
        window.gtag('js', new Date());
        window.gtag('config', measurementId, {
          send_page_view: false, // We'll handle page views manually
        });

        if (debug) {
          console.log('[GA4] Initialized with ID:', measurementId);
        }
      }
    }
  }, [measurementId, debug, trackingType]);

  // Track page views on route change
  useEffect(() => {
    if (trackingType === 'GTM') {
      // GTM page view tracking via dataLayer
      if (window.dataLayer) {
        window.dataLayer.push({
          event: 'page_view',
          page_path: location.pathname + location.search,
          page_title: document.title,
          page_location: window.location.href,
        });

        if (debug) {
          console.log('[GTM] Page view tracked:', location.pathname);
        }
      }
    } else {
      // GA4 page view tracking via gtag
      if (window.gtag) {
        window.gtag('event', 'page_view', {
          page_path: location.pathname + location.search,
          page_title: document.title,
        });

        if (debug) {
          console.log('[GA4] Page view tracked:', location.pathname);
        }
      }
    }
  }, [location, debug, trackingType]);

  return null;
};

/**
 * Track custom events
 * Works with both GA4 and GTM
 * 
 * @example
 * trackEvent('button_click', { button_name: 'signup', page: 'home' });
 */
export const trackEvent = (
  eventName: string,
  eventParams?: Record<string, any>
) => {
  // Try GTM dataLayer first
  if (window.dataLayer) {
    window.dataLayer.push({
      event: eventName,
      ...eventParams,
    });
  }
  
  // Also try GA4 gtag (in case both are present)
  if (window.gtag) {
    window.gtag('event', eventName, eventParams);
  }
};

/**
 * Track user properties
 * Works with both GA4 and GTM
 * 
 * @example
 * setUserProperties({ user_type: 'premium', plan: 'pro' });
 */
export const setUserProperties = (properties: Record<string, any>) => {
  // GTM dataLayer
  if (window.dataLayer) {
    window.dataLayer.push({
      event: 'user_properties_set',
      user_properties: properties,
    });
  }
  
  // GA4 gtag
  if (window.gtag) {
    window.gtag('set', 'user_properties', properties);
  }
};

/**
 * Push custom data to GTM dataLayer
 * 
 * @example
 * pushToDataLayer({ event: 'custom_event', customData: 'value' });
 */
export const pushToDataLayer = (data: Record<string, any>) => {
  if (window.dataLayer) {
    window.dataLayer.push(data);
  }
};

// TypeScript declarations for gtag and dataLayer
declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}

export default GoogleAnalytics;`,

  getSEOUtils: (a: any) => `// SEO Utility Functions
export interface PageMeta {
  title: string;
  description: string;
  keywords?: string;
  image?: string;
  url?: string;
  structuredData?: Record<string, any>;
}

// Default meta tags for the application
export const defaultMeta: PageMeta = {
  title: '${a.name}',
  description: 'A modern React application built with PTG UI Schematics',
  keywords: 'react, typescript, ${a.framework !== 'none' ? a.framework + ',' : ''} web development',
  image: '/og-image.png',
  url: typeof window !== 'undefined' ? window.location.origin : '',
};

// Page-specific meta tags
export const pageMeta: Record<string, PageMeta> = {
  home: {
    title: 'Home',
    description: 'Welcome to ${a.name} - Your modern React application',
    keywords: 'home, welcome, react app',
  },
  about: {
    title: 'About Us',
    description: 'Learn more about ${a.name} and our mission',
    keywords: 'about, team, company',
  },
  // Add more page-specific meta tags here
};

/**
 * Get meta tags for a specific page
 * @param page - The page identifier
 * @returns PageMeta object with merged default and page-specific meta
 */
export function getPageMeta(page: string): PageMeta {
  const meta = pageMeta[page] || {};
  return {
    ...defaultMeta,
    ...meta,
    title: meta.title ? \`\${meta.title} | \${defaultMeta.title}\` : defaultMeta.title,
  };
}

/**
 * Generate WebApplication structured data (JSON-LD)
 */
export function getWebApplicationStructuredData() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: '${a.name}',
    description: defaultMeta.description,
    url: defaultMeta.url,
    image: defaultMeta.image,
    applicationCategory: 'WebApplication',
    operatingSystem: 'Any',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
  };
}

/**
 * Generate Organization structured data (JSON-LD)
 */
export function getOrganizationStructuredData() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: '${a.name}',
    url: defaultMeta.url,
    logo: defaultMeta.image,
    description: defaultMeta.description,
  };
}

/**
 * Generate Article structured data (JSON-LD) for blog posts
 */
export function getArticleStructuredData(article: {
  title: string;
  description: string;
  image: string;
  datePublished: string;
  dateModified?: string;
  author: string;
  url: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.description,
    image: article.image,
    datePublished: article.datePublished,
    dateModified: article.dateModified || article.datePublished,
    author: {
      '@type': 'Person',
      name: article.author,
    },
    publisher: {
      '@type': 'Organization',
      name: '${a.name}',
      logo: {
        '@type': 'ImageObject',
        url: defaultMeta.image,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': article.url,
    },
  };
}

/**
 * Generate BreadcrumbList structured data (JSON-LD)
 */
export function getBreadcrumbStructuredData(breadcrumbs: Array<{ name: string; url: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      item: crumb.url,
    })),
  };
}

/**
 * Generate Product structured data (JSON-LD) for e-commerce
 */
export function getProductStructuredData(product: {
  name: string;
  description: string;
  image: string;
  brand: string;
  price: number;
  currency: string;
  availability: 'InStock' | 'OutOfStock' | 'PreOrder';
  url: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: product.image,
    brand: {
      '@type': 'Brand',
      name: product.brand,
    },
    offers: {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: product.currency,
      availability: \`https://schema.org/\${product.availability}\`,
      url: product.url,
    },
  };
}

export default {
  defaultMeta,
  pageMeta,
  getPageMeta,
  getWebApplicationStructuredData,
  getOrganizationStructuredData,
  getArticleStructuredData,
  getBreadcrumbStructuredData,
  getProductStructuredData,
};`
};



// Utility functions
const createFileWithErrorHandling = (filePath: string, content: string, description: string) => {
  try {
    fs.writeFileSync(filePath, content);
    return true;
  } catch (error) {
    console.error(`❌ Failed to create ${description}:`, error.message);
    return false;
  }
};

const executeCommand = (command: string, options: any, description: string) => {
  try {
    execSync(command, options);
    return true;
  } catch (error) {
    console.error(`❌ Failed to ${description}:`, error.message);
    return false;
  }
};

const installPackagesWithRetry = (packages: string[], isDev: boolean, workspacePath: string, description: string) => {
  const saveFlag = isDev ? "--save-dev" : "--save";
  const command = `npm install ${packages.join(" ")} ${saveFlag}`;
  
  const strategies = [
    { cmd: `${command} --legacy-peer-deps`, desc: "with legacy peer deps" },
    { cmd: `${command} --force --no-audit --no-fund`, desc: "with force flags" },
    { cmd: command, desc: "standard install" }
  ];

  for (const strategy of strategies) {
    console.log(`📦 Trying to install ${description} ${strategy.desc}...`);
    if (executeCommand(strategy.cmd, { cwd: workspacePath, stdio: [0, 1, 2] }, `install ${description}`)) {
      return true;
    }
  }
  
  console.error(`\n⚠️  Failed to install ${description}. You may need to install manually:`);
  console.error(`${command}\n`);
  return false;
};

const createWorkspaceWithRetry = (workspacePath: string, a: any) => {
  // Normalize style for Nx compatibility
  const nxStyle = getNormalizedStyleForNx(a.style);
  
  const strategies = [
    {
      cmd: `npx create-nx-workspace@latest ${a.workspace} --preset react-standalone --appName ${a.name} --style ${nxStyle} --nx-cloud skip --packageManager npm --routing ${a.routing} --bundler ${a.bundler} --unitTestRunner ${a.unitTestRunner} --e2eTestRunner ${a.e2eTestRunner} --no-interactive`,
      desc: "React standalone preset"
    },
    {
      cmd: `npx create-nx-workspace@latest ${a.workspace} --preset node --nx-cloud skip --packageManager npm --no-interactive`,
      desc: "Node preset"
    }
  ];

  for (const strategy of strategies) {
    console.log(`🚀 Attempting workspace creation with ${strategy.desc}...`);
    
    // Clean up any partial directory
    if (fs.existsSync(workspacePath)) {
      fs.rmSync(workspacePath, { recursive: true, force: true });
    }

    if (executeCommand(strategy.cmd, { cwd: process.cwd(), stdio: "inherit" }, strategy.desc)) {
      console.log("✅ Nx workspace created successfully!");
      return true;
    }
  }
  
  return false;
};

const createManualWorkspace = (workspacePath: string, a: any) => {
  try {
    fs.mkdirSync(workspacePath, { recursive: true });

    const scripts: { [key: string]: string } = {
      build: "nx build",
      test: "nx test",
      start: "nx serve",
    };

    // Add lint scripts if linter is enabled
    if (a.linter && a.linter !== 'none') {
      scripts.lint = `eslint "src/**/*.{js,jsx,ts,tsx}"`;
      scripts["lint:fix"] = `eslint "src/**/*.{js,jsx,ts,tsx}" --fix`;
    }

    // Add format scripts if prettier is enabled
    if (a.prettier) {
      scripts.format = `prettier --write "src/**/*.{js,jsx,ts,tsx,json,css,scss,md}"`;
      scripts["format:check"] = `prettier --check "src/**/*.{js,jsx,ts,tsx,json,css,scss,md}"`;
    }

    const packageJson = {
      name: a.workspace,
      version: "0.0.0",
      license: "MIT",
      type: "module",
      scripts,
      private: true,
      dependencies: {},
      devDependencies: {
        nx: "^21.6.5",
        typescript: "^5.5.0",
        "@nx/react": "^21.6.5",
        "@nx/js": "^21.6.5",
        "@nx/eslint": "^21.6.5",
        "@nx/webpack": "^21.6.5",
        "@nx/vite": "^21.6.5",
        "@nx/workspace": "^21.6.5",
      },
    };

    const filesToCreate = [
      { path: path.join(workspacePath, "nx.json"), content: JSON.stringify(TEMPLATE_CONFIG.NX_CONFIG, null, 2), desc: "nx.json" },
      { path: path.join(workspacePath, "package.json"), content: JSON.stringify(packageJson, null, 2), desc: "package.json" },
      { path: path.join(workspacePath, "tsconfig.base.json"), content: JSON.stringify(TEMPLATE_CONFIG.TSCONFIG_BASE, null, 2), desc: "tsconfig.base.json" },
      { path: path.join(workspacePath, "tsconfig.json"), content: JSON.stringify(TEMPLATE_CONFIG.TSCONFIG, null, 2), desc: "tsconfig.json" },
      { path: path.join(workspacePath, ".gitignore"), content: "node_modules\ndist\n.nx\n", desc: ".gitignore" }
    ];

    for (const file of filesToCreate) {
      if (!createFileWithErrorHandling(file.path, file.content, file.desc)) {
        throw new Error(`Failed to create ${file.desc}`);
      }
    }

    console.log("✅ Manual workspace creation completed");
    return true;
  } catch (error) {
    console.error("\n❌ Manual workspace creation failed:", error.message);
    return false;
  }
};

const getDependenciesByFeature = (a: any) => {
  const basePkgs = ["react@latest", "react-dom@latest"];
  const baseDevPkgs = [
    "@types/react@latest",
    "@types/react-dom@latest",
    "@vitejs/plugin-react@latest",
    "vite@latest",
    ...(a.style === 'scss' ? ["sass@latest"] : []),
    ...(a.style === 'styl' ? ["stylus@latest"] : []),
    ...(a.seo && a.bundler === 'vite' ? ["vite-plugin-ssr@latest"] : []), // Add SSR/SSG plugin for SEO (Vite only)
  ];

  // Add linting packages
  if (a.linter === "eslint" || a.linter === "airbnb" || a.linter === "custom") {
    const eslintDeps = getEslintDependencies(a.linter);
    baseDevPkgs.push(...eslintDeps);
  }

  // Add prettier if selected
  if (a.prettier) {
    const prettierDeps = getPrettierDependencies(a.prettier);
    baseDevPkgs.push(...prettierDeps);
  }

  // Add husky if selected
  if (a.husky) {
    const huskyDeps = getHuskyDependencies(a.husky);
    baseDevPkgs.push(...huskyDeps);
  }

  const featurePackages = {
    auth: {
      msal: ["@azure/msal-react@latest", "@azure/msal-browser@latest"],
      okta: ["@okta/okta-auth-js@latest", "@okta/okta-react@latest"]
    },
    routing: ["react-router-dom@latest"],
    routingDev: ["@types/react-router-dom@latest"],
    stateManagement: {
      redux: ["@reduxjs/toolkit@latest", "react-redux@latest"],
      reduxDev: ["@types/react-redux@latest"],
      zustand: ["zustand@latest"]
    },
    i18n: ["i18next@latest", "react-i18next@latest", "i18next-browser-languagedetector@latest"],
    seo: [],  // Using custom React hook instead of external package
    seoDev: [],
    framework: {
      material: ["@mui/material@latest", "@emotion/react@latest", "@emotion/styled@latest"],
      bootstrap: ["bootstrap@latest", "react-bootstrap@latest"],
      bootstrapDev: ["@types/bootstrap@latest"]
    }
  };

  // Add feature-specific packages
  if (a.auth === 'msal') {
    basePkgs.push(...featurePackages.auth.msal);
  } else if (a.auth === 'okta') {
    basePkgs.push(...featurePackages.auth.okta);
  }
  if (a.routing) {
    basePkgs.push(...featurePackages.routing);
    baseDevPkgs.push(...featurePackages.routingDev);
  }
  if (a.stateManagement === 'redux') {
    basePkgs.push(...featurePackages.stateManagement.redux);
    baseDevPkgs.push(...featurePackages.stateManagement.reduxDev);
  } else if (a.stateManagement === 'zustand') {
    basePkgs.push(...featurePackages.stateManagement.zustand);
  }
  if (a.i18n) {
    basePkgs.push(...featurePackages.i18n);
  }
  if (a.seo) {
    basePkgs.push(...featurePackages.seo);
    baseDevPkgs.push(...featurePackages.seoDev);
  }
  if (a.framework === "material") {
    basePkgs.push(...featurePackages.framework.material);
  } else if (a.framework === "bootstrap") {
    basePkgs.push(...featurePackages.framework.bootstrap);
    baseDevPkgs.push(...featurePackages.framework.bootstrapDev);
  }

  return { production: basePkgs, development: baseDevPkgs };
};

const addLintScriptsToPackageJson = (workspacePath: string, a: any) => {
  if (!a.linter || a.linter === 'none') {
    return;
  }

  try {
    const packageJsonPath = path.join(workspacePath, "package.json");
    if (!fs.existsSync(packageJsonPath)) {
      console.warn("⚠️  package.json not found, skipping lint scripts");
      return;
    }

    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
    
    // Initialize scripts if not present
    packageJson.scripts = packageJson.scripts || {};

    // Add lint scripts - use paths that work on both Windows and Unix
    packageJson.scripts.lint = `eslint "src/**/*.{js,jsx,ts,tsx}"`;
    packageJson.scripts["lint:fix"] = `eslint "src/**/*.{js,jsx,ts,tsx}" --fix`;

    // Add format scripts if prettier is enabled
    if (a.prettier) {
      packageJson.scripts.format = `prettier --write "src/**/*.{js,jsx,ts,tsx,json,css,scss,md}"`;
      packageJson.scripts["format:check"] = `prettier --check "src/**/*.{js,jsx,ts,tsx,json,css,scss,md}"`;
    }

    // Write back to package.json
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
    console.log("✅ Lint scripts added to package.json");
  } catch (error) {
    console.warn("⚠️  Failed to add lint scripts to package.json:", error.message);
  }
};

const setupHusky = (workspacePath: string, a: any) => {
  if (!a.husky) {
    return;
  }

  try {
    console.log("\n🐶 Setting up Husky...");

    // Initialize Husky
    try {
      execSync("npx husky init", {
        cwd: workspacePath,
        stdio: [0, 1, 2],
      });
    } catch (error) {
      // Husky init might fail if already initialized, continue anyway
      console.warn("⚠️  Husky init warning (may already be initialized)");
    }

    // Create .husky directory if it doesn't exist
    const huskyDir = path.join(workspacePath, ".husky");
    if (!fs.existsSync(huskyDir)) {
      fs.mkdirSync(huskyDir, { recursive: true });
    }

    // Create pre-commit hook
    const preCommitPath = path.join(huskyDir, "pre-commit");
    const preCommitContent = getHuskyPreCommitHook(
      a.linter && a.linter !== 'none',
      a.prettier
    );
    
    fs.writeFileSync(preCommitPath, preCommitContent, { mode: 0o755 });
    console.log("✅ Created pre-commit hook");

    // Add lint-staged configuration to package.json
    const packageJsonPath = path.join(workspacePath, "package.json");
    if (fs.existsSync(packageJsonPath)) {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
      
      // Parse the lint-staged config and add it to package.json
      const lintStagedConfigStr = getLintStagedConfig(
        a.linter && a.linter !== 'none',
        a.prettier
      );
      packageJson["lint-staged"] = JSON.parse(lintStagedConfigStr);
      
      // Add prepare script for husky
      packageJson.scripts = packageJson.scripts || {};
      packageJson.scripts.prepare = "husky";
      
      fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
      console.log("✅ Added lint-staged configuration to package.json");
    }

    console.log("✅ Husky setup completed successfully!");
  } catch (error) {
    console.error("❌ Failed to setup Husky:", error.message);
    console.warn("You can setup Husky manually later by running:");
    console.warn("  npx husky init");
  }
};

export function reactAppGenerator() {
  getArgs().then((a: any) => {
    try {
      const workspacePath = path.join(process.cwd(), a.workspace);

      // Check if workspace already exists
      if (fs.existsSync(workspacePath)) {
        console.error(
          `\n❌ Error: Directory "${a.workspace}" already exists. Please choose a different name or remove the existing directory.\n`
        );
        process.exit(1);
      }

      // Step 1: Create Nx workspace
      console.log("\n🚀 Step 1/7: Creating Nx workspace...\n");
      
      if (!createWorkspaceWithRetry(workspacePath, a)) {
        console.log("\n⚠️  All Nx presets failed, creating minimal workspace manually...\n");
        if (!createManualWorkspace(workspacePath, a)) {
          throw new Error("All workspace creation methods failed");
        }
      }

      // Check if workspace directory was created
      if (!fs.existsSync(workspacePath)) {
        console.error("\n❌ Workspace directory was not created. Exiting...\n");
        process.exit(1);
      }

      // Ensure TypeScript configuration files exist
      const tsconfigBasePath = path.join(workspacePath, "tsconfig.base.json");
      const tsconfigPath = path.join(workspacePath, "tsconfig.json");

      if (!fs.existsSync(tsconfigBasePath) && !fs.existsSync(tsconfigPath)) {
        console.log("\n⚠️  TypeScript configuration missing, creating...\n");
        createFileWithErrorHandling(tsconfigBasePath, JSON.stringify(TEMPLATE_CONFIG.TSCONFIG_BASE, null, 2), "tsconfig.base.json");
        createFileWithErrorHandling(tsconfigPath, JSON.stringify(TEMPLATE_CONFIG.TSCONFIG, null, 2), "tsconfig.json");
        console.log("✅ TypeScript configuration files created");
      }

      // Step 2: Install workspace dependencies
      console.log("\n📦 Step 2/7: Installing workspace dependencies...\n");
      installPackagesWithRetry([], false, workspacePath, "workspace dependencies");

      // Step 3: Install Angular DevKit
      console.log("\n📦 Step 3/7: Installing Angular DevKit...\n");
      installPackagesWithRetry(["@angular-devkit/core@latest", "@angular-devkit/schematics@latest"], true, workspacePath, "Angular DevKit");

      // Step 4: Install Nx React Plugin
      console.log("\n📦 Step 4/7: Installing Nx React Plugin...\n");
      
      // Clean up old packages first
      executeCommand(
        `npm uninstall @nrwl/react @nrwl/js @nrwl/eslint @nrwl/webpack @nrwl/workspace @nrwl/cli`,
        { cwd: workspacePath, stdio: "pipe" },
        "cleanup old packages"
      );
      
      installPackagesWithRetry([
        "@nx/react@latest", 
        "@nx/js@latest", 
        "@nx/eslint@latest", 
        "@nx/webpack@latest", 
        "@nx/vite@latest"
      ], true, workspacePath, "Nx React Plugin");

      // Step 4: Install PTG React Schematics
      console.log("\n📦 Step 5/7: Installing PTG React Schematics...\n");
      try {
        // For local development, use npm link instead of npm install
        execSync(`npm link @ptg-ui/react-schematics --force`, {
          cwd: workspacePath,
          stdio: [0, 1, 2],
        });
      } catch (err) {
        console.log(
          "\n⚠️  PTG React Schematics linking failed, trying alternative approaches...\n"
        );
        try {
          // Try installing from local path
          const localSchematicsPath = path.resolve(
            __dirname,
            "../../react-schematics"
          );
          if (fs.existsSync(localSchematicsPath)) {
            execSync(
              `npm install "${localSchematicsPath}" --no-audit --no-fund`,
              {
                cwd: workspacePath,
                stdio: [0, 1, 2],
              }
            );
          } else {
            throw new Error("Local react-schematics path not found");
          }
        } catch (err2) {
          console.log(
            "\n⚠️  Local installation failed, trying npm registry...\n"
          );
          try {
            execSync(
              `npm install @ptg-ui/react-schematics --no-audit --no-fund`,
              {
                cwd: workspacePath,
                stdio: [0, 1, 2],
              }
            );
          } catch (err3) {
            console.error("\n❌ Failed to install PTG React Schematics\n");
            console.error("This appears to be a local development setup.\n");
            console.error(
              "Please ensure you have run the following commands in the react-schematics directory:\n"
            );
            console.error("1. cd react-schematics");
            console.error("2. npm install");
            console.error("3. npm run build");
            console.error("4. npm link\n");
            console.error("Then try running the CLI again.\n");
            throw err3;
          }
        }
      }

      // Step 5: Generate React application
      console.log("\n🚀 Step 6/7: Generating React application...\n");

      // Check if app was already created by the preset
      const appPath = path.join(workspacePath, "apps", a.name);
      const standaloneAppPath = path.join(workspacePath, "src");

      if (fs.existsSync(appPath) || fs.existsSync(standaloneAppPath)) {
        // If using SCSS, ensure SASS is installed
        if (a.style === 'scss') {
          try {
            execSync('npm install --save-dev sass', {
              cwd: workspacePath,
              stdio: [0, 1, 2],
            });
          } catch (error) {
            console.warn("⚠️ Failed to install SASS. You may need to install it manually: npm install --save-dev sass");
          }
        }
        
        // If using Stylus, ensure stylus is installed
        if (a.style === 'styl') {
          try {
            execSync('npm install --save-dev stylus', {
              cwd: workspacePath,
              stdio: [0, 1, 2],
            });
            console.log("✅ Stylus installed successfully");
          } catch (error) {
            console.warn("⚠️ Failed to install Stylus. You may need to install it manually: npm install --save-dev stylus");
          }
        }

        // Apply PTG customizations to the preset-generated app
        console.log(
          "🎨 Applying PTG customizations to preset-generated app..."
        );
        applyPTGCustomizations(workspacePath, a);
      } else {
        console.log("🚀 Creating React application using Nx generator...");

        // Normalize style for Nx compatibility
        const nxStyle = getNormalizedStyleForNx(a.style);

        try {
          // Use Nx React generator to create the application
          execSync(
            `npx nx generate @nx/react:application ${a.name} --style=${nxStyle} --routing=${a.routing} --bundler=${a.bundler} --unitTestRunner=${a.unitTestRunner} --e2eTestRunner=${a.e2eTestRunner} --linter=${a.linter !== 'none' ? 'eslint' : 'none'} --skipFormat=true --no-interactive`,
            {
              cwd: workspacePath,
              stdio: [0, 1, 2],
            }
          );
          console.log(
            `✅ React application '${a.name}' created successfully using Nx generator!`
          );

          // Apply PTG customizations to the generated app
          console.log("🎨 Applying PTG customizations...");
          applyPTGCustomizations(workspacePath, a);
        } catch (err) {
          console.log(
            "\n⚠️  Nx React generator failed, trying alternative approach...\n"
          );

          try {
            // Try without some optional parameters
            execSync(
              `npx nx generate @nx/react:app ${a.name} --style=${nxStyle} --routing=${a.routing} --linter=${a.linter === 'none' ? 'none' : 'eslint'} --no-interactive`,
              {
                cwd: workspacePath,
                stdio: [0, 1, 2],
              }
            );
            console.log(
              `✅ React application '${a.name}' created successfully with fallback command!`
            );

            // Apply PTG customizations to the generated app
            console.log("🎨 Applying PTG customizations...");
            applyPTGCustomizations(workspacePath, a);
          } catch (err2) {
            console.log(
              "\n⚠️  Standard Nx generators failed, trying PTG React Schematics...\n"
            );

            try {
              // Try using the custom PTG React schematic
              // Note: PTG schematic handles the original style option internally
              execSync(
                `npx nx generate @ptg-ui/react-schematics:application ${a.name} --style=${a.style} --routing=${a.routing} --framework=${a.framework} --auth=${a.auth} --stateManagement=${a.stateManagement} --i18n=${a.i18n} --linter=${a.linter} --no-interactive`,
                {
                  cwd: workspacePath,
                  stdio: [0, 1, 2],
                }
              );
              console.log(
                `✅ React application '${a.name}' created successfully using PTG React Schematics!`
              );

              // PTG schematics should already include customizations, but apply any additional ones
              console.log("🎨 Applying additional PTG customizations...");
              applyPTGCustomizations(workspacePath, a);
            } catch (err3) {
              console.error("\n❌ All React generation methods failed\n");
              console.error("Nx generator error:", err2.message);
              console.error("PTG schematic error:", err3.message);
              console.error("\nFalling back to manual creation...\n");

              // Manual creation as last resort
              createManualReactApp(workspacePath, a);
            }
          }
        }
      }

      // Step 6: Install additional packages
      console.log("\n📦 Step 7/7: Installing React dependencies and additional packages...\n");

      const dependencies = getDependenciesByFeature(a);
      
      // Add specific note for SEO
      if (a.seo) {
        if (a.bundler === 'vite') {
          console.log("✅ SEO enabled with custom React hook + vite-plugin-ssr for SSR/SSG");
          console.log("   - Client-side: Custom hook for dynamic meta tags");
          console.log("   - Server-side: vite-plugin-ssr for prerendering and SSR\n");
        } else {
          console.log("✅ SEO enabled with custom React hook (client-side only)");
          console.log("   - Dynamic meta tags via custom hook");
          console.log(`   - Note: SSR/SSG requires Vite bundler (you selected ${a.bundler})\n`);
        }
      }
      
      installPackagesWithRetry(dependencies.production, false, workspacePath, "production dependencies");
      installPackagesWithRetry(dependencies.development, true, workspacePath, "development dependencies");

      // Add lint scripts to package.json
      addLintScriptsToPackageJson(workspacePath, a);

      // Setup Husky if enabled
      setupHusky(workspacePath, a);

      console.log("\n✅ React application created successfully!\n");
      console.log("━".repeat(50));
      console.log(`📁 Workspace: ${a.workspace}`);
      console.log(`📱 Application: ${a.name}`);
      console.log(`🎨 Style: ${a.style}`);
      console.log(`🔐 Auth: ${a.auth}`);
      console.log(`🧭 Routing: ${a.routing ? "Yes" : "No"}`);
      console.log(`📦 State Management: ${a.stateManagement === 'redux' ? 'Redux Toolkit' : a.stateManagement === 'zustand' ? 'Zustand' : 'None'}`);
      console.log(`🌐 i18n: ${a.i18n ? "Yes" : "No"}`);
      console.log(`🔍 SEO: ${a.seo ? (a.bundler === 'vite' ? "Yes (with vite-plugin-ssr for SSR/SSG)" : "Yes (client-side only)") : "No"}`);
      console.log(`🔧 Linter: ${a.linter === 'none' ? 'None' : a.linter === 'airbnb' ? 'ESLint with Airbnb' : a.linter === 'custom' ? 'ESLint with Custom Rules' : 'ESLint'}`);
      console.log(`✨ Prettier: ${a.prettier ? "Yes" : "No"}`);
      console.log(`🐶 Husky: ${a.husky ? "Yes" : "No"}`);
      console.log("━".repeat(50));
      console.log("\nTo get started:\n");
      console.log(`  cd ${a.workspace}`);
      console.log(`  npx nx serve ${a.name}`);
      console.log(`\nOr alternatively:`);
      console.log(`  cd ${a.workspace}`);
      console.log(`  npm run start ${a.name}\n`);
      
      // Add SEO-specific instructions if enabled
      if (a.seo) {
        console.log("📝 SEO Features:");
        console.log("   - Meta tags configured in src/app/components/SEO.tsx");
        console.log("   - Google Analytics 4 (GA4) / Google Tag Manager (GTM) ready");
        console.log("   - Component: src/app/components/GoogleAnalytics.tsx");
        console.log("   ⚠️  Replace 'G-XXXXXXXXXX' with your GA4 ID or 'GTM-XXXXXXX' with your GTM ID in App.tsx");
        console.log("   - Customize SEO defaults in src/app/utils/seo.ts");
        console.log("   - robots.txt available in public/robots.txt");
        console.log("   - sitemap.xml available in public/sitemap.xml");
        console.log("   - Schema.org structured data (JSON-LD) included");
        if (a.bundler === 'vite') {
          console.log("   - SSR/SSG enabled via vite-plugin-ssr (prerendering)");
          console.log("   - Run 'npm run build' to generate static HTML with meta tags");
        } else {
          console.log(`   - Note: Using ${a.bundler} bundler (SSR/SSG requires Vite)`);
          console.log("   - Meta tags updated dynamically on client-side");
        }
        console.log("   - See SEO_INTEGRATION_GUIDE.md for detailed usage\n");
      }
    } catch (error) {
      console.error("\n❌ Error creating React application:", error.message);
      console.error("\nTroubleshooting tips:");
      console.error("1. Clear npm cache: npm cache clean --force");
      console.error("2. Check your internet connection");
      console.error("3. Try using a different network or VPN");
      console.error("4. Check npm registry: npm config get registry");
      console.error(
        "5. Try running with different Node.js version (use nvm if available)"
      );
      console.error(
        "6. Check if you have write permissions in the current directory"
      );
      console.error("7. Try running the command with administrator privileges");
      console.error("8. Disable any antivirus software temporarily");
      console.error(
        "9. Try running: npm config set registry https://registry.npmjs.org/"
      );
      console.error("10. If on corporate network, check proxy settings\n");
      process.exit(1);
    }
  });
}

function getArgs() {
  const frameWorkOptions: { value: string; label: string }[] = [
    {
      value: "none",
      label: "None",
    },
    {
      value: "material",
      label: "Material",
    },
    {
      value: "bootstrap",
      label: "Bootstrap",
    },
  ];
  const styleOptions: { value: string; label: string }[] = [
    {
      value: "css",
      label: "CSS",
    },
    {
      value: "scss",
      label: "SASS(.scss)",
    },
    {
      value: "styl",
      label: "Stylus(.styl)",
    },
    {
      value: "less",
      label: "LESS",
    },
  ];
  const authOptions: { value: string; label: string }[] = [
    {
      value: "custom",
      label: "Custom",
    },
    {
      value: "msal",
      label: "Msal",
    },
    {
      value: "okta",
      label: "Okta",
    },
  ];
  const bundlerOptions: { value: string; label: string }[] = [
    {
      value: "vite",
      label: "Vite (Recommended)",
    },
    {
      value: "webpack",
      label: "Webpack",
    },
    //  Not supported by Nx for React apps
    // {
    //   value: "esbuild",
    //   label: "esbuild",
    // },
  ];
  const unitTestOptions: { value: string; label: string }[] = [
    {
      value: "vitest",
      label: "Vitest (Recommended)",
    },
    {
      value: "jest",
      label: "Jest",
    },
    {
      value: "none",
      label: "None",
    },
  ];
  const e2eTestOptions: { value: string; label: string }[] = [
    {
      value: "cypress",
      label: "Cypress",
    },
    {
      value: "playwright",
      label: "Playwright",
    },
    {
      value: "none",
      label: "None",
    },
  ];
  const stateManagementOptions: { value: string; label: string }[] = [
    {
      value: "redux",
      label: "Redux Toolkit - Popular, powerful state management",
    },
    {
      value: "zustand",
      label: "Zustand - Lightweight, simple state management",
    },
    {
      value: "none",
      label: "None - No state management library",
    },
  ];
  const linterOptions: { value: string; label: string }[] = [
    {
      value: "eslint",
      label: "Standard - Popular JavaScript style guide",
    },
    {
      value: "airbnb",
      label: "Airbnb - Strict and comprehensive rules",
    },
    {
      value: "custom",
      label: "Custom - Basic TypeScript ESLint setup",
    },
    {
      value: "none",
      label: "None",
    },
  ];
  return (inquirer as any)
    .prompt([
      {
        name: "workspace",
        message: `Workspace name (e.g., org name)`,
        type: "string",
      },
      {
        name: "name",
        message: `What name would you like to use for the application?`,
        type: "string",
      },
      {
        name: "framework",
        message: `Which framework would you like to use?`,
        type: "list",
        default: "none",
        choices: frameWorkOptions,
      },
      {
        name: "auth",
        message: `Which Authentication you would like to add to this Application??`,
        type: "list",
        default: "custom",
        choices: authOptions,
      },
      {
        name: "style",
        message: `Which stylesheet format would you like to use?`,
        type: "list",
        default: "css",
        choices: styleOptions,
      },
      {
        name: "routing",
        message: "Would you like to add React Router to this application?",
        type: "confirm",
      },
      {
        name: "stateManagement",
        message: "Which state management library would you like to use?",
        type: "list",
        default: "none",
        choices: stateManagementOptions,
      },
      {
        name: "i18n",
        message: "would you like to Adds i18n in project?",
        type: "confirm",
      },
      {
        name: "bundler",
        message: "Which bundler would you like to use?",
        type: "list",
        default: "vite",
        choices: bundlerOptions,
      },
      {
        name: "unitTestRunner",
        message: "Which unit test runner would you like to use?",
        type: "list",
        default: "vitest",
        choices: unitTestOptions,
      },
      {
        name: "e2eTestRunner",
        message: "Which test runner would you like to use for end to end tests?",
        type: "list",
        default: "none",
        choices: e2eTestOptions,
      },
      {
        name: "linter",
        message: "Which linter would you like to use?",
        type: "list",
        default: "eslint",
        choices: linterOptions,
      },
      {
        name: "prettier",
        message: "Would you like to use Prettier for code formatting?",
        type: "confirm",
        default: true,
      },
      {
        name: "husky",
        message: "Would you like to add Husky for Git hooks (pre-commit)?",
        type: "confirm",
        default: false,
      },
      {
        name: "seo",
        message: "Would you like to enable SEO features? (Meta tags, Open Graph, GA4/GTM, Sitemap)",
        type: "confirm",
        default: true,
      },
    ])
    .then((a: any) => {
      return a;
    });
}

function createManualReactApp(workspacePath: string, a: any) {
  console.log("📁 Creating React application structure manually...");

  // Create app directory structure
  const appPath = path.join(workspacePath, "apps", a.name);
  const srcPath = path.join(appPath, "src");
  const appSrcPath = path.join(srcPath, "app");

  // Create directories
  fs.mkdirSync(appPath, { recursive: true });
  fs.mkdirSync(srcPath, { recursive: true });
  fs.mkdirSync(appSrcPath, { recursive: true });

  // Create basic React files
  const indexHtml = TEMPLATES.getIndexHtml(a.name, a.seo);
  const mainTsx = TEMPLATES.getMainTsx(a);
  const appTsx = TEMPLATES.getBasicAppTsx(a);
  const appCss = TEMPLATES.getBasicAppCss();

  // Write files
  fs.writeFileSync(path.join(appPath, "index.html"), indexHtml);
  fs.writeFileSync(path.join(srcPath, "main.tsx"), mainTsx);
  fs.writeFileSync(path.join(appSrcPath, "app.tsx"), appTsx);
  fs.writeFileSync(path.join(appSrcPath, `app.${a.style}`), appCss);

  // Update workspace package.json with React dependencies
  const packageJsonPath = path.join(workspacePath, "package.json");
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));

  packageJson.type = "module";
  packageJson.dependencies = packageJson.dependencies || {};
  packageJson.dependencies["react"] = "latest";
  packageJson.dependencies["react-dom"] = "latest";
  packageJson.devDependencies = packageJson.devDependencies || {};
  packageJson.devDependencies["@types/react"] = "latest";
  packageJson.devDependencies["@types/react-dom"] = "latest";
  packageJson.devDependencies["@vitejs/plugin-react"] = "latest";
  packageJson.devDependencies["vite"] = "latest";

  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));

  // Update nx.json to include the new project
  const nxJsonPath = path.join(workspacePath, "nx.json");
  let nxJson: any = {};
  if (fs.existsSync(nxJsonPath)) {
    nxJson = JSON.parse(fs.readFileSync(nxJsonPath, "utf8"));
  }

  nxJson.projects = nxJson.projects || {};
  nxJson.projects[a.name] = `apps/${a.name}`;

  fs.writeFileSync(nxJsonPath, JSON.stringify(nxJson, null, 2));

  // Create project.json for the app
  const projectJson = {
    name: a.name,
    sourceRoot: `apps/${a.name}/src`,
    projectType: "application",
    targets: {
      build: {
        executor: "@nx/vite:build",
        outputs: [`{options.outputPath}`],
        options: {
          outputPath: `dist/apps/${a.name}`,
        },
      },
      serve: {
        executor: "@nx/vite:dev-server",
        defaultConfiguration: "development",
        options: {
          buildTarget: `${a.name}:build`,
        },
        configurations: {
          development: {
            buildTarget: `${a.name}:build:development`,
            hmr: true,
          },
          production: {
            buildTarget: `${a.name}:build:production`,
            hmr: false,
          },
        },
      },
      preview: {
        executor: "@nx/vite:preview-server",
        defaultConfiguration: "development",
        options: {
          buildTarget: `${a.name}:build`,
        },
      },
      test: {
        executor: "@nx/vite:test",
        outputs: [`{options.reportsDirectory}`],
        options: {
          passWithNoTests: true,
          reportsDirectory: `../../coverage/apps/${a.name}`,
        },
      },
      lint: {
        executor: "@nx/eslint:lint",
        outputs: [`{options.outputFile}`],
        options: {
          lintFilePatterns: [`apps/${a.name}/**/*.{ts,tsx,js,jsx}`],
        },
      },
    },
  };

  fs.writeFileSync(
    path.join(appPath, "project.json"),
    JSON.stringify(projectJson, null, 2)
  );

  // Create vite.config.ts
  const viteConfig = TEMPLATES.getViteConfig(a.name, a.seo, a.bundler);

  fs.writeFileSync(path.join(appPath, "vite.config.ts"), viteConfig);

  // Create tsconfig.json for the app
  fs.writeFileSync(
    path.join(appPath, "tsconfig.json"),
    JSON.stringify(TEMPLATE_CONFIG.APP_TSCONFIG, null, 2)
  );

  // Setup ESLint and Prettier if requested
  if (a.linter !== 'none') {
    const eslintConfigPath = path.join(appPath, "eslint.config.js");
    const eslintConfig = TEMPLATES.getEslintConfig(a.linter);
    createFileWithErrorHandling(eslintConfigPath, eslintConfig, "ESLint configuration");
  }

  if (a.prettier) {
    const prettierConfigPath = path.join(appPath, ".prettierrc");
    const prettierConfig = TEMPLATES.getPrettierConfig();
    createFileWithErrorHandling(prettierConfigPath, prettierConfig, "Prettier configuration");
  }

  console.log(
    `✅ React application '${a.name}' created successfully using manual fallback!`
  );
}

function removeNxWelcomeFile(workspacePath: string, a: any) {
  try {
    // Detect app structure
    const standaloneAppPath = path.join(workspacePath, "src");
    const multiAppPath = path.join(workspacePath, "apps", a.name);

    let appSrcPath: string;

    if (fs.existsSync(standaloneAppPath)) {
      appSrcPath = path.join(standaloneAppPath, "app");
    } else if (fs.existsSync(multiAppPath)) {
      appSrcPath = path.join(multiAppPath, "src", "app");
    } else {
      return;
    }

    // Remove nx-welcome.tsx if it exists
    const nxWelcomePath = path.join(appSrcPath, "nx-welcome.tsx");
    if (fs.existsSync(nxWelcomePath)) {
      fs.unlinkSync(nxWelcomePath);
      console.log("✅ Removed nx-welcome.tsx file");
    }
  } catch (error) {
    console.warn("⚠️  Could not remove nx-welcome file:", error.message);
  }
}

function updateTestFiles(workspacePath: string, a: any) {
  if (a.unitTestRunner === 'none') {
    return;
  }

  try {
    // Detect app structure
    const standaloneAppPath = path.join(workspacePath, "src");
    const multiAppPath = path.join(workspacePath, "apps", a.name);

    let appSrcPath: string;

    if (fs.existsSync(standaloneAppPath)) {
      appSrcPath = path.join(standaloneAppPath, "app");
    } else if (fs.existsSync(multiAppPath)) {
      appSrcPath = path.join(multiAppPath, "src", "app");
    } else {
      return;
    }

    // Update app.spec.tsx
    const specPath = path.join(appSrcPath, "app.spec.tsx");
    if (fs.existsSync(specPath)) {
      const updatedSpec = `import { render } from '@testing-library/react';

import App from './app';

describe('App', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<App />);
    expect(baseElement).toBeTruthy();
  });

  it('should have a greeting', () => {
    const { getAllByText } = render(<App />);
    expect(
      getAllByText(new RegExp('Welcome', 'gi')).length
    ).toBeGreaterThan(0);
  });
});
`;
      fs.writeFileSync(specPath, updatedSpec);
      console.log("✅ Updated test file with proper formatting");
    }
  } catch (error) {
    console.warn("⚠️  Could not update test files:", error.message);
  }
}

function fixLintIssues(workspacePath: string, a: any) {
  if (!a.linter || a.linter === 'none') {
    return;
  }

  try {
    console.log("\n🔧 Auto-fixing lint issues...");
    
    // Run lint fix
    execSync('npm run lint:fix', {
      cwd: workspacePath,
      stdio: 'pipe', // Use pipe to suppress output
    });
    
    console.log("✅ Lint issues fixed automatically");
  } catch (error) {
    // It's okay if some issues can't be auto-fixed
    console.log("✅ Lint auto-fix completed (some issues may need manual review)");
  }
}

function applyPTGCustomizations(workspacePath: string, a: any) {
  try {
    console.log("🔧 Applying framework-specific customizations...");

    // Update package.json to include module type for Vite bundler
    // Note: Webpack requires CommonJS, so we only set "module" for Vite
    const packageJsonPath = path.join(workspacePath, "package.json");
    if (fs.existsSync(packageJsonPath)) {
      try {
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
        if (!packageJson.type && a.bundler === 'vite') {
          packageJson.type = "module";
          fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
          console.log("✅ Updated package.json with module type for Vite");
        }
      } catch (error) {
        console.warn("⚠️  Could not update package.json:", error.message);
      }
    }

    // Detect if it's a standalone app (src in root) or multi-app workspace (apps/appName)
    const standaloneAppPath = path.join(workspacePath, "src");
    const multiAppPath = path.join(workspacePath, "apps", a.name);

    let appPath: string;
    let srcPath: string;
    let appSrcPath: string;

    if (fs.existsSync(standaloneAppPath)) {
      // Standalone app structure
      appPath = workspacePath;
      srcPath = standaloneAppPath;
      appSrcPath = path.join(srcPath, "app");
      console.log("📁 Detected standalone app structure");
    } else if (fs.existsSync(multiAppPath)) {
      // Multi-app workspace structure
      appPath = multiAppPath;
      srcPath = path.join(appPath, "src");
      appSrcPath = path.join(srcPath, "app");
      console.log("📁 Detected multi-app workspace structure");
    } else {
      console.warn(
        "⚠️  Could not detect app structure, skipping customizations"
      );
      return;
    }

    // Remove Nx welcome file first
    removeNxWelcomeFile(workspacePath, a);

    // Update the main app component with PTG branding
    const appTsxPath = path.join(appSrcPath, "app.tsx");
    const appJsxPath = path.join(appSrcPath, "app.jsx");
    const mainAppPath = fs.existsSync(appTsxPath) ? appTsxPath : appJsxPath;

    if (fs.existsSync(mainAppPath)) {
      const appContent = TEMPLATES.getAppContent(a);
      fs.writeFileSync(mainAppPath, appContent);
      console.log("✅ App component updated with PTG features");
    } else {
      console.warn("⚠️  Could not find main app component file");
    }

    // Create i18n configuration if i18n is enabled
    if (a.i18n) {
      console.log("📦 Setting up i18n configuration...");
      const i18nPath = path.join(appSrcPath, "i18n.ts");
      const i18nContent = TEMPLATES.getI18nContent(a.name);
      createFileWithErrorHandling(i18nPath, i18nContent, "i18n configuration");
    }

    // Create state management store based on selection
    if (a.stateManagement === 'redux') {
      console.log("📦 Setting up Redux Toolkit store...");
      const storePath = path.join(appSrcPath, "store.ts");
      const storeContent = TEMPLATES.getReduxStoreContent();
      createFileWithErrorHandling(storePath, storeContent, "Redux store");
    } else if (a.stateManagement === 'zustand') {
      console.log("📦 Setting up Zustand store...");
      const storePath = path.join(appSrcPath, "store.ts");
      const storeContent = TEMPLATES.getZustandStoreContent();
      createFileWithErrorHandling(storePath, storeContent, "Zustand store");
    }

    // Create SEO components and utilities if SEO is enabled
    if (a.seo) {
      console.log("📦 Setting up SEO components and utilities...");
      
      // Create components directory
      const componentsPath = path.join(appSrcPath, "components");
      fs.mkdirSync(componentsPath, { recursive: true });
      
      // Create SEO component
      const seoComponentPath = path.join(componentsPath, "SEO.tsx");
      const seoComponentContent = TEMPLATES.getSEOComponent(a);
      createFileWithErrorHandling(seoComponentPath, seoComponentContent, "SEO component");
      
      // Create Google Analytics component
      const gaComponentPath = path.join(componentsPath, "GoogleAnalytics.tsx");
      const gaComponentContent = TEMPLATES.getGoogleAnalytics(a);
      createFileWithErrorHandling(gaComponentPath, gaComponentContent, "Google Analytics component");
      
      // Create SEO utils
      const utilsPath = path.join(appSrcPath, "utils");
      fs.mkdirSync(utilsPath, { recursive: true });
      
      const seoUtilsPath = path.join(utilsPath, "seo.ts");
      const seoUtilsContent = TEMPLATES.getSEOUtils(a);
      createFileWithErrorHandling(seoUtilsPath, seoUtilsContent, "SEO utilities");
      
      // Create sitemap config
      const sitemapConfigPath = path.join(utilsPath, "sitemap.config.ts");
      const sitemapConfigContent = TEMPLATES.getSitemapConfig(a);
      createFileWithErrorHandling(sitemapConfigPath, sitemapConfigContent, "Sitemap configuration");
      
      // Create public folder for SEO files
      const publicPath = path.join(appPath, "public");
      fs.mkdirSync(publicPath, { recursive: true });
      
      // Create assets/images folder and copy logo
      const assetsPath = path.join(publicPath, "assets", "images");
      fs.mkdirSync(assetsPath, { recursive: true });
      
      // Copy YashLogo from angular-schematics assets
      // When compiled: __dirname is cli/dist/generators, need to go up 3 levels to root
      const sourceLogoPath = path.join(__dirname, "..", "..", "..", "angular-schematics", "src", "application", "files", "src", "assets", "images", "YashLogo.jpg");
      const destLogoPath = path.join(assetsPath, "YashLogo.jpg");
      
      try {
        if (fs.existsSync(sourceLogoPath)) {
          fs.copyFileSync(sourceLogoPath, destLogoPath);
          console.log("✅ Logo copied to assets/images/YashLogo.jpg");
        } else {
          console.warn("⚠️  Warning: YashLogo.jpg not found at source location");
          console.warn(`   Searched at: ${sourceLogoPath}`);
        }
      } catch (error) {
        console.warn("⚠️  Warning: Could not copy logo:", error.message);
      }
      
      // Create robots.txt
      const robotsTxtPath = path.join(publicPath, "robots.txt");
      const robotsTxtContent = TEMPLATES.getRobotsTxt('https://yourdomain.com');
      createFileWithErrorHandling(robotsTxtPath, robotsTxtContent, "robots.txt");
      
      // Create sitemap.xml
      const sitemapXmlPath = path.join(publicPath, "sitemap.xml");
      const sitemapXmlContent = TEMPLATES.getSitemapXml('https://yourdomain.com');
      createFileWithErrorHandling(sitemapXmlPath, sitemapXmlContent, "sitemap.xml");
      
      console.log("✅ SEO setup completed:");
      console.log("   - Meta tags, Open Graph, Twitter Cards");
      console.log("   - Google Analytics 4 (GA4) / Google Tag Manager (GTM) integration");
      console.log("   - Schema.org structured data (JSON-LD)");
      console.log("   - sitemap.xml and robots.txt");
      console.log("   ⚠️  Replace 'G-XXXXXXXXXX' with your GA4 ID or 'GTM-XXXXXXX' with your GTM ID in App.tsx");
    }

    // Add enhanced styling
    fs.mkdirSync(appSrcPath, { recursive: true });
    const stylePath = path.join(appSrcPath, `app.${a.style}`);
    const styleContent = TEMPLATES.getStyleContent(a);
    createFileWithErrorHandling(stylePath, styleContent, "style file") ||
      createFileWithErrorHandling(path.join(srcPath, `app.${a.style}`), styleContent, "style file (fallback)");

    // Copy logo to public/assets/images for all apps
    if (!a.seo) {
      const publicPath = path.join(appPath, "public");
      fs.mkdirSync(publicPath, { recursive: true });
      
      const assetsPath = path.join(publicPath, "assets", "images");
      fs.mkdirSync(assetsPath, { recursive: true });
      
      // Copy YashLogo from angular-schematics assets
      // When compiled: __dirname is cli/dist/generators, need to go up 3 levels to root
      const sourceLogoPath = path.join(__dirname, "..", "..", "..", "angular-schematics", "src", "application", "files", "src", "assets", "images", "YashLogo.jpg");
      const destLogoPath = path.join(assetsPath, "YashLogo.jpg");
      
      try {
        if (fs.existsSync(sourceLogoPath)) {
          fs.copyFileSync(sourceLogoPath, destLogoPath);
          console.log("✅ Logo copied to public/assets/images/YashLogo.jpg");
        } else {
          console.warn("⚠️  Warning: YashLogo.jpg not found at source location");
          console.warn(`   Searched at: ${sourceLogoPath}`);
        }
      } catch (error) {
        console.warn("⚠️  Warning: Could not copy logo:", error.message);
      }
    }

    // Setup ESLint and Prettier configurations
    if (a.linter !== 'none') {
      console.log("📦 Setting up ESLint configuration...");
      // Use eslint.config.js for all configurations (ESLint v9 format)
      const eslintConfigPath = path.join(appPath, "eslint.config.js");
      const eslintConfig = TEMPLATES.getEslintConfig(a.linter);
      createFileWithErrorHandling(eslintConfigPath, eslintConfig, "ESLint configuration");
    }

    if (a.prettier) {
      console.log("📦 Setting up Prettier configuration...");
      const prettierConfigPath = path.join(appPath, ".prettierrc");
      const prettierConfig = TEMPLATES.getPrettierConfig();
      createFileWithErrorHandling(prettierConfigPath, prettierConfig, "Prettier configuration");
    }

    // Update test files with proper formatting
    updateTestFiles(workspacePath, a);

    // Fix lint issues after all customizations
    fixLintIssues(workspacePath, a);

    console.log("✅ PTG customizations applied successfully!");
  } catch (error) {
    console.warn("⚠️  Some customizations failed to apply:", error.message);
  }
}

function addVSCodeExtensions() {
  const extensionsList = [
    "mrmlnc.vscode-scss",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-typescript-tslint-plugin",
    "vscode-icons-team.vscode-icons",
    "dsznajder.es7-react-js-snippets",
    "burkeholland.simple-react-snippets",
  ];
  const extensions = extensionsList
    .map((ext) => `--install-extension ${ext}`)
    .join(" ");
  execSync(`code ${extensions}`, {
    cwd: process.cwd(),
  });
}

export function invokeReactGenerator() {
  reactAppGenerator();
  // addVSCodeExtensions();
}