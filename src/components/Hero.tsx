import React from 'react';
import { motion } from 'motion/react';
import { Star, Clock } from 'lucide-react';
import { useStore } from '../store';
import { useSiteContent } from '../context/SiteContentContext';

export const Hero = () => {
  const { navigateToCategory } = useStore();
  const { content } = useSiteContent();
  const hero = content.hero ?? {};

  return (
    <div className="relative h-screen w-full overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-950 via-violet-900 to-fuchsia-950" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_100%_80%_at_50%_-30%,rgba(255,193,7,0.2)_0%,transparent_55%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_rgba(168,85,247,0.35)_0%,_transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_rgba(99,102,241,0.25)_0%,_transparent_45%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_80%,rgba(236,72,153,0.1)_0%,transparent_50%)]" />
        <div className="absolute inset-0 bg-black/10" />
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")' }} />
      </div>

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
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            animate={{ opacity: [0.2, 0.8, 0.2] }}
            transition={{ duration: 3 + i, repeat: Infinity, ease: "easeInOut", delay: i * 0.5 }}
            className="absolute w-1.5 h-1.5 bg-white/40 rounded-full"
            style={{ top: `${15 + (i * 13) % 70}%`, left: `${10 + (i * 17) % 80}%` }}
          />
        ))}
      </div>

      <div className="relative h-full flex flex-col items-center justify-center text-center px-4 pt-24 z-10">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          className="mb-16 flex flex-col items-center relative"
        >
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
          <button
            onClick={() => navigateToCategory('Книги')}
            className="group relative overflow-hidden bg-[var(--color-bobo-yellow)] text-black px-14 py-4.5 rounded-full font-display font-bold text-sm transition-all duration-500 hover:shadow-[0_0_50px_-10px_rgba(255,193,7,0.7)] hover:scale-[1.04] active:scale-[0.98] min-w-[200px] uppercase tracking-[0.2em] hover:brightness-105"
          >
            <span className="relative z-10">Книги</span>
          </button>
          <button
            onClick={() => navigateToCategory('Іграшки')}
            className="group relative overflow-hidden bg-white/10 border-2 border-white/70 text-white px-14 py-4.5 rounded-full font-display font-bold text-sm transition-all duration-500 hover:bg-white/25 hover:border-white hover:shadow-[0_0_40px_-8px_rgba(255,255,255,0.3)] hover:scale-[1.04] active:scale-[0.98] min-w-[200px] uppercase tracking-[0.2em] backdrop-blur-xl"
          >
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
            <p className="font-medium tracking-wide text-sm sm:text-base">{hero.address ?? 'м. Ірпінь, вул. Григорія Сковороди 11/7'}</p>
            <span className="w-px h-4 bg-white/20 mx-2 hidden sm:block"></span>
            <div className="hidden sm:flex items-center gap-2 text-sm text-gray-300">
              <Clock className="w-3.5 h-3.5" />
              <p>{hero.workingHours ?? '09:00 - 18:00'}</p>
            </div>
          </div>
          <div className="sm:hidden flex items-center gap-2 text-xs text-gray-300 bg-black/40 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/10">
            <Clock className="w-3 h-3" />
            <p>{hero.workingHoursShort ?? 'Щодня з 09:00 до 18:00'}</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
