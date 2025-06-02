import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
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
  isLoading = false;

  constructor(
    private historyService: HistoryService,
    private authService: AuthService,
    private snackBar: MatSnackBar
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
      error: (error) => {
        console.error('Error loading history:', error);
        this.snackBar.open('Failed to load history', 'Close', {
          duration: 3000,
        });
        this.isLoading = false;
      },
    });
  }

  clearHistory(): void {
    if (confirm('Are you sure you want to clear your entire quote history?')) {
      this.isLoading = true;
      this.historyService.clearHistory().subscribe({
        next: () => {
          this.history = [];
          this.isLoading = false;
          this.snackBar.open('History cleared successfully!', 'Close', {
            duration: 3000,
          });
        },
        error: (error) => {
          console.error('Error clearing history:', error);
          this.snackBar.open('Failed to clear history', 'Close', {
            duration: 3000,
          });
          this.isLoading = false;
        },
      });
    }
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleString();
  }
}
