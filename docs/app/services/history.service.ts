import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { forkJoin, Observable, of, switchMap } from 'rxjs';
import { Quote } from '../models/quote.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class HistoryService {
  private apiUrl = `${environment.jsonServerUrl}/history`;

  constructor(private http: HttpClient) {}

  getHistory(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  addToHistory(quote: Quote): Observable<any> {
    const historyEntry = {
      quoteId: quote._id,
      content: quote.content,
      author: quote.author,
      tags: quote.tags,
      viewedAt: new Date().toISOString(),
    };
    return this.http.post(this.apiUrl, historyEntry);
  }

  clearHistory(): Observable<any> {
    // First get all history items to delete them one by one
    return this.http.get<any[]>(this.apiUrl).pipe(
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
