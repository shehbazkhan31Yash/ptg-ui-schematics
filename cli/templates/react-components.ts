/**
 * React Component Templates
 * Extracted from react.ts - Contains all React component template generation functions
 * 
 * This file contains template generators for:
 * - Main App component (with and without routing)
 * - HomePage, AboutPage, FeaturesPage, DemoPage components
 * - AuthInfo component for authentication display
 * - AppContent component with navigation
 */

/**
 * Generates the complete App.tsx content with all features
 * Includes conditional rendering based on selected features (routing, auth, state management, etc.)
 * 
 * @param a - Application configuration object
 * @returns Complete App.tsx file content as a string
 */
export const getAppContent = (a: any) => `import React, { useState } from 'react';
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
`}`;
