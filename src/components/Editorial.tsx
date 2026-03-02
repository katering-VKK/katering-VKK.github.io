import React from 'react';
import { motion } from 'motion/react';

const articles = [
  {
    id: 1,
    title: 'Анімована книга: Подорож до зірок',
    category: 'Новинки',
    description: 'Пориньте у світ SS26 з нашою анімованою книгою. Історія про маленького астронавта.',
    image: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?q=80&w=1000&auto=format&fit=crop',
  },
  {
    id: 2,
    title: 'Колекція "Місячне Сяйво"',
    category: 'Натхнення',
    description: 'Колекція, що запрошує вас сповільнитися та відчути глибину космосу.',
    image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1000&auto=format&fit=crop',
  },
  {
    id: 3,
    title: 'Космічні пригоди',
    category: 'Для дітей',
    description: 'Колекція, що святкує допитливість, щоденні відкриття та мистецтво гри.',
    image: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?q=80&w=1000&auto=format&fit=crop',
  }
];

export const Editorial = () => {
  return (
    <section className="py-32 bg-[#FDFBF7]">
      <div className="container mx-auto px-6 lg:px-12">
        <div className="flex justify-between items-end mb-16">
          <h2 className="text-4xl md:text-6xl font-display font-bold uppercase tracking-tight">
            Журнал
          </h2>
          <a href="#" className="hidden md:block text-sm font-bold uppercase tracking-widest border-b border-black pb-1 hover:text-gray-600 transition-colors">
            Читати всі статті
          </a>
        </div>

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
              <div className="aspect-[3/4] overflow-hidden rounded-2xl mb-6 relative">
                <img
                  src={article.image}
                  alt={article.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                  {article.category}
                </div>
              </div>
              <div className="flex flex-col gap-3">
                <h3 className="text-2xl font-display font-bold leading-tight group-hover:text-purple-600 transition-colors">
                  {article.title}
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed line-clamp-2">
                  {article.description}
                </p>
                <div className="mt-2 text-xs font-bold uppercase tracking-widest text-black flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0">
                  Читати далі
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
