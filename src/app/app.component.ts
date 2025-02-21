import { Component } from '@angular/core';
import { RouterModule } from '@angular/router'; // Import RouterModule
import { ThemeService } from './services/theme.service';
import { SearchComponent } from './components/search/search.component';
import { QuoteComponent } from './components/quote/quote.component';
import { BackgroundComponent } from './components/background/background.component';

@Component({
  selector: 'app-root',
  standalone: true, // Mark the component as standalone
  imports: [RouterModule, SearchComponent, QuoteComponent, BackgroundComponent], // Add RouterModule here
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
