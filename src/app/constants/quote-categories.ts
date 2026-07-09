export const QUOTE_CATEGORIES = [
  'motivational',
  'inspirational',
  'success',
  'happiness',
  'wisdom',
  'love',
  'friendship',
  'life',
] as const;

export type QuoteCategory = (typeof QUOTE_CATEGORIES)[number];
