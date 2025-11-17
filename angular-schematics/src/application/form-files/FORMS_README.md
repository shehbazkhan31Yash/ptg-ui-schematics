# Angular Reactive Forms - Usage Guide

This application includes pre-built form components using Angular Reactive Forms with validation.

## 📦 Available Components

### 1. ContactForm
A complete contact form with validation:
- Name (required, min 2 characters)
- Email (required, valid email format)
- Subject (required, min 5 characters)
- Message (required, min 10 characters)

### 2. LoginForm
A login form with authentication fields:
- Email (required, valid email format)
- Password (required, min 6 characters)
- Remember Me (checkbox)
- Show/Hide password toggle

## 🚀 Quick Start

### Import FormsModule

The forms are already set up in your application. To use them in any component:

```typescript
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
  imports: [
    ReactiveFormsModule
  ]
})
export class YourModule { }
```

### Use in Templates

```html
<!-- Contact Form -->
<app-contact-form></app-contact-form>

<!-- Login Form -->
<app-login-form></app-login-form>
```

## 📚 Form Structure

Each form component includes:
- **Reactive Form Setup**: Using FormBuilder and FormGroup
- **Validation**: Built-in Angular validators
- **Error Messages**: Dynamic error display
- **Submit Handling**: Loading states and success feedback
- **Styling**: Modern gradient design matching your app theme

## 🎨 Styling

Forms use the stylesheet format you selected during setup (CSS/SCSS/LESS). The styles feature:
- Modern purple gradient theme (#667eea to #764ba2)
- Responsive design
- Accessible form controls
- Focus states and transitions
- Error state styling

## 🔧 Customization

### Modify Validation

Edit the component TypeScript files:

```typescript
// contact-form.component.ts
ngOnInit(): void {
  this.contactForm = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    // Add or modify validators here
  });
}
```

### Custom Validators

Create custom validators in a separate file:

```typescript
// custom-validators.ts
import { AbstractControl, ValidationErrors } from '@angular/forms';

export function phoneValidator(control: AbstractControl): ValidationErrors | null {
  const phoneRegex = /^\d{10}$/;
  return phoneRegex.test(control.value) ? null : { invalidPhone: true };
}
```

### Handle Form Submission

```typescript
onSubmit(): void {
  if (this.contactForm.invalid) {
    return;
  }

  // Your API call here
  this.yourService.submitForm(this.contactForm.value).subscribe(
    response => {
      console.log('Success:', response);
      this.resetForm();
    },
    error => {
      console.error('Error:', error);
    }
  );
}
```

## 🔐 Authentication Integration

The LoginForm is ready to integrate with your authentication service:

```typescript
// login-form.component.ts
import { AuthService } from '@core/services/auth.service';

constructor(
  private fb: FormBuilder,
  private authService: AuthService
) {}

onSubmit(): void {
  if (this.loginForm.invalid) return;

  this.authService.login(this.loginForm.value).subscribe(
    user => {
      // Navigate to dashboard
    },
    error => {
      // Show error message
    }
  );
}
```

## 📱 Responsive Design

Forms are fully responsive:
- Desktop: Centered with max-width
- Tablet: Adjusted padding
- Mobile: Full-width with optimized spacing

## ♿ Accessibility

Forms include:
- Proper ARIA labels
- Keyboard navigation support
- Focus indicators
- Screen reader friendly error messages
- Semantic HTML structure

## 🧪 Testing

Forms can be tested using Angular TestBed:

```typescript
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
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should validate email', () => {
    const emailControl = component.contactForm.get('email');
    emailControl?.setValue('invalid-email');
    expect(emailControl?.hasError('email')).toBeTruthy();
  });
});
```

## 📖 Learn More

- [Angular Reactive Forms Documentation](https://angular.io/guide/reactive-forms)
- [Form Validation Guide](https://angular.io/guide/form-validation)
- [Angular Forms Best Practices](https://angular.io/guide/form-validation#reactive-form-validation)

## 💡 Tips

1. **Always validate on the backend**: Client-side validation is for UX, not security
2. **Use custom validators**: Create reusable validators for common patterns
3. **Handle loading states**: Show feedback during form submission
4. **Reset forms properly**: Clear form data and validation state after submission
5. **Provide clear error messages**: Help users understand what went wrong

## 🆘 Common Issues

### Form not submitting
- Check if `formGroup` is properly bound in template
- Verify all required fields have values
- Check browser console for validation errors

### Validation not working
- Ensure `ReactiveFormsModule` is imported
- Check validator syntax in TypeScript
- Verify error message conditions in template

### Styling issues
- Check if component stylesheet is properly referenced
- Verify global styles are imported in `angular.json`
- Check for CSS specificity conflicts

---

Happy coding! 🚀
