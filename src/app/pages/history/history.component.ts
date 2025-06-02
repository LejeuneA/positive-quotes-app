import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { HistoryService } from '../../services/history.service';
import { AuthService } from '../../services/auth.service';
import { QuoteComponent } from '../../components/quote/quote.component';

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatListModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    QuoteComponent,
  ],
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.scss'],
})
export class HistoryComponent {
  history: any[] = [];
  isLoading = true;

  constructor(
    private historyService: HistoryService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadHistory();
  }

  loadHistory(): void {
    this.isLoading = true;
    this.historyService.getHistory().subscribe({
      next: (history) => {
        this.history = history;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      },
    });
  }

  clearHistory(): void {
    this.historyService.clearHistory().subscribe({
      next: () => {
        this.history = [];
      },
      error: (err) => {
        console.error('Error clearing history:', err);
      },
    });
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleString();
  }
}
