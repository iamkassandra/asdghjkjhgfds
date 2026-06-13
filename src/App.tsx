import React, { useState, useEffect } from 'react';
import LandingPage from './components/LandingPage';
import CommandCenter from './components/CommandCenter';
import CustomerServiceChat from './components/CustomerServiceChat';
import { Product } from './types';
import { db } from './lib/firebase';
import { collection, onSnapshot, doc, setDoc } from 'firebase/firestore';

// Core default high-tech blueprints to ensure zero-cold-start gorgeous interface
const DEFAULT_PRODUCTS: Product[] = [
  {
    id: "asset_prospector",
    name: "Account Prospector Automation Blueprint",
    description: "Autonomous lead finder and parser. Headlessly sweeps Hacker News, social tech channels, and recruiter aggregates to identify corporate hiring budgets, isolates AI-oriented slots, and compiles strategic outreach rosters.",
    price: 29.00,
    fileUrl: "asset_prospector",
    image: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=400&q=80",
    category: "Blueprints",
    features: [
      "Headless Puppeteer scraping queues",
      "Dynamic lead metadata structuring",
      "Interactive command logs console compiler",
      "Auto-filtering key technology terms"
    ]
  },
  {
    id: "asset_webhook",
    name: "Express Social Webhook Queue",
    description: "Multi-channel automated social publisher. Constructs secure post buffers with cryptographic HMACS, enabling sole orchestrators to dispatch parallel growth queues to X (Twitter), LinkedIn, and Slack simultaneously.",
    price: 19.00,
    fileUrl: "asset_webhook",
    image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80",
    category: "Micro-SaaS",
    features: [
      "Parallel social multi-post adapters",
      "HMAC SHA256 cryptographic handshakes",
      "Interval queues with custom post-delay timers",
      "Client webhook authentication middleware"
    ]
  },
  {
    id: "asset_cfo",
    name: "Agentic Cashflow CFO Controller",
    description: "The supreme financial planning dashboard widget. Collects store orders from database snapshots, dynamically compiles MRR growth, measures active cloud burn-rates, and structures strategic forecast ledgers.",
    price: 39.00,
    fileUrl: "asset_cfo",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=400&q=80",
    category: "Controller",
    features: [
      "Dynamic MRR velocity calculator",
      "Ledger compilation and cash flow forecaster",
      "Interactive target telemetry graphs module",
      "Full offline fallback state support"
    ]
  }
];

export default function App() {
  const [view, setView] = useState<'store' | 'admin'>('store');
  const [products, setProducts] = useState<Product[]>(DEFAULT_PRODUCTS);
  const [addedProductId, setAddedProductId] = useState<string | undefined>(undefined);

  // Sync products list in real-time from Firestore, seed with defaults if empty
  useEffect(() => {
    const productsCol = collection(db, 'products');

    const unsubscribe = onSnapshot(productsCol, (snapshot) => {
      if (snapshot.empty) {
        // Automatically seed defaults in Firestore for instant live testing
        DEFAULT_PRODUCTS.forEach(async (p) => {
          try {
            await setDoc(doc(db, 'products', p.id), p);
          } catch (e) {
            console.warn("Product seeding skipped (check Firestore permissions):", e);
          }
        });
        setProducts(DEFAULT_PRODUCTS);
      } else {
        const liveProducts: Product[] = [];
        snapshot.forEach((doc) => {
          liveProducts.push(doc.data() as Product);
        });
        setProducts(liveProducts);
      }
    }, (error) => {
      console.warn("Firestore listener warning (running with default memory state):", error);
      setProducts(DEFAULT_PRODUCTS);
    });

    return () => unsubscribe();
  }, []);

  const handleAddProductLocal = (newProd: Product) => {
    setProducts(prev => {
      if (prev.some(item => item.id === newProd.id)) return prev;
      return [...prev, newProd];
    });
  };

  const selectAddToCartFromChat = (productId: string) => {
    setAddedProductId(productId);
  };

  return (
    <div className="min-h-screen bg-[#030712] relative select-none">
      
      {/* Dynamic View switching */}
      {view === 'store' ? (
        <>
          <LandingPage 
            products={products}
            onAdminToggle={() => setView('admin')}
            addedProductId={addedProductId}
            clearAddedProduct={() => setAddedProductId(undefined)}
          />
          {/* Chat widget layer */}
          <CustomerServiceChat 
            onAddToCart={selectAddToCartFromChat}
          />
        </>
      ) : (
        <CommandCenter 
          products={products}
          onBackToStore={() => setView('store')}
          onAddProduct={handleAddProductLocal}
        />
      )}
    </div>
  );
}
