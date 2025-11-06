# Authentication Implementation

This document describes the authentication options available in the PTG UI Angular Schematics.

## Available Authentication Options

### 1. MSAL (Microsoft Authentication Library)
- **Package**: `@azure/msal-browser`, `@azure/msal-angular`
- **Use Case**: Applications that need to authenticate with Microsoft Azure AD
- **Features**:
  - Popup-based authentication
  - Automatic token refresh
  - Microsoft Graph API integration
  - Built-in MSAL interceptor for HTTP requests

#### Configuration
Update `src/app/core/services/auth.config.ts`:
```typescript
export const msalConfig: Configuration = {
  auth: {
    clientId: 'YOUR_CLIENT_ID', // Replace with your Azure AD app client ID
    authority: 'https://login.microsoftonline.com/YOUR_TENANT_ID', // Replace with your tenant ID
    redirectUri: '/'
  }
};
```

### 2. Okta Authentication
- **Package**: `@okta/okta-angular`, `@okta/okta-auth-js`
- **Use Case**: Enterprise applications using Okta as identity provider
- **Features**:
  - Redirect-based authentication
  - Built-in route guards
  - Automatic token management
  - PKCE support

#### Configuration
Update `src/app/core/services/auth.config.ts`:
```typescript
export const oktaConfig: OktaAuthOptions = {
  issuer: 'https://YOUR_OKTA_DOMAIN/oauth2/default', // Replace with your Okta domain
  clientId: 'YOUR_CLIENT_ID', // Replace with your Okta app client ID
  redirectUri: window.location.origin + '/login/callback'
};
```

### 3. Custom Authentication
- **Package**: No external dependencies (uses Angular HttpClient)
- **Use Case**: Applications with custom backend authentication
- **Demo API**: Uses DummyJSON API for demonstration
- **Features**:
  - JWT token-based authentication
  - Custom login form with validation
  - HTTP interceptor for token injection
  - Route guards for protected routes
  - Working demo with real API

#### Demo Credentials (DummyJSON API)
- **Username**: `kminchelle`
- **Password**: `0lelplR`
- **API Endpoint**: `https://dummyjson.com/auth/login`
- **Documentation**: [DummyJSON Auth Docs](https://dummyjson.com/docs/auth)

## Generated Files

### MSAL Authentication
```
src/app/
├── core/services/
│   ├── auth.service.ts      # MSAL authentication service
│   └── auth.config.ts       # MSAL configuration
├── login/
│   └── login.component.ts   # Login component with Microsoft sign-in
└── app.module.ts            # Updated with MSAL modules
```

### Okta Authentication
```
src/app/
├── core/services/
│   ├── auth.service.ts      # Okta authentication service
│   └── auth.config.ts       # Okta configuration
├── login/
│   └── login.component.ts   # Login component with Okta sign-in
└── app.module.ts            # Updated with Okta modules
```

### Custom Authentication
```
src/app/
├── core/services/
│   ├── auth.service.ts      # Custom authentication service
│   ├── auth.guard.ts        # Route guard for protected routes
│   └── auth.interceptor.ts  # HTTP interceptor for token injection
├── login/
│   └── login.component.ts   # Custom login form component
└── app.module.ts            # Updated with interceptors and guards
```

## Usage Examples

### MSAL Service Usage
```typescript
constructor(private authService: AuthService) {}

// Login
login() {
  this.authService.login();
}

// Check if logged in
isLoggedIn(): boolean {
  return this.authService.isLoggedIn();
}

// Get user info
getUser() {
  return this.authService.getUser();
}

// Logout
logout() {
  this.authService.logout();
}
```

### Okta Service Usage
```typescript
constructor(private authService: AuthService) {
  this.isAuthenticated$ = this.authService.isAuthenticated$;
}

// Login
async login() {
  await this.authService.login();
}

// Get user info
async getUser() {
  return await this.authService.getUser();
}

// Logout
async logout() {
  await this.authService.logout();
}
```

### Custom Service Usage
```typescript
constructor(private authService: AuthService) {
  this.currentUser$ = this.authService.currentUser$;
}

// Login with DummyJSON API
login(credentials: LoginCredentials) {
  // credentials = { username: 'kminchelle', password: '0lelplR' }
  this.authService.login(credentials).subscribe(success => {
    if (success) {
      this.router.navigate(['/dashboard']);
    }
  });
}

// Check if logged in
isLoggedIn(): boolean {
  return this.authService.isLoggedIn();
}

// Get current user info
getCurrentUser() {
  this.authService.getCurrentUser().subscribe(user => {
    console.log('Current user:', user);
  });
}

// Logout
logout() {
  this.authService.logout();
}
```

## Route Protection

### Using Guards
```typescript
// In your routing module
const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { 
    path: 'dashboard', 
    component: DashboardComponent,
    canActivate: [AuthGuard] // For custom auth
    // canActivate: [MsalGuard] // For MSAL
    // canActivate: [OktaAuthGuard] // For Okta
  }
];
```

## Environment Configuration

Add authentication configuration to your environment files:

```typescript
// environment.ts
export const environment = {
  production: false,
  auth: {
    // For MSAL
    clientId: 'your-msal-client-id',
    tenantId: 'your-tenant-id',
    
    // For Okta
    oktaDomain: 'your-okta-domain',
    oktaClientId: 'your-okta-client-id',
    
    // For Custom (DummyJSON Demo)
    apiUrl: 'https://dummyjson.com'
  }
};
```

## Security Best Practices

1. **Never store sensitive credentials in code**
2. **Use environment variables for configuration**
3. **Implement proper token refresh logic**
4. **Use HTTPS in production**
5. **Implement proper logout functionality**
6. **Validate tokens on the backend**
7. **Use secure storage for tokens (avoid localStorage for sensitive data)**

## Troubleshooting

### MSAL Issues
- Ensure redirect URI is registered in Azure AD
- Check browser console for MSAL errors
- Verify tenant ID and client ID are correct

### Okta Issues
- Verify Okta domain and client ID
- Check CORS settings in Okta dashboard
- Ensure redirect URI is whitelisted

### Custom Auth Issues
- Verify API endpoints are accessible
- Check network tab for HTTP errors
- For DummyJSON demo, use provided credentials: `kminchelle` / `0lelplR`
- Ensure JWT tokens are properly formatted
- DummyJSON API doesn't require CORS configuration