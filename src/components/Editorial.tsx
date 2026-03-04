import React from 'react';
import { motion } from 'motion/react';
import { useSiteContent } from '../context/SiteContentContext';

const defaultArticles = [
  { id: 1, title: 'Анімована книга: Подорож до зірок', category: 'Новинки', description: 'Пориньте у світ SS26 з нашою анімованою книгою. Історія про маленького астронавта.', gradient: 'linear-gradient(135deg, hsl(340, 75%, 60%) 0%, hsl(20, 85%, 65%) 100%)' },
  { id: 2, title: 'Колекція "Місячне Сяйво"', category: 'Натхнення', description: 'Колекція, що запрошує вас сповільнитися та відчути глибину космосу.', gradient: 'linear-gradient(135deg, hsl(230, 70%, 55%) 0%, hsl(270, 65%, 70%) 100%)' },
  { id: 3, title: 'Космічні пригоди', category: 'Для дітей', description: 'Колекція, що святкує допитливість, щоденні відкриття та мистецтво гри.', gradient: 'linear-gradient(135deg, hsl(160, 65%, 50%) 0%, hsl(190, 70%, 60%) 100%)' },
];

export const Editorial = () => {
  const { content } = useSiteContent();
  const ed = content.editorial ?? {};
  const articles = ed.articles ?? defaultArticles;
  return (
    <section className="py-32 bg-[var(--color-bobo-cream)] relative overflow-hidden">
      <div className="absolute inset-0 bg-mesh opacity-40" />
      <div className="container mx-auto px-6 lg:px-12 relative z-10">
        <div className="flex justify-between items-end mb-20">
          <h2 className="text-4xl md:text-6xl font-display font-extrabold tracking-tight text-gray-900">
            {ed.title ?? 'Журнал'}
          </h2>
          <a href="#" className="hidden md:block text-sm font-bold uppercase tracking-widest border-b-2 border-gray-900 pb-1 hover:text-violet-600 hover:border-violet-600 transition-colors">
            {ed.linkText ?? 'Читати всі статті'}
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-10 gap-y-20">
          {articles.map((article, idx) => (
            <motion.div 
              key={article.id} 
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1, duration: 0.5 }}
              viewport={{ once: true }}
              className="flex flex-col group cursor-pointer"
            >
              <div className="aspect-[3/4] overflow-hidden rounded-[var(--radius-card)] mb-6 relative border border-gray-100 group-hover:border-violet-200/60 shadow-card group-hover:shadow-card-hover group-hover:-translate-y-2 transition-all duration-500">
                <div
                  className="w-full h-full transition-transform duration-700 group-hover:scale-105"
                  style={{ background: article.gradient }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                <div className="absolute top-5 left-5 bg-white/95 backdrop-blur-md px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider shadow-lg">
                  {article.category}
                </div>
              </div>
              <div className="flex flex-col gap-3">
                <h3 className="text-2xl font-display font-bold leading-tight group-hover:text-violet-600 transition-colors">
                  {article.title}
                </h3>
                <p className="text-gray-500 text-base leading-relaxed line-clamp-2">
                  {article.description}
                </p>
                <div className="mt-2 text-xs font-bold uppercase tracking-widest text-violet-600 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">
                  Читати далі →
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
