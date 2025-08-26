import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Quote } from '../models/quote.model';

@Injectable({
  providedIn: 'root',
})
export class FavoriteService {
  private apiUrl = 'http://localhost:3000/favorites';

  constructor(private http: HttpClient) {}

  getFavorites(): Observable<Quote[]> {
    return this.http.get<any[]>(this.apiUrl).pipe(
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

  addFavorite(quote: Quote): Observable<any> {
    const favorite = {
      quoteId: quote._id,
      content: quote.content,
      author: quote.author,
      tags: quote.tags,
      favoritedAt: new Date().toISOString(),
    };
    return this.http.post(this.apiUrl, favorite);
  }

  removeFavorite(favoriteId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${favoriteId}`);
  }

  // Helper method to find the favorite ID by quote ID
  getFavoriteIdByQuoteId(quoteId: string): Observable<string | null> {
    return this.http
      .get<any[]>(`${this.apiUrl}?quoteId=${quoteId}`)
      .pipe(
        map((favorites) => (favorites.length > 0 ? favorites[0].id : null))
      );
  }
}
