import React from 'react';
import { Facebook, Instagram, Twitter, Youtube, Star, Moon, MapPin, Clock, Rocket } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-[#0f172a] text-white pt-24 pb-0 overflow-hidden relative">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10"></div>
        <div className="absolute -top-1/2 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-purple-900/20 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-0 left-0 w-full h-96 bg-gradient-to-t from-black to-transparent"></div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        
        {/* Top Section: Newsletter & Brand */}
        <div className="flex flex-col items-center text-center mb-20">
          <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-sm border border-white/10">
            <Rocket className="w-8 h-8 text-yellow-400" />
          </div>
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-4 tracking-tight">
            Приєднуйтесь до <span className="text-yellow-400">Маленького Всесвіту</span>
          </h2>
          <p className="text-gray-400 max-w-lg mb-8 text-lg font-light">
            Отримуйте космічні новини, ексклюзивні знижки та натхнення для творчості.
          </p>
          
          <div className="w-full max-w-md relative group">
            <input 
              type="email" 
              placeholder="Ваш email для старту..." 
              className="w-full bg-white/5 border border-white/10 rounded-full pl-6 pr-36 py-4 text-white placeholder:text-gray-500 focus:outline-none focus:bg-white/10 focus:border-yellow-400/50 transition-all font-medium"
            />
            <button className="absolute right-1.5 top-1.5 bottom-1.5 bg-white text-black px-6 rounded-full font-bold hover:bg-yellow-400 transition-colors uppercase tracking-wider text-xs font-display">
              Підписатися
            </button>
          </div>
        </div>

        {/* Divider */}
        <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mb-16"></div>

        {/* Links Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12 lg:gap-8 mb-20">
          <div className="flex flex-col gap-6">
            <h4 className="font-display font-bold text-xs uppercase text-gray-500 tracking-[0.2em]">Магазин</h4>
            <nav className="flex flex-col gap-3">
              <a href="#" className="text-gray-300 hover:text-white transition-colors text-sm">Книги</a>
              <a href="#" className="text-gray-300 hover:text-white transition-colors text-sm">Іграшки</a>
              <a href="#" className="text-gray-300 hover:text-white transition-colors text-sm">Власне виробництво</a>
              <a href="#" className="text-gray-300 hover:text-white transition-colors text-sm">Подарункові сертифікати</a>
              <a href="#" className="text-gray-300 hover:text-white transition-colors text-red-400 hover:text-red-300 text-sm">Акції</a>
            </nav>
          </div>

          <div className="flex flex-col gap-6">
            <h4 className="font-display font-bold text-xs uppercase text-gray-500 tracking-[0.2em]">Про нас</h4>
            <nav className="flex flex-col gap-3">
              <a href="#" className="text-gray-300 hover:text-white transition-colors text-sm">Історія бренду</a>
              <a href="#" className="text-gray-300 hover:text-white transition-colors text-sm">Наші цінності</a>
              <a href="#" className="text-gray-300 hover:text-white transition-colors text-sm">Блог</a>
              <a href="#" className="text-gray-300 hover:text-white transition-colors text-sm">Кар'єра</a>
              <a href="#" className="text-gray-300 hover:text-white transition-colors text-sm">Контакти</a>
            </nav>
          </div>

          <div className="flex flex-col gap-6">
            <h4 className="font-display font-bold text-xs uppercase text-gray-500 tracking-[0.2em]">Клієнтам</h4>
            <nav className="flex flex-col gap-3">
              <a href="#" className="text-gray-300 hover:text-white transition-colors text-sm">Доставка та оплата</a>
              <a href="#" className="text-gray-300 hover:text-white transition-colors text-sm">Повернення та обмін</a>
              <a href="#" className="text-gray-300 hover:text-white transition-colors text-sm">Таблиця розмірів</a>
              <a href="#" className="text-gray-300 hover:text-white transition-colors text-sm">FAQ</a>
              <a href="#" className="text-gray-300 hover:text-white transition-colors text-sm">Публічна оферта</a>
            </nav>
          </div>

          <div className="flex flex-col gap-6">
            <h4 className="font-display font-bold text-xs uppercase text-gray-500 tracking-[0.2em]">Контакти</h4>
            <div className="flex flex-col gap-4 text-sm text-gray-300">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-yellow-500 shrink-0" />
                <span className="leading-relaxed">м. Ірпінь,<br/>вул. Григорія Сковороди 11/7</span>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-yellow-500 shrink-0" />
                <span>Щодня: 09:00 - 18:00</span>
              </div>
              <div className="flex gap-4 mt-2">
                <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/20 hover:text-yellow-400 transition-all">
                  <Instagram className="w-5 h-5" />
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/20 hover:text-yellow-400 transition-all">
                  <Facebook className="w-5 h-5" />
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/20 hover:text-yellow-400 transition-all">
                  <Youtube className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 pt-8 pb-12 flex flex-col md:flex-row justify-between items-center gap-6 text-xs text-gray-500">
          <p>© 2026 Маленький Всесвіт. Всі права захищено.</p>
          <div className="flex gap-4 grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all duration-500">
             <div className="h-6 w-10 bg-white/10 rounded flex items-center justify-center font-bold">VISA</div>
             <div className="h-6 w-10 bg-white/10 rounded flex items-center justify-center font-bold">MC</div>
             <div className="h-6 w-10 bg-white/10 rounded flex items-center justify-center font-bold">PAY</div>
          </div>
        </div>
      </div>

      {/* Giant Background Text */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-[30%] w-full text-center pointer-events-none select-none overflow-hidden">
        <h1 className="text-[20vw] font-black text-white/[0.02] tracking-tighter uppercase leading-none whitespace-nowrap">
          МАЛЕНЬКИЙ ВСЕСВІТ
        </h1>
      </div>
    </footer>
  );
};
