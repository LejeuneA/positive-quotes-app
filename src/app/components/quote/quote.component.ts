import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { QuoteService } from '../../services/quote.service';

interface Quote {
  content: string;
  author: string;
}

@Component({
  selector: 'app-quote',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './quote.component.html',
  styleUrls: ['./quote.component.scss'],
})
export class QuoteComponent implements OnInit {
  quote: string = 'Stay positive and happy. Work hard and don’t give up hope.';
  author: string = 'Anonymous';

  constructor(private quoteService: QuoteService) {}

  ngOnInit(): void {
    this.quoteService.getDailyQuote().subscribe({
      next: (data: Quote) => {
        this.quote = data.content || this.quote;
        this.author = data.author || 'Unknown';
      },
      error: (err) => {
        console.error('Failed to fetch quote:', err);
      },
    });
  }
}
