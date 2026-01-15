
import React from 'react';
import { NewsArticle } from '../types';
import { ExternalLink, Sparkles, TrendingUp, TrendingDown, Minus, ArrowUpRight, ShieldCheck } from 'lucide-react';

interface NewsCardProps {
  article: NewsArticle;
  onShowInsight: (topic: string) => void;
}

const NewsCard: React.FC<NewsCardProps> = ({ article, onShowInsight }) => {
  const getSentimentStyle = () => {
    switch (article.sentiment) {
      case 'positive': return { color: 'text-red-500 bg-red-50', icon: <TrendingUp size={14} />, label: '호재' };
      case 'negative': return { color: 'text-blue-500 bg-blue-50', icon: <TrendingDown size={14} />, label: '악재' };
      default: return { color: 'text-slate-400 bg-slate-50', icon: <Minus size={14} />, label: '중립' };
    }
  };

  const sentiment = getSentimentStyle();
  const isReliable = (article.reliabilityScore || 0) >= 80;

  return (
    <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col group h-full">
      <div className="p-7 flex-1">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <div className={`flex items-center space-x-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider ${sentiment.color}`}>
              {sentiment.icon}
              <span>{sentiment.label}</span>
            </div>
            {isReliable && (
              <div className="flex items-center space-x-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                <ShieldCheck size={12} />
                <span>신뢰도 높음</span>
              </div>
            )}
          </div>
          <span className="text-[11px] font-bold text-slate-300 uppercase tracking-widest">{article.source}</span>
        </div>
        
        <h3 className="text-xl font-bold text-slate-900 leading-[1.3] mb-4 group-hover:text-blue-600 transition-colors line-clamp-2">
          {article.title}
        </h3>
        
        <p className="text-[14px] text-slate-500 leading-relaxed line-clamp-2">
          {article.summary}
        </p>
      </div>

      <div className="px-7 py-5 bg-slate-50/50 border-t border-slate-50 flex items-center justify-between mt-auto">
        <button 
          onClick={() => onShowInsight(article.title)}
          className="flex items-center space-x-2 text-[13px] font-black text-blue-600 hover:text-blue-700 transition-colors"
        >
          <Sparkles size={16} />
          <span>AI INSIGHT</span>
        </button>
        
        <a 
          href={article.url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="w-10 h-10 flex items-center justify-center text-slate-300 hover:text-slate-900 hover:bg-white rounded-full transition-all border border-transparent hover:border-slate-100"
        >
          <ArrowUpRight size={18} />
        </a>
      </div>
    </div>
  );
};

export default NewsCard;
