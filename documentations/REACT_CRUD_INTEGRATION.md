# React CRUD Operations Integration Guide

## 📋 Overview

Complete integration of CRUD operations with Axios HTTP client and interceptors into the PTG UI React generator. This feature provides a production-ready API client setup with generic CRUD services, request/response interceptors, and a fully functional demo component.

## ✨ Features

### Core Features
- ✅ Axios HTTP client with custom configuration
- ✅ Request interceptors (authentication tokens, logging)
- ✅ Response interceptors (global error handling)
- ✅ Generic `CrudService<T>` class for type-safe operations
- ✅ Pre-built demo with Users and Posts management
- ✅ Complete TypeScript support
- ✅ Environment-based configuration
- ✅ Error handling for 401, 403, 404, 500 errors

### Demo Features
- Interactive CRUD UI with tabs (Users/Posts)
- Create, Read, Update, Delete operations
- Loading states and error messages
- Form validation
- Modern purple gradient styling
- JSONPlaceholder API integration

## 🚀 Usage

### CLI Prompt

When generating a new React application:

```bash
ptg-ui-cli

? Select Application Type › React
? Workspace name (e.g., org name) › my-company
? What name would you like to use for the application? › dashboard
# ... other prompts ...
? Add CRUD operations? (Axios + API Client + Interceptors) › Yes
```

### Generated Files

When CRUD is enabled, the following files are created:

```
my-workspace/
├── apps/
│   └── my-app/
│       ├── src/
│       │   ├── services/
│       │   │   ├── apiClient.ts        # Axios instance with interceptors
│       │   │   └── crudService.ts      # Generic CRUD service + examples
│       │   └── components/
│       │       ├── CrudDemo.tsx        # Interactive demo component
│       │       └── CrudDemo.css        # Demo styles
│       ├── .env                         # API configuration
│       └── CRUD_GUIDE.md               # Complete documentation
```

## 📁 File Structure & Implementation

### 1. API Client (`src/services/apiClient.ts`)

**Purpose**: Centralized Axios instance with request/response interceptors

**Key Features**:
```typescript
- Base URL from environment variables
- Automatic Bearer token injection
- Request/response logging (dev mode)
- Global error handling
- 401 → Redirect to login
- 403/404/500 → Console error logging
```

**Usage**:
```typescript
import apiClient from './services/apiClient';

// The client is already configured with interceptors
const response = await apiClient.get('/users');
```

### 2. CRUD Service (`src/services/crudService.ts`)

**Purpose**: Generic service class for all CRUD operations

**API Methods**:
```typescript
class CrudService<T> {
  getAll(): Promise<T[]>              // GET all records
  getById(id: number): Promise<T>     // GET single record
  create(item: Partial<T>): Promise<T> // POST new record
  update(id: number, item: Partial<T>): Promise<T> // PUT update
  patch(id: number, item: Partial<T>): Promise<T>  // PATCH partial update
  delete(id: number): Promise<void>   // DELETE record
}
```

**Pre-built Services**:
- `userService`: Manages user data at `/users`
- `postService`: Manages post data at `/posts`

**Creating Custom Services**:
```typescript
interface Product {
  id: number;
  name: string;
  price: number;
}

export const productService = new CrudService<Product>('/products');
```

### 3. Demo Component (`src/components/CrudDemo.tsx`)

**Purpose**: Interactive demonstration of CRUD operations

**Features**:
- Tabbed interface (Users/Posts)
- Complete CRUD UI for each entity
- Form validation
- Loading states
- Error handling
- Real API integration (JSONPlaceholder)

**Usage in App**:
```typescript
import { CrudDemo } from './components/CrudDemo';
import './components/CrudDemo.css';

function DemoPage() {
  return (
    <div>
      <h1>CRUD Operations Demo</h1>
      <CrudDemo />
    </div>
  );
}
```

### 4. Environment Configuration (`.env`)

**Purpose**: API base URL configuration

```bash
# Development API
REACT_APP_API_BASE_URL=https://jsonplaceholder.typicode.com

# Production API (update when deploying)
# REACT_APP_API_BASE_URL=https://your-api.com/api
```

## 🎨 Integration Points

### 1. Home Page

CRUD is listed in the features section:

```typescript
<ul>
  {/* ... other features ... */}
  <li>✅ CRUD Operations with Axios</li>
</ul>
```

### 2. Demo Page

CRUD demo section with usage guide:

```typescript
<section className="demo-section">
  <h2>🔧 CRUD Operations Demo</h2>
  <div className="demo-examples">
    <p>Complete Create, Read, Update, Delete operations with API client:</p>
    <ul>
      <li>Axios HTTP client with interceptors</li>
      <li>Request interceptor (auth tokens, logging)</li>
      <li>Response interceptor (error handling)</li>
      <li>Generic CrudService<T> class</li>
      <li>Pre-built demo with Users and Posts</li>
    </ul>
  </div>
</section>
```

### 3. Features Page

Complete setup guide and usage examples:

```typescript
<div className="usage-example">
  <h3>🔧 CRUD Operations with Axios</h3>
  <div className="setup-step">
    <strong>API Client:</strong> Pre-configured Axios instance
  </div>
  <code>
    import { userService } from './services/crudService';
    const users = await userService.getAll();
  </code>
  <p>📚 See CRUD_GUIDE.md for complete documentation</p>
</div>
```

### 4. CLI Console Output

During generation, shows CRUD status:

```bash
✅ React application created successfully!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🏗️  Application: my-app
📦 Workspace: my-company
🎨 Framework: Material
🔐 Authentication: MSAL
📝 Form Builder: Formik
🔧 CRUD Operations: Yes (Axios + Interceptors)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## 🔧 Customization Guide

### 1. Update API Base URL

Edit `.env`:
```bash
REACT_APP_API_BASE_URL=https://your-api.com/api
```

### 2. Add Authentication Token

Update `src/services/apiClient.ts`:
```typescript
request.headers.Authorization = `Bearer ${yourTokenHere}`;
```

### 3. Custom Error Handling

Modify response interceptor in `apiClient.ts`:
```typescript
if (error.response?.status === 401) {
  // Custom login redirect logic
  window.location.href = '/your-login-page';
}
```

### 4. Create New Service

```typescript
// src/services/productService.ts
import { CrudService } from './crudService';

interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
}

export const productService = new CrudService<Product>('/products');
```

### 5. Add Custom Methods

```typescript
class ProductService extends CrudService<Product> {
  constructor() {
    super('/products');
  }

  async getByCategory(category: string): Promise<Product[]> {
    const response = await apiClient.get<Product[]>(
      `${this.baseUrl}?category=${category}`
    );
    return response.data;
  }
}

export const productService = new ProductService();
```

## 📊 API Integration Examples

### Using JSONPlaceholder (Default)

Pre-configured for demo purposes:

```typescript
// Users: https://jsonplaceholder.typicode.com/users
// Posts: https://jsonplaceholder.typicode.com/posts

const users = await userService.getAll();
const user = await userService.getById(1);
await userService.create({ name: 'John Doe', email: 'john@example.com' });
```

### Switching to Real API

1. Update `.env`:
```bash
REACT_APP_API_BASE_URL=https://api.example.com
```

2. Update interfaces in `crudService.ts` to match your API:
```typescript
export interface User {
  id: number;
  firstName: string;  // Match your API
  lastName: string;   // Match your API
  email: string;
  role: string;       // Add new fields
}
```

3. Update demo component or create your own components

## 🎯 Best Practices

### 1. Error Handling

```typescript
try {
  const users = await userService.getAll();
  setUsers(users);
} catch (error) {
  console.error('Failed to load users:', error);
  // Show user-friendly error message
  setError('Unable to load users. Please try again.');
}
```

### 2. Loading States

```typescript
const [loading, setLoading] = useState(false);

const loadData = async () => {
  setLoading(true);
  try {
    const data = await userService.getAll();
    setData(data);
  } catch (error) {
    handleError(error);
  } finally {
    setLoading(false);
  }
};
```

### 3. Type Safety

```typescript
// Define interfaces for type safety
interface CreateUserDto {
  name: string;
  email: string;
}

const newUser: CreateUserDto = {
  name: 'John',
  email: 'john@example.com'
};

await userService.create(newUser);
```

### 4. Interceptor Configuration

**Request Interceptor** (in `apiClient.ts`):
```typescript
// Add custom headers
request.headers['X-Custom-Header'] = 'value';

// Add timestamp for logging
request.metadata = { startTime: new Date() };
```

**Response Interceptor**:
```typescript
// Log response time
const endTime = new Date();
const startTime = response.config.metadata?.startTime;
console.log(`Request took: ${endTime - startTime}ms`);
```

## 🧪 Testing

### Unit Testing Services

```typescript
import { userService } from './services/crudService';
import apiClient from './services/apiClient';

jest.mock('./services/apiClient');

describe('UserService', () => {
  it('should fetch all users', async () => {
    const mockUsers = [{ id: 1, name: 'John' }];
    (apiClient.get as jest.Mock).mockResolvedValue({ data: mockUsers });
    
    const users = await userService.getAll();
    expect(users).toEqual(mockUsers);
  });
});
```

### Integration Testing

```typescript
import { render, screen, waitFor } from '@testing-library/react';
import { CrudDemo } from './components/CrudDemo';

test('loads and displays users', async () => {
  render(<CrudDemo />);
  
  await waitFor(() => {
    expect(screen.getByText(/John Doe/i)).toBeInTheDocument();
  });
});
```

## 📚 Additional Resources

### Generated Documentation

After generation, check `CRUD_GUIDE.md` in your project root for:
- Quick start guide
- API customization
- Error handling patterns
- State management integration
- Testing strategies
- Production deployment tips

### External Resources

- [Axios Documentation](https://axios-http.com/)
- [JSONPlaceholder](https://jsonplaceholder.typicode.com/)
- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)

## 🔄 Migration from Other HTTP Clients

### From Fetch API

**Before**:
```typescript
const response = await fetch('/api/users');
const users = await response.json();
```

**After**:
```typescript
const users = await userService.getAll();
```

### From Axios (without service layer)

**Before**:
```typescript
const response = await axios.get('/api/users');
const users = response.data;
```

**After**:
```typescript
const users = await userService.getAll();
```

## 🚀 Production Deployment

### 1. Environment Configuration

Create environment-specific `.env` files:

```bash
# .env.development
REACT_APP_API_BASE_URL=http://localhost:3000/api

# .env.staging
REACT_APP_API_BASE_URL=https://staging-api.example.com

# .env.production
REACT_APP_API_BASE_URL=https://api.example.com
```

### 2. Security Considerations

- Store sensitive tokens in secure storage (not localStorage)
- Use HTTPS for all API calls
- Implement proper CORS policies
- Add request rate limiting
- Validate all user inputs

### 3. Performance Optimization

- Implement request caching
- Add request debouncing for search/filter operations
- Use React Query or SWR for server state management
- Implement pagination for large datasets

## 📝 Schema Configuration

### CLI Schema (`react-schematics/src/application/schema.json`)

```json
{
  "crud": {
    "type": "boolean",
    "default": false,
    "description": "Add CRUD operations with Axios and interceptors",
    "x-prompt": "Add CRUD operations? (Axios + API Client + Interceptors)"
  }
}
```

## 🎉 Summary

The CRUD integration provides:

✅ **Complete HTTP Client Setup**: Axios with interceptors  
✅ **Type-Safe Services**: Generic `CrudService<T>` class  
✅ **Interactive Demo**: Users and Posts management  
✅ **Error Handling**: Global error interceptor  
✅ **Authentication Ready**: Token injection support  
✅ **Documentation**: Complete guide (CRUD_GUIDE.md)  
✅ **Customizable**: Easy to adapt to any API  
✅ **Production Ready**: Environment configuration

---

**Generated**: 2024
**Version**: 2.1.15
**Package**: @ptg-ui/cli
