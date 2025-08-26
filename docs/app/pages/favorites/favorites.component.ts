import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { FavoriteService } from '../../services/favorite.service';
import { Quote } from '../../models/quote.model';

@Component({
  selector: 'app-favorites',
  templateUrl: './favorites.component.html',
  styleUrls: ['./favorites.component.scss'],
  imports: [MatIconModule, CommonModule],
  standalone: true,
})
export class FavoritesComponent {
  favorites: any[] = [];

  constructor(private favoriteService: FavoriteService) {
    this.loadFavorites();
  }

  loadFavorites() {
    this.favoriteService.getFavorites().subscribe((favs) => {
      this.favoriteService.getFavorites().subscribe((favorites) => {
        this.favorites = favorites;
      });
    });
  }

  removeFavorite(quoteId: string) {
    this.favoriteService
      .getFavoriteIdByQuoteId(quoteId)
      .subscribe((favoriteId) => {
        if (favoriteId) {
          this.favoriteService.removeFavorite(favoriteId).subscribe(() => {
            this.loadFavorites();
          });
        }
      });
  }
}
