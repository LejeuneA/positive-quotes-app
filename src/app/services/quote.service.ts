import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Quote, QuoteResponse } from '../models/quote.model';

@Injectable({
  providedIn: 'root',
})
export class QuoteService {
  private apiUrl = '/api'; // Using proxy path

  constructor(private http: HttpClient) {}

  getRandomQuote(): Observable<any> {
    return this.http.get(`${this.apiUrl}/random`).pipe(
      tap((response) => console.log('Quote API Response:', response)),
      catchError((error) => {
        console.error('Error fetching quote:', error);
        return of(this.getFallbackQuote());
      })
    );
  }

  getQuotesByCategory(category: string): Observable<any> {
    return this.http
      .get(`${this.apiUrl}/quotes`, {
        params: {
          tags: category.toLowerCase(),
          limit: 10,
        },
      })
      .pipe(
        catchError((error) => {
          console.error('Error fetching category quotes:', error);
          return of({ results: [this.getFallbackQuote()] });
        })
      );
  }

  private getFallbackQuote(): any {
    const fallbacks = [
      {
        content: "Stay positive and happy. Work hard and don't give up hope.",
        author: 'Anonymous',
      },
      {
        content:
          'Every day may not be good, but there is something good in every day.',
        author: 'Unknown',
      },
    ];
    return fallbacks[Math.floor(Math.random() * fallbacks.length)];
  }
}
