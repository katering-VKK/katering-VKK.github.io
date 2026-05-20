import React, { useState, useEffect } from 'react';
import { Instagram, ExternalLink, Heart, MessageCircle } from 'lucide-react';

export interface InstagramPost {
  id: string;
  imageUrl: string;
  caption: string;
  link: string;
  likes?: number;
  comments?: number;
  date?: string;
}

const INSTAGRAM_URL = 'https://www.instagram.com/malyenkyi.vsesvit_/';
const POSTS_KEY = 'lumu_instagram_posts';

const DEFAULT_POSTS: InstagramPost[] = [
  {
    id: '1',
    imageUrl: '/images/insta-placeholder-1.jpg',
    caption: '\u041d\u043e\u0432\u0456 \u043d\u0430\u0434\u0445\u043e\u0434\u0436\u0435\u043d\u043d\u044f \u0456\u0433\u0440\u0430\u0448\u043e\u043a \u0432\u0436\u0435 \u0432 \u043d\u0430\u044f\u0432\u043d\u043e\u0441\u0442\u0456! \u2728',
    link: INSTAGRAM_URL,
    likes: 42,
    comments: 5,
  },
  {
    id: '2',
    imageUrl: '/images/insta-placeholder-2.jpg',
    caption: '\u041a\u043d\u0438\u0433\u0438 \u0434\u043b\u044f \u043d\u0430\u0439\u043c\u0435\u043d\u0448\u0438\u0445 \u0447\u0438\u0442\u0430\u0447\u0456\u0432 \ud83d\udcda',
    link: INSTAGRAM_URL,
    likes: 38,
    comments: 3,
  },
  {
    id: '3',
    imageUrl: '/images/insta-placeholder-3.jpg',
    caption: '\u0412\u043b\u0430\u0441\u043d\u0435 \u0432\u0438\u0440\u043e\u0431\u043d\u0438\u0446\u0442\u0432\u043e \u2014 \u0437\u0440\u043e\u0431\u043b\u0435\u043d\u043e \u0437 \u043b\u044e\u0431\u043e\u0432\'\u044e \ud83d\udc9c',
    link: INSTAGRAM_URL,
    likes: 56,
    comments: 8,
  },
  {
    id: '4',
    imageUrl: '/images/insta-placeholder-4.jpg',
    caption: '\u041f\u043e\u0434\u0430\u0440\u0443\u043d\u043a\u0438 \u0434\u043b\u044f \u0434\u0456\u0442\u043e\u043a \u043d\u0430 \u0431\u0443\u0434\u044c-\u044f\u043a\u0438\u0439 \u0432\u0456\u043a \ud83c\udf81',
    link: INSTAGRAM_URL,
    likes: 31,
    comments: 2,
  },
  {
    id: '5',
    imageUrl: '/images/insta-placeholder-5.jpg',
    caption: '\u0417\u0430\u0432\u0456\u0442\u0430\u0439\u0442\u0435 \u0434\u043e \u043d\u0430\u0441 \u0432 \u0406\u0440\u043f\u0456\u043d\u044c! \ud83c\udfe0',
    link: INSTAGRAM_URL,
    likes: 45,
    comments: 6,
  },
  {
    id: '6',
    imageUrl: '/images/insta-placeholder-6.jpg',
    caption: '\u041d\u043e\u0432\u0430 \u043a\u043e\u043b\u0435\u043a\u0446\u0456\u044f \u0432\u0436\u0435 \u0447\u0435\u043a\u0430\u0454 \u043d\u0430 \u0432\u0430\u0441! \ud83c\udf1f',
    link: INSTAGRAM_URL,
    likes: 29,
    comments: 4,
  },
];

function loadPosts(): InstagramPost[] {
  try {
    const s = localStorage.getItem(POSTS_KEY);
    if (s) {
      const data = JSON.parse(s);
      if (Array.isArray(data) && data.length > 0) return data;
    }
  } catch {}
  return DEFAULT_POSTS;
}

export function InstagramFeed() {
  const [posts] = useState<InstagramPost[]>(loadPosts);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [imgErrors, setImgErrors] = useState<Set<string>>(new Set());

  return (
    <section className="py-16 sm:py-20 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10 sm:mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 text-sm font-bold mb-4">
            <Instagram className="w-4 h-4" />
            @malyenkyi.vsesvit_
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">
            {'\u041c\u0438 \u0432 Instagram'}
          </h2>
          <p className="text-gray-500 mt-3 max-w-lg mx-auto">
            {'\u0421\u043b\u0456\u0434\u043a\u0443\u0439\u0442\u0435 \u0437\u0430 \u043d\u043e\u0432\u0438\u043d\u043a\u0430\u043c\u0438, \u0430\u043a\u0446\u0456\u044f\u043c\u0438 \u0442\u0430 \u043d\u0430\u0434\u0445\u043d\u0435\u043d\u043d\u044f\u043c \u0443 \u043d\u0430\u0448\u043e\u043c\u0443 Instagram'}
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {posts.slice(0, 6).map(post => {
            const hasImgError = imgErrors.has(post.id);
            return (
              <a
                key={post.id}
                href={post.link || INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-purple-200 to-pink-200 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                onMouseEnter={() => setHoveredId(post.id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                {!hasImgError && post.imageUrl ? (
                  <img
                    src={post.imageUrl}
                    alt={post.caption}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    onError={() => setImgErrors(prev => new Set(prev).add(post.id))}
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-400 to-pink-400">
                    <Instagram className="w-10 h-10 text-white/60" />
                  </div>
                )}
                <div className={`absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent transition-opacity duration-300 ${hoveredId === post.id ? 'opacity-100' : 'opacity-0'}`}>
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <p className="text-white text-xs line-clamp-2 mb-2">{post.caption}</p>
                    {(post.likes || post.comments) && (
                      <div className="flex items-center gap-3 text-white/80 text-xs">
                        {post.likes != null && (
                          <span className="flex items-center gap-1">
                            <Heart className="w-3 h-3" />
                            {post.likes}
                          </span>
                        )}
                        {post.comments != null && (
                          <span className="flex items-center gap-1">
                            <MessageCircle className="w-3 h-3" />
                            {post.comments}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </a>
            );
          })}
        </div>

        <div className="text-center mt-8 sm:mt-10">
          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-full bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 text-white font-bold text-sm hover:shadow-lg hover:shadow-purple-500/30 transition-all duration-300 hover:-translate-y-0.5"
          >
            <Instagram className="w-5 h-5" />
            {'\u041f\u0456\u0434\u043f\u0438\u0441\u0430\u0442\u0438\u0441\u044f \u0432 Instagram'}
            <ExternalLink className="w-4 h-4 opacity-70" />
          </a>
        </div>
      </div>
    </section>
  );
}
