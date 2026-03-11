import React from 'react';
import { motion } from 'motion/react';
import { Truck, CreditCard, Package, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSiteContent } from '../context/SiteContentContext';

export const DeliveryPayment = () => {
  const { content } = useSiteContent();
  const d = content.delivery ?? {};
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
        {d.title ?? 'Доставка та оплата'}
      </h1>

      <div className="space-y-12">
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-violet-100 flex items-center justify-center">
              <Truck className="w-6 h-6 text-violet-600" />
            </div>
            <h2 className="text-xl font-bold">{d.deliveryTitle ?? 'Доставка'}</h2>
          </div>
          <div className="text-base text-gray-600 leading-relaxed space-y-4 [&_p]:mb-4 [&_strong]:font-semibold [&_strong]:text-gray-800">
            {(d.deliveryText ?? '').split('\n\n').filter(Boolean).map((para, i) => (
              <p key={i}>{para.split('\n').map((line, j) => {
                const idx = line.indexOf('—');
                if (idx > 0) {
                  const bold = line.slice(0, idx).trim();
                  const rest = line.slice(idx + 1).trim();
                  return <span key={j}><strong>{bold}</strong> — {rest} </span>;
                }
                return <span key={j}>{line}</span>;
              })}</p>
            ))}
          </div>
        </section>

        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-emerald-600" />
            </div>
            <h2 className="text-xl font-bold">{d.paymentTitle ?? 'Оплата'}</h2>
          </div>
          <div className="text-base text-gray-600 leading-relaxed space-y-4 [&_p]:mb-4 [&_strong]:font-semibold [&_strong]:text-gray-800">
            {(d.paymentText ?? '').split('\n\n').filter(Boolean).map((para, i) => (
              <p key={i}>{para.split('\n').map((line, j) => {
                const idx = line.indexOf('—');
                if (idx > 0) {
                  const bold = line.slice(0, idx).trim();
                  const rest = line.slice(idx + 1).trim();
                  return <span key={j}><strong>{bold}</strong> — {rest} </span>;
                }
                return <span key={j}>{line}</span>;
              })}</p>
            ))}
          </div>
        </section>

        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center">
              <Package className="w-6 h-6 text-amber-600" />
            </div>
            <h2 className="text-xl font-bold">{d.returnsTitle ?? 'Повернення'}</h2>
          </div>
          <div className="text-base text-gray-600 leading-relaxed space-y-4 [&_p]:mb-4">
            {(d.returnsText ?? '').split('\n\n').filter(Boolean).map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>
        </section>
      </div>
    </div>
  </motion.article>
  );
};
