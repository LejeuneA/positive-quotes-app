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

  /** This function sorts the quotes by newest date first */
  loadHistory(): void {
    this.isLoading = true;
    this.historyService.getHistory().subscribe({
      next: (history) => {
        this.history = history.sort(
          (a, b) =>
            new Date(b.viewedAt).getTime() - new Date(a.viewedAt).getTime()
        );
        this.isLoading = false;
      },
      /** Shows a small popup message if something goes wrong. snackBar is a message box from Angular Material */
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
          this.snackBar.open(
            'Failed to clear history. Please try again.',
            'Close',
            {
              duration: 5000,
            }
          );
          this.isLoading = false;
        },
        complete: () => {
          // Reload history to ensure UI is in sync
          this.loadHistory();
        },
      });
    }
  }

  formatDate(dateString: string): string {
    /** This is a TypeScript type for formatting dates and times in JavaScript. */
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    };
    return new Date(dateString).toLocaleString(undefined, options);
  }
}
