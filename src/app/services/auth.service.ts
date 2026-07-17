import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import {
  BehaviorSubject,
  Observable,
  catchError,
  map,
  tap,
  throwError,
} from 'rxjs';
import { Router } from '@angular/router';
import { UpdateUser, User } from '@app/models/user.interface';
import { MatSnackBar } from '@angular/material/snack-bar';
import { environment } from '../../environments/environment';

interface AuthResponse {
  user: User;
  token: string;
}

interface UserResponse {
  user: User;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly apiUrl = environment.jsonServerUrl;
  private readonly currentUserSubject = new BehaviorSubject<User | null>(null);
  public readonly currentUser$ = this.currentUserSubject.asObservable();
  private redirectUrl: string | null = null;

  constructor(
    private readonly http: HttpClient,
    private readonly router: Router,
    private readonly snackBar: MatSnackBar
  ) {
    this.initializeCurrentUser();
  }

  private initializeCurrentUser(): void {
    const storedUser = localStorage.getItem('currentUser');
    const token = localStorage.getItem('authToken');

    if (!storedUser || !token) {
      this.clearUserData();
      return;
    }

    try {
      this.currentUserSubject.next(JSON.parse(storedUser) as User);
    } catch {
      this.clearUserData();
    }
  }

  register(user: Omit<User, 'id'>): Observable<User> {
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/auth/register`, user)
      .pipe(
        tap((response) => {
          this.setCurrentUser(response.user, response.token);
          this.router.navigate(['/home']);
        }),
        map((response) => response.user),
        catchError((error: HttpErrorResponse) =>
          throwError(() => new Error(this.getErrorMessage(error, 'Registration failed.')))
        )
      );
  }

  login(email: string, password: string): Observable<User> {
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/auth/login`, { email, password })
      .pipe(
        tap((response) => {
          this.setCurrentUser(response.user, response.token);
          this.router.navigate([this.redirectUrl || '/home']);
          this.redirectUrl = null;
        }),
        map((response) => response.user),
        catchError((error: HttpErrorResponse) =>
          throwError(() => new Error(this.getErrorMessage(error, 'Login failed.')))
        )
      );
  }

  logout(): void {
    this.clearUserData();
    this.router.navigate(['/login']);
  }

  setRedirectUrl(url: string): void {
    this.redirectUrl = url;
  }

  updateUser(userData: UpdateUser): Observable<User> {
    const currentUser = this.currentUserValue;
    if (!currentUser) {
      return throwError(() => new Error('No user is logged in.'));
    }

    if (userData.newPassword && !userData.currentPassword) {
      return throwError(
        () => new Error('Current password is required to change the password.')
      );
    }

    return this.http
      .put<UserResponse>(`${this.apiUrl}/users/${currentUser.id}`, userData)
      .pipe(
        map((response) => response.user),
        tap((user) => {
          this.setCurrentUser(user);
          this.snackBar.open('Profile updated successfully!', 'Close', {
            duration: 3000,
          });
        }),
        catchError((error: HttpErrorResponse) => {
          const message = this.getErrorMessage(
            error,
            'Failed to update the profile.'
          );
          this.snackBar.open(message, 'Close', { duration: 3000 });
          return throwError(() => new Error(message));
        })
      );
  }

  private setCurrentUser(user: User, token?: string): void {
    const safeUser: User = {
      ...user,
      password: undefined,
    };

    localStorage.setItem('currentUser', JSON.stringify(safeUser));
    if (token) {
      localStorage.setItem('authToken', token);
    }
    this.currentUserSubject.next(safeUser);
  }

  private clearUserData(): void {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('authToken');
    this.currentUserSubject.next(null);
  }

  private getErrorMessage(
    error: HttpErrorResponse,
    fallbackMessage: string
  ): string {
    if (error.status === 0) {
      return 'Cannot connect to the application server.';
    }

    const serverMessage = error.error?.message;
    return typeof serverMessage === 'string' && serverMessage.trim()
      ? serverMessage
      : fallbackMessage;
  }

  get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  isAuthenticated(): boolean {
    return Boolean(
      this.currentUserValue && localStorage.getItem('authToken')
    );
  }
}
