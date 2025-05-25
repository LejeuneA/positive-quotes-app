export interface Quote {
  _id: string;
  content: string;
  author: string;
  tags?: string[];
  favorited?: boolean;
  viewedAt?: Date;
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
