import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { FavoriteQuoteRecord, Quote } from '../models/quote.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class FavoriteService {
  private apiUrl = `${environment.jsonServerUrl}/favorites`;

  constructor(private http: HttpClient) {}

  getFavorites(): Observable<Quote[]> {
    return this.http.get<FavoriteQuoteRecord[]>(this.apiUrl).pipe(
      map((favorites) =>
        favorites.map((fav) => ({
          _id: fav.quoteId,
          content: fav.content,
          author: fav.author,
          tags: fav.tags,
          favorited: true,
        }))
      )
    );
  }

  addFavorite(quote: Quote): Observable<FavoriteQuoteRecord> {
    const favorite: FavoriteQuoteRecord = {
      quoteId: quote._id,
      content: quote.content,
      author: quote.author,
      tags: quote.tags,
      favoritedAt: new Date().toISOString(),
    };
    return this.http.post<FavoriteQuoteRecord>(this.apiUrl, favorite);
  }

  removeFavorite(favoriteId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${favoriteId}`);
  }

  // Helper method to find the favorite ID by quote ID
  getFavoriteIdByQuoteId(quoteId: string): Observable<string | null> {
    return this.http
      .get<FavoriteQuoteRecord[]>(`${this.apiUrl}?quoteId=${quoteId}`)
      .pipe(
        map((favorites) =>
          favorites.length > 0 && favorites[0].id != null
            ? String(favorites[0].id)
            : null
        )
      );
  }
}
