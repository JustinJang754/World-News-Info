
import React from 'react';
import { X, Sparkles, Loader2 } from 'lucide-react';

interface InsightModalProps {
  isOpen: boolean;
  onClose: () => void;
  topic: string;
  insight: string;
  loading: boolean;
}

const InsightModal: React.FC<InsightModalProps> = ({ isOpen, onClose, topic, insight, loading }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-2">
            <div className="bg-blue-100 p-2 rounded-lg">
              <Sparkles className="text-blue-600" size={20} />
            </div>
            <h2 className="text-xl font-bold text-gray-900">AI 심층 분석</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>
        
        <div className="p-8 overflow-y-auto">
          <div className="mb-6">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">분석 주제</span>
            <h3 className="text-2xl font-bold text-gray-900 mt-1">{topic}</h3>
          </div>
          
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
              <Loader2 className="animate-spin text-blue-600" size={40} />
              <p className="text-gray-500 animate-pulse">Gemini AI가 경제 데이터를 분석 중입니다...</p>
            </div>
          ) : (
            <div className="prose prose-blue max-w-none text-gray-700 leading-relaxed whitespace-pre-wrap">
              {insight}
            </div>
          )}
        </div>
        
        <div className="p-6 border-t bg-gray-50 text-center">
          <p className="text-xs text-gray-400">
            * 이 분석은 Gemini AI에 의해 생성되었으며, 투자 권유가 아닙니다. 모든 투자 판단의 책임은 본인에게 있습니다.
          </p>
        </div>
      </div>
    </div>
  );
};

export default InsightModal;
