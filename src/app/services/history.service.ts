import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { forkJoin, Observable, of, switchMap } from 'rxjs';
import { HistoryQuoteRecord, Quote } from '../models/quote.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class HistoryService {
  private apiUrl = `${environment.jsonServerUrl}/history`;

  constructor(private http: HttpClient) {}

  getHistory(): Observable<HistoryQuoteRecord[]> {
    return this.http.get<HistoryQuoteRecord[]>(this.apiUrl);
  }

  addToHistory(quote: Quote): Observable<HistoryQuoteRecord> {
    const historyEntry: HistoryQuoteRecord = {
      quoteId: quote._id,
      content: quote.content,
      author: quote.author,
      tags: quote.tags,
      viewedAt: new Date().toISOString(),
    };
    return this.http.post<HistoryQuoteRecord>(this.apiUrl, historyEntry);
  }

  clearHistory(): Observable<unknown> {
    // First get all history items to delete them one by one
    return this.http.get<HistoryQuoteRecord[]>(this.apiUrl).pipe(
      switchMap((historyItems) => {
        if (historyItems.length === 0) {
          return of({ message: 'History already empty' });
        }
        // Create an array of delete observables
        const deleteObservables = historyItems.map((item) =>
          this.http.delete(`${this.apiUrl}/${item.id}`)
        );
        // Execute all delete requests in parallel
        return forkJoin(deleteObservables);
      })
    );
  }
}
