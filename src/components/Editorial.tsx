import React from 'react';
import { motion } from 'motion/react';
import { ArrowUpRight } from 'lucide-react';
import { useSiteContent } from '../context/SiteContentContext';
import { useStore } from '../store';

const defaultArticles = [
  { id: 1, title: 'Анімована книга: Подорож до зірок', category: 'Новинки', description: 'Пориньте у світ новинок з нашою анімованою книгою. Історія про маленького астронавта.', gradient: 'linear-gradient(135deg, hsl(340, 75%, 60%) 0%, hsl(20, 85%, 65%) 100%)' },
  { id: 2, title: 'Колекція "Місячне Сяйво"', category: 'Натхнення', description: 'Колекція, що запрошує вас сповільнитися та відчути глибину космосу.', gradient: 'linear-gradient(135deg, hsl(230, 70%, 55%) 0%, hsl(270, 65%, 70%) 100%)' },
  { id: 3, title: 'Космічні пригоди', category: 'Для дітей', description: 'Колекція, що святкує допитливість, щоденні відкриття та мистецтво гри.', gradient: 'linear-gradient(135deg, hsl(160, 65%, 50%) 0%, hsl(190, 70%, 60%) 100%)' },
];

export const Editorial = () => {
  const { content } = useSiteContent();
  const { navigateToCategory } = useStore();
  const ed = content.editorial ?? {};
  const articles = ed.articles ?? defaultArticles;
  const toysDesc = content.categories?.toys?.trim();
  const ownProdDesc = content.categories?.ownProduction?.trim();

  return (
    <section className="py-32 bg-[var(--color-bobo-cream)]">
      <div className="container mx-auto px-6 lg:px-12">
        <div className="flex justify-between items-end mb-16">
          <h2 className="text-4xl md:text-6xl font-display font-extrabold uppercase tracking-tight">
            {ed.title ?? 'Журнал'}
          </h2>
          <a href="#" className="hidden md:block text-sm font-bold uppercase tracking-widest border-b border-black pb-1 hover:text-gray-600 transition-colors">
            {ed.linkText ?? 'Читати всі статті'}
          </a>
        </div>

        {(toysDesc || ownProdDesc) && (
          <div className="mb-16 grid grid-cols-1 md:grid-cols-2 gap-6">
            {toysDesc && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                onClick={() => navigateToCategory('Іграшки')}
                className="p-8 rounded-2xl bg-gradient-to-br from-violet-100 to-indigo-50 border-2 border-violet-200/50 cursor-pointer group hover:shadow-xl hover:border-violet-300 transition-all duration-300"
              >
                <div className="flex flex-col gap-4">
                  <h3 className="text-xl font-display font-bold uppercase tracking-tight text-violet-900">Іграшки</h3>
                  <p className="text-gray-600 leading-relaxed">{toysDesc}</p>
                  <div className="flex items-center gap-2 text-violet-600 font-bold uppercase tracking-widest text-sm group-hover:translate-x-1 transition-transform">
                    Дивитися каталог
                    <ArrowUpRight className="w-4 h-4" />
                  </div>
                </div>
              </motion.div>
            )}
            {ownProdDesc && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                onClick={() => navigateToCategory('Власне виробництво')}
                className="p-8 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200/50 cursor-pointer group hover:shadow-xl hover:border-amber-300 transition-all duration-300"
              >
                <div className="flex flex-col gap-4">
                  <h3 className="text-xl font-display font-bold uppercase tracking-tight text-amber-900">Власне виробництво</h3>
                  <p className="text-gray-600 leading-relaxed">{ownProdDesc}</p>
                  <div className="flex items-center gap-2 text-amber-600 font-bold uppercase tracking-widest text-sm group-hover:translate-x-1 transition-transform">
                    Дивитися каталог
                    <ArrowUpRight className="w-4 h-4" />
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-16">
          {articles.map((article, idx) => (
            <motion.div 
              key={article.id} 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              viewport={{ once: true }}
              className="flex flex-col group cursor-pointer"
            >
              <div className="aspect-[3/4] overflow-hidden rounded-2xl mb-6 relative border-2 border-gray-100 group-hover:border-violet-200 shadow-lg group-hover:shadow-xl group-hover:-translate-y-1 transition-all duration-500">
                <div
                  className="w-full h-full transition-transform duration-700 group-hover:scale-105"
                  style={{ background: article.gradient }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
                <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-md">
                  {article.category}
                </div>
              </div>
              <div className="flex flex-col gap-3">
                <h3 className="text-2xl font-display font-bold leading-tight group-hover:text-violet-600 transition-colors">
                  {article.title}
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed line-clamp-2">
                  {article.description}
                </p>
                <div className="mt-2 text-xs font-bold uppercase tracking-widest text-violet-600 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0">
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
