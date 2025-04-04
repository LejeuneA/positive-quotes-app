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

  get displayQuote(): string {
    return this.quote || 'No quote available';
  }

  get displayAuthor(): string {
    return this.author ? `- ${this.author}` : '';
  }
}
