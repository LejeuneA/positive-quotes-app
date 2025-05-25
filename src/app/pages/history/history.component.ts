import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HistoryService } from '../../services/history.service';
import { Quote } from '../../models/quote.model';

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.scss'],
})
export class HistoryComponent {
  history: Quote[] = [];

  constructor(private historyService: HistoryService) {
    this.loadHistory();
  }

  loadHistory() {
    this.historyService.getHistory().subscribe((history) => {
      this.history = history;
    });
  }
}
