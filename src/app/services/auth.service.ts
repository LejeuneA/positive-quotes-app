// auth.service.ts
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
  private apiUrl = 'http://localhost:3000/users';
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  private redirectUrl: string | null = null;

  constructor(private http: HttpClient, private router: Router) {
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
    return this.http.post<User>(this.apiUrl, user).pipe(
      tap((response: User) => {
        this.setCurrentUser(response);
        this.router.navigate(['/home']); // Redirect after registration
      }),
      catchError((error) => {
        console.error('Registration failed', error);
        return throwError(() => new Error('Registration failed'));
      })
    );
  }

  login(email: string, password: string): Observable<User> {
    return this.http.get<User[]>(`${this.apiUrl}?email=${email}`).pipe(
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
