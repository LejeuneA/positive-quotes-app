import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Quote } from '../models/quote.model';

@Injectable({
  providedIn: 'root',
})
export class FavoriteService {
  private apiUrl = 'http://localhost:3000/favorites';

  constructor(private http: HttpClient) {}

  getFavorites() {
    return this.http.get<Quote[]>(this.apiUrl);
  }

  addFavorite(quote: Quote) {
    return this.http.post(this.apiUrl, { ...quote, favorited: true });
  }

  removeFavorite(quoteId: string) {
    return this.http.delete(`${this.apiUrl}/${quoteId}`);
  }
}
