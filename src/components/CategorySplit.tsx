import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import { ArrowUpRight } from 'lucide-react';
import { useStore } from '../store';
import { useProducts } from '../context/ProductsContext';

const CATEGORY_CONFIG = [
  { title: 'Книги', description: 'Історії, що надихають', gradient: 'linear-gradient(135deg, #E85D04 0%, #F48C06 50%, #FFBA08 100%)' },
  { title: 'Іграшки', description: 'Для розвитку та гри', gradient: 'linear-gradient(135deg, #4361EE 0%, #3A0CA3 50%, #7209B7 100%)' },
  { title: 'Власне виробництво', description: 'Зроблено з любовʼю', gradient: 'linear-gradient(135deg, #D4A373 0%, #CCD5AE 50%, #E9EDC9 100%)' },
  { title: 'Творчість', description: 'Розкрий свій талант', gradient: 'linear-gradient(135deg, #9D4EDD 0%, #C77DFF 50%, #E0AAFF 100%)' },
  { title: 'Настільні ігри', description: 'Грайте разом', gradient: 'linear-gradient(135deg, #2D6A4F 0%, #40916C 50%, #52B788 100%)' },
];

export const CategorySplit = () => {
  const { navigateToCategory } = useStore();
  const { products } = useProducts();
  const countsByCategory = useMemo(() => {
    const counts: Record<string, number> = {};
    const list = Array.isArray(products) ? products : [];
    for (const p of list) {
      const cat = String(p.category || '').trim() || 'Інше';
      counts[cat] = (counts[cat] ?? 0) + 1;
    }
    return counts;
  }, [products]);
  const categories = useMemo(() =>
    CATEGORY_CONFIG.map(c => ({ ...c, count: countsByCategory[c.title] ?? 0 })),
    [countsByCategory]
  );

  return (
    <section className="py-28 bg-[var(--color-bobo-cream)] relative overflow-hidden">
      <div className="absolute inset-0 bg-mesh opacity-50" />
      <div className="container mx-auto px-6 lg:px-12 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5 auto-rows-[300px] md:auto-rows-[380px]">
          {categories.map((cat, idx) => (
            <motion.div 
              key={cat.title} 
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.06, duration: 0.5 }}
              viewport={{ once: true }}
              onClick={() => navigateToCategory(cat.title)}
              className="relative group overflow-hidden rounded-[var(--radius-card)] cursor-pointer border border-white/60 shadow-card hover:shadow-card-hover hover:-translate-y-2 transition-all duration-500"
            >
              <div
                className="absolute inset-0 transition-transform duration-700 group-hover:scale-110"
                style={{ background: cat.gradient }}
              />
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.3)_0%,transparent_60%)]" />
              <div className="absolute inset-0 bg-black/5 group-hover:bg-black/20 transition-colors duration-500" />
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: 'repeating-linear-gradient(-45deg, transparent, transparent 10px, rgba(255,255,255,0.04) 10px, rgba(255,255,255,0.04) 20px)' }} />
              
              <div className="absolute inset-0 p-6 flex flex-col justify-between relative z-10">
                <div className="flex justify-between items-start">
                  <span className="text-white/90 text-xs font-bold uppercase tracking-widest bg-black/25 backdrop-blur-md px-3.5 py-1.5 rounded-full">
                    {cat.count} товарів
                  </span>
                  <div className="w-11 h-11 bg-white/30 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/40 opacity-0 group-hover:opacity-100 -translate-y-2 group-hover:translate-y-0 transition-all duration-300 shadow-lg">
                    <ArrowUpRight className="w-5 h-5" />
                  </div>
                </div>
                
                <div>
                  <p className="text-white/95 text-xs uppercase tracking-widest mb-2 opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 delay-75">
                    {cat.description}
                  </p>
                  <h3 className="text-white text-2xl md:text-3xl font-display font-extrabold uppercase tracking-tight leading-tight drop-shadow-lg">
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
