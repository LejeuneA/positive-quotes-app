import { Component, OnInit } from '@angular/core';
import { QuoteService } from '../../services/quote.service';

@Component({
  selector: 'app-quote',
  templateUrl: './quote.component.html',
  styleUrls: ['./quote.component.scss'],
})
export class QuoteComponent implements OnInit {
  quote: string = '';
  author: string = '';

  constructor(private quoteService: QuoteService) {}

  ngOnInit(): void {
    this.quoteService.getDailyQuote().subscribe((data: any) => {
      this.quote = data.content;
      this.author = data.author;
    });
  }
}
