import { Component } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import { QuoteService } from '../../services/quote.service';
import { CommonModule } from '@angular/common';
import { QuoteComponent } from '../../components/quote/quote.component';
import { SearchComponent } from '../../components/search/search.component';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Quote, QuoteResponse } from '../../models/quote.model';

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
  quotes: Quote[] = [];
  currentQuote: Quote = this.getDefaultQuote();
  isLoading = false;

  constructor(
    private authService: AuthService,
    private quoteService: QuoteService
  ) {
    this.authService.currentUser$.subscribe((user) => {
      this.currentUser = user;
    });
    this.loadRandomQuote();
  }

  private getDefaultQuote(): Quote {
    return {
      _id: 'default',
      content: 'Loading...',
      author: '',
    };
  }

  selectCategory(category: string): void {
    if (this.selectedCategory === category) {
      this.selectedCategory = null;
      this.loadRandomQuote();
      return;
    }

    this.selectedCategory = category;
    this.isLoading = true;

    this.quoteService.getQuotesByCategory(category).subscribe({
      next: (response: QuoteResponse) => {
        this.quotes = response.results || [];
        if (this.quotes.length > 0) {
          this.currentQuote = this.quotes[0];
        }
        this.isLoading = false;
      },
      error: (error: HttpErrorResponse) => {
        console.error('Error fetching category quotes:', error);
        this.isLoading = false;
        this.loadRandomQuote();
      },
    });
  }

  loadRandomQuote(): void {
    this.isLoading = true;
    this.quoteService.getRandomQuote().subscribe({
      next: (quote: Quote) => {
        this.currentQuote = quote;
        this.quotes = [quote];
        this.isLoading = false;
      },
      error: (error: HttpErrorResponse) => {
        console.error('Error fetching random quote:', error);
        this.currentQuote = this.getDefaultQuote();
        this.quotes = [this.currentQuote];
        this.isLoading = false;
      },
    });
  }

  nextQuote(): void {
    if (this.quotes.length > 1) {
      const currentIndex = this.quotes.findIndex(
        (q) => q._id === this.currentQuote._id
      );
      const nextIndex = (currentIndex + 1) % this.quotes.length;
      this.currentQuote = this.quotes[nextIndex];
    }
  }
}
