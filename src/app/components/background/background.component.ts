import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BackgroundService } from '../../services/background.service';

@Component({
  selector: 'app-background',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './background.component.html',
  styleUrls: ['./background.component.scss'],
})
export class BackgroundComponent implements OnInit {
  backgroundImage: string = '';

  constructor(private backgroundService: BackgroundService) {}

  ngOnInit(): void {
    this.backgroundService
      .getBackgroundImage()
      .subscribe((imageUrl: string) => {
        this.backgroundImage = imageUrl;
      });
  }
}
