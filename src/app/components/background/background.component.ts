import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-background',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './background.component.html',
  styleUrls: ['./background.component.scss'],
})
export class BackgroundComponent implements OnInit {
  backgroundImage: string = '';
  fullHeight = false;

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit(): void {
    this.fetchBackgroundImage();

    // Listen to route changes
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        this.checkRoute();
      });

    // Initial check
    this.checkRoute();
  }

  checkRoute() {
    const currentRoute = this.router.url;
    this.fullHeight = ['/login', '/register'].includes(currentRoute);
  }

  fetchBackgroundImage(): void {
    const accessKey = '2Dd2Hb-S8Ekw-KDUh-WmG2skBLNV6zncJ6NAPEIBKDA';
    const apiUrl = `https://api.unsplash.com/photos/random?query=nature&client_id=${accessKey}`;

    this.http.get<any>(apiUrl).subscribe({
      next: (data) => {
        this.backgroundImage = data.urls.full;
      },
      error: (error) => {
        console.error('Failed to load background:', error);
        this.backgroundImage = '/assets/default-background.jpg';
      },
    });
  }
}
