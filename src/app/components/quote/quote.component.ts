import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { QuoteService } from '../../services/quote.service';

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
      next: (data) => {
        console.log('Quote Data:', data);
        this.quote = data.content;
        this.author = data.author;
      },
      error: (err) => {
        console.error('Error fetching quote:', err);
      },
    });
  }
}
