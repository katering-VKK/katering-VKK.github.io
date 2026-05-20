import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Instagram, Save, ExternalLink } from 'lucide-react';
import type { InstagramPost } from '../InstagramFeed';

const POSTS_KEY = 'lumu_instagram_posts';
const INSTAGRAM_URL = 'https://www.instagram.com/malyenkyi.vsesvit_/';

function loadPosts(): InstagramPost[] {
  try {
    const s = localStorage.getItem(POSTS_KEY);
    if (s) {
      const data = JSON.parse(s);
      if (Array.isArray(data) && data.length > 0) return data;
    }
  } catch {}
  return [];
}

function savePosts(posts: InstagramPost[]) {
  localStorage.setItem(POSTS_KEY, JSON.stringify(posts));
}

export function InstagramManager() {
  const [posts, setPosts] = useState<InstagramPost[]>(loadPosts);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    savePosts(posts);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const addPost = () => {
    const id = Date.now().toString(36);
    setPosts(prev => [...prev, {
      id,
      imageUrl: '',
      caption: '\u041d\u043e\u0432\u0438\u0439 \u043f\u043e\u0441\u0442',
      link: INSTAGRAM_URL,
      likes: 0,
      comments: 0,
    }]);
  };

  const updatePost = (id: string, updates: Partial<InstagramPost>) => {
    setPosts(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  const deletePost = (id: string) => {
    if (confirm('\u0412\u0438\u0434\u0430\u043b\u0438\u0442\u0438 \u043f\u043e\u0441\u0442?')) {
      setPosts(prev => prev.filter(p => p.id !== id));
    }
  };

  const handleImageFile = async (postId: string, file: File) => {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      updatePost(postId, { imageUrl: dataUrl });
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Instagram className="w-5 h-5 text-purple-600" />
            Instagram \u043f\u043e\u0441\u0442\u0438
          </h2>
          <p className="text-sm text-gray-500">{'\u0423\u043f\u0440\u0430\u0432\u043b\u0456\u043d\u043d\u044f \u043f\u043e\u0441\u0442\u0430\u043c\u0438 \u043d\u0430 \u0433\u043e\u043b\u043e\u0432\u043d\u0456\u0439 \u0441\u0442\u043e\u0440\u0456\u043d\u0446\u0456. \u041f\u0435\u0440\u0448\u0456 6 \u043f\u043e\u0441\u0442\u0456\u0432 \u0432\u0456\u0434\u043e\u0431\u0440\u0430\u0436\u0430\u044e\u0442\u044c\u0441\u044f \u043d\u0430 \u0441\u0430\u0439\u0442\u0456.'}</p>
        </div>
        <div className="flex items-center gap-2">
          <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm text-gray-500 hover:text-black border border-gray-200 hover:bg-gray-50">
            <ExternalLink className="w-4 h-4" />
            Instagram
          </a>
          <button onClick={addPost} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 text-white text-sm font-bold hover:bg-purple-700">
            <Plus className="w-4 h-4" />
            {'\u0414\u043e\u0434\u0430\u0442\u0438'}
          </button>
          <button onClick={handleSave} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-black text-white text-sm font-bold hover:bg-gray-800">
            <Save className="w-4 h-4" />
            {saved ? '\u0417\u0431\u0435\u0440\u0435\u0436\u0435\u043d\u043e!' : '\u0417\u0431\u0435\u0440\u0435\u0433\u0442\u0438'}
          </button>
        </div>
      </div>

      {posts.length === 0 ? (
        <div className="text-center py-12 text-gray-400 rounded-2xl border-2 border-dashed border-gray-200">
          <Instagram className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p className="text-sm">{'\u041f\u043e\u0441\u0442\u0456\u0432 \u043d\u0435\u043c\u0430\u0454. \u0414\u043e\u0434\u0430\u0439\u0442\u0435 \u043f\u0435\u0440\u0448\u0438\u0439 \u043f\u043e\u0441\u0442!'}</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post, idx) => (
            <div key={post.id} className={`rounded-2xl border bg-white shadow-sm overflow-hidden ${idx < 6 ? 'border-purple-200' : 'border-gray-200 opacity-60'}`}>
              <div className="aspect-square relative bg-gradient-to-br from-purple-100 to-pink-100">
                {post.imageUrl ? (
                  <img src={post.imageUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Instagram className="w-10 h-10 text-purple-300" />
                  </div>
                )}
                {idx < 6 && (
                  <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-purple-600 text-white text-xs font-bold">#{idx + 1}</span>
                )}
                <button onClick={() => deletePost(post.id)} className="absolute top-2 right-2 p-1.5 rounded-lg bg-red-500 text-white hover:bg-red-600">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="p-3 space-y-2">
                <div>
                  <label className="text-xs font-bold text-gray-500">{'\u0417\u043e\u0431\u0440\u0430\u0436\u0435\u043d\u043d\u044f'}</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={e => { const f = e.target.files?.[0]; if (f) handleImageFile(post.id, f); e.target.value = ''; }}
                    className="w-full text-xs mt-0.5"
                  />
                  <input
                    value={post.imageUrl || ''}
                    onChange={e => updatePost(post.id, { imageUrl: e.target.value })}
                    placeholder="URL \u0430\u0431\u043e data URL"
                    className="w-full px-2 py-1.5 rounded-lg border border-gray-200 text-xs mt-1 focus:outline-none focus:ring-1 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500">{'\u041f\u0456\u0434\u043f\u0438\u0441'}</label>
                  <input
                    value={post.caption}
                    onChange={e => updatePost(post.id, { caption: e.target.value })}
                    className="w-full px-2 py-1.5 rounded-lg border border-gray-200 text-xs mt-0.5 focus:outline-none focus:ring-1 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500">{'\u041f\u043e\u0441\u0438\u043b\u0430\u043d\u043d\u044f'}</label>
                  <input
                    value={post.link || ''}
                    onChange={e => updatePost(post.id, { link: e.target.value })}
                    placeholder={INSTAGRAM_URL}
                    className="w-full px-2 py-1.5 rounded-lg border border-gray-200 text-xs mt-0.5 focus:outline-none focus:ring-1 focus:ring-purple-500"
                  />
                </div>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className="text-xs font-bold text-gray-500">{'\u2764\ufe0f \u041b\u0430\u0439\u043a\u0438'}</label>
                    <input
                      type="number"
                      value={post.likes ?? 0}
                      onChange={e => updatePost(post.id, { likes: parseInt(e.target.value) || 0 })}
                      className="w-full px-2 py-1.5 rounded-lg border border-gray-200 text-xs mt-0.5 focus:outline-none focus:ring-1 focus:ring-purple-500"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="text-xs font-bold text-gray-500">{'\ud83d\udcac \u041a\u043e\u043c\u0435\u043d\u0442\u0430\u0440\u0456'}</label>
                    <input
                      type="number"
                      value={post.comments ?? 0}
                      onChange={e => updatePost(post.id, { comments: parseInt(e.target.value) || 0 })}
                      className="w-full px-2 py-1.5 rounded-lg border border-gray-200 text-xs mt-0.5 focus:outline-none focus:ring-1 focus:ring-purple-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
