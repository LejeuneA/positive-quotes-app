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
  id: number;
  username: string;
  email: string;
  password?: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  // Debugging: Log the API URL during service initialization
  private apiUrl = `${environment.jsonServerUrl}/users`;
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  private redirectUrl: string | null = null;

  constructor(
    private http: HttpClient,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    console.log('AuthService initialized with API URL:', this.apiUrl); // Debug
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
    console.log('Attempting registration at:', this.apiUrl); // Debug
    return this.http.post<User>(this.apiUrl, user).pipe(
      tap((response: User) => {
        console.log('Registration successful:', response); // Debug
        this.setCurrentUser(response);
        this.router.navigate(['/home']);
      }),
      catchError((error) => {
        console.error('Registration error:', error); // Debug
        this.snackBar.open('Registration failed. Please try again.', 'Close', {
          duration: 3000,
        });
        return throwError(() => new Error('Registration failed'));
      })
    );
  }

  login(email: string, password: string): Observable<User> {
    console.log('Attempting login at:', `${this.apiUrl}?email=${email}`); // Debug
    return this.http.get<User[]>(`${this.apiUrl}?email=${email}`).pipe(
      map((users) => {
        const user = users.find((u) => u.password === password);
        if (!user) {
          throw new Error('Invalid email or password');
        }
        return user;
      }),
      tap((user) => {
        console.log('Login successful:', user); // Debug
        this.setCurrentUser(user);
        this.router.navigate([this.redirectUrl || '/home']);
        this.redirectUrl = null;
      }),
      catchError((error) => {
        console.error('Login error:', error); // Debug
        let errorMessage = 'Login failed. Please try again.';
        if (error.status === 404) {
          errorMessage = 'User not found. Please check your email.';
        } else if (error.status === 401) {
          errorMessage = 'Invalid password. Please try again.';
        }
        this.snackBar.open(errorMessage, 'Close', { duration: 3000 });
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  logout(): void {
    console.log('Logging out user'); // Debug
    this.clearUserData();
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
      .put<User>(`${this.apiUrl}/${currentUser.id}`, updatedUser)
      .pipe(
        tap((user) => {
          console.log('Update successful:', user); // Debug
          this.setCurrentUser(user);
          this.snackBar.open('Profile updated successfully!', 'Close', {
            duration: 3000,
          });
        }),
        catchError((error) => {
          console.error('Update error:', error); // Debug
          let errorMessage = 'Failed to update profile';
          if (error.status === 400) {
            errorMessage = error.error?.message || errorMessage;
          }
          this.snackBar.open(errorMessage, 'Close', { duration: 3000 });
          return throwError(() => new Error(errorMessage));
        })
      );
  }

  private setCurrentUser(user: User): void {
    const { password, ...userWithoutPassword } = user;
    localStorage.setItem('currentUser', JSON.stringify(userWithoutPassword));
    this.currentUserSubject.next(userWithoutPassword);
    console.log('User set in localStorage:', userWithoutPassword); // Debug
  }

  private clearUserData(): void {
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
    console.log('User data cleared'); // Debug
  }

  get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  isAuthenticated(): boolean {
    return !!this.currentUserValue;
  }
}
