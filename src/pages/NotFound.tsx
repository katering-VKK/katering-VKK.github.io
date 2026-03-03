import React from 'react';
import { motion } from 'motion/react';
import { Home, Search } from 'lucide-react';
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
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="min-h-screen flex flex-col items-center justify-center px-6"
    >
      <p className="text-8xl font-black text-gray-200 mb-4">404</p>
      <h1 className="text-2xl font-display font-bold uppercase tracking-tight mb-2">
        Сторінку не знайдено
      </h1>
      <p className="text-gray-500 mb-12 text-center max-w-sm">
        Можливо, вона перемістилась або ви ввели неправильну адресу.
      </p>
      <div className="flex gap-4">
        <Link
          to="/"
          className="inline-flex items-center gap-2 bg-black text-white px-6 py-3 rounded-full font-bold text-sm uppercase tracking-wider hover:bg-gray-800 transition-colors"
        >
          <Home className="w-4 h-4" />
          На головну
        </Link>
        <button
          onClick={handleSearch}
          className="inline-flex items-center gap-2 border-2 border-gray-200 px-6 py-3 rounded-full font-bold text-sm uppercase tracking-wider hover:border-gray-300 transition-colors"
        >
          <Search className="w-4 h-4" />
          Пошук
        </button>
      </div>
    </motion.div>
  );
};
