import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { UpdateUser } from '../../models/user.interface';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatProgressSpinnerModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
  ],
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
})
export class SettingsComponent implements OnInit {
  settingsForm: FormGroup;
  isSubmitting = false;
  currentUser: any;
  showPasswordFields = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.settingsForm = this.fb.group(
      {
        username: ['', [Validators.required, Validators.minLength(3)]],
        email: ['', [Validators.required, Validators.email]],
        currentPassword: [''],
        newPassword: ['', [Validators.minLength(8)]],
        confirmPassword: [''],
      },
      { validator: this.passwordMatchValidator }
    );
  }

  ngOnInit(): void {
    this.currentUser = this.authService.currentUserValue;
    if (this.currentUser) {
      this.settingsForm.patchValue({
        username: this.currentUser.username,
        email: this.currentUser.email,
      });
    }
  }

  passwordMatchValidator(form: FormGroup) {
    const newPassword = form.get('newPassword')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;

    if (newPassword && confirmPassword && newPassword !== confirmPassword) {
      form.get('confirmPassword')?.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    return null;
  }

  togglePasswordFields() {
    this.showPasswordFields = !this.showPasswordFields;
    if (!this.showPasswordFields) {
      this.settingsForm.patchValue({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    }
  }

  onSubmit() {
    if (this.settingsForm.invalid) {
      return;
    }

    this.isSubmitting = true;

    const formData = this.settingsForm.value;
    const updateData: UpdateUser = {
      username: formData.username,
      email: formData.email,
    };

    // Only include password fields if they're being changed
    if (formData.newPassword) {
      updateData.currentPassword = formData.currentPassword;
      updateData.newPassword = formData.newPassword;
    }

    this.authService.updateUser(updateData).subscribe({
      next: () => {
        this.snackBar.open('Settings updated successfully!', 'Close', {
          duration: 3000,
        });
        this.isSubmitting = false;
        this.showPasswordFields = false;
      },
      error: (error) => {
        this.snackBar.open(
          error.message || 'Failed to update settings',
          'Close',
          {
            duration: 3000,
          }
        );
        this.isSubmitting = false;
      },
    });
  }

  onCancel() {
    this.router.navigate(['/home']);
  }
}
