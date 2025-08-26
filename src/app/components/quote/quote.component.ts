import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-quote',
  standalone: true,
  imports: [CommonModule, MatProgressSpinnerModule],
  templateUrl: './quote.component.html',
  styleUrls: ['./quote.component.scss'],
})
export class QuoteComponent {
  @Input() quote?: string;
  @Input() author?: string;
  @Input() isLoading: boolean = false;

  /*It works like a property, not a function. NOT need parentheses like displayQuote()*/
  get displayQuote(): string {
    return (
      this.quote || 'No quote available'
    ); /* If quote is empty, show 'No quote available' */
  }

  get displayAuthor(): string {
    if (!this.author) return '';
    return this.author === 'Unknown' ? '- Unknown' : `- ${this.author}`;
  }
}
