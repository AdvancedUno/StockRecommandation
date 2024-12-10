'use client';

import StockSelector from '../components/StockSelector';

export default function Home() {
  return (
    <main style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Stock Portfolio Recommender</h1>
      <StockSelector />
    </main>
  );
}
