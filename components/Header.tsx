
import React from 'react';

interface HeaderProps {
  onGoHome: () => void;
  onGoHistory: () => void;
  currentView: 'form' | 'result' | 'history';
  historyCount: number;
  maxHistory: number;
}

export const Header: React.FC<HeaderProps> = ({ onGoHome, onGoHistory, currentView, historyCount, maxHistory }) => {
  const isFull = historyCount >= maxHistory;

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm backdrop-blur-md bg-white/90">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <button 
          onClick={onGoHome}
          className="flex items-center gap-3 hover:opacity-80 transition-all active:scale-95"
        >
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 w-10 h-10 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
            <i className="fas fa-bolt text-white text-xl"></i>
          </div>
          <div className="text-left">
            <h1 className="text-lg font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 leading-none">
              AmzGenius AI
            </h1>
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Global Pro v2.6</span>
          </div>
        </button>
        
        <nav className="flex items-center gap-3 md:gap-6">
          <button 
            onClick={onGoHome}
            className={`text-xs font-black px-3 py-2 rounded-lg transition-all ${currentView === 'form' ? 'bg-blue-50 text-blue-600' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            新生成
          </button>
          <button 
            onClick={onGoHistory}
            className={`relative text-xs font-black px-3 py-2 rounded-lg transition-all ${currentView === 'history' ? 'bg-blue-50 text-blue-600' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            历史库
            {historyCount > 0 && (
              <span className={`absolute -top-1 -right-1 text-[8px] px-1.5 py-0.5 rounded-full text-white font-black shadow-sm ${isFull ? 'bg-amber-500 animate-pulse' : 'bg-slate-800'}`}>
                {historyCount}
              </span>
            )}
          </button>
        </nav>
      </div>
    </header>
  );
};
