import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { FavoriteService } from '../../services/favorite.service';
import { Quote } from '../../models/quote.model';

@Component({
  selector: 'app-favorites',
  templateUrl: './favorites.component.html',
  styleUrls: ['./favorites.component.scss'],
  imports: [MatIconModule],
})
export class FavoritesComponent {
  favorites: Quote[] = [];

  constructor(private favoriteService: FavoriteService) {
    this.loadFavorites();
  }

  loadFavorites() {
    this.favoriteService.getFavorites().subscribe((favs) => {
      this.favorites = favs;
    });
  }

  removeFavorite(quoteId: string) {
    this.favoriteService.removeFavorite(quoteId).subscribe(() => {
      this.loadFavorites();
    });
  }
}
