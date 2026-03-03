import React from 'react';
import { Hero } from '../components/Hero';
import { ProductGrid } from '../components/ProductGrid';
import { CategorySplit } from '../components/CategorySplit';
import { Reviews } from '../components/Reviews';
import { Editorial } from '../components/Editorial';

export const Home = () => (
  <>
    <Hero />
    <ProductGrid />
    <CategorySplit />
    <Reviews />
    <Editorial />
  </>
);
