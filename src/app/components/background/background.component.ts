import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-background',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './background.component.html',
  styleUrls: ['./background.component.scss'],
})
export class BackgroundComponent implements OnInit {
  backgroundImage: string = '';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.fetchBackgroundImage();
  }

  fetchBackgroundImage(): void {
    const accessKey = '2Dd2Hb-S8Ekw-KDUh-WmG2skBLNV6zncJ6NAPEIBKDA';
    const apiUrl = `https://api.unsplash.com/photos/random?query=nature&client_id=${accessKey}`;

    console.log('Fetching background image from:', apiUrl); // Debug log

    this.http.get<any>(apiUrl).subscribe({
      next: (data) => {
        console.log('Background image data:', data); // Debug log
        this.backgroundImage = data.urls.full;
      },
      error: (error) => {
        console.error('Failed to load background:', error);
        // Fallback to local image
        this.backgroundImage = '/assets/default-background.jpg';
      },
    });
  }
}
