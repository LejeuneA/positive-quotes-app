import { Routes } from '@angular/router';
import { QuoteComponent } from './components/quote/quote.component';
import { CategoriesComponent } from './components/categories/categories.component';
import { QuoteHistoryComponent } from './components/quote-history/quote-history.component';
import { SettingsComponent } from './components/settings/settings.component';

export const routes: Routes = [
  { path: '', component: QuoteComponent },
  { path: 'categories', component: CategoriesComponent },
  { path: 'history', component: QuoteHistoryComponent },
  { path: 'settings', component: SettingsComponent },
];
