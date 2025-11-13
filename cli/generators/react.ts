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
${a.routing ? "import { Routes, Route, Link, useLocation, BrowserRouter } from 'react-router-dom';" : ''}
${a.stateManagement === 'redux' ? "import { Provider, useSelector, useDispatch } from 'react-redux';\nimport { store, RootState, increment, decrement } from './store';" : ''}
${a.stateManagement === 'zustand' ? "import { useAppStore } from './store';" : ''}
${a.i18n ? "import { useTranslation } from 'react-i18next';\nimport './i18n';" : ''}
${a.seo ? "import { SEO } from './components/SEO';\nimport { GoogleAnalytics } from './components/GoogleAnalytics';" : ''}
${a.auth === 'msal' ? "import { MsalLoginButton } from '../components/MsalLoginButton';\nimport { useMsal } from '@azure/msal-react';" : ''}
${a.auth === 'okta' ? "import { OktaLoginButton } from '../components/OktaLoginButton';\nimport { useOktaAuth } from '@okta/okta-react';" : ''}

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
            ${a.auth === 'msal' ? '<li>✅ Azure AD (MSAL) Authentication</li>' : ''}
            ${a.auth === 'okta' ? '<li>✅ Okta Authentication</li>' : ''}
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
          ${a.auth === 'msal' ? `
          <div className="usage-example setup-required">
            <h3>🔐 Azure AD (MSAL) Authentication</h3>
            <div className="setup-step">Your app is configured with Microsoft Authentication Library (MSAL)</div>
            <div className="setup-step">
              <strong>Configuration:</strong> Update <code>src/config/msalConfig.ts</code> with your Azure AD credentials
            </div>
            <div className="setup-step">
              <strong>Components:</strong> Use <code>&lt;MsalLoginButton /&gt;</code> component anywhere in your app
            </div>
            <div className="setup-step">
              <strong>Access user data:</strong>
            </div>
            <code>const &#123; accounts &#125; = useMsal();<br/>const user = accounts[0];</code>
            <div className="setup-step">
              <strong>Get access token:</strong>
            </div>
            <code>const response = await instance.acquireTokenSilent(&#123;<br/>  scopes: ['user.read'],<br/>  account: accounts[0]<br/>&#125;);</code>
            <div className="setup-step">
              ✨ <strong>Try it:</strong> Visit the <a href="/demo">Demo page</a> to see live authentication!
            </div>
          </div>` : ''}
          
          ${a.auth === 'okta' ? `
          <div className="usage-example setup-required">
            <h3>🔐 Okta Authentication</h3>
            <div className="setup-step">Your app is configured with Okta for secure authentication</div>
            <div className="setup-step">
              <strong>Configuration:</strong> Update <code>src/config/oktaConfig.ts</code> with your Okta credentials
            </div>
            <div className="setup-step">
              <strong>Components:</strong> Use <code>&lt;OktaLoginButton /&gt;</code> component anywhere in your app
            </div>
            <div className="setup-step">
              <strong>Access user data:</strong>
            </div>
            <code>const &#123; authState &#125; = useOktaAuth();<br/>const user = authState.idToken?.claims;</code>
            <div className="setup-step">
              <strong>Protected routes:</strong>
            </div>
            <code>import &#123; SecureRoute &#125; from '@okta/okta-react';<br/>&lt;SecureRoute path="/protected" component=&#123;ProtectedPage&#125; /&gt;</code>
            <div className="setup-step">
              ✨ <strong>Try it:</strong> Visit the <a href="/demo">Demo page</a> to see live authentication!
            </div>
          </div>` : ''}
          
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

${a.auth === 'msal' || a.auth === 'okta' ? `
// Authentication Info Component
const AuthInfo = () => {
  ${a.auth === 'msal' ? `const { accounts } = useMsal();
  
  if (accounts.length === 0) {
    return (
      <div className="auth-info">
        <p>Not authenticated. Click the button above to sign in.</p>
      </div>
    );
  }
  
  const account = accounts[0];
  return (
    <div className="auth-info">
      <h4>User Information</h4>
      <p><strong>Name:</strong> {account.name}</p>
      <p><strong>Email:</strong> {account.username}</p>
      <p><strong>Account ID:</strong> {account.localAccountId}</p>
    </div>
  );` : ''}
  ${a.auth === 'okta' ? `const { authState } = useOktaAuth();
  
  if (!authState || !authState.isAuthenticated) {
    return (
      <div className="auth-info">
        <p>Not authenticated. Click the button above to sign in.</p>
      </div>
    );
  }
  
  const user = authState.idToken?.claims;
  return (
    <div className="auth-info">
      <h4>User Information</h4>
      <p><strong>Name:</strong> {user?.name || 'N/A'}</p>
      <p><strong>Email:</strong> {user?.email || 'N/A'}</p>
      <p><strong>Subject:</strong> {user?.sub || 'N/A'}</p>
    </div>
  );` : ''}
};
` : ''}

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

        ${a.auth === 'msal' ? `
        <section className="demo-section">
          <h2>MSAL Authentication Demo</h2>
          <div className="demo-examples">
            <div className="auth-demo">
              <MsalLoginButton />
              <AuthInfo />
            </div>
          </div>
        </section>` : ''}

        ${a.auth === 'okta' ? `
        <section className="demo-section">
          <h2>Okta Authentication Demo</h2>
          <div className="demo-examples">
            <div className="auth-demo">
              <OktaLoginButton />
              <AuthInfo />
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
    ${a.auth === 'okta' 
      ? (a.stateManagement === 'redux' ? '<Provider store={store}><AppContent /></Provider>' : '<AppContent />')
      : (a.stateManagement === 'redux' ? '<Provider store={store}><BrowserRouter><AppContent /></BrowserRouter></Provider>' : '<BrowserRouter><AppContent /></BrowserRouter>')
    }
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
};`,

  getDockerfile: (appName: string, bundler: string = 'vite') => `# Multi-stage build for React application
# Stage 1: Build the application
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy application source
COPY . .

# Build the application
RUN npm run build

# Stage 2: Serve the application with nginx
FROM nginx:alpine

# Copy built assets from builder stage
COPY --from=builder /app/${bundler === 'vite' ? 'dist' : 'build'} /usr/share/nginx/html

# Copy custom nginx configuration (optional)
# COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \\
  CMD wget --quiet --tries=1 --spider http://localhost:80/ || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
`,

  getDockerIgnore: () => `# Node modules
node_modules
npm-debug.log

# Build output
dist
build
.nx

# Development files
.git
.gitignore
.env.local
.env.development
.env.test
*.log

# IDE
.vscode
.idea
*.swp
*.swo
*~

# OS files
.DS_Store
Thumbs.db

# Test files
coverage
*.test.ts
*.test.tsx
*.spec.ts
*.spec.tsx
__tests__
__mocks__

# Documentation
*.md
docs

# CI/CD
.github
.gitlab-ci.yml
azure-pipelines.yml

# Docker
Dockerfile
.dockerignore
docker-compose.yml
`,

  getDockerCompose: (appName: string) => `version: '3.8'

services:
  ${appName}:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: ${appName}-app
    ports:
      - "3000:80"
    environment:
      - NODE_ENV=production
    restart: unless-stopped
    networks:
      - ${appName}-network
    # Optional: Add volume for logs
    # volumes:
    #   - ./logs:/var/log/nginx

networks:
  ${appName}-network:
    driver: bridge

# Optional: Add volumes for persistent data
# volumes:
#   app-data:
`,

  getNginxConf: () => `server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json application/javascript;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Cache static assets
    location ~* \\.(?:css|js|jpg|jpeg|gif|png|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Single Page Application routing
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Health check endpoint
    location /health {
        access_log off;
        return 200 "healthy\\n";
        add_header Content-Type text/plain;
    }

    # Error pages
    error_page 404 /index.html;
}
`,

  getDockerReadme: (appName: string) => `# Docker Configuration for ${appName}

This directory contains Docker configuration files for containerizing your React application.

## Files Included

- **Dockerfile**: Multi-stage build configuration
- **.dockerignore**: Files to exclude from Docker build context
- **docker-compose.yml**: Docker Compose configuration for easy deployment
- **nginx.conf**: Custom Nginx configuration (optional)

## Quick Start

### Build and Run with Docker

\`\`\`bash
# Build the Docker image
docker build -t ${appName}:latest .

# Run the container
docker run -d -p 3000:80 --name ${appName}-app ${appName}:latest

# View logs
docker logs ${appName}-app

# Stop the container
docker stop ${appName}-app
\`\`\`

### Using Docker Compose

\`\`\`bash
# Build and start services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Rebuild and restart
docker-compose up -d --build
\`\`\`

## NPM Scripts

Use these convenient npm scripts:

\`\`\`bash
# Build Docker image
npm run docker:build

# Run with Docker Compose
npm run docker:up

# Stop Docker Compose
npm run docker:down

# View logs
npm run docker:logs
\`\`\`

## Configuration

### Environment Variables

Add environment variables in \`docker-compose.yml\`:

\`\`\`yaml
environment:
  - NODE_ENV=production
  - REACT_APP_API_URL=https://api.example.com
\`\`\`

### Port Configuration

Default port mapping: \`3000:80\` (host:container)

To change the host port, edit \`docker-compose.yml\`:

\`\`\`yaml
ports:
  - "8080:80"  # Changes host port to 8080
\`\`\`

### Custom Nginx Configuration

Uncomment the following line in \`Dockerfile\` to use custom Nginx config:

\`\`\`dockerfile
COPY nginx.conf /etc/nginx/conf.d/default.conf
\`\`\`

## Production Deployment

### Build Optimization

The Dockerfile uses multi-stage builds to minimize image size:
- Stage 1: Builds the application
- Stage 2: Serves static files with Nginx

### Security Best Practices

1. ✅ Uses Alpine Linux for smaller attack surface
2. ✅ Multi-stage build reduces final image size
3. ✅ Security headers configured in Nginx
4. ✅ Health check endpoint included
5. ✅ Runs as non-root user (Nginx default)

### Health Checks

The container includes a health check that runs every 30 seconds:

\`\`\`bash
# Check container health
docker inspect --format='{{.State.Health.Status}}' ${appName}-app
\`\`\`

## Troubleshooting

### Container won't start

\`\`\`bash
# Check logs
docker logs ${appName}-app

# Inspect container
docker inspect ${appName}-app
\`\`\`

### Port already in use

Change the host port in \`docker-compose.yml\` or use:

\`\`\`bash
docker run -d -p 8080:80 ${appName}:latest
\`\`\`

### Build fails

Ensure all dependencies are properly installed:

\`\`\`bash
# Clean build
docker-compose build --no-cache
\`\`\`

## Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Nginx Documentation](https://nginx.org/en/docs/)
- [Docker Compose Reference](https://docs.docker.com/compose/compose-file/)
`,

  getMsalConfig: () => `import { Configuration, PopupRequest } from '@azure/msal-browser';

export const msalConfig: Configuration = {
  auth: {
    clientId: 'YOUR_CLIENT_ID', // Replace with your Azure AD app client ID
    authority: 'https://login.microsoftonline.com/YOUR_TENANT_ID', // Replace with your tenant ID
    redirectUri: window.location.origin,
  },
  cache: {
    cacheLocation: 'sessionStorage',
    storeAuthStateInCookie: false,
  },
};

export const loginRequest: PopupRequest = {
  scopes: ['User.Read'],
};
`,

  getMsalLoginButton: () => `import React from 'react';
import { useMsal } from '@azure/msal-react';
import { loginRequest } from '../config/msalConfig';

export const MsalLoginButton: React.FC = () => {
  const { instance, accounts } = useMsal();

  const handleLogin = () => {
    instance.loginPopup(loginRequest).catch((e) => {
      console.error(e);
    });
  };

  const handleLogout = () => {
    instance.logoutPopup().catch((e) => {
      console.error(e);
    });
  };

  return (
    <div>
      {accounts.length > 0 ? (
        <div>
          <p>Welcome, {accounts[0].name}!</p>
          <button onClick={handleLogout}>Sign Out</button>
        </div>
      ) : (
        <button onClick={handleLogin}>Sign In with Microsoft</button>
      )}
    </div>
  );
};

export default MsalLoginButton;
`,

  getOktaConfig: () => `const oktaConfig = {
  clientId: 'YOUR_OKTA_CLIENT_ID', // Replace with your Okta app client ID
  issuer: 'https://YOUR_OKTA_DOMAIN/oauth2/default', // Replace with your Okta domain
  redirectUri: window.location.origin + '/login/callback',
  scopes: ['openid', 'profile', 'email'],
  pkce: true,
};

export default oktaConfig;
`,

  getOktaLoginButton: () => `import React from 'react';
import { useOktaAuth } from '@okta/okta-react';

export const OktaLoginButton: React.FC = () => {
  const { oktaAuth, authState } = useOktaAuth();

  const handleLogin = async () => {
    await oktaAuth.signInWithRedirect();
  };

  const handleLogout = async () => {
    await oktaAuth.signOut();
  };

  if (!authState) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      {authState.isAuthenticated ? (
        <div>
          <p>Welcome, {authState.idToken?.claims.name}!</p>
          <button onClick={handleLogout}>Sign Out</button>
        </div>
      ) : (
        <button onClick={handleLogin}>Sign In with Okta</button>
      )}
    </div>
  );
};

export default OktaLoginButton;
`,

  getGitHubActionsWorkflow: () => `name: CI

on:
  push:
    branches: [ main, master, develop ]
  pull_request:
    branches: [ main, master, develop ]

jobs:
  build-and-test:
    runs-on: ubuntu-latest
    
    strategy:
      matrix:
        node-version: [20.x]
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v4
      
    - name: Setup Node.js \${{ matrix.node-version }}
      uses: actions/setup-node@v4
      with:
        node-version: \${{ matrix.node-version }}
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Lint code
      run: npm run lint
      continue-on-error: true
    
    - name: Run tests
      run: npm test -- --watchAll=false
      continue-on-error: true
    
    - name: Build application
      run: npm run build
    
    - name: Upload build artifacts
      uses: actions/upload-artifact@v4
      with:
        name: build-output
        path: dist/
        retention-days: 7
    
    - name: Run E2E tests (if available)
      run: |
        if grep -q "\\"e2e\\"" package.json; then
          npm run e2e
        else
          echo "E2E tests not configured, skipping..."
        fi
      continue-on-error: true

  code-quality:
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v4
      
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: 20.x
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Check formatting (if Prettier is configured)
      run: |
        if grep -q "prettier" package.json; then
          npm run format:check || true
        else
          echo "Prettier not configured, skipping..."
        fi
      continue-on-error: true
    
    - name: Type check
      run: npx tsc --noEmit
      continue-on-error: true

  docker-build:
    runs-on: ubuntu-latest
    needs: build-and-test
    if: github.event_name == 'push' && (github.ref == 'refs/heads/main' || github.ref == 'refs/heads/master' || github.ref == 'refs/heads/develop')
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v4
    
    - name: Check if Dockerfile exists
      id: docker-check
      run: |
        if [ -f "Dockerfile" ]; then
          echo "dockerfile_exists=true" >> \$GITHUB_OUTPUT
        else
          echo "dockerfile_exists=false" >> \$GITHUB_OUTPUT
        fi
    
    - name: Set up Docker Buildx
      if: steps.docker-check.outputs.dockerfile_exists == 'true'
      uses: docker/setup-buildx-action@v3
    
    - name: Build Docker image
      if: steps.docker-check.outputs.dockerfile_exists == 'true'
      run: docker build -t app:\${{ github.sha }} .
    
    - name: Test Docker image
      if: steps.docker-check.outputs.dockerfile_exists == 'true'
      run: |
        docker run -d -p 3000:80 --name test-container app:\${{ github.sha }}
        sleep 5
        curl -f http://localhost:3000 || exit 1
        docker stop test-container
`,

  getGitLabCI: () => `stages:
  - install
  - lint
  - test
  - build
  - docker

variables:
  NODE_VERSION: "20"
  NPM_CACHE_FOLDER: .npm
  DOCKER_DRIVER: overlay2

cache:
  key:
    files:
      - package-lock.json
  paths:
    - node_modules/
    - .npm/

install_dependencies:
  stage: install
  image: node:\${NODE_VERSION}
  script:
    - npm ci --cache .npm --prefer-offline
  artifacts:
    paths:
      - node_modules/
    expire_in: 1 hour

lint:
  stage: lint
  image: node:\${NODE_VERSION}
  needs:
    - install_dependencies
  script:
    - npm run lint
  allow_failure: true

test:unit:
  stage: test
  image: node:\${NODE_VERSION}
  needs:
    - install_dependencies
  script:
    - npm test -- --watchAll=false
  coverage: '/All files[^|]*\\|[^|]*\\s+([\\d\\.]+)/'
  artifacts:
    when: always
    reports:
      junit:
        - junit.xml
      coverage_report:
        coverage_format: cobertura
        path: coverage/cobertura-coverage.xml
    paths:
      - coverage/
    expire_in: 30 days
  allow_failure: true

test:e2e:
  stage: test
  image: node:\${NODE_VERSION}
  needs:
    - install_dependencies
  script:
    - |
      if grep -q "\\"e2e\\"" package.json; then
        npm run e2e
      else
        echo "E2E tests not configured, skipping..."
      fi
  allow_failure: true
  only:
    - main
    - master
    - develop
    - merge_requests

build:
  stage: build
  image: node:\${NODE_VERSION}
  needs:
    - install_dependencies
  script:
    - npm run build
    - echo "Build completed successfully"
  artifacts:
    paths:
      - dist/
      - build/
    expire_in: 1 week

typecheck:
  stage: lint
  image: node:\${NODE_VERSION}
  needs:
    - install_dependencies
  script:
    - npx tsc --noEmit
  allow_failure: true

format:check:
  stage: lint
  image: node:\${NODE_VERSION}
  needs:
    - install_dependencies
  script:
    - |
      if grep -q "prettier" package.json; then
        npm run format:check || true
      else
        echo "Prettier not configured, skipping..."
      fi
  allow_failure: true

docker:build:
  stage: docker
  image: docker:24
  services:
    - docker:24-dind
  needs:
    - build
  before_script:
    - |
      if [ ! -f "Dockerfile" ]; then
        echo "Dockerfile not found, skipping Docker build..."
        exit 0
      fi
  script:
    - docker build -t \$CI_PROJECT_NAME:\$CI_COMMIT_SHORT_SHA .
    - docker tag \$CI_PROJECT_NAME:\$CI_COMMIT_SHORT_SHA \$CI_PROJECT_NAME:latest
    - echo "Docker image built successfully"
  only:
    - main
    - master
    - develop
  allow_failure: true

docker:test:
  stage: docker
  image: docker:24
  services:
    - docker:24-dind
  needs:
    - docker:build
  before_script:
    - |
      if [ ! -f "Dockerfile" ]; then
        echo "Dockerfile not found, skipping Docker test..."
        exit 0
      fi
  script:
    - docker run -d -p 3000:80 --name test-container \$CI_PROJECT_NAME:latest
    - sleep 5
    - apk add --no-cache curl
    - curl -f http://localhost:3000 || exit 1
    - docker stop test-container
    - echo "Docker container tested successfully"
  only:
    - main
    - master
    - develop
  allow_failure: true
`,

  getCIReadme: () => `# CI/CD Configuration

This project includes CI/CD configurations for both GitHub Actions and GitLab CI.

## GitHub Actions

The GitHub Actions workflow is located at \`.github/workflows/ci.yml\` and includes:

### Jobs

1. **build-and-test** (Matrix: Node 18.x, 20.x)
   - Checkout code
   - Setup Node.js
   - Install dependencies
   - Lint code
   - Run unit tests
   - Build application
   - Upload build artifacts
   - Run E2E tests (if configured)

2. **code-quality**
   - Check code formatting with Prettier
   - Run TypeScript type checking

3. **docker-build** (Only on main/develop branches)
   - Build Docker image
   - Test Docker container

### Triggers
- Push to \`main\` or \`develop\` branches
- Pull requests to \`main\` or \`develop\` branches

## GitLab CI

The GitLab CI configuration is located at \`.gitlab-ci.yml\` and includes:

### Stages

1. **install** - Install dependencies with caching
2. **lint** - Run linters and type checking
3. **test** - Run unit and E2E tests with coverage
4. **build** - Build the application
5. **docker** - Build and test Docker images (only on main/develop)

### Features
- Dependency caching for faster builds
- Test coverage reporting
- Parallel job execution
- Artifact retention
- Docker build and testing

## Configuration

### GitHub Secrets (Optional)

For deployment, you may need to add these secrets in GitHub Settings > Secrets:

- \`DOCKER_USERNAME\` - Docker Hub username
- \`DOCKER_PASSWORD\` - Docker Hub password/token
- \`NPM_TOKEN\` - NPM registry token (if publishing packages)

### GitLab CI/CD Variables (Optional)

For deployment, configure these variables in GitLab Settings > CI/CD > Variables:

- \`DOCKER_USERNAME\` - Docker Hub username
- \`DOCKER_PASSWORD\` - Docker Hub password/token
- \`NPM_TOKEN\` - NPM registry token (if publishing packages)

## Customization

### Adding Deployment

To add deployment steps, uncomment and configure the deployment jobs in the respective CI files:

**GitHub Actions:**
\`\`\`yaml
deploy:
  runs-on: ubuntu-latest
  needs: build-and-test
  if: github.ref == 'refs/heads/main'
  steps:
    # Add your deployment steps here
\`\`\`

**GitLab CI:**
\`\`\`yaml
deploy:
  stage: deploy
  script:
    # Add your deployment steps here
  only:
    - main
\`\`\`

### Modifying Test Commands

Update the test commands in the CI files to match your project:

- \`npm test\` - Unit tests
- \`npm run e2e\` - End-to-end tests
- \`npm run lint\` - Linting
- \`npm run build\` - Build

## Troubleshooting

### Tests Failing in CI

- Ensure all tests pass locally before pushing
- Check if environment-specific configurations are needed
- Review CI logs for specific error messages

### Build Artifacts Not Found

- Verify the build output directory matches the artifact path
- Check if the build command completes successfully

### Docker Build Issues

- Ensure Dockerfile exists in the project root
- Verify all dependencies are properly installed before build
- Check Docker service is running (GitLab CI)

## Best Practices

1. ✅ Keep CI files up to date with project dependencies
2. ✅ Run CI checks locally before pushing (using act for GitHub Actions)
3. ✅ Monitor CI/CD pipeline execution times and optimize if needed
4. ✅ Use caching effectively to speed up builds
5. ✅ Keep secrets secure - never commit them to the repository

## Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [GitLab CI/CD Documentation](https://docs.gitlab.com/ee/ci/)
- [Docker Documentation](https://docs.docker.com/)
`,

  getAuthReadme: (authType: string) => `# ${authType.toUpperCase()} Authentication Setup

${authType === 'msal' ? `## Microsoft Authentication Library (MSAL) Setup

### Prerequisites
1. Azure AD tenant
2. Registered application in Azure Portal

### Configuration Steps

1. **Register Application in Azure Portal**
   - Go to Azure Portal > Azure Active Directory > App registrations
   - Click "New registration"
   - Enter application name
   - Select supported account types
   - Add redirect URI: \`http://localhost:3000\`
   - Click "Register"

2. **Configure Application**
   - Copy Application (client) ID
   - Copy Directory (tenant) ID
   - Under "Authentication", enable "Access tokens" and "ID tokens"
   - Add platform configuration for Single-page application

3. **Update Configuration**
   Update \`src/config/msalConfig.ts\` with your Client ID and Tenant ID:
   \`\`\`typescript
   clientId: 'YOUR_CLIENT_ID',
   authority: 'https://login.microsoftonline.com/YOUR_TENANT_ID',
   \`\`\`

4. **API Permissions**
   - Go to "API permissions" in Azure Portal
   - Add required permissions (e.g., User.Read)
   - Grant admin consent if needed

### Usage

\`\`\`tsx
import { MsalLoginButton } from './components/MsalLoginButton';

function App() {
  return (
    <div>
      <MsalLoginButton />
    </div>
  );
}
\`\`\`

### Resources
- [MSAL.js Documentation](https://docs.microsoft.com/en-us/azure/active-directory/develop/msal-overview)
- [Azure AD App Registration](https://docs.microsoft.com/en-us/azure/active-directory/develop/quickstart-register-app)
` : `## Okta Authentication Setup

### Prerequisites
1. Okta developer account
2. Okta application configured

### Configuration Steps

1. **Create Okta Application**
   - Log in to Okta Developer Console
   - Go to Applications > Create App Integration
   - Select "OIDC - OpenID Connect"
   - Select "Single-Page Application"
   - Click "Next"

2. **Configure Application**
   - Enter application name
   - Add Sign-in redirect URI: \`http://localhost:3000/login/callback\`
   - Add Sign-out redirect URI: \`http://localhost:3000\`
   - Save the application

3. **Update Configuration**
   Copy your Client ID and Okta domain, then update \`src/config/oktaConfig.ts\`:
   \`\`\`typescript
   clientId: 'YOUR_OKTA_CLIENT_ID',
   issuer: 'https://YOUR_OKTA_DOMAIN/oauth2/default',
   \`\`\`

4. **Trusted Origins**
   - Go to Security > API > Trusted Origins
   - Add \`http://localhost:3000\` for both CORS and Redirect

### Usage

\`\`\`tsx
import { OktaLoginButton } from './components/OktaLoginButton';

function App() {
  return (
    <div>
      <OktaLoginButton />
    </div>
  );
}
\`\`\`

### Resources
- [Okta Developer Documentation](https://developer.okta.com/docs/)
- [Okta React SDK](https://github.com/okta/okta-react)
`}

## Testing Authentication

1. Start your development server
2. Click the login button
3. Complete the authentication flow
4. Verify user information is displayed
5. Test logout functionality

## Troubleshooting

### Common Issues

**MSAL:**
- CORS errors: Check redirect URIs in Azure Portal
- Token errors: Verify API permissions and consent
- Login popup blocked: Enable popups in browser

**Okta:**
- Invalid client: Verify Client ID in configuration
- CORS errors: Check Trusted Origins in Okta console
- Callback errors: Verify redirect URIs match exactly

### Debug Tips

Enable debug logging in your configuration:
\`\`\`typescript
// For MSAL
system: {
  loggerOptions: {
    loggerCallback: (level, message, containsPii) => {
      console.log(message);
    },
    logLevel: LogLevel.Verbose,
  },
}

// For Okta
oktaAuth.options.devMode = true;
\`\`\`
`
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
  // If no packages specified, run npm install to install all dependencies from package.json
  const saveFlag = isDev ? "--save-dev" : "--save";
  const command = packages.length === 0 
    ? "npm install" 
    : `npm install ${packages.join(" ")} ${saveFlag}`;
  
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
    // Only add Vite if it's the selected bundler
    ...(a.bundler === 'vite' || a.bundler === 'esbuild' ? ["@vitejs/plugin-react@latest", "vite@latest"] : []),
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

const setupDockerConfig = (workspacePath: string, a: any) => {
  if (!a.docker) {
    return;
  }

  try {
    console.log("\n🐳 Setting up Docker configuration...");

    // Detect app structure (standalone or multi-app)
    const standaloneAppPath = path.join(workspacePath, "src");
    const multiAppPath = path.join(workspacePath, "apps", a.name);
    
    let appPath: string;
    
    if (fs.existsSync(standaloneAppPath)) {
      appPath = workspacePath; // Standalone app, docker files go in root
    } else if (fs.existsSync(multiAppPath)) {
      appPath = multiAppPath; // Multi-app workspace
    } else {
      appPath = workspacePath; // Fallback to root
    }

    // Create Dockerfile
    const dockerfilePath = path.join(appPath, "Dockerfile");
    const dockerfileContent = TEMPLATES.getDockerfile(a.name, a.bundler);
    createFileWithErrorHandling(dockerfilePath, dockerfileContent, "Dockerfile");

    // Create .dockerignore
    const dockerignorePath = path.join(appPath, ".dockerignore");
    const dockerignoreContent = TEMPLATES.getDockerIgnore();
    createFileWithErrorHandling(dockerignorePath, dockerignoreContent, ".dockerignore");

    // Create docker-compose.yml
    const dockerComposePath = path.join(appPath, "docker-compose.yml");
    const dockerComposeContent = TEMPLATES.getDockerCompose(a.name);
    createFileWithErrorHandling(dockerComposePath, dockerComposeContent, "docker-compose.yml");

    // Create nginx.conf (optional)
    const nginxConfPath = path.join(appPath, "nginx.conf");
    const nginxConfContent = TEMPLATES.getNginxConf();
    createFileWithErrorHandling(nginxConfPath, nginxConfContent, "nginx.conf");

    // Create Docker README
    const dockerReadmePath = path.join(appPath, "DOCKER_README.md");
    const dockerReadmeContent = TEMPLATES.getDockerReadme(a.name);
    createFileWithErrorHandling(dockerReadmePath, dockerReadmeContent, "Docker documentation");

    // Add Docker scripts to package.json
    const packageJsonPath = path.join(workspacePath, "package.json");
    if (fs.existsSync(packageJsonPath)) {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
      
      packageJson.scripts = packageJson.scripts || {};
      packageJson.scripts["docker:build"] = `docker build -t ${a.name}:latest .`;
      packageJson.scripts["docker:run"] = `docker run -d -p 3000:80 --name ${a.name}-app ${a.name}:latest`;
      packageJson.scripts["docker:stop"] = `docker stop ${a.name}-app`;
      packageJson.scripts["docker:up"] = "docker-compose up -d";
      packageJson.scripts["docker:down"] = "docker-compose down";
      packageJson.scripts["docker:logs"] = "docker-compose logs -f";
      
      fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
      console.log("✅ Added Docker scripts to package.json");
    }

    console.log("✅ Docker configuration setup completed successfully!");
    console.log("   📝 Dockerfile created with multi-stage build");
    console.log("   📝 docker-compose.yml created for easy deployment");
    console.log("   📝 nginx.conf created with optimized settings");
    console.log("   📝 Docker scripts added to package.json");
    console.log("\n   Run 'npm run docker:build' to build your Docker image");
    console.log("   Run 'npm run docker:up' to start with Docker Compose");
  } catch (error) {
    console.error("❌ Failed to setup Docker configuration:", error.message);
    console.warn("You can add Docker configuration manually later");
  }
};

const setupCIConfig = (workspacePath: string, a: any) => {
  if (!a.ci) {
    return;
  }

  try {
    console.log("\n🔄 Setting up CI/CD configuration...");

    // Create .github/workflows directory for GitHub Actions
    const githubWorkflowsPath = path.join(workspacePath, ".github", "workflows");
    if (!fs.existsSync(githubWorkflowsPath)) {
      fs.mkdirSync(githubWorkflowsPath, { recursive: true });
    }

    // Create GitHub Actions workflow
    const githubActionsPath = path.join(githubWorkflowsPath, "ci.yml");
    const githubActionsContent = TEMPLATES.getGitHubActionsWorkflow();
    createFileWithErrorHandling(githubActionsPath, githubActionsContent, "GitHub Actions workflow");

    // Create GitLab CI configuration
    const gitlabCIPath = path.join(workspacePath, ".gitlab-ci.yml");
    const gitlabCIContent = TEMPLATES.getGitLabCI();
    createFileWithErrorHandling(gitlabCIPath, gitlabCIContent, "GitLab CI configuration");

    // Create CI README
    const ciReadmePath = path.join(workspacePath, "CI_README.md");
    const ciReadmeContent = TEMPLATES.getCIReadme();
    createFileWithErrorHandling(ciReadmePath, ciReadmeContent, "CI/CD documentation");

    console.log("✅ CI/CD configuration setup completed successfully!");
    console.log("   📝 GitHub Actions: .github/workflows/ci.yml");
    console.log("   📝 GitLab CI: .gitlab-ci.yml");
    console.log("   📝 Documentation: CI_README.md");
    console.log("\n   Both CI configurations work with React and Angular applications");
  } catch (error) {
    console.error("❌ Failed to setup CI/CD configuration:", error.message);
    console.warn("You can add CI/CD configuration manually later");
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
      
      // Prepare bundler-specific packages
      const nxPlugins = [
        "@nx/react@latest", 
        "@nx/js@latest", 
        "@nx/eslint@latest"
      ];
      
      // Add bundler-specific plugins
      if (a.bundler === 'webpack') {
        nxPlugins.push("@nx/webpack@latest");
      } else if (a.bundler === 'vite' || a.bundler === 'esbuild') {
        nxPlugins.push("@nx/vite@latest");
      } else if (a.bundler === 'rspack') {
        nxPlugins.push("@nx/rspack@latest");
      } else if (a.bundler === 'rsbuild') {
        nxPlugins.push("@nx/rsbuild@latest");
      }
      
      installPackagesWithRetry(nxPlugins, true, workspacePath, "Nx React Plugin");

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

      // Setup Docker configuration if enabled
      setupDockerConfig(workspacePath, a);

      // Setup CI/CD configuration if enabled
      setupCIConfig(workspacePath, a);

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
      console.log(`🐳 Docker: ${a.docker ? "Yes" : "No"}`);
      console.log(`🔄 CI/CD: ${a.ci ? "Yes (GitHub Actions & GitLab CI)" : "No"}`);
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
        name: "docker",
        message: "Would you like to add Docker configuration?",
        type: "confirm",
        default: false,
      },
      {
        name: "ci",
        message: "Would you like to add CI/CD configuration? (GitHub Actions & GitLab CI)",
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

function setupAuthentication(workspacePath: string, a: any) {
  if (!a.auth || a.auth === 'custom') {
    return; // No setup needed for custom auth
  }

  try {
    console.log(`\n🔐 Setting up ${a.auth.toUpperCase()} authentication...`);

    // Detect app structure
    const standaloneAppPath = path.join(workspacePath, "src");
    const multiAppPath = path.join(workspacePath, "apps", a.name);

    let appPath: string;
    let srcPath: string;

    if (fs.existsSync(standaloneAppPath)) {
      appPath = workspacePath;
      srcPath = standaloneAppPath;
    } else if (fs.existsSync(multiAppPath)) {
      appPath = multiAppPath;
      srcPath = path.join(appPath, "src");
    } else {
      console.warn("⚠️  Could not detect app structure for auth setup");
      return;
    }

    // Create config directory
    const configPath = path.join(srcPath, "config");
    fs.mkdirSync(configPath, { recursive: true });

    // Create components directory
    const componentsPath = path.join(srcPath, "components");
    fs.mkdirSync(componentsPath, { recursive: true });

    if (a.auth === 'msal') {
      // Create MSAL configuration
      const msalConfigPath = path.join(configPath, "msalConfig.ts");
      const msalConfigContent = TEMPLATES.getMsalConfig();
      createFileWithErrorHandling(msalConfigPath, msalConfigContent, "MSAL configuration");

      // Create MSAL Login Button component
      const msalButtonPath = path.join(componentsPath, "MsalLoginButton.tsx");
      const msalButtonContent = TEMPLATES.getMsalLoginButton();
      createFileWithErrorHandling(msalButtonPath, msalButtonContent, "MSAL Login Button component");

      // Update main.tsx to wrap with MsalProvider
      const mainTsxPath = path.join(srcPath, "main.tsx");
      if (fs.existsSync(mainTsxPath)) {
        const updatedMain = `import { StrictMode } from 'react';
import * as ReactDOM from 'react-dom/client';
import { MsalProvider } from '@azure/msal-react';
import { PublicClientApplication } from '@azure/msal-browser';
import { msalConfig } from './config/msalConfig';
import App from './app/app';

const msalInstance = new PublicClientApplication(msalConfig);

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <StrictMode>
    <MsalProvider instance={msalInstance}>
      <App />
    </MsalProvider>
  </StrictMode>
);`;
        fs.writeFileSync(mainTsxPath, updatedMain);
        console.log("✅ Updated main.tsx with MsalProvider");
      }

      console.log("✅ MSAL authentication setup completed!");
      console.log("   📝 Update src/config/msalConfig.ts with your Azure AD credentials");
      console.log("   📝 Use <MsalLoginButton /> component in your app");

    } else if (a.auth === 'okta') {
      // Create Okta configuration
      const oktaConfigPath = path.join(configPath, "oktaConfig.ts");
      const oktaConfigContent = TEMPLATES.getOktaConfig();
      createFileWithErrorHandling(oktaConfigPath, oktaConfigContent, "Okta configuration");

      // Create Okta Login Button component
      const oktaButtonPath = path.join(componentsPath, "OktaLoginButton.tsx");
      const oktaButtonContent = TEMPLATES.getOktaLoginButton();
      createFileWithErrorHandling(oktaButtonPath, oktaButtonContent, "Okta Login Button component");

      // Update main.tsx to wrap with Okta Security
      const mainTsxPath = path.join(srcPath, "main.tsx");
      if (fs.existsSync(mainTsxPath)) {
        const updatedMain = `import { StrictMode } from 'react';
import * as ReactDOM from 'react-dom/client';
import { OktaAuth } from '@okta/okta-auth-js';
import { Security } from '@okta/okta-react';
import { BrowserRouter as Router } from 'react-router-dom';
import oktaConfig from './config/oktaConfig';
import App from './app/app';

const oktaAuth = new OktaAuth(oktaConfig);

const restoreOriginalUri = async (_oktaAuth: any, originalUri: string) => {
  window.location.replace(originalUri || '/');
};

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <StrictMode>
    <Router>
      <Security oktaAuth={oktaAuth} restoreOriginalUri={restoreOriginalUri}>
        <App />
      </Security>
    </Router>
  </StrictMode>
);`;
        fs.writeFileSync(mainTsxPath, updatedMain);
        console.log("✅ Updated main.tsx with Okta Security provider");
      }

      console.log("✅ Okta authentication setup completed!");
      console.log("   📝 Update src/config/oktaConfig.ts with your Okta credentials");
      console.log("   📝 Use <OktaLoginButton /> component in your app");
    }

    // Create README for authentication
    const authReadmePath = path.join(srcPath, `${a.auth.toUpperCase()}_SETUP.md`);
    const authReadmeContent = TEMPLATES.getAuthReadme(a.auth);
    createFileWithErrorHandling(authReadmePath, authReadmeContent, "Authentication setup guide");

  } catch (error) {
    console.warn(`⚠️  Could not setup ${a.auth} authentication:`, error.message);
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

    // Setup Docker configuration if enabled
    setupDockerConfig(workspacePath, a);

    // Setup CI/CD configuration if enabled
    setupCIConfig(workspacePath, a);

    // Setup authentication if MSAL or Okta selected
    setupAuthentication(workspacePath, a);

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