import React from 'react';
import { motion } from 'motion/react';
import { Home, Search, Rocket } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '../store';

export const NotFound = () => {
  const { setSearchOpen } = useStore();
  const navigate = useNavigate();

  const handleSearch = () => {
    navigate('/');
    setTimeout(() => setSearchOpen(true), 100);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen flex flex-col items-center justify-center px-6 bg-gradient-to-b from-white to-violet-50/30"
    >
      <div className="absolute top-20 left-1/2 -translate-x-1/2 w-64 h-64 bg-violet-200/30 rounded-full blur-3xl -z-10" />
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
        className="w-24 h-24 rounded-3xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center mb-8 shadow-xl shadow-violet-500/20"
      >
        <Rocket className="w-12 h-12 text-white rotate-[-20deg]" />
      </motion.div>
      <p className="text-7xl sm:text-8xl font-black text-violet-100 mb-2 select-none">404</p>
      <h1 className="text-2xl sm:text-3xl font-display font-bold uppercase tracking-tight mb-3 text-gray-900">
        Сторінку не знайдено
      </h1>
      <p className="text-gray-500 mb-12 text-center max-w-sm">
        Можливо, вона перемістилась або ви ввели неправильну адресу. Спробуйте пошук або поверніться на головну.
      </p>
      <div className="flex flex-col sm:flex-row gap-4">
        <Link
          to="/"
          className="inline-flex items-center justify-center gap-2 bg-black text-white px-8 py-4 rounded-2xl font-bold text-sm uppercase tracking-wider hover:bg-gray-800 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg"
        >
          <Home className="w-4 h-4" />
          На головну
        </Link>
        <button
          onClick={handleSearch}
          className="inline-flex items-center justify-center gap-2 border-2 border-violet-200 text-violet-700 px-8 py-4 rounded-2xl font-bold text-sm uppercase tracking-wider hover:bg-violet-50 hover:border-violet-300 transition-all"
        >
          <Search className="w-4 h-4" />
          Пошук
        </button>
      </div>
    </motion.div>
  );
};
