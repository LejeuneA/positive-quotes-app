import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  isDarkMode(): boolean {
    throw new Error('Method not implemented.');
  }
  toggleTheme() {
    throw new Error('Method not implemented.');
  }

  constructor() {}
}
