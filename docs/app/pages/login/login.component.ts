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
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../services/auth.service';
import { HttpErrorResponse } from '@angular/common/http';

interface LoginForm {
  email: FormControl<string | null>;
  password: FormControl<string | null>;
}

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    ReactiveFormsModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  loginForm: FormGroup<LoginForm> = new FormGroup({
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

  onLogin(formDirective?: FormGroupDirective): void {
    if (this.loginForm.invalid || this.isLoading) {
      return;
    }

    this.isLoading = true;
    const { email, password } = this.loginForm.value;

    this.authService.login(email!, password!).subscribe({
      next: () => {
        this.isLoading = false;
        this.showSnackbar('Login successful!', 'success');
        formDirective?.resetForm();
      },
      error: (error: HttpErrorResponse) => {
        this.isLoading = false;
        this.handleLoginError(error);
        this.loginForm.get('password')?.reset();
      },
    });
  }

  private showSnackbar(message: string, type: 'success' | 'error'): void {
    this.snackBar.open(message, 'Close', {
      duration: 5000,
      panelClass: [`snackbar-${type}`],
      verticalPosition: 'top',
    });
  }

  private handleLoginError(error: HttpErrorResponse): void {
    console.error('Login error:', error);

    let errorMessage = 'Login failed - please try again later';
    if (error.status === 0) {
      errorMessage = 'Network error - please check your connection';
    } else if (error.status === 401) {
      errorMessage = 'Invalid email or password';
    } else if (error.status >= 400 && error.status < 500) {
      errorMessage = 'Invalid request - please check your input';
    }

    this.showSnackbar(errorMessage, 'error');
  }

  get email() {
    return this.loginForm.get('email');
  }

  get password() {
    return this.loginForm.get('password');
  }
}
