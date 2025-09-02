import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class BackgroundService {
  private apiUrl =
    'https://api.unsplash.com/photos/random?query=nature&client_id=YOUR_UNSPLASH_ACCESS_KEY';

  constructor(private http: HttpClient) {}

  getBackgroundImage(): Observable<string> {
    return this.http
      .get<any>(this.apiUrl) /** Makes an HTTP request */
      .pipe(map((data: { urls: { full: any } }) => data.urls.full));
  }
}

/**
 * get → fetch data from API
 * pipe → make a chain of operators to change data
 * map → pick/transform the part of the data you need
 */
