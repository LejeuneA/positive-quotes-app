import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  BehaviorSubject,
  Observable,
  catchError,
  map,
  tap,
  throwError,
} from 'rxjs';
import { Router } from '@angular/router';
import { UpdateUser } from '@app/models/user.interface';
import { MatSnackBar } from '@angular/material/snack-bar';
import { environment } from '../../environments/environment';

interface User {
  id: string;
  username: string;
  email: string;
  password?: string;
}

interface AuthResponse {
  success: boolean;
  user?: User;
  token?: string;
  message?: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  // Updated to use the correct base URL and auth endpoints
  private baseUrl = environment.jsonServerUrl;
  private usersUrl = `${this.baseUrl}/users`;
  private authUrl = `${this.baseUrl}/auth`;
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  private redirectUrl: string | null = null;

  constructor(
    private http: HttpClient,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    console.log('AuthService initialized with base URL:', this.baseUrl);
    console.log('Auth endpoint:', this.authUrl);
    console.log('Users endpoint:', this.usersUrl);
    this.initializeCurrentUser();
  }

  private initializeCurrentUser(): void {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      try {
        const user: User = JSON.parse(storedUser);
        this.currentUserSubject.next(user);
      } catch (error) {
        console.error('Error parsing stored user', error);
        this.clearUserData();
      }
    }
  }

  register(user: Omit<User, 'id'>): Observable<User> {
    const registerUrl = `${this.authUrl}/register`;
    console.log('Attempting registration at:', registerUrl);

    return this.http.post<AuthResponse>(registerUrl, user).pipe(
      map((response: AuthResponse) => {
        console.log('Registration response:', response);

        if (response.success && response.user) {
          return response.user;
        } else {
          throw new Error(response.message || 'Registration failed');
        }
      }),
      tap((user: User) => {
        console.log('Registration successful:', user);
        this.setCurrentUser(user);
        this.router.navigate(['/home']);
        this.snackBar.open('Registration successful! Welcome!', 'Close', {
          duration: 3000,
        });
      }),
      catchError((error) => {
        console.error('Registration error:', error);
        let errorMessage = 'Registration failed. Please try again.';

        if (error.status === 400) {
          errorMessage =
            error.error?.message ||
            'User already exists or invalid data provided.';
        } else if (error.status === 0) {
          errorMessage =
            'Cannot connect to server. Please check your internet connection.';
        } else if (error.error?.message) {
          errorMessage = error.error.message;
        }

        this.snackBar.open(errorMessage, 'Close', {
          duration: 3000,
        });
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  login(email: string, password: string): Observable<User> {
    const loginUrl = `${this.authUrl}/login`;
    console.log('Attempting login at:', loginUrl);

    return this.http.post<AuthResponse>(loginUrl, { email, password }).pipe(
      map((response: AuthResponse) => {
        console.log('Login response:', response);

        if (response.success && response.user) {
          return response.user;
        } else {
          throw new Error(response.message || 'Login failed');
        }
      }),
      tap((user: User) => {
        console.log('Login successful:', user);
        this.setCurrentUser(user);
        this.router.navigate([this.redirectUrl || '/home']);
        this.redirectUrl = null;
        this.snackBar.open(`Welcome back, ${user.username}!`, 'Close', {
          duration: 3000,
        });
      }),
      catchError((error) => {
        console.error('Login error:', error);
        let errorMessage = 'Login failed. Please try again.';

        if (error.status === 401) {
          errorMessage = 'Invalid email or password.';
        } else if (error.status === 0) {
          errorMessage =
            'Cannot connect to server. Please check your internet connection.';
        } else if (error.error?.message) {
          errorMessage = error.error.message;
        }

        this.snackBar.open(errorMessage, 'Close', { duration: 3000 });
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  logout(): void {
    console.log('Logging out user');
    this.clearUserData();
    this.snackBar.open('You have been logged out.', 'Close', {
      duration: 2000,
    });
    this.router.navigate(['/login']);
  }

  setRedirectUrl(url: string): void {
    this.redirectUrl = url;
  }

  updateUser(userData: UpdateUser): Observable<User> {
    const currentUser = this.currentUserValue;
    if (!currentUser) {
      return throwError(() => new Error('No user logged in'));
    }

    if (userData.newPassword && !userData.currentPassword) {
      return throwError(
        () => new Error('Current password is required to change password')
      );
    }

    const updatedUser = {
      ...currentUser,
      username: userData.username || currentUser.username,
      email: userData.email || currentUser.email,
      password: userData.newPassword || currentUser.password,
    };

    return this.http
      .put<User>(`${this.usersUrl}/${currentUser.id}`, updatedUser)
      .pipe(
        tap((user) => {
          console.log('Update successful:', user);
          this.setCurrentUser(user);
          this.snackBar.open('Profile updated successfully!', 'Close', {
            duration: 3000,
          });
        }),
        catchError((error) => {
          console.error('Update error:', error);
          let errorMessage = 'Failed to update profile';
          if (error.status === 400) {
            errorMessage = error.error?.message || errorMessage;
          } else if (error.status === 0) {
            errorMessage =
              'Cannot connect to server. Please check your internet connection.';
          }
          this.snackBar.open(errorMessage, 'Close', { duration: 3000 });
          return throwError(() => new Error(errorMessage));
        })
      );
  }

  // Method to test server connectivity
  testConnection(): Observable<any> {
    const healthUrl = `${this.baseUrl}/health`;
    console.log('Testing connection to:', healthUrl);

    return this.http.get(healthUrl).pipe(
      tap((response) => {
        console.log('Server connection successful:', response);
      }),
      catchError((error) => {
        console.error('Server connection failed:', error);
        this.snackBar.open(
          'Cannot connect to server. Please try again later.',
          'Close',
          {
            duration: 5000,
          }
        );
        return throwError(() => error);
      })
    );
  }

  private setCurrentUser(user: User): void {
    const { password, ...userWithoutPassword } = user;
    localStorage.setItem('currentUser', JSON.stringify(userWithoutPassword));
    this.currentUserSubject.next(userWithoutPassword);
    console.log('User set in localStorage:', userWithoutPassword);
  }

  private clearUserData(): void {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('authToken');
    this.currentUserSubject.next(null);
    console.log('User data cleared');
  }

  get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  isAuthenticated(): boolean {
    return !!this.currentUserValue;
  }

  getAuthToken(): string | null {
    return localStorage.getItem('authToken');
  }
}
