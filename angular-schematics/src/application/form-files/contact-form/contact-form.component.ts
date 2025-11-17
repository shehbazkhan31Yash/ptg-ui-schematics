import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-contact-form',
  templateUrl: './contact-form.component.html',
  styleUrls: ['./contact-form.component.<%= style %>']
})
export class ContactFormComponent implements OnInit {
  contactForm!: FormGroup;
  submitted = false;
  isSubmitting = false;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.contactForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      subject: ['', [Validators.required, Validators.minLength(5)]],
      message: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  get f() {
    return this.contactForm.controls;
  }

  onSubmit(): void {
    this.submitted = true;

    if (this.contactForm.invalid) {
      return;
    }

    this.isSubmitting = true;

    // Simulate API call
    setTimeout(() => {
      console.log('Form Data:', this.contactForm.value);
      alert('Message sent successfully!');
      this.resetForm();
    }, 1500);
  }

  resetForm(): void {
    this.submitted = false;
    this.isSubmitting = false;
    this.contactForm.reset();
  }
}
