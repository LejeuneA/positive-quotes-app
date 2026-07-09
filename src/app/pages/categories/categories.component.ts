// categories.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { QuoteService } from '../../services/quote.service';
import { QuoteComponent } from '../../components/quote/quote.component';
import { QUOTE_CATEGORIES } from '../../constants/quote-categories';
import { Quote } from '../../models/quote.model';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    QuoteComponent,
  ],
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.scss'],
})
export class CategoriesComponent {
  categories = QUOTE_CATEGORIES;
  selectedCategory: string | null = null;
  currentQuote: Quote | null = null;
  isLoading = false;

  constructor(private quoteService: QuoteService) {}

  selectCategory(category: string): void {
    this.selectedCategory = category;
    this.fetchRandomQuote();
  }

  fetchRandomQuote(): void {
    if (!this.selectedCategory) return;

    this.isLoading = true;
    this.quoteService
      .getRandomQuoteByCategory(this.selectedCategory)
      .subscribe({
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
    this.fetchRandomQuote();
  }
}
