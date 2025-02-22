import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class QuoteService {
  private apiUrl = '/api/random';

  constructor(private http: HttpClient) {}

  getDailyQuote(): Observable<any> {
    console.log('Fetching quote from API...');
    return this.http.get(this.apiUrl);
  }
}
