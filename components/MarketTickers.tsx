
import React from 'react';
import { MarketIndex } from '../types';
import { TrendingUp, TrendingDown, Minus, RefreshCw } from 'lucide-react';

interface MarketTickersProps {
  indices: MarketIndex[];
  loading: boolean;
}

const MarketTickers: React.FC<MarketTickersProps> = ({ indices, loading }) => {
  if (loading && indices.length === 0) {
    return (
      <div className="bg-white border-b py-2 px-4 flex items-center justify-center space-x-2 text-slate-400">
        <RefreshCw size={14} className="animate-spin" />
        <span className="text-xs font-bold">실시간 시장 지수 로딩 중...</span>
      </div>
    );
  }

  return (
    <div className="bg-white border-b overflow-hidden whitespace-nowrap py-2 sticky top-0 z-40">
      <div className="flex animate-marquee space-x-12 px-4">
        {[...indices, ...indices].map((index, i) => (
          <div key={i} className="flex items-center space-x-3 min-w-max">
            <span className="font-bold text-slate-500 text-[11px] uppercase tracking-tighter">{index.name}</span>
            <span className="font-black text-slate-900 text-sm">{index.value}</span>
            <span className={`flex items-center text-[11px] font-black ${index.trend === 'up' ? 'text-rose-500' : index.trend === 'down' ? 'text-blue-500' : 'text-slate-400'}`}>
              {index.trend === 'up' ? <TrendingUp size={12} className="mr-0.5" /> : index.trend === 'down' ? <TrendingDown size={12} className="mr-0.5" /> : <Minus size={12} className="mr-0.5" />}
              {index.change} ({index.changePercent})
            </span>
          </div>
        ))}
      </div>
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          display: flex;
          animation: marquee 40s linear infinite;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
};

export default MarketTickers;
