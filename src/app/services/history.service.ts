import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Quote } from '../models/quote.model';

@Injectable({
  providedIn: 'root',
})
export class HistoryService {
  private apiUrl = 'http://localhost:3000/favorites';

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
    return this.http.delete(this.apiUrl);
  }
}
