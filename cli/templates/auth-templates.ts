/**
 * Authentication Templates
 * Extracted from react.ts - Contains all authentication-related template generation functions
 * 
 * This file contains template generators for:
 * - MSAL (Microsoft Authentication Library) configuration and components
 * - Okta authentication configuration and components
 * - Authentication README documentation
 */

/**
 * Generates MSAL configuration file for Azure AD authentication
 * @returns MSAL config file content as a string
 */
export const getMsalConfig = () => `export const msalConfig: any = {
  auth: {
    clientId: "YOUR_CLIENT_ID", // Replace with your Azure AD client ID
    authority: "https://login.microsoftonline.com/YOUR_TENANT_ID", // Replace with your tenant ID
    redirectUri: window.location.origin, // Automatically uses current origin
  },
  cache: {
    cacheLocation: 'sessionStorage',
    storeAuthStateInCookie: true,
  },
};

export const loginRequest = {
  scopes: ['user.read', 'https://management.azure.com/user_impersonation'],
};`;

/**
 * Generates MSAL Login Button React component
 * Provides sign in/sign out functionality with Azure AD
 * @returns MSAL Login Button component code as a string
 */
export const getMsalLoginButton = () => `import { useMsal } from '@azure/msal-react';
import { loginRequest } from '../config/msalConfig';

export function MsalLoginButton() {
  const { instance, accounts } = useMsal();

  const handleLogin = () => {
    instance.loginPopup(loginRequest).catch((e) => {
      console.error('Login error:', e);
    });
  };

  const handleLogout = () => {
    instance.logoutPopup().catch((e) => {
      console.error('Logout error:', e);
    });
  };

  return (
    <div className="auth-buttons">
      {accounts.length === 0 ? (
        <button onClick={handleLogin} className="loginBtn">
          Sign In with Microsoft
        </button>
      ) : (
        <div>
          <span>Welcome, {accounts[0].name}</span>
          <button onClick={handleLogout} className="logoutBtn">
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
}`;

/**
 * Generates Okta configuration file for Okta authentication
 * @returns Okta config file content as a string
 */
export const getOktaConfig = () => `import { OktaAuthOptions } from '@okta/okta-auth-js';

const oktaConfig: OktaAuthOptions = {
  clientId: 'YOUR_OKTA_CLIENT_ID', // Replace with your Okta client ID
  issuer: 'https://YOUR_OKTA_DOMAIN/oauth2/default', // Replace with your Okta domain
  redirectUri: window.location.origin + '/login/callback',
  scopes: ['openid', 'profile', 'email'],
  pkce: true,
  disableHttpsCheck: process.env.NODE_ENV === 'development',
};

export default oktaConfig;`;

/**
 * Generates Okta Login Button React component
 * Provides sign in/sign out functionality with Okta
 * @returns Okta Login Button component code as a string
 */
export const getOktaLoginButton = () => `import { useOktaAuth } from '@okta/okta-react';

export function OktaLoginButton() {
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
    <div className="auth-buttons">
      {!authState.isAuthenticated ? (
        <button onClick={handleLogin} className="loginBtn">
          Sign In with Okta
        </button>
      ) : (
        <div>
          <span>Welcome, {authState.idToken?.claims.name || 'User'}</span>
          <button onClick={handleLogout} className="logoutBtn">
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
}`;

/**
 * Generates README documentation for authentication setup
 * @param authType - Type of authentication ('msal' or 'okta')
 * @returns README content for authentication setup
 */
export const getAuthReadme = (authType: string) => `# ${authType.toUpperCase()} Authentication Setup

This project is configured with ${authType.toUpperCase()} authentication.

## Setup Instructions

${authType === 'msal' ? `### Azure AD (MSAL) Configuration

1. Register your app in Azure Portal
2. Update \`src/config/msalConfig.ts\` with your Client ID and Tenant ID
3. Configure API permissions in Azure Portal

See the full setup guide in the MSAL documentation.` : `### Okta Configuration

1. Create an Okta developer account
2. Create a new application in Okta Dashboard
3. Update \`src/config/oktaConfig.ts\` with your Client ID and Domain

See the full setup guide in the Okta documentation.`}

## Usage

Authentication components are available in \`src/components/\`:
- Login/Logout button component
- Protected route examples

Check the component files for implementation details.
`;
