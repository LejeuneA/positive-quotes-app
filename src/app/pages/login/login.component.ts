import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import {
  MatSnackBar,
  MatSnackBarModule,
} from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../services/auth.service';

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
    email: new FormControl('', [
      Validators.required,
      Validators.email,
    ]),
    password: new FormControl('', [
      Validators.required,
      Validators.minLength(8),
    ]),
  });

  isOwnerLoading = false;
  isDemoLoading = false;

  constructor(
    private readonly authService: AuthService,
    private readonly snackBar: MatSnackBar
  ) {}

  continueAsDemo(): void {
    if (this.isDemoLoading || this.isOwnerLoading) {
      return;
    }

    this.isDemoLoading = true;

    this.authService.loginAsDemo().subscribe({
      next: () => {
        this.isDemoLoading = false;
        this.showSnackbar('Welcome to the demo!', 'success');
      },
      error: (error: Error) => {
        this.isDemoLoading = false;
        this.showSnackbar(
          error.message || 'Demo access is temporarily unavailable.',
          'error'
        );
      },
    });
  }

  onLogin(): void {
    if (
      this.loginForm.invalid ||
      this.isOwnerLoading ||
      this.isDemoLoading
    ) {
      return;
    }

    this.isOwnerLoading = true;

    const { email, password } = this.loginForm.value;

    this.authService.login(email!, password!).subscribe({
      next: () => {
        this.isOwnerLoading = false;
        this.showSnackbar('Login successful!', 'success');
        this.loginForm.reset();
      },
      error: (error: Error) => {
        this.isOwnerLoading = false;
        this.showSnackbar(error.message || 'Login failed.', 'error');
        this.loginForm.get('password')?.reset();
      },
    });
  }

  private showSnackbar(
    message: string,
    type: 'success' | 'error'
  ): void {
    this.snackBar.open(message, 'Close', {
      duration: 5000,
      panelClass: [`snackbar-${type}`],
      verticalPosition: 'top',
    });
  }

  get email() {
    return this.loginForm.get('email');
  }

  get password() {
    return this.loginForm.get('password');
  }
}
