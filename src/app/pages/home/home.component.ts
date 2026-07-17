import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';

import { AuthService } from '../../services/auth.service';
import { QuoteService } from '../../services/quote.service';
import { FavoriteService } from '../../services/favorite.service';
import { HistoryService } from '../../services/history.service';

import { QuoteComponent } from '../../components/quote/quote.component';
import { SearchComponent } from '../../components/search/search.component';

import { Quote } from '../../models/quote.model';
import { QUOTE_CATEGORIES } from '../../constants/quote-categories';

@Component({
    selector: 'app-home',
    standalone: true,
    imports: [
        CommonModule,
        QuoteComponent,
        SearchComponent,
        MatButtonModule,
        MatIconModule,
        MatMenuModule,
    ],
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss'],
})
export class HomeComponent {
    categories = QUOTE_CATEGORIES;

    selectedCategory: string | null = null;
    currentUser: unknown = null;
    currentQuote: Quote = this.getDefaultQuote();
    isLoading = false;

    constructor(
        private readonly authService: AuthService,
        private readonly quoteService: QuoteService,
        private readonly favoriteService: FavoriteService,
        private readonly historyService: HistoryService,
        private readonly router: Router
    ) {
        this.authService.currentUser$.subscribe((user) => {
            this.currentUser = user;
        });

        this.fetchRandomQuote();
    }

    private getDefaultQuote(): Quote {
        return {
            _id: 'default',
            content: 'Click a category to get started',
            author: '',
            tags: [],
            favorited: false,
        };
    }

    selectCategory(category: string): void {
        if (this.selectedCategory === category) {
            this.selectedCategory = null;
            this.fetchRandomQuote();
            return;
        }

        this.selectedCategory = category;
        this.isLoading = true;

        this.quoteService
            .getRandomQuoteByCategory(category)
            .subscribe({
                next: (quote) => {
                    this.handleNewQuote(quote);
                },
                error: (error) => {
                    console.error(
                        'Failed to load category quote:',
                        error
                    );

                    this.handleNewQuote(
                        this.quoteService.getFallbackQuote()
                    );
                },
            });
    }

    fetchRandomQuote(): void {
        this.isLoading = true;

        this.quoteService.getRandomQuote().subscribe({
            next: (quote) => {
                this.handleNewQuote(quote);
            },
            error: (error) => {
                console.error(
                    'Failed to load random quote:',
                    error
                );

                this.handleNewQuote(
                    this.quoteService.getFallbackQuote()
                );
            },
        });
    }

    refreshQuote(): void {
        if (this.selectedCategory) {
            const currentCategory =
                this.selectedCategory;

            this.selectedCategory = null;
            this.selectCategory(currentCategory);
            return;
        }

        this.fetchRandomQuote();
    }

    toggleFavorite(): void {
        const quoteId = this.currentQuote._id;

        if (!quoteId) {
            return;
        }

        if (this.currentQuote.favorited) {
            this.favoriteService
                .getFavoriteIdByQuoteId(quoteId)
                .subscribe({
                    next: (favoriteId) => {
                        if (!favoriteId) {
                            this.currentQuote.favorited = false;
                            return;
                        }

                        this.favoriteService
                            .removeFavorite(favoriteId)
                            .subscribe({
                                next: () => {
                                    this.currentQuote.favorited = false;
                                },
                                error: (error) => {
                                    console.error(
                                        'Failed to remove favorite:',
                                        error
                                    );
                                },
                            });
                    },
                    error: (error) => {
                        console.error(
                            'Failed to find favorite:',
                            error
                        );
                    },
                });

            return;
        }

        this.favoriteService
            .addFavorite(this.currentQuote)
            .subscribe({
                next: () => {
                    this.currentQuote.favorited = true;
                },
                error: (error) => {
                    console.error(
                        'Failed to add favorite:',
                        error
                    );
                },
            });
    }

    shareQuote(platform: string): void {
        const text =
            `"${this.currentQuote.content}"` +
            ` - ${this.currentQuote.author}`;

        switch (platform) {
            case 'twitter': {
                const twitterUrl =
                    'https://twitter.com/intent/tweet?text=' +
                    encodeURIComponent(text);

                window.open(
                    twitterUrl,
                    '_blank',
                    'noopener,noreferrer'
                );
                break;
            }

            case 'facebook': {
                const facebookUrl =
                    'https://www.facebook.com/sharer/sharer.php?u=' +
                    encodeURIComponent(window.location.href) +
                    '&quote=' +
                    encodeURIComponent(text);

                window.open(
                    facebookUrl,
                    '_blank',
                    'noopener,noreferrer'
                );
                break;
            }

            case 'instagram': {
                navigator.clipboard
                    .writeText(text)
                    .then(() => {
                        alert(
                            'Quote copied to clipboard! ' +
                            'You can now paste it in Instagram.'
                        );
                    })
                    .catch((error) => {
                        console.error(
                            'Failed to copy quote:',
                            error
                        );
                    });
                break;
            }
        }
    }

    private handleNewQuote(quote: Quote): void {
        this.currentQuote = {
            ...quote,
            favorited: false,
        };

        if (!this.authService.isAuthenticated()) {
            this.isLoading = false;
            return;
        }

        this.historyService
            .addToHistory(quote)
            .subscribe({
                error: (error) => {
                    console.error(
                        'Failed to save quote history:',
                        error
                    );
                },
            });

        this.favoriteService
            .getFavoriteIdByQuoteId(quote._id)
            .subscribe({
                next: (favoriteId) => {
                    this.currentQuote.favorited =
                        favoriteId !== null;
                },
                error: (error) => {
                    console.error(
                        'Failed to check favorite state:',
                        error
                    );
                },
            });

        this.isLoading = false;
    }

    navigateToCategories(): void {
        this.router.navigate(['/categories']);
    }
}
