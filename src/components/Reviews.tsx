import React from 'react';
import { motion } from 'motion/react';
import { Star, Quote } from 'lucide-react';

const reviews = [
  {
    id: 1,
    name: 'Олена К.',
    rating: 5,
    text: 'Чудовий магазин! Книги якісні, дочка в захваті від енциклопедії про космос. Швидка доставка по Ірпеню.',
    date: 'Березень 2025',
  },
  {
    id: 2,
    name: 'Андрій М.',
    rating: 5,
    text: 'Замовляли конструктор та пазли — все прийшло швидко, упаковано акуратно. Діти грають щодня.',
    date: 'Лютий 2025',
  },
  {
    id: 3,
    name: 'Марія Т.',
    rating: 5,
    text: 'Рекомендую! Великий вибір книг для дошкільнят, приємні ціни. Обов\'язково повернемось.',
    date: 'Січень 2025',
  },
];

export const Reviews = () => {
  return (
    <section id="reviews" className="py-24 bg-white">
      <div className="container mx-auto px-6 lg:px-12">
        <h2 className="text-4xl md:text-5xl font-display font-extrabold uppercase tracking-tight mb-16">
          Наші огляди
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {reviews.map((review, idx) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              viewport={{ once: true }}
              className="relative p-8 rounded-2xl bg-gradient-to-br from-[var(--color-bobo-cream)] to-white border-2 border-gray-100 hover:border-violet-200 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-500"
            >
              <Quote className="absolute top-6 right-6 w-8 h-8 text-violet-200" />
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 drop-shadow-sm ${i < review.rating ? 'fill-[var(--color-bobo-yellow)] text-[var(--color-bobo-yellow)]' : 'text-gray-200'}`}
                  />
                ))}
              </div>
              <p className="text-gray-700 leading-relaxed mb-6">{review.text}</p>
              <div className="flex justify-between items-center">
                <span className="font-bold">{review.name}</span>
                <span className="text-sm text-gray-400">{review.date}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
