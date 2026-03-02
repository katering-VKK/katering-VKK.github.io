import React from 'react';
import { motion } from 'motion/react';
import { ArrowUpRight } from 'lucide-react';

const categories = [
  {
    title: 'Книги',
    description: 'Історії, що надихають',
    image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?q=80&w=1598&auto=format&fit=crop',
    alt: 'Дитячі книги'
  },
  {
    title: 'Іграшки',
    description: 'Для розвитку та гри',
    image: 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?q=80&w=1740&auto=format&fit=crop',
    alt: 'Дитячі іграшки'
  },
  {
    title: 'Власне виробництво',
    description: 'Зроблено з любовʼю',
    image: 'https://images.unsplash.com/photo-1599623560574-39d485900c95?q=80&w=1740&auto=format&fit=crop',
    alt: 'Іграшки власного виробництва'
  }
];

export const CategorySplit = () => {
  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[600px]">
          {categories.map((cat, idx) => (
            <motion.div 
              key={cat.title} 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              viewport={{ once: true }}
              className="relative group overflow-hidden rounded-3xl cursor-pointer"
            >
              <img
                src={cat.image}
                alt={cat.alt}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-500" />
              
              <div className="absolute inset-0 p-8 flex flex-col justify-between">
                <div className="flex justify-end">
                  <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 -translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                    <ArrowUpRight className="w-6 h-6" />
                  </div>
                </div>
                
                <div>
                  <p className="text-white/80 text-sm uppercase tracking-widest mb-2 opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 delay-75">
                    {cat.description}
                  </p>
                  <h3 className="text-white text-4xl font-display font-bold uppercase tracking-tight">
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
