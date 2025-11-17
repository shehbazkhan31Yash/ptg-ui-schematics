# Angular Reactive Forms - Complete Implementation Guide

## 📋 Overview

This guide covers the Angular Reactive Forms implementation that has been added to your PTG UI Schematics. The implementation provides ready-to-use form components with validation, modern styling, and best practices.

## 🎯 What's Included

### Form Components

1. **ContactForm Component**
   - Full name validation (min 2 characters)
   - Email validation (valid email format)
   - Subject field (min 5 characters)
   - Message textarea (min 10 characters)
   - Submit handling with loading states

2. **LoginForm Component**
   - Email validation (valid email format)
   - Password validation (min 6 characters)
   - Remember me checkbox
   - Show/Hide password toggle
   - Authentication-ready structure

### Features

- ✅ **Angular Reactive Forms**: Using FormBuilder and FormGroup
- ✅ **Built-in Validation**: Required, email, minLength validators
- ✅ **Error Messages**: Dynamic, user-friendly error display
- ✅ **Loading States**: Submit button disabled during processing
- ✅ **Modern Styling**: Purple gradient theme matching your app
- ✅ **Responsive Design**: Mobile-first approach
- ✅ **Accessibility**: ARIA labels, keyboard navigation
- ✅ **TypeScript**: Full type safety

## 🚀 Getting Started

### Generate a New Angular App with Forms

```bash
npm run generate:angular

# When prompted:
? What name would you like to use for the application? my-app
? Which stylesheet format would you like to use? SCSS
? Which form builder would you like to use? Reactive Forms
```

### Project Structure

After generation, you'll have:

```
my-app/
└── src/
    └── app/
        ├── forms/
        │   ├── contact-form/
        │   │   ├── contact-form.component.ts
        │   │   ├── contact-form.component.html
        │   │   └── contact-form.component.scss (or css/less)
        │   ├── login-form/
        │   │   ├── login-form.component.ts
        │   │   ├── login-form.component.html
        │   │   └── login-form.component.scss (or css/less)
        │   ├── styles/
        │   │   └── forms.scss (or css/less)
        │   ├── forms-feature.module.ts
        │   └── FORMS_README.md
        └── app.module.ts (with FormsFeatureModule imported)
```

## 📚 Usage Examples

### Basic Usage in Templates

```html
<!-- In any component template -->
<app-contact-form></app-contact-form>
<app-login-form></app-login-form>
```

### Using in Your Components

```typescript
// your-component.component.ts
import { Component } from '@angular/core';

@Component({
  selector: 'app-your-component',
  template: `
    <div class="container">
      <app-contact-form></app-contact-form>
    </div>
  `
})
export class YourComponent {}
```

### Routing Integration

```typescript
// app-routing.module.ts
import { ContactFormComponent } from './forms/contact-form/contact-form.component';
import { LoginFormComponent } from './forms/login-form/login-form.component';

const routes: Routes = [
  { path: 'contact', component: ContactFormComponent },
  { path: 'login', component: LoginFormComponent },
];
```

## 🔧 Customization

### Modify Validation Rules

Edit the component TypeScript file:

```typescript
// contact-form.component.ts
ngOnInit(): void {
  this.contactForm = this.fb.group({
    name: ['', [
      Validators.required, 
      Validators.minLength(2),
      Validators.maxLength(50) // Add max length
    ]],
    email: ['', [
      Validators.required, 
      Validators.email,
      Validators.pattern(/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/) // Stricter email
    ]],
    // ... other fields
  });
}
```

### Create Custom Validators

```typescript
// validators/custom-validators.ts
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export class CustomValidators {
  static phoneValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const phoneRegex = /^\+?[\d\s-()]+$/;
      return phoneRegex.test(control.value) ? null : { invalidPhone: true };
    };
  }

  static passwordStrength(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (!value) return null;

      const hasUpperCase = /[A-Z]/.test(value);
      const hasLowerCase = /[a-z]/.test(value);
      const hasNumeric = /[0-9]/.test(value);
      const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(value);

      const valid = hasUpperCase && hasLowerCase && hasNumeric && hasSpecialChar;
      return valid ? null : { weakPassword: true };
    };
  }
}
```

### Use Custom Validators

```typescript
import { CustomValidators } from './validators/custom-validators';

ngOnInit(): void {
  this.contactForm = this.fb.group({
    phone: ['', [Validators.required, CustomValidators.phoneValidator()]],
    password: ['', [
      Validators.required, 
      Validators.minLength(8),
      CustomValidators.passwordStrength()
    ]]
  });
}
```

### Customize Styling

#### Option 1: Override Global Styles

```scss
// styles.scss
.form-container {
  background: linear-gradient(135deg, #ff6b6b 0%, #4ecdc4 100%); // Custom gradient
}

.submit-button {
  background: linear-gradient(135deg, #ff6b6b 0%, #4ecdc4 100%);
}
```

#### Option 2: Component-Specific Styles

```scss
// contact-form.component.scss
:host {
  .form-wrapper {
    max-width: 40rem; // Wider form
    background: #f8f9fa; // Different background
  }
}
```

### Handle Form Submission

#### With HTTP Service

```typescript
// contact-form.component.ts
import { HttpClient } from '@angular/common/http';

constructor(
  private fb: FormBuilder,
  private http: HttpClient
) {}

onSubmit(): void {
  if (this.contactForm.invalid) return;

  this.isSubmitting = true;

  this.http.post('/api/contact', this.contactForm.value)
    .subscribe({
      next: (response) => {
        console.log('Success:', response);
        alert('Message sent successfully!');
        this.resetForm();
      },
      error: (error) => {
        console.error('Error:', error);
        alert('Failed to send message. Please try again.');
        this.isSubmitting = false;
      }
    });
}
```

#### With Authentication Service

```typescript
// login-form.component.ts
import { AuthService } from '@core/services/auth.service';
import { Router } from '@angular/router';

constructor(
  private fb: FormBuilder,
  private authService: AuthService,
  private router: Router
) {}

onSubmit(): void {
  if (this.loginForm.invalid) return;

  this.isSubmitting = true;
  const { email, password, rememberMe } = this.loginForm.value;

  this.authService.login(email, password, rememberMe)
    .subscribe({
      next: (user) => {
        console.log('Login successful:', user);
        this.router.navigate(['/dashboard']);
      },
      error: (error) => {
        console.error('Login failed:', error);
        alert('Invalid credentials. Please try again.');
        this.isSubmitting = false;
      }
    });
}
```

## 🔐 Authentication Integration

### Setup Authentication Service

```typescript
// auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface User {
  id: string;
  email: string;
  name: string;
  token: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser: Observable<User | null>;

  constructor(private http: HttpClient) {
    const storedUser = localStorage.getItem('currentUser');
    this.currentUserSubject = new BehaviorSubject<User | null>(
      storedUser ? JSON.parse(storedUser) : null
    );
    this.currentUser = this.currentUserSubject.asObservable();
  }

  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  login(email: string, password: string, rememberMe: boolean): Observable<User> {
    return this.http.post<User>('/api/auth/login', { email, password })
      .pipe(
        map(user => {
          if (rememberMe) {
            localStorage.setItem('currentUser', JSON.stringify(user));
          }
          this.currentUserSubject.next(user);
          return user;
        })
      );
  }

  logout(): void {
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
  }
}
```

### Use in Login Form

```typescript
// login-form.component.ts
import { AuthService } from '@core/services/auth.service';

constructor(
  private fb: FormBuilder,
  private authService: AuthService,
  private router: Router
) {}

onSubmit(): void {
  if (this.loginForm.invalid) return;

  this.isSubmitting = true;
  const { email, password, rememberMe } = this.loginForm.value;

  this.authService.login(email, password, rememberMe)
    .subscribe({
      next: () => {
        this.router.navigate(['/dashboard']);
      },
      error: (error) => {
        this.errorMessage = 'Invalid email or password';
        this.isSubmitting = false;
      }
    });
}
```

## 🧪 Testing

### Unit Testing Forms

```typescript
// contact-form.component.spec.ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { ContactFormComponent } from './contact-form.component';

describe('ContactFormComponent', () => {
  let component: ContactFormComponent;
  let fixture: ComponentFixture<ContactFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ContactFormComponent ],
      imports: [ ReactiveFormsModule ]
    }).compileComponents();

    fixture = TestBed.createComponent(ContactFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with empty values', () => {
    expect(component.contactForm.value).toEqual({
      name: '',
      email: '',
      subject: '',
      message: ''
    });
  });

  it('should validate required fields', () => {
    const form = component.contactForm;
    expect(form.valid).toBeFalsy();

    form.patchValue({
      name: 'John Doe',
      email: 'john@example.com',
      subject: 'Test Subject',
      message: 'Test message with enough characters'
    });

    expect(form.valid).toBeTruthy();
  });

  it('should validate email format', () => {
    const emailControl = component.contactForm.get('email');
    
    emailControl?.setValue('invalid-email');
    expect(emailControl?.hasError('email')).toBeTruthy();

    emailControl?.setValue('valid@email.com');
    expect(emailControl?.hasError('email')).toBeFalsy();
  });

  it('should validate minimum length', () => {
    const nameControl = component.contactForm.get('name');
    
    nameControl?.setValue('a');
    expect(nameControl?.hasError('minlength')).toBeTruthy();

    nameControl?.setValue('John');
    expect(nameControl?.hasError('minlength')).toBeFalsy();
  });

  it('should call onSubmit when form is submitted', () => {
    spyOn(component, 'onSubmit');
    const form = fixture.nativeElement.querySelector('form');
    
    form.dispatchEvent(new Event('submit'));
    
    expect(component.onSubmit).toHaveBeenCalled();
  });
});
```

### Integration Testing

```typescript
// login-integration.spec.ts
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AuthService } from '@core/services/auth.service';

describe('Login Integration', () => {
  let authService: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuthService]
    });

    authService = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should authenticate user successfully', () => {
    const mockUser = {
      id: '1',
      email: 'test@example.com',
      name: 'Test User',
      token: 'mock-token'
    };

    authService.login('test@example.com', 'password', false)
      .subscribe(user => {
        expect(user).toEqual(mockUser);
      });

    const req = httpMock.expectOne('/api/auth/login');
    expect(req.request.method).toBe('POST');
    req.flush(mockUser);
  });
});
```

## 📱 Responsive Design

Forms automatically adapt to different screen sizes:

### Desktop (> 640px)
- Centered layout
- Max-width: 28rem
- Full padding: 2rem

### Mobile (≤ 640px)
- Full-width with margins
- Reduced padding: 1.5rem
- Smaller font sizes

### Custom Breakpoints

```scss
// Add to component styles
@media (max-width: 768px) {
  .form-wrapper {
    padding: 1rem;
  }
}

@media (max-width: 480px) {
  .form-title {
    font-size: 1.25rem;
  }
}
```

## ♿ Accessibility

All forms include:

- ✅ Semantic HTML structure
- ✅ Proper label associations
- ✅ ARIA attributes
- ✅ Keyboard navigation
- ✅ Focus indicators
- ✅ Screen reader support
- ✅ Error announcements

### Enhance Accessibility

```html
<!-- Add ARIA live regions for dynamic updates -->
<div class="form-group">
  <label for="email">Email *</label>
  <input
    id="email"
    type="email"
    formControlName="email"
    [attr.aria-invalid]="submitted && f['email'].errors"
    [attr.aria-describedby]="submitted && f['email'].errors ? 'email-error' : null"
  />
  <div 
    *ngIf="submitted && f['email'].errors" 
    id="email-error"
    role="alert"
    aria-live="polite"
    class="error-message"
  >
    <span *ngIf="f['email'].errors['required']">Email is required</span>
  </div>
</div>
```

## 🔄 Dynamic Forms

### Create Dynamic Form Fields

```typescript
// dynamic-form.component.ts
import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

interface FieldConfig {
  type: 'text' | 'email' | 'password' | 'textarea';
  name: string;
  label: string;
  validators: any[];
}

@Component({
  selector: 'app-dynamic-form',
  templateUrl: './dynamic-form.component.html'
})
export class DynamicFormComponent implements OnInit {
  @Input() fields: FieldConfig[] = [];
  dynamicForm!: FormGroup;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    const group: any = {};
    
    this.fields.forEach(field => {
      group[field.name] = ['', field.validators];
    });

    this.dynamicForm = this.fb.group(group);
  }

  onSubmit(): void {
    if (this.dynamicForm.valid) {
      console.log(this.dynamicForm.value);
    }
  }
}
```

## 🎨 Theming

### Custom Theme

Create a theme file:

```scss
// themes/_purple-theme.scss
$primary-color: #667eea;
$secondary-color: #764ba2;
$error-color: #ef4444;
$success-color: #10b981;

$primary-gradient: linear-gradient(135deg, $primary-color 0%, $secondary-color 100%);

// Export theme
:root {
  --primary-color: #{$primary-color};
  --secondary-color: #{$secondary-color};
  --error-color: #{$error-color};
  --success-color: #{$success-color};
}
```

### Use Theme Variables

```scss
// forms.scss
@import 'themes/purple-theme';

.form-container {
  background: $primary-gradient;
}

.submit-button {
  background: var(--primary-color);
}
```

## 🚀 Best Practices

1. **Always Validate on Backend**: Client-side validation is for UX only
2. **Use Type Safety**: Leverage TypeScript for form values
3. **Handle Loading States**: Disable submit during processing
4. **Provide Clear Feedback**: Show success/error messages
5. **Reset Forms After Submit**: Clear data and validation state
6. **Use Reactive Forms**: For complex forms with dynamic validation
7. **Implement Error Handling**: Catch and display API errors
8. **Test Thoroughly**: Unit and integration tests for forms
9. **Consider UX**: Inline validation, helpful error messages
10. **Accessibility First**: ARIA labels, keyboard navigation

## 📚 Additional Resources

- [Angular Reactive Forms Guide](https://angular.io/guide/reactive-forms)
- [Form Validation](https://angular.io/guide/form-validation)
- [Dynamic Forms](https://angular.io/guide/dynamic-form)
- [Custom Validators](https://angular.io/guide/form-validation#defining-custom-validators)
- [Testing Forms](https://angular.io/guide/testing-components-scenarios#component-with-async-service)

## 🆘 Troubleshooting

### Form not submitting
**Issue**: Form submission doesn't work
**Solution**: 
- Check if `[formGroup]` is bound in template
- Verify `(ngSubmit)` event handler
- Check browser console for errors

### Validation not showing
**Issue**: Error messages not displaying
**Solution**:
- Ensure `submitted` flag is set on submit
- Check `*ngIf` conditions in template
- Verify validator syntax in TypeScript

### Styling not applied
**Issue**: Form styles not showing
**Solution**:
- Check if component styles are referenced
- Verify stylesheet import in angular.json
- Check for CSS specificity conflicts

### Module errors
**Issue**: FormsFeatureModule not found
**Solution**:
- Ensure module is properly imported in app.module.ts
- Check file paths in imports
- Run `npm install` if needed

---

## 💡 Pro Tips

- Use `markAllAsTouched()` to show all validation errors at once
- Implement debounce for API validation (async validators)
- Create reusable form components for consistent UX
- Use FormArray for dynamic form fields
- Implement custom error messages component
- Add loading skeletons for better perceived performance

---

**Happy coding with Angular Reactive Forms!** 🎉
