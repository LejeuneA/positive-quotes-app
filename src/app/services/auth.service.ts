import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { environment } from '../../environments/environment';

interface User {
  id: string;
  username: string;
  email: string;
  password?: string;
}

interface UpdateUserData {
  username?: string;
  email?: string;
  currentPassword?: string;
  newPassword?: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = environment.authApiUrl;
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  private redirectUrl: string | null = null;

  // Mock users for production/demo purposes
  private mockUsers: User[] = [
    {
      id: '1',
      username: 'demo',
      email: 'demo@example.com',
      password: 'demo123',
    },
    {
      id: '2',
      username: 'test',
      email: 'test@example.com',
      password: 'test123',
    },
  ];

  constructor(
    private http: HttpClient,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
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
    if (environment.useMockAuth) {
      // Mock registration
      const newUser: User = {
        ...user,
        id: Math.random().toString(36).substring(2, 9),
      };
      this.mockUsers.push(newUser);
      return of(newUser).pipe(
        tap((response: User) => {
          this.setCurrentUser(response);
          this.router.navigate(['/home']);
        })
      );
    } else {
      // Real registration with JSON server
      return this.http.post<User>(`${this.apiUrl}/users`, user).pipe(
        tap((response: User) => {
          this.setCurrentUser(response);
          this.router.navigate(['/home']);
        }),
        catchError((error) => {
          console.error('Registration failed', error);
          return throwError(() => new Error('Registration failed'));
        })
      );
    }
  }

  login(email: string, password: string): Observable<User> {
    if (environment.useMockAuth) {
      // Mock login
      const user = this.mockUsers.find(
        (u) => u.email === email && u.password === password
      );
      if (user) {
        return of(user).pipe(
          tap((u) => {
            this.setCurrentUser(u);
            this.router.navigate([this.redirectUrl || '/home']);
            this.redirectUrl = null;
          })
        );
      } else {
        return throwError(() => new Error('Invalid email or password'));
      }
    } else {
      // Real login with JSON server
      return this.http.get<User[]>(`${this.apiUrl}/users?email=${email}`).pipe(
        map((users) => {
          const user = users.find((u) => u.password === password);
          if (!user) {
            throw new Error('Invalid email or password');
          }
          return user;
        }),
        tap((user) => {
          this.setCurrentUser(user);
          this.router.navigate([this.redirectUrl || '/home']);
          this.redirectUrl = null;
        }),
        catchError((error) => {
          console.error('Login error:', error);
          let errorMessage = 'Login failed. Please try again.';
          if (error.status === 404) {
            errorMessage = 'User not found. Please check your email.';
          } else if (error.status === 401) {
            errorMessage = 'Invalid password. Please try again.';
          }
          return throwError(() => new Error(errorMessage));
        })
      );
    }
  }

  updateUser(userData: UpdateUserData): Observable<User> {
    const currentUser = this.currentUserValue;
    if (!currentUser) {
      return throwError(() => new Error('No user logged in'));
    }

    // Verify current password if changing password
    if (userData.newPassword && !userData.currentPassword) {
      return throwError(
        () => new Error('Current password is required to change password')
      );
    }

    if (environment.useMockAuth) {
      // Mock update
      const updatedUser = {
        ...currentUser,
        username: userData.username || currentUser.username,
        email: userData.email || currentUser.email,
        password: userData.newPassword || currentUser.password,
      };

      // Update in mock users array
      const index = this.mockUsers.findIndex((u) => u.id === currentUser.id);
      if (index !== -1) {
        this.mockUsers[index] = updatedUser;
      }

      return of(updatedUser).pipe(
        tap((user) => {
          this.setCurrentUser(user);
          this.snackBar.open('Profile updated successfully!', 'Close', {
            duration: 3000,
          });
        })
      );
    } else {
      // Real update with JSON server
      const updatedUser = {
        ...currentUser,
        username: userData.username || currentUser.username,
        email: userData.email || currentUser.email,
        password: userData.newPassword || currentUser.password,
      };

      return this.http
        .put<User>(`${this.apiUrl}/users/${currentUser.id}`, updatedUser)
        .pipe(
          tap((user) => {
            this.setCurrentUser(user);
            this.snackBar.open('Profile updated successfully!', 'Close', {
              duration: 3000,
            });
          }),
          catchError((error) => {
            console.error('Update failed', error);
            let errorMessage = 'Failed to update profile';
            if (error.status === 400) {
              errorMessage = error.error?.message || errorMessage;
            }
            return throwError(() => new Error(errorMessage));
          })
        );
    }
  }

  logout(): void {
    this.clearUserData();
    this.router.navigate(['/login']);
  }

  setRedirectUrl(url: string): void {
    this.redirectUrl = url;
  }

  private setCurrentUser(user: User): void {
    const { password, ...userWithoutPassword } = user;
    localStorage.setItem('currentUser', JSON.stringify(userWithoutPassword));
    this.currentUserSubject.next(userWithoutPassword);
  }

  private clearUserData(): void {
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
  }

  get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  isAuthenticated(): boolean {
    return !!this.currentUserValue;
  }
}
