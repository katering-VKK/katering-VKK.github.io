import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Bot, CalendarCheck, CheckCircle2, ShoppingBag } from 'lucide-react';
import { useStore } from '../store';

const launchSteps = [
  {
    icon: ShoppingBag,
    title: 'Кошик на сайті',
    text: 'Клієнт обирає товари в каталозі та одразу переходить до оформлення.',
  },
  {
    icon: Bot,
    title: 'Telegram-дублер',
    text: 'Бот залишається резервним каналом, щоб заявки не губилися під час запуску.',
  },
  {
    icon: CheckCircle2,
    title: 'Робота з аудиторією',
    text: 'Після старту можна повноцінно приймати онлайн-аудиторію та обробляти замовлення.',
  },
];

export const OnlineOrdersLaunch = () => {
  const { scrollToGrid, setCartOpen } = useStore();

  return (
    <section className="bg-white py-20 px-4 sm:px-6">
      <div className="mx-auto max-w-[1440px] overflow-hidden rounded-[2rem] border border-gray-100 bg-gray-950 text-white shadow-2xl">
        <div className="grid gap-0 lg:grid-cols-[1.05fr_0.95fr]">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-120px' }}
            transition={{ duration: 0.45, ease: 'easeOut' }}
            className="px-6 py-10 sm:px-10 lg:px-14 lg:py-16"
          >
            <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold uppercase tracking-widest text-white/80">
              <CalendarCheck className="h-4 w-4 text-[var(--color-bobo-yellow)]" />
              Запуск 10 червня
            </div>

            <h2 className="max-w-3xl font-display text-4xl font-extrabold uppercase leading-[0.98] tracking-tight sm:text-5xl lg:text-6xl">
              Впроваджуємо онлайн-замовлення
            </h2>

            <p className="mt-6 max-w-2xl text-base leading-7 text-white/[0.82] sm:text-lg">
              Через тиждень на сайті працюватиме повний сценарій онлайн-замовлення. Потрібний розділ уже підготовлений, а Telegram-бот буде дублером для стабільного прийому заявок.
            </p>

            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <button
                onClick={scrollToGrid}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[var(--color-bobo-yellow)] px-7 py-3 text-sm font-bold uppercase tracking-wider text-black transition-all hover:brightness-110 active:scale-[0.98]"
              >
                До каталогу
                <ArrowRight className="h-4 w-4" />
              </button>
              <button
                onClick={() => setCartOpen(true)}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-white/20 bg-white/5 px-7 py-3 text-sm font-bold uppercase tracking-wider text-white transition-all hover:bg-white/10 active:scale-[0.98]"
              >
                Перевірити кошик
                <ShoppingBag className="h-4 w-4" />
              </button>
            </div>
          </motion.div>

          <div className="border-t border-white/10 bg-white/[0.03] px-6 py-8 sm:px-10 lg:border-l lg:border-t-0 lg:px-12 lg:py-14">
            <div className="grid gap-4">
              {launchSteps.map((step, index) => {
                const Icon = step.icon;
                return (
                  <motion.div
                    key={step.title}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: '-120px' }}
                    transition={{ delay: index * 0.08, duration: 0.4, ease: 'easeOut' }}
                    className="grid grid-cols-[auto_1fr] gap-4 rounded-2xl border border-white/10 bg-white/[0.08] p-5"
                  >
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-gray-950">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold uppercase tracking-wider text-white">{step.title}</h3>
                      <p className="mt-2 text-sm leading-6 text-white/[0.78]">{step.text}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            <div className="mt-6 rounded-2xl border border-emerald-300/30 bg-emerald-400/[0.12] p-5 text-sm leading-6 text-emerald-50">
              Готовність до старту: каталог, кошик, оформлення та адмін-перегляд замовлень уже зібрані в одному сценарії.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
