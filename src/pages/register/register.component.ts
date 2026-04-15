import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthStore } from '../../app/core/services/authStore';
import { LoadingSpinner } from '../../app/shared/loading-spinner/loading-spinner';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, LoadingSpinner],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private authStore = inject(AuthStore);

  showPassword = false;

  form = this.fb.group({
    first_name: ['', [Validators.required]],
    last_name: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  authState$ = this.authStore.state$;

  get first_name() {
    return this.form.get('first_name')!;
  }
  get last_name() {
    return this.form.get('last_name')!;
  }
  get email() {
    return this.form.get('email')!;
  }
  get password() {
    return this.form.get('password')!;
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.authStore.register({
      first_name: this.first_name.value!,
      last_name: this.last_name.value!,
      email: this.email.value!,
      password: this.password.value!,
    });
  }
}
