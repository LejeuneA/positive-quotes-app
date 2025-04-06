import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  FormGroupDirective,
} from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../services/auth.service';
import { HttpErrorResponse } from '@angular/common/http';

interface SettingsForm {
  username: FormControl<string | null>;
  email: FormControl<string | null>;
  currentPassword: FormControl<string | null>;
  newPassword: FormControl<string | null>;
  confirmPassword: FormControl<string | null>;
}

@Component({
  selector: 'app-settings',
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
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
})
export class SettingsComponent {
  settingsForm: FormGroup<SettingsForm> = new FormGroup({
    username: new FormControl('', [
      Validators.required,
      Validators.minLength(3),
    ]),
    email: new FormControl('', [Validators.required, Validators.email]),
    currentPassword: new FormControl(''),
    newPassword: new FormControl('', [Validators.minLength(6)]),
    confirmPassword: new FormControl(''),
  });

  isLoading = false;

  constructor(
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {}

  onSubmit(formDirective?: FormGroupDirective): void {
    if (this.settingsForm.invalid || this.isLoading) {
      return;
    }

    this.isLoading = true;
    const formValue = this.settingsForm.value;

    // In a real app, call your authService.updateUser() here
    setTimeout(() => {
      this.isLoading = false;
      this.showSnackbar('Settings updated successfully!', 'success');
      formDirective?.resetForm();
    }, 1000);
  }

  private showSnackbar(message: string, type: 'success' | 'error'): void {
    this.snackBar.open(message, 'Close', {
      duration: 5000,
      panelClass: [`snackbar-${type}`],
      verticalPosition: 'top',
    });
  }

  private handleError(error: HttpErrorResponse): void {
    console.error('Settings error:', error);
    let errorMessage = 'Update failed - please try again later';

    if (error.status === 0) {
      errorMessage = 'Network error - please check your connection';
    } else if (error.status >= 400 && error.status < 500) {
      errorMessage = 'Invalid request - please check your input';
    }

    this.showSnackbar(errorMessage, 'error');
  }

  get username() {
    return this.settingsForm.get('username');
  }

  get email() {
    return this.settingsForm.get('email');
  }

  get currentPassword() {
    return this.settingsForm.get('currentPassword');
  }

  get newPassword() {
    return this.settingsForm.get('newPassword');
  }

  get confirmPassword() {
    return this.settingsForm.get('confirmPassword');
  }
}
