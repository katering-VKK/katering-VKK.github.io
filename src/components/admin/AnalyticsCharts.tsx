import React, { useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import type { Product } from '../../data/products';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, PointElement, LineElement, Title, Tooltip, Legend);

function priceNumber(p: Product) {
  return parseInt(String(p.price || '').replace(/\s/g, '').replace('\u20b4', ''), 10) || 0;
}

function productUnits(p: Product) {
  return typeof p.units === 'number' && p.units >= 0 ? p.units : 1;
}

const PALETTE = [
  'rgba(139,92,246,0.8)',
  'rgba(59,130,246,0.8)',
  'rgba(16,185,129,0.8)',
  'rgba(245,158,11,0.8)',
  'rgba(239,68,68,0.8)',
  'rgba(168,85,247,0.8)',
  'rgba(6,182,212,0.8)',
  'rgba(251,146,60,0.8)',
];

export function AnalyticsCharts({ products }: { products: Product[] }) {
  const categoryData = useMemo(() => {
    const map: Record<string, { count: number; units: number; value: number }> = {};
    products.forEach(p => {
      const cat = p.category || '\u0406\u043d\u0448\u0435';
      map[cat] = map[cat] || { count: 0, units: 0, value: 0 };
      map[cat].count += 1;
      map[cat].units += productUnits(p);
      map[cat].value += priceNumber(p) * productUnits(p);
    });
    const entries = Object.entries(map).sort((a, b) => b[1].count - a[1].count);
    return {
      labels: entries.map(e => e[0]),
      counts: entries.map(e => e[1].count),
      values: entries.map(e => e[1].value),
      units: entries.map(e => e[1].units),
    };
  }, [products]);

  const priceDistribution = useMemo(() => {
    const ranges = [
      { label: '0\u2013100 \u20b4', min: 0, max: 100 },
      { label: '101\u2013300 \u20b4', min: 101, max: 300 },
      { label: '301\u2013500 \u20b4', min: 301, max: 500 },
      { label: '501\u20131000 \u20b4', min: 501, max: 1000 },
      { label: '1000+ \u20b4', min: 1001, max: Infinity },
    ];
    const counts = ranges.map(r => products.filter(p => {
      const pr = priceNumber(p);
      return pr >= r.min && pr <= r.max;
    }).length);
    return { labels: ranges.map(r => r.label), counts };
  }, [products]);

  const topProducts = useMemo(() => {
    return [...products]
      .sort((a, b) => priceNumber(b) * productUnits(b) - priceNumber(a) * productUnits(a))
      .slice(0, 10);
  }, [products]);

  const qualityData = useMemo(() => {
    const withImage = products.filter(p => p.image).length;
    const withDesc = products.filter(p => String(p.description ?? '').trim()).length;
    const withArticle = products.filter(p => String(p.article ?? '').trim()).length;
    return {
      labels: ['\u0417 \u0444\u043e\u0442\u043e', '\u0411\u0435\u0437 \u0444\u043e\u0442\u043e', '\u0417 \u043e\u043f\u0438\u0441\u043e\u043c', '\u0411\u0435\u0437 \u043e\u043f\u0438\u0441\u0443', '\u0417 \u0430\u0440\u0442\u0438\u043a\u0443\u043b\u043e\u043c', '\u0411\u0435\u0437 \u0430\u0440\u0442\u0438\u043a\u0443\u043b\u0443'],
      values: [withImage, products.length - withImage, withDesc, products.length - withDesc, withArticle, products.length - withArticle],
    };
  }, [products]);

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-4">{'\u0422\u043e\u0432\u0430\u0440\u0438 \u043f\u043e \u043a\u0430\u0442\u0435\u0433\u043e\u0440\u0456\u044f\u0445'}</h3>
          <Doughnut
            data={{
              labels: categoryData.labels,
              datasets: [{
                data: categoryData.counts,
                backgroundColor: PALETTE.slice(0, categoryData.labels.length),
                borderWidth: 2,
                borderColor: '#fff',
              }],
            }}
            options={{
              responsive: true,
              plugins: { legend: { position: 'bottom', labels: { boxWidth: 12, padding: 12 } } },
            }}
          />
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-4">{'\u0412\u0430\u0440\u0442\u0456\u0441\u0442\u044c \u043f\u043e \u043a\u0430\u0442\u0435\u0433\u043e\u0440\u0456\u044f\u0445'}</h3>
          <Bar
            data={{
              labels: categoryData.labels,
              datasets: [{
                label: '\u0421\u0443\u043c\u0430 (\u20b4)',
                data: categoryData.values,
                backgroundColor: PALETTE.slice(0, categoryData.labels.length),
                borderRadius: 8,
              }],
            }}
            options={{
              responsive: true,
              plugins: { legend: { display: false } },
              scales: { y: { beginAtZero: true, ticks: { callback: v => Number(v).toLocaleString('uk-UA') + ' \u20b4' } } },
            }}
          />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-4">{'\u0420\u043e\u0437\u043f\u043e\u0434\u0456\u043b \u0446\u0456\u043d'}</h3>
          <Bar
            data={{
              labels: priceDistribution.labels,
              datasets: [{
                label: '\u041a\u0456\u043b\u044c\u043a\u0456\u0441\u0442\u044c \u0442\u043e\u0432\u0430\u0440\u0456\u0432',
                data: priceDistribution.counts,
                backgroundColor: 'rgba(139,92,246,0.7)',
                borderRadius: 8,
              }],
            }}
            options={{
              responsive: true,
              plugins: { legend: { display: false } },
              scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } },
            }}
          />
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-4">{'\u042f\u043a\u0456\u0441\u0442\u044c \u043a\u0430\u0440\u0442\u043e\u043a'}</h3>
          <Bar
            data={{
              labels: qualityData.labels,
              datasets: [{
                data: qualityData.values,
                backgroundColor: ['#10b981', '#ef4444', '#10b981', '#ef4444', '#10b981', '#ef4444'],
                borderRadius: 8,
              }],
            }}
            options={{
              responsive: true,
              indexAxis: 'y',
              plugins: { legend: { display: false } },
              scales: { x: { beginAtZero: true, ticks: { stepSize: 1 } } },
            }}
          />
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <h3 className="text-lg font-bold text-gray-900 mb-4">{'\u0422\u043e\u043f-10 \u0442\u043e\u0432\u0430\u0440\u0456\u0432 \u0437\u0430 \u0432\u0430\u0440\u0442\u0456\u0441\u0442\u044e (\u0446\u0456\u043d\u0430 \u00d7 \u044e\u043d\u0456\u0442\u0438)'}</h3>
        <Bar
          data={{
            labels: topProducts.map(p => (p.name.length > 30 ? p.name.slice(0, 27) + '\u2026' : p.name)),
            datasets: [{
              label: '\u0412\u0430\u0440\u0442\u0456\u0441\u0442\u044c (\u20b4)',
              data: topProducts.map(p => priceNumber(p) * productUnits(p)),
              backgroundColor: 'rgba(59,130,246,0.7)',
              borderRadius: 8,
            }],
          }}
          options={{
            responsive: true,
            indexAxis: 'y',
            plugins: { legend: { display: false } },
            scales: { x: { beginAtZero: true, ticks: { callback: v => Number(v).toLocaleString('uk-UA') + ' \u20b4' } } },
          }}
        />
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <h3 className="text-lg font-bold text-gray-900 mb-4">{'\u042e\u043d\u0456\u0442\u0438 \u043f\u043e \u043a\u0430\u0442\u0435\u0433\u043e\u0440\u0456\u044f\u0445'}</h3>
        <Line
          data={{
            labels: categoryData.labels,
            datasets: [{
              label: '\u042e\u043d\u0456\u0442\u0456\u0432',
              data: categoryData.units,
              borderColor: 'rgba(139,92,246,1)',
              backgroundColor: 'rgba(139,92,246,0.1)',
              fill: true,
              tension: 0.4,
              pointRadius: 6,
              pointBackgroundColor: 'rgba(139,92,246,1)',
            }],
          }}
          options={{
            responsive: true,
            plugins: { legend: { display: false } },
            scales: { y: { beginAtZero: true } },
          }}
        />
      </div>
    </div>
  );
}
