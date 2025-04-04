import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatListModule],
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.scss'],
})
export class CategoriesComponent {
  categories = [
    'Motivational',
    'Inspirational',
    'Life',
    'Success',
    'Happiness',
    'Wisdom',
    'Friendship',
    'Love',
  ];

  selectedCategory: string | null = null;

  selectCategory(category: string): void {
    this.selectedCategory = category;
    // You can add navigation or service call here to fetch quotes by category
  }
}
