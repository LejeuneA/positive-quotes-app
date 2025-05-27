import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Quote } from '../models/quote.model';

@Injectable({
  providedIn: 'root',
})
export class HistoryService {
  private apiUrl = 'http://localhost:3000/history';

  constructor(private http: HttpClient) {}

  getHistory() {
    return this.http.get<Quote[]>(this.apiUrl);
  }

  addToHistory(quote: Quote) {
    return this.http.post(this.apiUrl, { ...quote, viewedAt: new Date() });
  }
}
