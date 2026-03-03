import React from 'react';
import { motion } from 'motion/react';
import { MapPin, Clock, Phone, Mail, ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '../store';

export const Contacts = () => {
  const { navigateToCategory } = useStore();
  const navigate = useNavigate();

  const goToCategory = (cat: string) => {
    navigate('/');
    setTimeout(() => navigateToCategory(cat), 100);
  };

  return (
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

        <h1 className="text-4xl font-display font-extrabold uppercase tracking-tight mb-12">
          Контакти
        </h1>

        <div className="space-y-8">
          <a
            href="https://maps.google.com/?q=Ірпінь+Григорія+Сковороди+11/7"
            target="_blank"
            rel="noopener noreferrer"
            className="flex gap-4 p-6 rounded-2xl bg-gray-50 hover:bg-gray-100 transition-colors group"
          >
            <div className="w-12 h-12 rounded-xl bg-violet-100 flex items-center justify-center shrink-0 group-hover:bg-violet-200 transition-colors">
              <MapPin className="w-6 h-6 text-violet-600" />
            </div>
            <div>
              <h3 className="font-bold mb-1">Адреса</h3>
              <p className="text-gray-600">м. Ірпінь, вул. Григорія Сковороди 11/7</p>
              <p className="text-sm text-violet-600 mt-2">Відкрити на карті →</p>
            </div>
          </a>

          <div className="flex gap-4 p-6 rounded-2xl bg-gray-50">
            <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
              <Clock className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <h3 className="font-bold mb-1">Режим роботи</h3>
              <p className="text-gray-600">Щодня з 09:00 до 18:00</p>
            </div>
          </div>

          <a href="tel:+380991234567" className="flex gap-4 p-6 rounded-2xl bg-gray-50 hover:bg-gray-100 transition-colors group">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0 group-hover:bg-emerald-200 transition-colors">
              <Phone className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <h3 className="font-bold mb-1">Телефон</h3>
              <p className="text-gray-600">+38 (099) 123-45-67</p>
            </div>
          </a>

          <a href="mailto:hello@mvsesvit.ua" className="flex gap-4 p-6 rounded-2xl bg-gray-50 hover:bg-gray-100 transition-colors group">
            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center shrink-0 group-hover:bg-blue-200 transition-colors">
              <Mail className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-bold mb-1">Email</h3>
              <p className="text-gray-600">hello@mvsesvit.ua</p>
            </div>
          </a>
        </div>

        <div className="mt-12 p-6 rounded-2xl bg-[var(--color-bobo-cream)]">
          <p className="font-medium mb-4">Швидкий перехід до каталогу:</p>
          <div className="flex flex-wrap gap-2">
            {['Книги', 'Іграшки', 'Творчість', 'Настільні ігри'].map(cat => (
              <button
                key={cat}
                onClick={() => goToCategory(cat)}
                className="px-4 py-2 rounded-full bg-white text-sm font-medium hover:bg-violet-100 transition-colors"
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>
    </motion.article>
  );
};
