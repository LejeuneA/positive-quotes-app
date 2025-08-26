import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule, RouterModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
})
export class NavbarComponent {
  @Input() isDarkMode = false; /* Receive data from parent */
  @Input() currentUser: any = null;

  /* Sends data back to parent */
  @Output() themeToggled =
    new EventEmitter<boolean>(); /* Send events from child to parent*/

  constructor(
    private authService: AuthService
  ) {} /* Private means we only use it inside this file. Constructor injects the service */

  toggleTheme() {
    this.isDarkMode = !this.isDarkMode;
    this.themeToggled.emit(this.isDarkMode);
  }

  logout() {
    this.authService.logout(); /* Call the logout method from the service */
  }
}
