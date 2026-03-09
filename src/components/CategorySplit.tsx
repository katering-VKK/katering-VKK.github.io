import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import { ArrowUpRight } from 'lucide-react';
import { useStore } from '../store';
import { useProducts } from '../context/ProductsContext';
import { useSiteContent } from '../context/SiteContentContext';

const CATEGORY_CONFIG = [
  { title: 'Книги', description: 'Історії, що надихають', gradient: 'linear-gradient(135deg, hsl(10, 80%, 65%) 0%, hsl(35, 90%, 70%) 100%)' },
  { title: 'Іграшки', description: 'Для розвитку та гри', gradient: 'linear-gradient(135deg, hsl(210, 80%, 60%) 0%, hsl(240, 70%, 70%) 100%)' },
  { title: 'Власне виробництво', description: 'Зроблено з любовʼю', gradient: 'linear-gradient(135deg, hsl(40, 70%, 65%) 0%, hsl(50, 60%, 75%) 100%)' },
  { title: 'Творчість', description: 'Розкрий свій талант', gradient: 'linear-gradient(135deg, hsl(290, 70%, 65%) 0%, hsl(320, 75%, 70%) 100%)' },
  { title: 'Настільні ігри', description: 'Грайте разом', gradient: 'linear-gradient(135deg, hsl(120, 60%, 55%) 0%, hsl(150, 65%, 65%) 100%)' },
  { title: 'Сезонні товари', description: 'Товари для пори року', gradient: 'linear-gradient(135deg, hsl(180, 70%, 50%) 0%, hsl(200, 75%, 60%) 100%)', tagFilter: 'Сезонні' },
  { title: 'Акційні позиції', description: 'Знижки та спецпропозиції', gradient: 'linear-gradient(135deg, hsl(350, 80%, 55%) 0%, hsl(10, 90%, 65%) 100%)', tagFilter: 'Акція' },
];

export const CategorySplit = () => {
  const { navigateToCategory } = useStore();
  const { products } = useProducts();
  const { content } = useSiteContent();
  const countsByCategory = useMemo(() => {
    const counts: Record<string, number> = {};
    const list = Array.isArray(products) ? products : [];
    for (const p of list) {
      const cat = String(p.category || '').trim() || 'Інше';
      counts[cat] = (counts[cat] ?? 0) + 1;
    }
    const tagCounts: Record<string, number> = {};
    for (const p of list) {
      if (p.tag === 'Сезонні') tagCounts['Сезонні товари'] = (tagCounts['Сезонні товари'] ?? 0) + 1;
      if (p.tag === 'Акція') tagCounts['Акційні позиції'] = (tagCounts['Акційні позиції'] ?? 0) + 1;
    }
    return { ...counts, ...tagCounts };
  }, [products]);
  const categories = useMemo(() => {
    const fullDesc: Record<string, string> = {
      'Іграшки': content.categories?.toys?.trim() || CATEGORY_CONFIG.find(c => c.title === 'Іграшки')!.description,
      'Власне виробництво': content.categories?.ownProduction?.trim() || CATEGORY_CONFIG.find(c => c.title === 'Власне виробництво')!.description,
      'Сезонні товари': content.categories?.seasonal?.trim() || CATEGORY_CONFIG.find(c => c.title === 'Сезонні товари')!.description,
      'Акційні позиції': content.categories?.promo?.trim() || CATEGORY_CONFIG.find(c => c.title === 'Акційні позиції')!.description,
    };
    return CATEGORY_CONFIG.map(c => {
      const full = fullDesc[c.title] ?? c.description;
      const short = full.length > 60 ? full.slice(0, 57) + '…' : full;
      return {
        ...c,
        description: short,
        count: countsByCategory[c.title] ?? 0,
      };
    });
  }, [countsByCategory, content.categories]);

  return (
    <section className="py-24 bg-[var(--color-bobo-cream)]">
      <div className="container mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 auto-rows-[280px] md:auto-rows-[360px]">
          {categories.map((cat, idx) => (
            <motion.div 
              key={cat.title} 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.08 }}
              viewport={{ once: true }}
              onClick={() => navigateToCategory(cat.title)}
              className={`relative group overflow-hidden rounded-3xl cursor-pointer border-2 border-white/50 shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 ${
                idx < 2 ? 'col-span-1 md:col-span-1 lg:col-span-1' : ''
              }`}
            >
              <div
                className="absolute inset-0 transition-transform duration-700 group-hover:scale-110"
                style={{ background: cat.gradient }}
              />
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.2)_0%,transparent_50%)]" />
              <div className="absolute inset-0 bg-black/10 group-hover:bg-black/25 transition-colors duration-500" />
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: 'repeating-linear-gradient(-45deg, transparent, transparent 8px, rgba(255,255,255,0.03) 8px, rgba(255,255,255,0.03) 16px)' }} />
              
              <div className="absolute inset-0 p-6 flex flex-col justify-between relative z-10">
                <div className="flex justify-between items-start">
                  <span className="text-white/80 text-xs font-bold uppercase tracking-widest bg-black/20 backdrop-blur-sm px-3 py-1 rounded-full">
                    {cat.count} товарів
                  </span>
                  <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/30 opacity-0 group-hover:opacity-100 -translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                    <ArrowUpRight className="w-5 h-5" />
                  </div>
                </div>
                
                <div>
                  <p className="text-white/90 text-xs uppercase tracking-widest mb-1.5 opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 delay-75">
                    {cat.description}
                  </p>
                  <h3 className="text-white text-2xl md:text-3xl font-display font-bold uppercase tracking-tight leading-tight drop-shadow-lg">
                    {cat.title}
                  </h3>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
