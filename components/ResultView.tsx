
import React, { useState, useRef } from 'react';
import { GenerationResult, ProductInput } from '../types';
import html2canvas from 'html2canvas';

interface ResultViewProps {
  result: GenerationResult;
  input: ProductInput;
  onReset: () => void;
  onEdit: () => void;
}

export const ResultView: React.FC<ResultViewProps> = ({ result, input, onReset, onEdit }) => {
  const [activeTab, setActiveTab] = useState<'listing' | 'visual' | 'ads'>('listing');
  const [isCapturing, setIsCapturing] = useState(false);

  const visualRef = useRef<HTMLDivElement>(null);
  const adsRef = useRef<HTMLDivElement>(null);

  const copyToClipboard = (text: string, label: string = "内容") => {
    navigator.clipboard.writeText(text);
    alert(`${label}已复制到剪贴板！`);
  };

  const captureScreenshot = async (ref: React.RefObject<HTMLDivElement | null>, fileName: string) => {
    if (!ref.current) return;
    setIsCapturing(true);
    try {
      await new Promise(r => setTimeout(r, 200));
      const canvas = await html2canvas(ref.current, {
        useCORS: true,
        backgroundColor: '#f8fafc',
        scale: 2,
        logging: false,
      });
      const dataUrl = canvas.toDataURL("image/png");
      const link = document.createElement('a');
      link.download = `${fileName}_${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Screenshot failed:", err);
      alert("截图生成失败，请重试。");
    } finally {
      setIsCapturing(false);
    }
  };

  const visual = result.listing?.visualAssets;

  const renderVisualAssets = () => {
    if (!visual) return <div className="p-20 text-center">无法加载视觉资产数据</div>;

    return (
      <div className="space-y-12 pb-12" ref={visualRef}>
        <div className="flex justify-between items-center mb-4 sticky top-0 bg-slate-50 py-4 z-10 border-b border-slate-200">
           <h2 className="text-2xl font-black text-slate-800">视觉资产全套策划报告</h2>
           <button 
             disabled={isCapturing}
             onClick={() => captureScreenshot(visualRef, 'Visual_Assets_Report')}
             className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl text-xs font-black hover:bg-indigo-700 transition-all shadow-lg flex items-center gap-2"
           >
             <i className={`fas ${isCapturing ? 'fa-spinner fa-spin' : 'fa-camera'}`}></i>
             {isCapturing ? '正在生成长图...' : '一键截图视觉资产全内容'}
           </button>
        </div>

        {/* 主图策略 */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
              <i className="fas fa-camera text-xl"></i>
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-800 tracking-tight">主图策略 (Main Image)</h3>
              <p className="text-xs text-slate-400 font-bold uppercase">White Background Optimization</p>
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase mb-1">策划核心</p>
                <p className="text-sm text-slate-700 font-medium">{visual.mainImage.rationale}</p>
              </div>
              <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100">
                <p className="text-[10px] font-black text-blue-600 uppercase mb-1">场景描述</p>
                <p className="text-sm text-slate-800 leading-relaxed italic">{visual.mainImage.exampleDescription}</p>
              </div>
            </div>
            <div className="bg-slate-900 rounded-2xl p-6 relative">
               <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest block mb-4">AI Image Prompt</span>
               <p className="text-xs text-slate-300 font-mono leading-relaxed">{visual.mainImage.generationPrompt}</p>
               <button 
                 onClick={() => copyToClipboard(visual.mainImage.generationPrompt, "主图AI指令")}
                 className="mt-4 text-[10px] font-black text-white bg-blue-600 px-3 py-1.5 rounded-lg hover:bg-blue-500 transition-all"
               >
                 复制指令
               </button>
            </div>
          </div>
        </div>

        {/* 附图建议 */}
        <div className="space-y-6">
          <h3 className="text-lg font-black text-slate-800 px-2">产品附图方案 (Secondary Images)</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {visual.secondaryImages.map((img, i) => (
              <div key={i} className="bg-white p-6 rounded-3xl border border-slate-200 flex flex-col group">
                <div className="flex items-center gap-2 mb-4">
                  <span className="w-6 h-6 rounded-lg bg-indigo-600 text-white text-[10px] font-black flex items-center justify-center">{i+1}</span>
                  <span className="text-[10px] font-black text-indigo-600 uppercase">{img.title}</span>
                </div>
                <p className="text-xs font-black text-slate-800 mb-2">{img.keySellingPoint}</p>
                <p className="text-[11px] text-slate-500 leading-relaxed mb-6 flex-grow">{img.visualExample}</p>
                <div className="mt-auto bg-slate-900 p-4 rounded-2xl">
                   <button onClick={() => copyToClipboard(img.generationPrompt, `附图${i+1}指令`)} className="text-[9px] font-black text-indigo-400 uppercase mb-2 block hover:text-white transition-colors">COPY PROMPT</button>
                   <p className="text-[9px] text-slate-500 font-mono line-clamp-2">{img.generationPrompt}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 视频脚本部分 */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-rose-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
              <i className="fas fa-video text-xl"></i>
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-800 tracking-tight">视频脚本策划 (Product Video Script)</h3>
              <p className="text-xs text-slate-400 font-bold uppercase">15-30s Short-form Content</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-rose-50 p-6 rounded-2xl border border-rose-100">
                <h4 className="text-[10px] font-black text-rose-600 uppercase mb-3 tracking-widest">视频基调 (Tone)</h4>
                <p className="text-sm font-bold text-slate-800">{visual.productVideo?.tone || "活力、高质感、动感"}</p>
              </div>
              <div className="bg-slate-900 p-6 rounded-2xl">
                <h4 className="text-[10px] font-black text-rose-400 uppercase mb-3 tracking-widest">脚本大纲 (Outline)</h4>
                <p className="text-xs text-slate-300 leading-relaxed">{visual.productVideo?.scriptOutline}</p>
                <button 
                  onClick={() => copyToClipboard(visual.productVideo?.scriptOutline || "", "视频脚本")}
                  className="mt-4 text-[10px] font-black text-white bg-rose-600 px-3 py-1.5 rounded-lg hover:bg-rose-500 transition-all"
                >
                  复制脚本大纲
                </button>
              </div>
            </div>
            
            <div className="lg:col-span-2">
              <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200 h-full">
                <h4 className="text-[10px] font-black text-slate-400 uppercase mb-6 tracking-widest">关键分镜 (Key Scenes)</h4>
                <div className="space-y-4">
                  {(visual.productVideo?.keyScenes || []).map((scene, idx) => (
                    <div key={idx} className="flex gap-4 items-start bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                      <span className="w-6 h-6 rounded-full bg-slate-800 text-white text-[10px] font-black flex items-center justify-center shrink-0">SCENE {idx+1}</span>
                      <p className="text-xs text-slate-700 leading-relaxed font-medium">{scene}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* A+ 页面建议 */}
        <div className="bg-slate-100 p-8 rounded-3xl border border-slate-200">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-slate-800 rounded-2xl flex items-center justify-center text-white shadow-lg">
              <i className="fas fa-layer-group text-xl"></i>
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-800 tracking-tight">A+ 页面模块策划 (EBC/A+ Strategy)</h3>
              <p className="text-xs text-slate-400 font-bold uppercase">Visual Storytelling Layout</p>
            </div>
          </div>
          
          <div className="space-y-6">
             <div className="bg-white p-6 rounded-2xl border border-slate-200">
               <h4 className="text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">布局逻辑 (Strategy)</h4>
               <p className="text-sm font-bold text-slate-800">{visual.aPlusContent?.layoutStrategy}</p>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
               {(visual.aPlusContent?.modules || []).map((mod, idx) => (
                 <div key={idx} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col">
                   <span className="text-[9px] font-black text-slate-400 uppercase mb-2">Module {idx+1}: {mod.type}</span>
                   <p className="text-xs font-bold text-slate-800 mb-2">{mod.designGoal}</p>
                   <p className="text-[10px] text-slate-500 leading-relaxed">{mod.content}</p>
                 </div>
               ))}
             </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <button onClick={onReset} className="text-slate-500 hover:text-slate-800 flex items-center gap-2 font-medium transition-colors">
          <i className="fas fa-arrow-left"></i> 返回首页
        </button>
        <div className="flex bg-slate-200 p-1 rounded-2xl shadow-inner">
          {['listing', 'visual', 'ads'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-6 py-2 rounded-xl text-xs font-black transition-all ${activeTab === tab ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600'}`}
            >
              {tab === 'listing' ? 'Listing 文案' : tab === 'visual' ? '视觉资产 (视频/附图)' : '广告执行计划'}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'listing' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* 标题部分 */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
              <h3 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-3">
                <i className="fas fa-heading text-blue-500"></i> Amazon Listing Titles
              </h3>
              <div className="space-y-6">
                <div>
                   <p className="text-[10px] font-black text-blue-600 uppercase mb-2">Main Title (主标题)</p>
                   <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl font-bold text-slate-800 text-sm flex justify-between items-center group">
                      <span>{result.listing.mainTitle}</span>
                      <button onClick={() => copyToClipboard(result.listing.mainTitle, "主标题")} className="text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity">
                        <i className="far fa-copy"></i>
                      </button>
                   </div>
                </div>
                <div>
                   <p className="text-[10px] font-black text-slate-400 uppercase mb-2">Alternative Titles (3个副标题)</p>
                   <div className="space-y-3">
                      {(result.listing.altTitles || []).map((alt, idx) => (
                        <div key={idx} className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs text-slate-600 flex justify-between items-center group">
                           <span>{alt}</span>
                           <button onClick={() => copyToClipboard(alt, `副标题${idx+1}`)} className="text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity">
                             <i className="far fa-copy"></i>
                           </button>
                        </div>
                      ))}
                   </div>
                </div>
              </div>
            </div>

            {/* 五点描述部分 */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-black text-slate-800 flex items-center gap-3">
                  <i className="fas fa-list-ol text-blue-500"></i> Bullet Points
                </h3>
                <button 
                  onClick={() => copyToClipboard((result.listing.bulletPoints || []).join('\n'), "全部五点")}
                  className="text-xs font-black text-blue-600 flex items-center gap-1 hover:underline"
                >
                  <i className="fas fa-copy"></i> 一键复制全部
                </button>
              </div>
              <div className="space-y-4">
                {(result.listing.bulletPoints || []).map((bullet, idx) => (
                  <div key={idx} className="flex gap-4 items-start group relative">
                    <div className="w-6 h-6 rounded bg-slate-100 text-slate-400 flex items-center justify-center text-[10px] font-black shrink-0">{idx + 1}</div>
                    <p className="text-slate-700 text-sm leading-relaxed">{bullet}</p>
                    <button onClick={() => copyToClipboard(bullet, `五点${idx+1}`)} className="absolute right-0 top-0 text-slate-200 hover:text-blue-500 transition-colors opacity-0 group-hover:opacity-100">
                      <i className="far fa-copy"></i>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* 产品描述部分 (HTML) */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-black text-slate-800 flex items-center gap-3">
                  <i className="fas fa-code text-blue-500"></i> Product Description (HTML)
                </h3>
                <button onClick={() => copyToClipboard(result.listing.description, "HTML描述")} className="bg-slate-800 text-white px-4 py-2 rounded-lg text-xs font-black hover:bg-black transition-all">
                  复制源代码
                </button>
              </div>
              <div className="space-y-6">
                <div className="bg-slate-900 rounded-2xl p-6 overflow-x-auto">
                   <pre className="text-[10px] text-green-400 font-mono whitespace-pre-wrap leading-relaxed">
                     {result.listing.description}
                   </pre>
                </div>
                <div className="p-8 border border-slate-100 rounded-3xl bg-slate-50 relative">
                   <span className="absolute -top-3 left-6 bg-white px-3 py-1 border border-slate-100 rounded-full text-[9px] font-black text-slate-400 uppercase tracking-widest">渲染预览 (Preview)</span>
                   <div className="prose prose-sm max-w-none text-slate-700 description-preview" dangerouslySetInnerHTML={{ __html: result.listing.description }} />
                </div>
              </div>
            </div>
          </div>
          
          <div className="space-y-6">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 sticky top-24">
              <h3 className="text-xs font-black text-slate-400 mb-5 uppercase tracking-widest">Search Terms</h3>
              <div className="bg-slate-50 p-4 rounded-2xl text-xs font-mono text-slate-600 break-words border border-slate-100">
                {(result.listing.searchTerms || []).join(', ')}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'visual' && renderVisualAssets()}

      {activeTab === 'ads' && (
        <div className="space-y-12" ref={adsRef}>
          <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-200">
            <div className="flex justify-between items-center mb-12 sticky top-0 bg-white py-4 z-10 border-b border-slate-100">
              <h3 className="text-2xl font-black text-slate-800 flex items-center gap-4">
                <i className="fas fa-rocket text-indigo-500"></i> PPC Launch Roadmap
              </h3>
              <button 
                disabled={isCapturing}
                onClick={() => captureScreenshot(adsRef, 'PPC_Ad_Plan')}
                className="bg-slate-800 text-white px-6 py-2.5 rounded-xl text-xs font-black hover:bg-black transition-all shadow-lg flex items-center gap-2"
              >
                <i className={`fas ${isCapturing ? 'fa-spinner fa-spin' : 'fa-camera'}`}></i>
                {isCapturing ? '生成截图...' : '一键截图执行计划'}
              </button>
            </div>
            
            <div className="space-y-16">
              {(result.ads?.detailedRoadmap || []).map((step: any, idx: number) => (
                <div key={idx} className="relative pl-14 border-l-2 border-slate-100 last:border-0 pb-12">
                  <div className="absolute -left-[1.35rem] top-0 w-10 h-10 bg-white rounded-2xl border-2 border-indigo-600 shadow-xl flex items-center justify-center text-xs text-indigo-600 font-black">0{idx + 1}</div>
                  <div className="flex flex-col xl:flex-row gap-10">
                    <div className="xl:w-1/4">
                      <span className="inline-block px-4 py-1.5 bg-indigo-50 text-indigo-700 text-[10px] font-black rounded-full mb-3 uppercase">{step.dayRange}</span>
                      <h4 className="text-2xl font-black text-slate-800 tracking-tight">{step.phaseName}</h4>
                      <p className="text-sm text-slate-400 mt-3 font-medium">{step.objective}</p>
                    </div>
                    <div className="xl:w-3/4 space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-slate-50 p-5 rounded-2xl">
                          <p className="text-[10px] text-slate-400 uppercase font-black mb-2">Daily Budget</p>
                          <p className="text-lg font-black text-indigo-600">${step.dailyBudget}</p>
                        </div>
                        <div className="bg-slate-50 p-5 rounded-2xl">
                          <p className="text-[10px] text-slate-400 uppercase font-black mb-2">Targeting</p>
                          <p className="text-xs font-bold text-slate-700">{step.targetingFocus}</p>
                        </div>
                        <div className="bg-slate-50 p-5 rounded-2xl">
                          <p className="text-[10px] text-slate-400 uppercase font-black mb-2">Bidding</p>
                          <p className="text-xs font-bold text-slate-700">{step.biddingStrategy}</p>
                        </div>
                      </div>
                      <div className="bg-indigo-50/50 p-6 rounded-2xl border border-indigo-100">
                         <p className="text-sm text-slate-700 font-bold mb-4">"{step.contentInstruction}"</p>
                         <p className="text-xs text-slate-500 font-medium italic">Logic: {step.strategicLogic}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
