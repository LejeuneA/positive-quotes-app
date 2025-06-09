import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../enviroments/environment';

@Injectable({
  providedIn: 'root',
})
export class QuoteService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getRandomQuote(): Observable<any> {
    return this.http
      .get(`${this.apiUrl}/random`)
      .pipe(catchError(() => of(this.getFallbackQuote())));
  }

  getRandomQuoteByCategory(category: string): Observable<any> {
    return this.http
      .get(`${this.apiUrl}/random`, {
        params: {
          tags: category.toLowerCase(),
        },
      })
      .pipe(catchError(() => of(this.getFallbackQuote())));
  }

  public getFallbackQuote(): any {
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
      {
        content: 'The only way to do great work is to love what you do.',
        author: 'Steve Jobs',
      },
      {
        content: "Life is what happens when you're busy making other plans.",
        author: 'John Lennon',
      },
    ];
    return fallbacks[Math.floor(Math.random() * fallbacks.length)];
  }
}
