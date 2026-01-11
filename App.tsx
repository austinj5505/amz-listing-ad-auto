
import React, { useState, useEffect } from 'react';
import { Category, ProductInput, GenerationResult, SavedRecord } from './types';
import { generateAmazonContent } from './services/geminiService';
import { ProductForm } from './components/ProductForm';
import { ResultView } from './components/ResultView';
import { Header } from './components/Header';
import { LoadingSpinner } from './components/LoadingSpinner';
import { HistoryList } from './components/HistoryList';

const STORAGE_KEY = 'amz_genius_shareable_v1';
const MAX_HISTORY = 30;

const App: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [viewInput, setViewInput] = useState<ProductInput | null>(null);
  const [editingInput, setEditingInput] = useState<ProductInput | null>(null);
  const [history, setHistory] = useState<SavedRecord[]>([]);
  const [view, setView] = useState<'form' | 'result' | 'history'>('form');
  const [error, setError] = useState<string | null>(null);
  const [isApiKeyMissing, setIsApiKeyMissing] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error("History parse failed", e);
      }
    }
    checkApiKey();
  }, []);

  const checkApiKey = async () => {
    // @ts-ignore
    if (window.aistudio) {
      // @ts-ignore
      const hasKey = await window.aistudio.hasSelectedApiKey();
      setIsApiKeyMissing(!hasKey);
    }
  };

  const handleOpenKeySelector = async () => {
    // @ts-ignore
    if (window.aistudio) {
      // @ts-ignore
      await window.aistudio.openSelectKey();
      setIsApiKeyMissing(false);
      setError(null);
    }
  };

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  }, [history]);

  const handleGenerate = async (input: ProductInput) => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await generateAmazonContent(input);
      setResult(data);
      setViewInput(input);
      
      const newRecord: SavedRecord = {
        id: Date.now().toString(),
        timestamp: Date.now(),
        input,
        result: data
      };
      
      setHistory(prev => [newRecord, ...prev].slice(0, MAX_HISTORY));
      setView('result');
    } catch (err: any) {
      console.error("Detailed error:", err);
      const msg = err.message || "未知原因";
      
      if (msg.includes("404") || msg.includes("entity was not found")) {
        setIsApiKeyMissing(true);
        setError("API Key 验证失败。请使用您自己的 API Key 关联后重试。");
      } else if (msg.includes("SAFETY")) {
        setError("生成被安全系统拦截：内容可能涉及敏感词汇，请尝试修改产品描述后再试。");
      } else if (msg.includes("quota") || msg.includes("429")) {
        setError("API 配额已用尽，请稍后再试。");
      } else {
        setError(`生成失败：${msg}。建议检查网络连接或更换 API Key。`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setView('form');
    setResult(null);
    setEditingInput(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header 
        onGoHome={handleReset} 
        onGoHistory={() => setView('history')} 
        currentView={view}
        historyCount={history.length}
        maxHistory={MAX_HISTORY}
      />
      
      <main className="max-w-6xl mx-auto px-4 py-8 w-full flex-grow">
        {isApiKeyMissing && (
          <div className="mb-8 bg-gradient-to-br from-slate-900 to-slate-800 text-white p-8 rounded-[2.5rem] shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8 animate-fadeIn border border-white/10 ring-1 ring-white/5">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 bg-blue-600 rounded-3xl flex items-center justify-center shadow-lg shadow-blue-500/20 rotate-3 group-hover:rotate-0 transition-transform">
                <i className="fas fa-key text-2xl text-white"></i>
              </div>
              <div>
                <h3 className="text-xl font-black mb-1">准备好开始了吗？</h3>
                <p className="text-sm text-slate-400 font-medium max-w-md">
                  这是一个基于 AI 的亚马逊运营工具。为了保护您的隐私并免费使用，请点击右侧按钮关联您自己的 <span className="text-blue-400">Gemini API Key</span>。
                </p>
              </div>
            </div>
            <div className="flex flex-col items-center gap-3">
              <button 
                onClick={handleOpenKeySelector}
                className="bg-white text-slate-900 px-10 py-4 rounded-2xl font-black text-sm hover:scale-105 transition-all shadow-xl active:scale-95 whitespace-nowrap"
              >
                立刻关联 API Key
              </button>
              <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" className="text-[10px] font-black text-slate-500 hover:text-blue-400 underline uppercase tracking-widest">查看如何获取 Key</a>
            </div>
          </div>
        )}

        {error && !loading && (
          <div className="mb-8 bg-red-50 border border-red-200 p-6 rounded-3xl flex items-start gap-4 text-red-700 animate-fadeIn">
            <i className="fas fa-circle-exclamation text-xl mt-1"></i>
            <div>
              <p className="font-black">生成异常</p>
              <p className="text-sm opacity-80 font-medium">{error}</p>
            </div>
          </div>
        )}

        {view === 'form' && !loading && (
          <div className="bg-white rounded-[2.5rem] shadow-xl p-10 border border-slate-200 animate-fadeIn relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full blur-3xl -mr-32 -mt-32 opacity-50"></div>
            <div className="mb-10 relative">
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">
                {editingInput ? '🔧 正在调整参数' : '🚀 亚马逊美站新品上架专家'}
              </h2>
              <p className="text-slate-500 mt-2 font-medium">生成 SEO 优化的 Listing、6 张高转化附图策划和 PPC 广告策略。</p>
            </div>
            <ProductForm 
              onSubmit={handleGenerate} 
              initialData={editingInput || undefined} 
            />
          </div>
        )}

        {loading && (
          <div className="flex flex-col items-center justify-center py-32 space-y-10">
            <LoadingSpinner />
            <div className="text-center space-y-3">
              <p className="text-2xl font-black text-slate-800">Gemini 正在分析类目数据...</p>
              <div className="flex gap-2 justify-center">
                <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest animate-pulse">调研市场</span>
                <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-widest animate-pulse delay-75">生成文案</span>
                <span className="px-3 py-1 bg-slate-50 text-slate-600 rounded-full text-[10px] font-black uppercase tracking-widest animate-pulse delay-150">策划视觉</span>
              </div>
            </div>
          </div>
        )}

        {view === 'result' && result && viewInput && !loading && (
          <ResultView 
            result={result} 
            input={viewInput}
            onReset={handleReset} 
            onEdit={() => { setEditingInput(viewInput); setView('form'); }}
          />
        )}

        {view === 'history' && (
          <HistoryList 
            records={history} 
            maxHistory={MAX_HISTORY}
            onSelect={(r) => { setResult(r.result); setViewInput(r.input); setView('result'); }} 
            onEdit={(r) => { setEditingInput(r.input); setView('form'); }}
            onDelete={(id) => setHistory(prev => prev.filter(r => r.id !== id))}
            onClearAll={() => { if(confirm('确定清空？')) setHistory([]); setView('form'); }}
            onBack={handleReset}
          />
        )}
      </main>

      <footer className="py-12 border-t border-slate-200 bg-white text-center">
        <div className="flex flex-col items-center gap-4">
          <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em]">AmzGenius AI v2.6 • Powered by Google Gemini 3.0</p>
          <div className="flex gap-4 opacity-30 grayscale">
            <i className="fab fa-amazon text-xl"></i>
            <i className="fas fa-bolt text-xl"></i>
            <i className="fas fa-chart-line text-xl"></i>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
