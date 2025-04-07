import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { QuoteService } from '../../services/quote.service';
import { CommonModule } from '@angular/common';
import { QuoteComponent } from '../../components/quote/quote.component';
import { SearchComponent } from '../../components/search/search.component';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Quote } from '../../models/quote.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    QuoteComponent,
    SearchComponent,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent {
  categories = [
    'motivational',
    'inspirational',
    'success',
    'happiness',
    'wisdom',
    'love',
    'friendship',
    'life',
  ];

  selectedCategory: string | null = null;
  currentUser: any;
  currentQuote: Quote = this.getDefaultQuote();
  isLoading = false;

  constructor(
    private authService: AuthService,
    private quoteService: QuoteService
  ) {
    this.authService.currentUser$.subscribe((user) => {
      this.currentUser = user;
    });
    this.fetchRandomQuote();
  }

  private getDefaultQuote(): Quote {
    return {
      _id: 'default',
      content: 'Click a category to get started',
      author: '',
      tags: [],
    };
  }

  selectCategory(category: string): void {
    if (this.selectedCategory === category) {
      this.selectedCategory = null;
      this.fetchRandomQuote();
      return;
    }

    this.selectedCategory = category;
    this.isLoading = true;

    this.quoteService.getRandomQuoteByCategory(category).subscribe({
      next: (quote) => {
        this.currentQuote = quote;
        this.isLoading = false;
      },
      error: () => {
        this.currentQuote = this.quoteService.getFallbackQuote();
        this.isLoading = false;
      },
    });
  }

  fetchRandomQuote(): void {
    this.isLoading = true;
    this.quoteService.getRandomQuote().subscribe({
      next: (quote) => {
        this.currentQuote = quote;
        this.isLoading = false;
      },
      error: () => {
        this.currentQuote = this.quoteService.getFallbackQuote();
        this.isLoading = false;
      },
    });
  }

  refreshQuote(): void {
    if (this.selectedCategory) {
      this.selectCategory(this.selectedCategory);
    } else {
      this.fetchRandomQuote();
    }
  }
}
