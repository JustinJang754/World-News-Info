
import React, { useState, useEffect, useCallback } from 'react';
import { Search, RefreshCw, Newspaper, Landmark, Sparkles, LayoutGrid, Building2, TrendingUp, Bitcoin, Cpu, Film, HeartPulse, AlertCircle, ShieldCheck, Lock } from 'lucide-react';
import { fetchEconomicNews, getDeepInsight, fetchMarketIndices } from './services/geminiService';
import { NewsArticle, MarketIndex, NewsCategory } from './types';
import { globalRateLimiter } from './utils/security';
import MarketTickers from './components/MarketTickers';
import NewsCard from './components/NewsCard';
import InsightModal from './components/InsightModal';

const SECTORS: { id: NewsCategory; name: string; icon: any; color: string }[] = [
  { id: 'ALL', name: '전체', icon: <LayoutGrid size={18} />, color: 'blue' },
  { id: 'KOREA', name: '대한민국', icon: <Landmark size={18} />, color: 'red' },
  { id: 'BUSINESS', name: '비즈니스', icon: <Building2 size={18} />, color: 'indigo' },
  { id: 'STOCK', name: '주식', icon: <TrendingUp size={18} />, color: 'emerald' },
  { id: 'CRYPTO', name: '크립토', icon: <Bitcoin size={18} />, color: 'orange' },
  { id: 'TECH', name: '과학/기술', icon: <Cpu size={18} />, color: 'purple' },
  { id: 'ENTERTAINMENT', name: '엔터테인먼트', icon: <Film size={18} />, color: 'pink' },
  { id: 'HEALTH', name: '건강', icon: <HeartPulse size={18} />, color: 'rose' },
];

function App() {
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [indices, setIndices] = useState<MarketIndex[]>([]);
  const [loading, setLoading] = useState(true);
  const [indicesLoading, setIndicesLoading] = useState(true);
  const [error, setError] = useState<{message: string, isRateLimit?: boolean} | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [region, setRegion] = useState<'domestic' | 'overseas'>('domestic');
  const [activeSector, setActiveSector] = useState<NewsCategory>('ALL');
  const [insightModal, setInsightModal] = useState({ isOpen: false, topic: '', content: '', loading: false });

  const loadMarketData = async () => {
    setIndicesLoading(true);
    try {
      const data = await fetchMarketIndices();
      setIndices(data);
    } catch (err) {
      console.error("Market data fetch failed");
    } finally {
      setIndicesLoading(false);
    }
  };

  const loadNews = useCallback(async (query?: string) => {
    if (!process.env.API_KEY) {
      setError({ message: "보안 오류: API 키가 누락되었습니다." });
      setLoading(false);
      return;
    }

    if (!globalRateLimiter.canRequest()) {
      setError({ 
        message: `보안 정책: 요청 과다 방지 중. ${globalRateLimiter.getTimeRemaining()}초 후 가능.`, 
        isRateLimit: true 
      });
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await fetchEconomicNews(region, activeSector, query);
      setNews(data.articles || []);
    } catch (err: any) {
      setError({ message: "데이터 보안 연결 실패. 다시 시도해 주세요." });
    } finally {
      setLoading(false);
    }
  }, [region, activeSector]);

  useEffect(() => {
    loadNews();
    loadMarketData();
    const interval = setInterval(loadMarketData, 600000); // 10분마다 지수 갱신
    return () => clearInterval(interval);
  }, [loadNews]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) loadNews(searchQuery);
  };

  const handleShowInsight = async (topic: string) => {
    setInsightModal({ isOpen: true, topic, content: '', loading: true });
    try {
      const insight = await getDeepInsight(topic);
      setInsightModal(prev => ({ ...prev, content: insight, loading: false }));
    } catch (err) {
      setInsightModal(prev => ({ ...prev, content: "보안상 이유로 분석이 중단되었습니다.", loading: false }));
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FB] font-sans text-slate-900 pb-20">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-600 p-1.5 rounded-xl shadow-lg shadow-blue-200">
              <Newspaper className="text-white" size={20} />
            </div>
            <h1 className="text-xl font-black tracking-tighter text-slate-800 uppercase">ECOPULSE</h1>
            <div className="hidden lg:flex items-center space-x-1.5 px-2.5 py-1 bg-emerald-50 border border-emerald-100 rounded-full">
              <Lock size={10} className="text-emerald-500" />
              <span className="text-[10px] font-black text-emerald-600 uppercase tracking-tighter">Secure Tier</span>
            </div>
          </div>
          
          <div className="hidden md:flex items-center space-x-1 p-1 bg-slate-100 rounded-xl">
            {['domestic', 'overseas'].map((r) => (
              <button
                key={r}
                onClick={() => setRegion(r as any)}
                className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${region === r ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                {r === 'domestic' ? '국내 경제' : '해외 경제'}
              </button>
            ))}
          </div>

          <button 
            onClick={() => { loadNews(); loadMarketData(); }} 
            disabled={loading}
            className="p-2.5 bg-slate-50 text-slate-400 hover:text-blue-600 rounded-xl border border-slate-200 transition-all active:scale-95"
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
        <MarketTickers indices={indices} loading={indicesLoading} />
      </header>

      <main className="max-w-6xl mx-auto px-4 pt-6">
        <div className="flex items-center space-x-2 overflow-x-auto pb-4 mb-6 no-scrollbar">
          {SECTORS.map((sector) => (
            <button
              key={sector.id}
              onClick={() => setActiveSector(sector.id)}
              className={`flex items-center space-x-2 px-5 py-2.5 rounded-2xl whitespace-nowrap font-bold text-sm transition-all border ${
                activeSector === sector.id 
                  ? 'bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-100' 
                  : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
              }`}
            >
              {sector.icon}
              <span>{sector.name}</span>
            </button>
          ))}
        </div>

        {error && (
          <div className={`mb-6 p-4 rounded-2xl flex items-center justify-between animate-in slide-in-from-top-4 duration-300 ${error.isRateLimit ? 'bg-amber-50 text-amber-800 border border-amber-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
            <div className="flex items-center space-x-3">
              <AlertCircle size={20} />
              <p className="text-sm font-bold">{error.message}</p>
            </div>
            <div className="flex items-center space-x-1 px-2 py-0.5 bg-white/50 rounded-lg text-[10px] font-black uppercase">
              <ShieldCheck size={12} />
              <span>Verified</span>
            </div>
          </div>
        )}

        <div className="mb-10 max-w-3xl mx-auto">
          <form onSubmit={handleSearch} className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={20} />
            <input
              type="text"
              placeholder={`${SECTORS.find(s => s.id === activeSector)?.name} 검색... (AI 필터 적용됨)`}
              className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-3xl focus:ring-4 focus:ring-blue-50 shadow-sm transition-all outline-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>
        </div>

        <div className="flex items-end justify-between mb-8">
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
              <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Global Grounding Active</span>
            </div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">
              {region === 'domestic' ? '대한민국' : '해외'} 주요 뉴스
            </h2>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-[32px] p-8 border border-slate-100 h-64 animate-pulse">
                <div className="flex justify-between mb-6">
                  <div className="h-4 w-20 bg-slate-50 rounded-full"></div>
                  <div className="h-4 w-12 bg-slate-50 rounded-full"></div>
                </div>
                <div className="h-6 w-full bg-slate-50 rounded-lg mb-4"></div>
                <div className="h-4 w-2/3 bg-slate-50 rounded-lg"></div>
              </div>
            ))}
          </div>
        ) : news.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {news.map((article) => (
              <NewsCard key={article.id} article={article} onShowInsight={handleShowInsight} />
            ))}
          </div>
        ) : (
          <div className="text-center py-24 bg-white rounded-[48px] border border-slate-100 shadow-sm">
            <LayoutGrid size={48} className="mx-auto text-slate-200 mb-4" />
            <p className="text-slate-400 font-bold">안전한 채널을 통해 데이터를 검색 중입니다.</p>
            <button onClick={() => loadNews()} className="mt-4 text-blue-600 font-black hover:underline">재연결 시도</button>
          </div>
        )}
      </main>

      <InsightModal 
        isOpen={insightModal.isOpen} 
        onClose={() => setInsightModal(prev => ({ ...prev, isOpen: false }))}
        topic={insightModal.topic}
        insight={insightModal.content}
        loading={insightModal.loading}
      />
    </div>
  );
}

export default App;
