import React from 'react';
import { motion } from 'motion/react';
import { Star, Clock } from 'lucide-react';

export const Hero = () => {
  return (
    <div className="relative h-screen w-full overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?q=80&w=3272&auto=format&fit=crop"
          alt="Space themed background"
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-black/30"></div>
      </div>

      {/* Floating Space Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div 
          animate={{ y: [0, -20, 0], rotate: [0, 10, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/4 left-1/4 text-white/40"
        >
          <Star className="w-12 h-12 fill-current" />
        </motion.div>
        <motion.div 
          animate={{ y: [0, 30, 0], rotate: [0, -15, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-1/3 right-1/4 text-yellow-200/60"
        >
          <Star className="w-8 h-8 fill-current" />
        </motion.div>
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/3 right-10 w-4 h-4 bg-white rounded-full blur-sm"
        />
      </div>

      {/* Content */}
      <div className="relative h-full flex flex-col items-center justify-center text-center px-4 pt-24 z-10">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          className="mb-16 flex flex-col items-center relative"
        >
          {/* Glow effect behind logo */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-white/10 blur-[100px] rounded-full pointer-events-none"></div>
          
          <img 
            src="/logo.png" 
            alt="Маленький Всесвіт" 
            className="w-full max-w-[280px] sm:max-w-[400px] md:max-w-[600px] h-auto drop-shadow-2xl relative z-10 hover:scale-105 transition-transform duration-700"
          />
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
          className="flex flex-col sm:flex-row gap-6 mb-16"
        >
          <button className="group relative overflow-hidden bg-white text-black px-12 py-4 rounded-full font-bold text-sm transition-all hover:shadow-[0_0_40px_-10px_rgba(255,255,255,0.5)] min-w-[180px] uppercase tracking-widest">
            <span className="relative z-10 group-hover:text-purple-900 transition-colors">Книги</span>
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-200 to-yellow-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </button>
          <button className="group relative overflow-hidden bg-transparent border-2 border-white text-white px-12 py-4 rounded-full font-bold text-sm transition-all hover:bg-white/10 hover:shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)] min-w-[180px] uppercase tracking-widest backdrop-blur-sm">
            <span className="relative z-10">Іграшки</span>
          </button>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1 }}
          className="flex flex-col items-center gap-2 text-white/90"
        >
          <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md px-6 py-3 rounded-full border border-white/10">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
            </span>
            <p className="font-medium tracking-wide text-sm sm:text-base">м. Ірпінь, вул. Григорія Сковороди 11/7</p>
            <span className="w-px h-4 bg-white/20 mx-2 hidden sm:block"></span>
            <div className="hidden sm:flex items-center gap-2 text-sm text-gray-300">
              <Clock className="w-3.5 h-3.5" />
              <p>09:00 - 18:00</p>
            </div>
          </div>
          <div className="sm:hidden flex items-center gap-2 text-xs text-gray-300 bg-black/40 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/10">
            <Clock className="w-3 h-3" />
            <p>Щодня з 09:00 до 18:00</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
