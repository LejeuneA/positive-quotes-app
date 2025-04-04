import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { QuoteComponent } from '../../components/quote/quote.component';
import { SearchComponent } from '../../components/search/search.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, QuoteComponent, SearchComponent],
  template: `
    <app-quote></app-quote>
    <app-search></app-search>
  `,
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent {}
