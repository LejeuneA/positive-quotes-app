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
  isLoading = true;
  error = false;

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit(): void {
    this.fetchBackgroundImage();
    this.setupRouteListener();
  }

  private setupRouteListener(): void {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        this.updateBackgroundHeight();
      });
    this.updateBackgroundHeight();
  }

  private updateBackgroundHeight(): void {
    const currentRoute = this.router.url;
    this.fullHeight = ['/login', '/register', '/settings'].includes(
      currentRoute
    );
  }

  fetchBackgroundImage(): void {
    this.isLoading = true;
    this.error = false;

    const accessKey = '2Dd2Hb-S8Ekw-KDUh-WmG2skBLNV6zncJ6NAPEIBKDA';
    const apiUrl = `https://api.unsplash.com/photos/random?query=nature&client_id=${accessKey}`;

    this.http.get<any>(apiUrl).subscribe({
      next: (data) => {
        this.backgroundImage = data.urls.full;
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
