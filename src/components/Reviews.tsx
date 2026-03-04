import React from 'react';
import { motion } from 'motion/react';
import { Star, Quote } from 'lucide-react';
import { useSiteContent } from '../context/SiteContentContext';

const defaultReviews = [
  { id: 1, name: 'Олена К.', rating: 5, text: 'Чудовий магазин! Книги якісні, дочка в захваті від енциклопедії про космос. Швидка доставка по Ірпеню.', date: 'Березень 2025' },
  { id: 2, name: 'Андрій М.', rating: 5, text: 'Замовляли конструктор та пазли — все прийшло швидко, упаковано акуратно. Діти грають щодня.', date: 'Лютий 2025' },
  { id: 3, name: 'Марія Т.', rating: 5, text: "Рекомендую! Великий вибір книг для дошкільнят, приємні ціни. Обов'язково повернемось.", date: 'Січень 2025' },
];

export const Reviews = () => {
  const { content } = useSiteContent();
  const rev = content.reviews ?? {};
  const reviews = rev.items ?? defaultReviews;
  return (
    <section id="reviews" className="py-28 bg-white relative overflow-hidden">
      <div className="absolute inset-0 bg-mesh opacity-30" />
      <div className="container mx-auto px-6 lg:px-12 relative z-10">
        <h2 className="text-4xl md:text-6xl font-display font-extrabold tracking-tight mb-20 text-gray-900">
          {rev.title ?? 'Наші огляди'}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {reviews.map((review, idx) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1, duration: 0.5 }}
              viewport={{ once: true }}
              className="relative p-8 rounded-[var(--radius-card)] bg-white/80 backdrop-blur-sm border border-gray-100 hover:border-violet-200/60 shadow-card hover:shadow-card-hover hover:-translate-y-2 transition-all duration-500"
            >
              <Quote className="absolute top-6 right-6 w-10 h-10 text-violet-200/80" />
              <div className="flex gap-1 mb-5">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 drop-shadow-sm ${i < review.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`}
                  />
                ))}
              </div>
              <p className="text-gray-700 leading-relaxed mb-6 text-base">{review.text}</p>
              <div className="flex justify-between items-center">
                <span className="font-bold text-gray-900">{review.name}</span>
                <span className="text-sm text-gray-500">{review.date}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
