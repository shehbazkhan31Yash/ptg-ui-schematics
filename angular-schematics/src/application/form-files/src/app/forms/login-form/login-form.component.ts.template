import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-login-form',
  templateUrl: './login-form.component.html',
  styleUrls: ['./login-form.component.<%= style %>']
})
export class LoginFormComponent implements OnInit {
  loginForm!: FormGroup;
  submitted = false;
  isSubmitting = false;
  showPassword = false;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [false]
    });
  }

  get f() {
    return this.loginForm.controls;
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit(): void {
    this.submitted = true;

    if (this.loginForm.invalid) {
      return;
    }

    this.isSubmitting = true;

    // Simulate API call
    setTimeout(() => {
      console.log('Login Data:', this.loginForm.value);
      alert('Login successful!');
      this.resetForm();
    }, 1500);
  }

  resetForm(): void {
    this.submitted = false;
    this.isSubmitting = false;
    this.loginForm.reset({ rememberMe: false });
  }
}
