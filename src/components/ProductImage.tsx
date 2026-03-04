import React, { useState } from 'react';
import { resolveImageUrl } from '../utils/imageUrl';
import { getProductGradient } from '../data/products';
import type { Product } from '../data/products';

type ProductImageProps = {
  product: Product;
  className?: string;
  imgClassName?: string;
  loading?: 'lazy' | 'eager';
  letterSize?: 'xs' | 'sm' | 'md';
};

export function ProductImage({ product, className = '', imgClassName = 'w-full h-full object-cover', loading = 'lazy', letterSize = 'md' }: ProductImageProps) {
  const [failed, setFailed] = useState(false);
  const url = product.image ? resolveImageUrl(product.image) || product.image : null;

  if (!url || failed) {
    const letterClass = letterSize === 'xs' ? 'text-white/40 text-xl' : letterSize === 'sm' ? 'text-white/30 text-2xl' : 'text-white/40 text-7xl';
    return (
      <div className={`flex items-center justify-center relative ${className}`} style={{ background: getProductGradient(product.id, product.category) }}>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.15)_100%)]" />
        <span className={`${letterClass} font-black select-none drop-shadow-lg relative z-10`}>{product.name.charAt(0)}</span>
      </div>
    );
  }

  return (
    <img
      src={url}
      alt={product.name}
      className={imgClassName}
      loading={loading}
      onError={() => setFailed(true)}
    />
  );
}
