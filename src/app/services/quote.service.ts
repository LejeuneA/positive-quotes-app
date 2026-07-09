import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Quote } from '../models/quote.model';

@Injectable({
  providedIn: 'root',
})
export class QuoteService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getRandomQuote(): Observable<Quote> {
    return this.http
      .get<Quote>(`${this.apiUrl}/random`)
      .pipe(catchError(() => of(this.getFallbackQuote())));
  }

  getRandomQuoteByCategory(category: string): Observable<Quote> {
    return this.http
      .get<Quote>(`${this.apiUrl}/random`, {
        params: {
          tags: category.toLowerCase(),
        },
      })
      .pipe(catchError(() => of(this.getFallbackQuote())));
  }

  public getFallbackQuote(): Quote {
    const fallbacks: Quote[] = [
      {
        _id: 'fallback-positive',
        content: "Stay positive and happy. Work hard and don't give up hope.",
        author: 'Anonymous',
        tags: ['positive'],
      },
      {
        _id: 'fallback-good-day',
        content:
          'Every day may not be good, but there is something good in every day.',
        author: 'Unknown',
        tags: ['positive'],
      },
      {
        _id: 'fallback-great-work',
        content: 'The only way to do great work is to love what you do.',
        author: 'Steve Jobs',
        tags: ['work'],
      },
      {
        _id: 'fallback-life',
        content: "Life is what happens when you're busy making other plans.",
        author: 'John Lennon',
        tags: ['life'],
      },
    ];
    return fallbacks[Math.floor(Math.random() * fallbacks.length)];
  }
}
