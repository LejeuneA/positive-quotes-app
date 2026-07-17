import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, map, Observable, of } from 'rxjs';
import { environment } from '../../environments/environment';

interface BackgroundResponse {
  url: string;
}

@Injectable({
  providedIn: 'root',
})
export class BackgroundService {
  constructor(private readonly http: HttpClient) {}

  getBackgroundImage(): Observable<string> {
    return this.http
      .get<BackgroundResponse>(environment.backgroundApiUrl)
      .pipe(
        map((response) => response.url),
        catchError(() => of('/assets/images/default-background.jpg'))
      );
  }
}
