import React from 'react';
import { motion } from 'motion/react';
import { Heart, Rocket, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export const About = () => (
  <motion.article
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="min-h-screen pt-28 pb-20 px-6"
  >
    <div className="max-w-2xl mx-auto">
      <Link to="/" className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-black mb-12 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        На головну
      </Link>

      <div className="flex items-center gap-4 mb-12">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
          <Rocket className="w-8 h-8 text-white" />
        </div>
        <div>
          <h1 className="text-4xl font-display font-extrabold uppercase tracking-tight">
            Маленький Всесвіт
          </h1>
          <p className="text-gray-500 mt-1">Книги та іграшки для дітей</p>
        </div>
      </div>

      <div className="space-y-8 text-gray-600 leading-relaxed">
        <p className="text-lg">
          Ми — невеликий магазин у Ірпені, де кожна книга та іграшка обрані з любов'ю.
          Наша місія — допомагати дітям відкривати світ через читання, гру та творчість.
        </p>
        <p>
          У нас ви знайдете дитячі книги різних жанрів: від казок та енциклопедій до розмальовок та навчальних видань.
          Іграшки — розвиваючі, інтерактивні, для хлопчиків та дівчаток. Є власне виробництво, настільні ігри та матеріали для творчості.
        </p>
        <div className="flex items-center gap-2 text-violet-600 font-medium">
          <Heart className="w-5 h-5 fill-current" />
          <span>Зроблено з любов'ю в Ірпені</span>
        </div>
      </div>
    </div>
  </motion.article>
);
