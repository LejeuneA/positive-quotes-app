import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { ThemeService } from './services/theme.service';
import { SearchComponent } from './components/search/search.component';
import { QuoteComponent } from './components/quote/quote.component';
import { BackgroundComponent } from './components/background/background.component';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-root',
  standalone: true, // Mark the component as standalone
  imports: [
    CommonModule,
    RouterModule,
    MatIconModule,
    SearchComponent,
    QuoteComponent,
    BackgroundComponent,
    MatButtonModule,
  ], // Add RouterModule here
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'positive-quotes-app';

  constructor(private themeService: ThemeService) {}

  // Toggle between light and dark mode
  toggleTheme() {
    this.themeService.toggleTheme();
  }

  // Check if dark mode is enabled
  get isDarkMode(): boolean {
    return this.themeService.isDarkMode();
  }
}
