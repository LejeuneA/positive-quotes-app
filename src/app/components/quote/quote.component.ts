import { Component, OnInit } from '@angular/core';
import { QuoteService } from '../../services/quote.service';

@Component({
  selector: 'app-quote',
  template: `
    <div class="quote-container">
      <p class="quote-text">{{ quote }}</p>
      <p class="quote-author">- {{ author }}</p>
    </div>
  `,
  styleUrls: ['./quote.component.scss'],
})
export class QuoteComponent implements OnInit {
  quote: string = 'Stay positive and happy. Work hard and don’t give up hope.'; // Fallback quote
  author: string = 'Anonymous'; // Fallback author

  constructor(private quoteService: QuoteService) {}

  ngOnInit(): void {
    this.quoteService.getDailyQuote().subscribe({
      next: (data) => {
        this.quote = data.content;
        this.author = data.author;
      },
      error: () => {
        console.error('Failed to fetch quote. Using fallback quote.');
      },
    });
  }
}
