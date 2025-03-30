import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  FormGroupDirective,
} from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../services/auth.service';
import { HttpErrorResponse } from '@angular/common/http';

interface RegisterForm {
  username: FormControl<string | null>;
  email: FormControl<string | null>;
  password: FormControl<string | null>;
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    ReactiveFormsModule,
    MatSnackBarModule,
  ],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent {
  registerForm: FormGroup<RegisterForm> = new FormGroup({
    username: new FormControl('', [
      Validators.required,
      Validators.minLength(3),
    ]),
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [
      Validators.required,
      Validators.minLength(6),
    ]),
  });

  isLoading = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  onRegister(formDirective?: FormGroupDirective): void {
    if (this.registerForm.invalid || this.isLoading) {
      return;
    }

    this.isLoading = true;

    // Create a properly typed registration object
    const registrationData = {
      username: this.registerForm.value.username!,
      email: this.registerForm.value.email!,
      password: this.registerForm.value.password!,
    };

    this.authService.register(registrationData).subscribe({
      next: () => {
        this.isLoading = false;
        this.showSnackbar('Registration successful!');
        this.router.navigate(['/']);
        formDirective?.resetForm();
      },
      error: (error: HttpErrorResponse) => {
        this.isLoading = false;
        this.handleRegistrationError(error);
      },
    });
  }

  private handleRegistrationError(error: HttpErrorResponse): void {
    console.error('Registration error:', error);

    if (error.status === 0) {
      this.showSnackbar('Network error - please check your connection');
    } else if (error.status === 400) {
      this.showSnackbar('Email already exists');
    } else {
      this.showSnackbar('Registration failed - please try again later');
    }
  }

  private showSnackbar(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      panelClass: ['snackbar-success'],
    });
  }

  get username() {
    return this.registerForm.get('username');
  }

  get email() {
    return this.registerForm.get('email');
  }

  get password() {
    return this.registerForm.get('password');
  }
}
