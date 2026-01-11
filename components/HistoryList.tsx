
import React from 'react';
import { SavedRecord } from '../types';

interface HistoryListProps {
  records: SavedRecord[];
  maxHistory: number;
  onSelect: (record: SavedRecord) => void;
  onEdit: (record: SavedRecord) => void;
  onDelete: (id: string) => void;
  onClearAll: () => void;
  onBack: () => void;
}

export const HistoryList: React.FC<HistoryListProps> = ({ records, maxHistory, onSelect, onEdit, onDelete, onClearAll, onBack }) => {
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('zh-CN', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="w-10 h-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-slate-500 hover:text-blue-600 transition-colors shadow-sm">
            <i className="fas fa-arrow-left"></i>
          </button>
          <h2 className="text-2xl font-black text-slate-800">历史生成记录 <span className="text-slate-300 font-medium ml-2">{records.length}/{maxHistory}</span></h2>
        </div>
        {records.length > 0 && (
          <button onClick={onClearAll} className="text-xs font-black text-red-400 hover:text-red-600 transition-colors uppercase tracking-widest">
            清空所有记录
          </button>
        )}
      </div>

      {records.length === 0 ? (
        <div className="bg-white rounded-3xl border-2 border-dashed border-slate-200 p-24 text-center">
          <div className="w-20 h-20 bg-slate-50 text-slate-200 rounded-3xl flex items-center justify-center mx-auto mb-6 transform rotate-12">
            <i className="fas fa-folder-open text-3xl"></i>
          </div>
          <p className="text-slate-500 font-black text-xl mb-2">暂无历史记录</p>
          <p className="text-slate-400 text-sm mb-8 font-medium">您生成的每一份专业报告都会在此存档，支持随时回填修改。</p>
          <button onClick={onBack} className="bg-blue-600 text-white px-8 py-3 rounded-2xl font-black hover:bg-blue-700 transition-all shadow-xl shadow-blue-200">
            去生成第一份报告
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {records.map((record) => (
            <div key={record.id} className="group bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all flex flex-col overflow-hidden">
              <div className="p-6 flex-grow">
                <div className="flex justify-between items-start mb-4">
                  <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-lg uppercase">
                    {record.input.category}
                  </span>
                  <span className="text-[10px] text-slate-400 font-bold uppercase">
                    {formatDate(record.timestamp)}
                  </span>
                </div>
                
                <h3 className="font-black text-slate-800 line-clamp-2 mb-6 text-lg group-hover:text-blue-600 transition-colors leading-tight min-h-[3rem]">
                  {record.input.name}
                </h3>
                
                <div className="flex gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="w-16 h-16 rounded-xl bg-white overflow-hidden border border-slate-200 shadow-sm shrink-0 flex items-center justify-center">
                    {record.input.imageFront ? (
                      <img src={record.input.imageFront} alt="Product" className="w-full h-full object-contain" />
                    ) : (
                      <i className="fas fa-image text-slate-200"></i>
                    )}
                  </div>
                  <div className="flex-grow flex flex-col justify-center min-w-0">
                    <p className="text-xs font-black text-slate-700 truncate uppercase tracking-tighter">{record.input.material}</p>
                    <p className="text-[10px] text-slate-400 mt-1 truncate font-medium">Style: {record.input.style}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-slate-50 px-6 py-5 border-t border-slate-100 flex items-center gap-3">
                <button 
                  onClick={() => onSelect(record)}
                  className="flex-[2] text-xs font-black text-white bg-blue-600 py-3 rounded-xl hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-100"
                >
                  <i className="fas fa-eye"></i> 查看结果
                </button>
                <button 
                  onClick={() => onEdit(record)}
                  className="flex-[2] text-xs font-black text-slate-600 bg-white border border-slate-200 py-3 rounded-xl hover:bg-slate-100 transition-all flex items-center justify-center gap-2"
                >
                  <i className="fas fa-wrench"></i> 修改参数
                </button>
                <button 
                  onClick={() => onDelete(record.id)}
                  className="w-11 h-11 rounded-xl flex items-center justify-center text-slate-300 hover:bg-red-50 hover:text-red-500 transition-all"
                >
                  <i className="far fa-trash-alt"></i>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
