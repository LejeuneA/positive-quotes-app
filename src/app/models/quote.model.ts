export interface Quote {
  _id: string;
  content: string;
  author: string;
  tags?: string[];
  favorited?: boolean;
  viewedAt?: Date;
}

export interface FavoriteQuoteRecord {
  id?: number | string;
  quoteId: string;
  content: string;
  author: string;
  tags?: string[];
  favoritedAt: string;
}

export interface HistoryQuoteRecord {
  id?: number | string;
  quoteId: string;
  content: string;
  author: string;
  tags?: string[];
  viewedAt: string;
}

export interface QuoteResponse {
  results: Quote[];
  count?: number;
  totalCount?: number;
}

export interface QuoteRequest {
  content: string;
  author: string;
  tags?: string[];
}

/** ? means the property is optional. */
