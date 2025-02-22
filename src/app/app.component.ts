import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { SearchComponent } from './components/search/search.component';
import { QuoteComponent } from './components/quote/quote.component';
import { BackgroundComponent } from './components/background/background.component';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    SearchComponent,
    QuoteComponent,
    BackgroundComponent,
    MatButtonModule,
    RouterModule,
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title(title: any) {
    throw new Error('Method not implemented.');
  }
  isDarkMode = false;

  toggleTheme(): void {
    this.isDarkMode = !this.isDarkMode;
    document.body.classList.toggle('dark-mode', this.isDarkMode);
  }
}
