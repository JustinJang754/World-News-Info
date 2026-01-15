
export type NewsCategory = 
  | 'ALL' 
  | 'KOREA' 
  | 'BUSINESS' 
  | 'STOCK' 
  | 'CRYPTO' 
  | 'TECH' 
  | 'ENTERTAINMENT' 
  | 'HEALTH';

export interface NewsArticle {
  id: string;
  title: string;
  summary: string;
  url: string;
  source: string;
  publishedAt: string;
  category: NewsCategory;
  sentiment: 'positive' | 'negative' | 'neutral';
  reliabilityScore: number;
}

export interface MarketIndex {
  name: string;
  value: string; // 실시간 텍스트 대응을 위해 string으로 변경
  change: string;
  changePercent: string;
  trend: 'up' | 'down' | 'neutral';
}

export interface GroundingSource {
  title: string;
  uri: string;
}
