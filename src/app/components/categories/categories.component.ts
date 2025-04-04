import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon'; // Add this import

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatListModule, MatIconModule],
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.scss'],
})
export class CategoriesComponent {
  categories = [
    'motivational',
    'inspirational',
    'success',
    'happiness',
    'wisdom',
    'love',
    'friendship',
    'life',
  ];
  selectedCategory: string | null = null;

  selectCategory(category: string): void {
    this.selectedCategory = category;
  }
}
