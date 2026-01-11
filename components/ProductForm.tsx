
import React, { useState, useEffect } from 'react';
import { Category, ProductInput } from '../types';

interface ProductFormProps {
  onSubmit: (input: ProductInput) => void;
  initialData?: ProductInput;
}

export const ProductForm: React.FC<ProductFormProps> = ({ onSubmit, initialData }) => {
  const [formData, setFormData] = useState<ProductInput>(initialData || {
    name: '',
    category: Category.SWIMWEAR,
    material: '',
    features: '',
    style: '',
    targetAudience: '',
    imageFront: undefined,
    imageBack: undefined
  });

  const [previews, setPreviews] = useState<{ front: string | null; back: string | null }>({
    front: initialData?.imageFront || null,
    back: initialData?.imageBack || null
  });

  // 当外部传入的 initialData 变化时（比如从历史记录切换到新建），同步内部状态
  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
      setPreviews({
        front: initialData.imageFront || null,
        back: initialData.imageBack || null
      });
    } else {
      setFormData({
        name: '',
        category: Category.SWIMWEAR,
        material: '',
        features: '',
        style: '',
        targetAudience: '',
        imageFront: undefined,
        imageBack: undefined
      });
      setPreviews({ front: null, back: null });
    }
  }, [initialData]);

  const [draggingSlot, setDraggingSlot] = useState<'front' | 'back' | null>(null);

  const processFile = (file: File, slot: 'front' | 'back') => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setPreviews(prev => ({ ...prev, [slot]: base64 }));
        setFormData(prev => ({ 
          ...prev, 
          [slot === 'front' ? 'imageFront' : 'imageBack']: base64 
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e: React.DragEvent, slot: 'front' | 'back') => {
    e.preventDefault();
    e.stopPropagation();
    setDraggingSlot(slot);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDraggingSlot(null);
  };

  const handleDrop = (e: React.DragEvent, slot: 'front' | 'back') => {
    e.preventDefault();
    e.stopPropagation();
    setDraggingSlot(null);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file, slot);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const ImageUploadBox = ({ slot, label }: { slot: 'front' | 'back', label: string }) => (
    <div className="space-y-2 flex-1">
      <label className="text-sm font-semibold text-slate-700">{label}</label>
      <div 
        className={`relative border-2 border-dashed rounded-xl transition-all h-40 flex flex-col items-center justify-center gap-2 group cursor-pointer ${
          draggingSlot === slot 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-slate-300 hover:border-blue-400 bg-slate-50'
        }`}
        onDragOver={(e) => handleDragOver(e, slot)}
        onDragLeave={handleDragLeave}
        onDrop={(e) => handleDrop(e, slot)}
        onClick={() => document.getElementById(`upload-${slot}`)?.click()}
      >
        <input
          type="file"
          id={`upload-${slot}`}
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) processFile(file, slot);
          }}
          className="hidden"
        />
        
        {previews[slot] ? (
          <div className="relative w-full h-full p-2 flex items-center justify-center">
            <img src={previews[slot]!} alt={label} className="h-full rounded object-contain shadow-sm" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded-xl">
              <p className="text-white text-xs font-bold">点击或拖拽更换图片</p>
            </div>
          </div>
        ) : (
          <>
            <div className={`p-3 rounded-full ${draggingSlot === slot ? 'bg-blue-100 text-blue-600' : 'bg-slate-200 text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-500'} transition-colors`}>
              <i className={`fas ${draggingSlot === slot ? 'fa-arrow-down animate-bounce' : 'fa-camera text-xl'}`}></i>
            </div>
            <p className="text-[10px] md:text-xs font-medium text-slate-500 group-hover:text-blue-600 px-4 text-center">
              {draggingSlot === slot ? '释放图片' : `拖拽或点击上传${label}`}
            </p>
          </>
        )}
      </div>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700">产品名称 / 标题草稿</label>
          <input
            required
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            placeholder="例如：女士一体式连体泳衣"
            value={formData.name}
            onChange={e => setFormData({ ...formData, name: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700">所属类目</label>
          <select
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none appearance-none bg-white"
            value={formData.category}
            onChange={e => setFormData({ ...formData, category: e.target.value as Category })}
          >
            <option value={Category.SWIMWEAR}>Swimwear (泳衣)</option>
            <option value={Category.SPORTSWEAR}>Sportswear (运动类目)</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700">面料材质</label>
          <input
            required
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            placeholder="例如：82% 尼龙, 18% 氨纶"
            value={formData.material}
            onChange={e => setFormData({ ...formData, material: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700">风格设计</label>
          <input
            required
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            placeholder="例如：复古风格, 高开叉, 极简设计"
            value={formData.style}
            onChange={e => setFormData({ ...formData, style: e.target.value })}
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <label className="text-sm font-semibold text-slate-700">核心卖点 / 功能 (每行一个)</label>
          <textarea
            required
            rows={3}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            placeholder="腹部控制, 可调节肩带, 防紫外线..."
            value={formData.features}
            onChange={e => setFormData({ ...formData, features: e.target.value })}
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <label className="text-sm font-semibold text-slate-700">目标受众</label>
          <input
            required
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            placeholder="例如：25-45岁追求时尚的运动女性"
            value={formData.targetAudience}
            onChange={e => setFormData({ ...formData, targetAudience: e.target.value })}
          />
        </div>

        <div className="md:col-span-2 flex flex-col md:flex-row gap-6">
          <ImageUploadBox slot="front" label="产品正面图 (Front View)" />
          <ImageUploadBox slot="back" label="产品背面图 (Back View)" />
        </div>
      </div>

      <button
        type="submit"
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-3 transform active:scale-95"
      >
        <i className="fas fa-magic"></i>
        {initialData ? '确认修改并重新生成' : '立即生成亚马逊全套资产'}
      </button>
    </form>
  );
};
