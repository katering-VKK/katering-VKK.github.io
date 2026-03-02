import React from 'react';
import { motion } from 'motion/react';
import { ArrowUpRight } from 'lucide-react';

const categories = [
  {
    title: 'Книги',
    description: 'Історії, що надихають',
    gradient: 'linear-gradient(135deg, hsl(10, 80%, 65%) 0%, hsl(35, 90%, 70%) 100%)',
    count: 55,
  },
  {
    title: 'Іграшки',
    description: 'Для розвитку та гри',
    gradient: 'linear-gradient(135deg, hsl(210, 80%, 60%) 0%, hsl(240, 70%, 70%) 100%)',
    count: 55,
  },
  {
    title: 'Власне виробництво',
    description: 'Зроблено з любовʼю',
    gradient: 'linear-gradient(135deg, hsl(40, 70%, 65%) 0%, hsl(50, 60%, 75%) 100%)',
    count: 35,
  },
  {
    title: 'Творчість',
    description: 'Розкрий свій талант',
    gradient: 'linear-gradient(135deg, hsl(290, 70%, 65%) 0%, hsl(320, 75%, 70%) 100%)',
    count: 30,
  },
  {
    title: 'Настільні ігри',
    description: 'Грайте разом',
    gradient: 'linear-gradient(135deg, hsl(120, 60%, 55%) 0%, hsl(150, 65%, 65%) 100%)',
    count: 25,
  }
];

export const CategorySplit = () => {
  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 auto-rows-[280px] md:auto-rows-[360px]">
          {categories.map((cat, idx) => (
            <motion.div 
              key={cat.title} 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.08 }}
              viewport={{ once: true }}
              className={`relative group overflow-hidden rounded-3xl cursor-pointer ${
                idx < 2 ? 'col-span-1 md:col-span-1 lg:col-span-1' : ''
              }`}
            >
              <div
                className="absolute inset-0 transition-transform duration-700 group-hover:scale-110"
                style={{ background: cat.gradient }}
              />
              <div className="absolute inset-0 bg-black/10 group-hover:bg-black/25 transition-colors duration-500" />
              
              <div className="absolute inset-0 p-6 flex flex-col justify-between relative z-10">
                <div className="flex justify-between items-start">
                  <span className="text-white/60 text-xs font-bold uppercase tracking-widest">
                    {cat.count} товарів
                  </span>
                  <div className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 -translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                    <ArrowUpRight className="w-5 h-5" />
                  </div>
                </div>
                
                <div>
                  <p className="text-white/80 text-xs uppercase tracking-widest mb-1.5 opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 delay-75">
                    {cat.description}
                  </p>
                  <h3 className="text-white text-2xl md:text-3xl font-display font-bold uppercase tracking-tight leading-tight">
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
