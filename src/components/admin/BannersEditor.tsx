import React, { useState, useEffect } from 'react';
import { Plus, Trash2, ChevronUp, ChevronDown, Eye, ImageIcon } from 'lucide-react';

export interface Banner {
  id: number;
  title: string;
  subtitle: string;
  gradient: string;
  link?: string;
  imageUrl?: string;
  active: boolean;
}

const BANNERS_KEY = 'lumu_admin_banners';

const DEFAULT_BANNERS: Banner[] = [
  { id: 1, title: '\u041d\u043e\u0432\u0430 \u043a\u043e\u043b\u0435\u043a\u0446\u0456\u044f \u043a\u043d\u0438\u0433', subtitle: '\u041f\u0456\u0437\u043d\u0430\u0432\u0430\u043b\u044c\u043d\u0456 \u043a\u043d\u0438\u0433\u0438 \u0434\u043b\u044f \u0434\u0456\u0442\u0435\u0439 \u0432\u0456\u0434 3 \u0440\u043e\u043a\u0456\u0432', gradient: 'linear-gradient(135deg, hsl(340, 75%, 60%) 0%, hsl(20, 85%, 65%) 100%)', active: true },
  { id: 2, title: '\u0406\u0433\u0440\u0430\u0448\u043a\u0438 \u0437\u0456 \u0437\u043d\u0438\u0436\u043a\u043e\u044e', subtitle: '\u0414\u043e -30% \u043d\u0430 \u043e\u0431\u0440\u0430\u043d\u0456 \u0442\u043e\u0432\u0430\u0440\u0438', gradient: 'linear-gradient(135deg, hsl(230, 70%, 55%) 0%, hsl(270, 65%, 70%) 100%)', active: true },
];

function loadBanners(): Banner[] {
  try {
    const s = localStorage.getItem(BANNERS_KEY);
    if (s) {
      const data = JSON.parse(s);
      if (Array.isArray(data) && data.length > 0) return data;
    }
  } catch {}
  return DEFAULT_BANNERS;
}

function saveBanners(banners: Banner[]) {
  localStorage.setItem(BANNERS_KEY, JSON.stringify(banners));
}

export function BannersEditor() {
  const [banners, setBanners] = useState<Banner[]>(loadBanners);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => { saveBanners(banners); }, [banners]);

  const addBanner = () => {
    const maxId = banners.reduce((m, b) => Math.max(m, b.id), 0);
    const newBanner: Banner = {
      id: maxId + 1,
      title: '\u041d\u043e\u0432\u0438\u0439 \u0431\u0430\u043d\u0435\u0440',
      subtitle: '\u041e\u043f\u0438\u0441 \u0431\u0430\u043d\u0435\u0440\u0430',
      gradient: 'linear-gradient(135deg, hsl(200, 70%, 55%) 0%, hsl(250, 65%, 65%) 100%)',
      active: true,
    };
    setBanners(prev => [...prev, newBanner]);
    setEditingId(newBanner.id);
  };

  const updateBanner = (id: number, updates: Partial<Banner>) => {
    setBanners(prev => prev.map(b => b.id === id ? { ...b, ...updates } : b));
  };

  const deleteBanner = (id: number) => {
    if (confirm('\u0412\u0438\u0434\u0430\u043b\u0438\u0442\u0438 \u0431\u0430\u043d\u0435\u0440?')) {
      setBanners(prev => prev.filter(b => b.id !== id));
      if (editingId === id) setEditingId(null);
    }
  };

  const moveUp = (idx: number) => {
    if (idx <= 0) return;
    setBanners(prev => {
      const next = [...prev];
      [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
      return next;
    });
  };

  const moveDown = (idx: number) => {
    if (idx >= banners.length - 1) return;
    setBanners(prev => {
      const next = [...prev];
      [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]];
      return next;
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900">{'\u0411\u0430\u043d\u0435\u0440\u0438 \u043d\u0430 \u0433\u043e\u043b\u043e\u0432\u043d\u0456\u0439'}</h2>
          <p className="text-sm text-gray-500">{'\u041d\u0430\u043b\u0430\u0448\u0442\u0443\u0439\u0442\u0435 \u0441\u043b\u0430\u0439\u0434\u0435\u0440 \u043d\u0430 \u0433\u043e\u043b\u043e\u0432\u043d\u0456\u0439 \u0441\u0442\u043e\u0440\u0456\u043d\u0446\u0456'}</p>
        </div>
        <button onClick={addBanner} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-black text-white text-sm font-bold hover:bg-gray-800">
          <Plus className="w-4 h-4" />
          {'\u0414\u043e\u0434\u0430\u0442\u0438'}
        </button>
      </div>

      {banners.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <ImageIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p className="text-sm">{'\u0411\u0430\u043d\u0435\u0440\u0456\u0432 \u043d\u0435\u043c\u0430\u0454'}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {banners.map((banner, idx) => (
            <div key={banner.id} className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
              <div className="flex items-stretch">
                <div
                  className="w-48 shrink-0 relative"
                  style={{ background: banner.gradient, minHeight: '100px' }}
                >
                  {banner.imageUrl && (
                    <img src={banner.imageUrl} alt="" className="absolute inset-0 w-full h-full object-cover" />
                  )}
                  <div className="absolute inset-0 flex items-end p-3">
                    {!banner.active && (
                      <span className="px-2 py-0.5 rounded-full bg-black/50 text-white text-xs font-bold">{'\u041d\u0435\u0430\u043a\u0442\u0438\u0432\u043d\u0438\u0439'}</span>
                    )}
                  </div>
                </div>
                <div className="flex-1 p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-900">{banner.title}</h3>
                      <p className="text-sm text-gray-500 mt-0.5">{banner.subtitle}</p>
                      {banner.link && <p className="text-xs text-violet-600 mt-1">{banner.link}</p>}
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button onClick={() => moveUp(idx)} disabled={idx === 0} className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30"><ChevronUp className="w-4 h-4" /></button>
                      <button onClick={() => moveDown(idx)} disabled={idx === banners.length - 1} className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30"><ChevronDown className="w-4 h-4" /></button>
                      <button onClick={() => setEditingId(editingId === banner.id ? null : banner.id)} className="p-1.5 rounded-lg hover:bg-gray-100"><Eye className="w-4 h-4" /></button>
                      <button onClick={() => deleteBanner(banner.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>

                  {editingId === banner.id && (
                    <div className="mt-4 space-y-3 border-t border-gray-100 pt-4">
                      <div>
                        <label className="text-xs font-bold text-gray-500 uppercase">{'\u0417\u0430\u0433\u043e\u043b\u043e\u0432\u043e\u043a'}</label>
                        <input value={banner.title} onChange={e => updateBanner(banner.id, { title: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm mt-1 focus:outline-none focus:ring-2 focus:ring-violet-500" />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-gray-500 uppercase">{'\u041f\u0456\u0434\u0437\u0430\u0433\u043e\u043b\u043e\u0432\u043e\u043a'}</label>
                        <input value={banner.subtitle} onChange={e => updateBanner(banner.id, { subtitle: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm mt-1 focus:outline-none focus:ring-2 focus:ring-violet-500" />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-gray-500 uppercase">{'\u0413\u0440\u0430\u0434\u0456\u0454\u043d\u0442'}</label>
                        <input value={banner.gradient} onChange={e => updateBanner(banner.id, { gradient: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm mt-1 focus:outline-none focus:ring-2 focus:ring-violet-500" placeholder="linear-gradient(135deg, ...)" />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-gray-500 uppercase">{'\u041f\u043e\u0441\u0438\u043b\u0430\u043d\u043d\u044f'}</label>
                        <input value={banner.link || ''} onChange={e => updateBanner(banner.id, { link: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm mt-1 focus:outline-none focus:ring-2 focus:ring-violet-500" placeholder="/category/books" />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-gray-500 uppercase">{'\u0417\u043e\u0431\u0440\u0430\u0436\u0435\u043d\u043d\u044f (URL)'}</label>
                        <input value={banner.imageUrl || ''} onChange={e => updateBanner(banner.id, { imageUrl: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm mt-1 focus:outline-none focus:ring-2 focus:ring-violet-500" placeholder="https://..." />
                      </div>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={banner.active} onChange={e => updateBanner(banner.id, { active: e.target.checked })} className="rounded" />
                        <span className="text-sm text-gray-700">{'\u0410\u043a\u0442\u0438\u0432\u043d\u0438\u0439'}</span>
                      </label>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
