import { Component, OnInit } from '@angular/core';
import { AuthService } from './services/auth.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { BackgroundComponent } from './components/background/background.component';
import { NavbarComponent } from './components/navbar/navbar.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule, BackgroundComponent, NavbarComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  isDarkMode = false;
  currentUser: any = null;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    // Check for saved theme
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      this.isDarkMode = savedTheme === 'dark';
      this.updateDarkMode(this.isDarkMode);
    }

    // Initialize current user
    this.currentUser = this.authService.currentUserValue;

    // Subscribe to user changes
    this.authService.currentUser$.subscribe((user) => {
      this.currentUser = user;
    });
  }

  onThemeToggled(isDark: boolean) {
    this.isDarkMode = isDark;
    this.updateDarkMode(isDark);
  }

  private updateDarkMode(isDark: boolean) {
    document.body.classList.toggle('dark-mode', isDark);
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  }
}
