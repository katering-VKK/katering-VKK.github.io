import React from 'react';
import { motion } from 'motion/react';
import { Truck, CreditCard, Package, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export const DeliveryPayment = () => (
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
        Доставка та оплата
      </h1>

      <div className="space-y-12">
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-violet-100 flex items-center justify-center">
              <Truck className="w-6 h-6 text-violet-600" />
            </div>
            <h2 className="text-xl font-bold">Доставка</h2>
          </div>
          <div className="prose prose-gray max-w-none text-gray-600 leading-relaxed space-y-4">
            <p><strong>Самовивіз</strong> — безкоштовно з магазину за адресою: м. Ірпінь, вул. Григорія Сковороди 11/7. Режим роботи: щодня з 09:00 до 18:00.</p>
            <p><strong>Доставка по Ірпеню</strong> — від 50 ₴. Мінімальне замовлення для доставки — 200 ₴.</p>
            <p><strong>Нова Пошта</strong> — відправлення протягом 1–2 робочих днів. Вартість за тарифами перевізника.</p>
            <p><strong>Укрпошта</strong> — за тарифами перевізника. Термін доставки — 3–7 днів.</p>
          </div>
        </section>

        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-emerald-600" />
            </div>
            <h2 className="text-xl font-bold">Оплата</h2>
          </div>
          <div className="prose prose-gray max-w-none text-gray-600 leading-relaxed space-y-4">
            <p><strong>Готівка</strong> — при самовивозі або доставці кур'єром.</p>
            <p><strong>Картка</strong> — Visa, Mastercard при отриманні або онлайн.</p>
            <p><strong>Оплата при отриманні</strong> — для доставки Нова Пошта та Укрпошта.</p>
          </div>
        </section>

        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center">
              <Package className="w-6 h-6 text-amber-600" />
            </div>
            <h2 className="text-xl font-bold">Повернення</h2>
          </div>
          <div className="prose prose-gray max-w-none text-gray-600 leading-relaxed space-y-4">
            <p>Товар належної якості можна повернути протягом 14 днів з моменту отримання. Товар має зберегти товарний вигляд та упаковку.</p>
            <p>При поверненні через Нова Пошта — вартість пересилки оплачує клієнт.</p>
          </div>
        </section>
      </div>
    </div>
  </motion.article>
);
