import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BackgroundService } from '../../services/background.service';

@Component({
  selector: 'app-background',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './background.component.html',
  styleUrls: ['./background.component.scss'],
})
export class BackgroundComponent {
  backgroundImage: string = '';
  isLoading = true;
  error = false;
  // Method to inject services
  constructor(private backgroundService: BackgroundService) {
    this.fetchBackgroundImage();
  }

  fetchBackgroundImage(): void {
    this.isLoading = true;
    this.error = false;

    // API calls are asynchronous. Subscribe listens for results and lets us react when the response arrives
    this.backgroundService.getBackgroundImage().subscribe({
      next: (imageUrl) => {
        this.backgroundImage = imageUrl;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Failed to load background:', error);
        this.backgroundImage = '/assets/images/default-background.jpg';
        this.error = true;
        this.isLoading = false;
      },
    });
  }

  refreshBackground(): void {
    this.fetchBackgroundImage();
  }
}
