import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '../../environments/environment';

interface UnsplashPhotoResponse {
  urls: {
    full: string;
  };
}

@Injectable({
  providedIn: 'root',
})
export class BackgroundService {
  private apiUrl = 'https://api.unsplash.com/photos/random';

  constructor(private http: HttpClient) {}

  getBackgroundImage(): Observable<string> {
    return this.http
      .get<UnsplashPhotoResponse>(this.apiUrl, {
        params: {
          query: 'nature',
          client_id: environment.unsplashAccessKey,
        },
      })
      .pipe(map((data) => data.urls.full));
  }
}

/**
 * get → fetch data from API
 * pipe → make a chain of operators to change data
 * map → pick/transform the part of the data you need
 */
