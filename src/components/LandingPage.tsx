import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, 
  Sparkles, 
  ShieldCheck, 
  ArrowRight, 
  X, 
  ChevronRight, 
  Code, 
  Download, 
  CheckCircle, 
  CreditCard, 
  Cpu, 
  Layers, 
  MessageSquare,
  DollarSign,
  Phone,
  Mail,
  Zap,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { Product, Purchase, PurchaseItem } from '../types';

interface LandingPageProps {
  onAdminToggle: () => void;
  addedProductId?: string;
  clearAddedProduct?: () => void;
  products: Product[];
}

export default function LandingPage({ onAdminToggle, addedProductId, clearAddedProduct, products }: LandingPageProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [cart, setCart] = useState<Product[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  
  // Checkout states
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [discountCode, setDiscountCode] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);
  const [discountAmount, setDiscountAmount] = useState(0); // active tier percentage, e.g. 10
  
  // Progress states
  const [checkoutStep, setCheckoutStep] = useState<'cart' | 'paying' | 'success'>('cart');
  const [paymentLog, setPaymentLog] = useState<string[]>([]);
  const [stripeReceipt, setStripeReceipt] = useState<Purchase | null>(null);

  // Trigger add to cart from floating assistant
  useEffect(() => {
    if (addedProductId) {
      const prod = products.find(p => p.id === addedProductId);
      if (prod) {
        addToCart(prod);
        if (clearAddedProduct) clearAddedProduct();
      }
    }
  }, [addedProductId, products]);

  const addToCart = (product: Product) => {
    setCart(prev => {
      if (prev.some(item => item.id === product.id)) return prev; // Avoid multiples
      return [...prev, product];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const applyPromo = () => {
    if (discountCode.toUpperCase() === 'AETHER10' || discountCode.toUpperCase() === 'ORCHESTRATOR') {
      setCouponApplied(true);
      setDiscountAmount(10);
    } else {
      alert("Invalid promotional token.");
    }
  };

  const getSubtotal = () => cart.reduce((total, p) => total + p.price, 0);
  const getTotal = () => {
    const sub = getSubtotal();
    if (couponApplied) {
      return sub * (1 - discountAmount / 100);
    }
    return sub;
  };

  // Simulated Stripe payments & secure Firestore persistence
  const handleStripeCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !phone || !cardName || !cardNumber) {
      alert("Please complete required checkout metrics.");
      return;
    }

    setCheckoutStep('paying');
    setPaymentLog(["Contacting Stripe payment gateways...", "Encrypting credit key tokens on device..."]);

    // Simulated webhook log progression
    setTimeout(() => {
      setPaymentLog(prev => [...prev, "Processing authorization batch with token 0x9be7c7af...", "Verifying funds with banking system..."]);
    }, 1200);

    setTimeout(async () => {
      setPaymentLog(prev => [...prev, "Payment APPROVED by card issuer...", "Dispatching secure webhook to firestore analytics server..."]);
      
      const purchaseId = "st_txn_" + Math.random().toString(36).substr(2, 9);
      const downloadToken = "dl_tok_" + Math.random().toString(36).substr(2, 16);
      
      const purchaseData: Purchase = {
        id: purchaseId,
        email,
        phone,
        items: cart.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          fileUrl: item.fileUrl
        })),
        total: parseFloat(getTotal().toFixed(2)),
        status: 'completed',
        createdAt: new Date().toISOString(),
        token: downloadToken
      };

      try {
        // Direct write to /purchases with correct rules compliance
        const purchaseRef = doc(db, 'purchases', purchaseId);
        await setDoc(purchaseRef, {
          ...purchaseData,
          createdAt: serverTimestamp() // compliant timestamp
        });

        setStripeReceipt(purchaseData);
        setCheckoutStep('success');
        setCart([]); // Clear cart
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `purchases/${purchaseId}`);
      }
    }, 2800);
  };

  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden text-slate-800 selection:bg-blue-600/20">
      
      {/* Subtle Elegant Geometric Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none opacity-40" />

      {/* Modern High-End Top Bar */}
      <nav className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-sm bg-slate-950 flex items-center justify-center border border-slate-900">
              <Cpu className="w-4.5 h-4.5 text-white" />
            </div>
            <div>
              <span className="font-display font-bold text-base tracking-widest text-slate-950">AETHEROPS</span>
              <span className="block text-[8.5px] font-mono text-blue-600 tracking-widest uppercase">Autonomous Systems</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative flex items-center gap-2 bg-slate-100 border border-slate-200 hover:bg-slate-200 hover:border-slate-300 px-4 py-2 rounded-sm transition duration-150 cursor-pointer"
              id="cart-trigger"
            >
              <ShoppingBag className="w-4 h-4 text-blue-600" />
              <span className="text-xs font-semibold text-slate-800">Cart</span>
              {cart.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-blue-600 text-white font-bold text-[9px] w-5 h-5 rounded-full flex items-center justify-center border border-white animate-bounce">
                  {cart.length}
                </span>
              )}
            </button>

            <button
              id="admin-console-shortcut"
              onClick={onAdminToggle}
              className="bg-slate-950 hover:bg-blue-700 text-white px-4 py-2 rounded-sm border border-slate-950 text-xs tracking-wider uppercase font-mono font-medium transition cursor-pointer"
            >
              Control Center
            </button>
          </div>
        </div>
      </nav>

      {/* Elite Hero Presentation */}
      <header className="max-w-7xl mx-auto px-6 pt-24 pb-16 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-200/60 rounded-sm border border-slate-300 mb-6 text-[10px] text-slate-700 font-mono tracking-wider uppercase"
        >
          <Sparkles className="w-3.5 h-3.5 text-blue-600" />
          <span>AUTONOMOUS AGENCY FOR HUMAN ORCHESTRATORS</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="font-display font-medium text-4xl sm:text-6xl md:text-7xl lg:text-8xl tracking-tight leading-[1.05] text-slate-950 max-w-5xl mx-auto"
        >
          Automate. Procure. <br />
          <span className="font-serif font-light italic text-slate-600 normal-case block mt-2 text-3xl sm:text-5xl md:text-6xl">Orchestrate Infinite Scales.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto mt-6 leading-relaxed"
        >
          Deploy modular autonomous blueprints that execute high-velocity scraping, cryptographic social dispatches, and real-time CFO telemetry. Instant code delivery upon Stripe validation.
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-8 flex flex-col sm:flex-row justify-center gap-6 text-xs font-mono text-slate-500"
        >
          <span className="flex items-center justify-center gap-1.5"><ShieldCheck className="w-4 h-4 text-emerald-600" /> Stripe Secure Sandbox</span>
          <span className="flex items-center justify-center gap-1.5"><Zap className="w-4 h-4 text-blue-600" /> Direct File Downloads</span>
        </motion.div>
      </header>

      {/* Bento Blueprint Specifications */}
      <section className="max-w-7xl mx-auto px-6 py-10 relative z-10 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-slate-200 p-6 rounded-sm shadow-sm transition-all hover:border-slate-300">
          <div className="w-9 h-9 bg-slate-100 border border-slate-200 flex items-center justify-center mb-4">
            <Cpu className="w-4.5 h-4.5 text-blue-600" />
          </div>
          <h3 className="font-display font-bold text-sm text-slate-900 tracking-wider uppercase">01. Modular Blueprints</h3>
          <p className="text-slate-500 text-xs sm:text-sm mt-2 leading-relaxed">Pristine TypeScript and Python templates written strictly for instant headless implementation.</p>
        </div>

        <div className="bg-white border border-slate-200 p-6 rounded-sm shadow-sm transition-all hover:border-slate-300">
          <div className="w-9 h-9 bg-slate-100 border border-slate-200 flex items-center justify-center mb-4">
            <Layers className="w-4.5 h-4.5 text-blue-600" />
          </div>
          <h3 className="font-display font-bold text-sm text-slate-900 tracking-wider uppercase">02. Micro-SaaS Blueprints</h3>
          <p className="text-slate-500 text-xs sm:text-sm mt-2 leading-relaxed">Cryptographically signed APIs designed to hook directly into X (Twitter) and LinkedIn dispatchers.</p>
        </div>

        <div className="bg-white border border-slate-200 p-6 rounded-sm shadow-sm transition-all hover:border-slate-300">
          <div className="w-9 h-9 bg-slate-100 border border-slate-200 flex items-center justify-center mb-4">
            <ShieldCheck className="w-4.5 h-4.5 text-blue-600" />
          </div>
          <h3 className="font-display font-bold text-sm text-slate-900 tracking-wider uppercase">03. CFO Target Verification</h3>
          <p className="text-slate-500 text-xs sm:text-sm mt-2 leading-relaxed">Automate accounting, operational burn logging, and MRR cash flow forecasting with AI.</p>
        </div>
      </section>

      {/* clickable Product Blowups Catalog */}
      <section className="max-w-7xl mx-auto px-6 py-16 relative z-10" id="products-catalog-section">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 pb-4 border-b border-slate-200">
          <div>
            <span className="font-mono text-xs text-blue-600 uppercase tracking-widest font-semibold">Available Tech</span>
            <h2 className="font-display font-bold text-2xl sm:text-3xl text-slate-950 mt-1">Autonomous Blueprints Store</h2>
          </div>
          <span className="text-xs text-slate-500 font-mono mt-2 sm:mt-0">Showing {products.filter(p => selectedCategory === 'All' || (p.category || '').toLowerCase() === selectedCategory.toLowerCase()).length} operational systems</span>
        </div>

        {/* Category filtering buttons layout */}
        <div className="flex flex-wrap gap-2 mb-10">
          {["All", "Blueprints", "Micro-SaaS", "Controller", "Scripts"].map((cat) => {
            const count = cat === 'All' 
              ? products.length 
              : products.filter(p => (p.category || '').toLowerCase() === cat.toLowerCase()).length;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-1.5 rounded-sm border text-xs font-mono transition-all duration-200 cursor-pointer flex items-center gap-1.5 ${
                  selectedCategory === cat
                    ? "bg-slate-950 text-white border-slate-950 font-bold shadow-sm"
                    : "bg-white text-slate-600 hover:bg-slate-50 border-slate-200"
                }`}
              >
                <span>{cat}</span>
                <span className={`text-[10px] rounded-full px-1.5 py-0.2 ${selectedCategory === cat ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'}`}>{count}</span>
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {products.filter(p => selectedCategory === 'All' || (p.category || '').toLowerCase() === selectedCategory.toLowerCase()).map((p) => (
            <div 
              key={p.id}
              className="group bg-white border border-slate-200 rounded-sm overflow-hidden hover:border-slate-400 hover:shadow-lg transition-all duration-300 flex flex-col justify-between shadow-sm"
              id={`product-card-${p.id}`}
            >
              {/* Product Cover Accent */}
              <div className="h-44 bg-slate-50 p-6 flex flex-col justify-between relative overflow-hidden border-b border-slate-100">
                <div className="absolute inset-0 bg-slate-100/10 group-hover:bg-transparent transition-colors pointer-events-none" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[80px] font-black text-slate-200/40 font-display select-none pointer-events-none uppercase tracking-tighter">
                  {p.id.split('_')[1]}
                </div>
                
                <span className="bg-slate-200/80 px-2.5 py-1 rounded-sm border border-slate-300 text-[9px] font-mono tracking-wider font-semibold text-slate-700 self-start uppercase">
                  {p.category}
                </span>

                <div className="relative z-10">
                  <h3 className="font-display font-bold text-base text-slate-955 group-hover:text-blue-600 transition-colors">
                    {p.name}
                  </h3>
                </div>
              </div>

              {/* Card Meta Content */}
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <p className="text-slate-600 text-xs sm:text-sm leading-relaxed mb-6 line-clamp-3">
                    {p.description}
                  </p>

                  <div className="space-y-2 mb-6">
                    {p.features.slice(0, 2).map((feat, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-slate-600">
                        <CheckCircle className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <div>
                    <span className="block text-[8px] font-mono text-slate-400 uppercase tracking-widest font-semibold">One-off License</span>
                    <span className="font-mono font-bold text-[18px] text-slate-900">
                      ${p.price.toFixed(2)}
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedProduct(p)}
                      className="px-3 py-1.5 rounded-sm bg-slate-100 border border-slate-200 hover:bg-slate-200 text-xs font-semibold text-slate-700 transition cursor-pointer"
                      id={`blowup-trigger-${p.id}`}
                    >
                      Specs
                    </button>
                    <button
                      onClick={() => addToCart(p)}
                      className="px-3.5 py-1.5 rounded-sm bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white transition shadow-sm cursor-pointer"
                      id={`add-to-cart-btn-${p.id}`}
                    >
                      Buy
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Trust & Guarantee Segment */}
      <section className="bg-slate-900 border-t border-b border-slate-800 py-16 relative z-10 text-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <ShieldCheck className="w-10 h-10 text-blue-400 mx-auto mb-4" />
          <h2 className="font-display font-bold text-xl uppercase tracking-wider text-slate-100">Zero Risks. Stripe Verified Delivery.</h2>
          <p className="text-slate-400 text-xs sm:text-sm mt-3 max-w-xl mx-auto leading-relaxed font-mono">
            Upon successful checkout auth, AetherOps issues cryptographic access download keys on screen so you can deploy automation code loops instantly.
          </p>
        </div>
      </section>

      {/* High-End Footer */}
      <footer className="max-w-7xl mx-auto px-6 py-12 relative z-10 border-t border-slate-200 mt-16 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-sm bg-slate-900 flex items-center justify-center">
            <Cpu className="w-4 h-4 text-blue-400" />
          </div>
          <span className="font-mono text-xs text-slate-500">© 2026 AetherOps Suite. For Human Orchestrators.</span>
        </div>

        <button 
          onClick={onAdminToggle}
          className="text-xs font-mono text-slate-500 hover:text-blue-600 transition underline cursor-pointer"
        >
          Administrator Executive Login
        </button>
      </footer>


      {/* IMMERSIVE PRODUCT BLOWUP MODAL */}
      <AnimatePresence>
        {selectedProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedProduct(null)}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
            />

            {/* Modal Glass Panel */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white border border-slate-200 rounded-sm w-full max-w-2xl overflow-hidden relative z-10 shadow-2xl overflow-y-auto max-h-[90vh]"
            >
              {/* Header Cover Banner */}
              <div className="p-6 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                <div>
                  <span className="font-mono text-[9px] text-blue-600 tracking-wider font-semibold uppercase">{selectedProduct.category} Blueprint</span>
                  <h3 className="font-display font-bold text-lg text-slate-900 mt-1">{selectedProduct.name}</h3>
                </div>
                <button
                  onClick={() => setSelectedProduct(null)}
                  className="p-1.5 rounded-sm bg-slate-200 text-slate-600 hover:text-slate-900 transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Spec details Info */}
              <div className="p-6 md:p-8 space-y-6">
                <div>
                  <h4 className="font-mono text-xs text-slate-400 uppercase tracking-widest mb-2 font-semibold">Description</h4>
                  <p className="text-slate-600 text-sm leading-relaxed">{selectedProduct.description}</p>
                </div>

                <div>
                  <h4 className="font-mono text-xs text-slate-400 uppercase tracking-widest mb-3 font-semibold">Included Specifications & Operations</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {selectedProduct.features.map((feature, idx) => (
                      <div key={idx} className="flex gap-2.5 p-3 bg-slate-50 rounded-sm border border-slate-200">
                        <CheckCircle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                        <span className="text-xs sm:text-sm text-slate-700">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-4 bg-slate-50 rounded-sm border border-slate-200 flex items-start gap-3">
                  <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <p className="text-[11px] sm:text-xs text-slate-600 leading-relaxed">
                    This is an autonomous digital asset. Once payment succeeds, Stripe signals the webhook channel. This unlocks immediate full code deployment assets in txt/json formatting.
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
                  <div>
                    <span className="block text-[9px] font-mono text-slate-400 uppercase">License Fee</span>
                    <span className="font-mono font-bold text-xl text-slate-900">${selectedProduct.price.toFixed(2)}</span>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setSelectedProduct(null)}
                      className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-900 transition cursor-pointer"
                    >
                      Close Detail
                    </button>
                    <button
                      onClick={() => {
                        addToCart(selectedProduct);
                        setSelectedProduct(null);
                      }}
                      className="px-5 py-2 rounded-sm bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white transition cursor-pointer"
                    >
                      Buy Asset Now
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>


      {/* STRIPE SECURE CHECKOUT SLIDE DRAWER */}
      <AnimatePresence>
        {isCartOpen && (
          <div className="fixed inset-0 z-50 overflow-hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCartOpen(false)}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
              id="cart-backdrop"
            />

            <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                className="w-screen max-w-md bg-slate-900 border-l border-slate-800 text-slate-100 shadow-2xl flex flex-col justify-between h-full"
                id="checkout-cart-drawer"
              >
                {/* Cart Header */}
                <div className="p-6 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <ShoppingBag className="w-5 h-5 text-blue-400" />
                    <h3 className="font-display font-bold text-white tracking-wider text-base uppercase">Secure Checkout Suite</h3>
                  </span>
                  <button
                    onClick={() => setIsCartOpen(false)}
                    className="p-1 px-2 rounded-sm bg-slate-800 text-slate-300 hover:text-white transition text-xs font-mono cursor-pointer"
                  >
                    Esc
                  </button>
                </div>

                {/* Main Dynamic View: Cart -> Paying -> Success */}
                <div className="flex-1 overflow-y-auto p-6 fancy-scrollbar">
                  
                  {checkoutStep === 'cart' && (
                    <div className="space-y-6">
                      {cart.length === 0 ? (
                        <div className="text-center py-20 space-y-4">
                          <ShoppingBag className="w-12 h-12 text-slate-600 mx-auto" />
                          <p className="text-sm text-slate-400">Your cart is currently empty.</p>
                          <button
                            onClick={() => setIsCartOpen(false)}
                            className="text-blue-400 hover:text-blue-300 text-xs font-mono underline cursor-pointer"
                          >
                            Explore Available Blueprints
                          </button>
                        </div>
                      ) : (
                        <>
                          {/* Products Listing */}
                          <div className="space-y-3">
                            <h4 className="font-mono text-[10px] text-slate-400 uppercase tracking-widest font-bold">Selected Blueprints</h4>
                            {cart.map((p) => (
                              <div key={p.id} className="flex p-3 bg-slate-950 border border-slate-800 rounded-sm items-center justify-between">
                                <div>
                                  <span className="text-xs text-blue-400 font-mono uppercase text-[9px] block">{p.category}</span>
                                  <span className="text-sm font-semibold text-white block mt-0.5">{p.name}</span>
                                  <span className="text-xs text-slate-400 mt-1 block">${p.price.toFixed(2)}</span>
                                </div>
                                <button
                                  onClick={() => removeFromCart(p.id)}
                                  className="p-1 text-rose-400 hover:text-rose-300 text-xs font-mono hover:underline cursor-pointer"
                                >
                                  Remove
                                </button>
                              </div>
                            ))}
                          </div>

                          {/* Promo code box */}
                          <div className="p-4 bg-slate-950 border border-slate-800 rounded-sm space-y-3">
                            <h4 className="font-mono text-[10px] text-slate-400 uppercase tracking-widest font-bold">Coupon Authentication</h4>
                            <div className="flex gap-2">
                              <input
                                type="text"
                                placeholder="e.g. AETHER10"
                                value={discountCode}
                                onChange={(e) => setDiscountCode(e.target.value)}
                                className="flex-1 bg-slate-900 border border-slate-800 rounded-sm px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
                              />
                              <button
                                onClick={applyPromo}
                                className="bg-slate-800 hover:bg-slate-750 text-white rounded-sm px-4 py-1.5 text-xs transition cursor-pointer font-mono uppercase"
                              >
                                Apply
                              </button>
                            </div>
                            {couponApplied && (
                              <div className="text-xs text-emerald-400 flex items-center justify-between">
                                <span>Code applied successfully:</span>
                                <strong>-{discountAmount}% Off</strong>
                              </div>
                            )}
                          </div>

                          {/* Billing stripe payment details */}
                          <form onSubmit={handleStripeCheckout} className="space-y-4">
                            <h4 className="font-mono text-[10px] text-slate-400 uppercase tracking-widest font-bold">Stripe billing specifications</h4>
                            
                            <div className="space-y-3">
                              <div>
                                <label className="block text-[10px] font-mono text-slate-400 mb-1">Email (Instant Access Link) *</label>
                                <input
                                  type="email"
                                  placeholder="purchaser@enterprise.net"
                                  required
                                  value={email}
                                  onChange={(e) => setEmail(e.target.value)}
                                  className="w-full bg-slate-950 border border-slate-800 rounded-sm px-3 py-2 text-xs block text-white focus:outline-none focus:border-blue-500"
                                  id="stripe-email"
                                />
                              </div>

                              <div>
                                <label className="block text-[10px] font-mono text-slate-400 mb-1">Mobile/Phone (Secure Notification) *</label>
                                <input
                                  type="tel"
                                  placeholder="+1 (555) 302-8822"
                                  required
                                  value={phone}
                                  onChange={(e) => setPhone(e.target.value)}
                                  className="w-full bg-slate-950 border border-slate-800 rounded-sm px-3 py-2 text-xs block text-white focus:outline-none focus:border-blue-500"
                                  id="stripe-phone"
                                />
                              </div>

                              <div className="pt-2 border-t border-slate-800">
                                <label className="block text-[10px] font-mono text-slate-400 mb-1">Credit Card Number *</label>
                                <div className="relative">
                                  <input
                                    type="text"
                                    placeholder="4242 4242 4242 4242"
                                    required
                                    value={cardNumber}
                                    onChange={(e) => setCardNumber(e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-sm pl-8 pr-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 block"
                                  />
                                  <CreditCard className="w-4 h-4 text-blue-400 absolute left-2.5 top-0.5 mt-2" />
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <label className="block text-[10px] font-mono text-slate-400 mb-1">Expiration *</label>
                                  <input
                                    type="text"
                                    placeholder="MM/YY"
                                    required
                                    value={cardExpiry}
                                    onChange={(e) => setCardExpiry(e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-sm px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 block"
                                  />
                                </div>
                                <div>
                                  <label className="block text-[10px] font-mono text-slate-400 mb-1">CVV *</label>
                                  <input
                                    type="password"
                                    placeholder="321"
                                    required
                                    value={cardCvv}
                                    onChange={(e) => setCardCvv(e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-sm px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 block"
                                  />
                                </div>
                              </div>

                              <div>
                                <label className="block text-[10px] font-mono text-slate-400 mb-1">Cardholder Name *</label>
                                <input
                                  type="text"
                                  placeholder="Full Name"
                                  required
                                  value={cardName}
                                  onChange={(e) => setCardName(e.target.value)}
                                  className="w-full bg-slate-950 border border-slate-800 rounded-sm px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 block"
                                />
                              </div>
                            </div>

                            <button
                              type="submit"
                              id="stripe-checkout-btn"
                              className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-sm py-3 text-sm font-bold mt-6 transition cursor-pointer font-mono uppercase tracking-wider"
                            >
                              Confirm Payment: ${getTotal().toFixed(2)}
                            </button>
                          </form>
                        </>
                      )}
                    </div>
                  )}

                  {checkoutStep === 'paying' && (
                    <div className="flex flex-col items-center justify-center py-20 space-y-6">
                      <div className="relative">
                        <div className="w-16 h-16 rounded-full border-4 border-slate-700 border-t-blue-400 animate-spin" />
                        <ShieldCheck className="w-8 h-8 text-blue-400 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                      </div>
                      
                      <div className="text-center">
                        <h4 className="font-display font-medium text-white text-base">Stripe Webhook Authorization</h4>
                        <p className="text-xs text-slate-400 mt-1">Stand by while confirming ledger accounts.</p>
                      </div>

                      {/* Webhook dynamic console logging trace */}
                      <div className="w-full bg-slate-950 rounded-sm p-4 border border-slate-800 text-[10px] font-mono space-y-1.5 text-blue-300 max-h-36 overflow-y-auto">
                        {paymentLog.map((log, idx) => (
                          <div key={idx} className="flex gap-1">
                            <span className="text-[#34d399]">{">"}</span>
                            <span>{log}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {checkoutStep === 'success' && stripeReceipt && (
                    <div className="space-y-6">
                      <div className="p-4 bg-emerald-950/20 border border-emerald-500/20 rounded-sm text-center space-y-2">
                        <CheckCircle className="w-10 h-10 text-emerald-400 mx-auto" strokeWidth={1.5} />
                        <h4 className="font-display font-bold text-emerald-400 text-base">Receipt Confirmed!</h4>
                        <p className="text-[11px] text-slate-400">Payment receipt successfully logged in Firestore database.</p>
                      </div>

                      <div className="space-y-3">
                        <h4 className="font-mono text-[10px] text-slate-400 uppercase tracking-widest font-bold">Receipt Overview</h4>
                        <div className="bg-[#030712] rounded-sm border border-slate-800 p-4 space-y-2 text-xs font-mono">
                          <div className="flex justify-between">
                            <span className="text-slate-500">Receipt ID:</span>
                            <span className="text-slate-200">{stripeReceipt.id}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">Charged Amount:</span>
                            <span className="text-emerald-400 font-extrabold">${stripeReceipt.total.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">Destination Mail:</span>
                            <span className="text-slate-200">{stripeReceipt.email}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">Destination SMS:</span>
                            <span className="text-slate-200">{stripeReceipt.phone}</span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3 pt-2">
                        <h4 className="font-mono text-[10px] text-slate-400 uppercase tracking-widest font-bold">Instant Deliverables Downloads Collection</h4>
                        <p className="text-xs text-slate-400">Directly access your compiled automated blueprints below:</p>

                        <div className="space-y-2">
                          {stripeReceipt.items.map((item) => (
                            <div key={item.id} className="flex p-3 bg-slate-950 border border-slate-800 rounded-sm items-center justify-between">
                              <div>
                                <span className="text-[10px] font-mono text-blue-400 block">{item.id.split('_')[1]} specification</span>
                                <span className="text-xs font-semibold text-white block mt-0.5">{item.name}</span>
                              </div>
                              <a
                                href={`/api/downloads/${item.fileUrl}?token=${stripeReceipt.token}&purchaseId=${stripeReceipt.id}`}
                                download
                                className="bg-blue-600 hover:bg-blue-500 text-white rounded-sm px-3 py-1.5 text-xs font-semibold flex items-center gap-1.5 cursor-pointer decoration-none"
                              >
                                <Download className="w-3.5 h-3.5" />
                                <span>Get code</span>
                              </a>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="pt-4 border-t border-slate-800 flex gap-2">
                        <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full shrink-0 mt-1.5" />
                        <p className="text-[10px] text-slate-500 leading-relaxed">
                          A copy of your downloadable links and receipts has been securely logged. Dispatched link copies inside network simulation channels to {stripeReceipt.email} and {stripeReceipt.phone}.
                        </p>
                      </div>

                      <button
                        onClick={() => {
                          setCheckoutStep('cart');
                          setIsCartOpen(false);
                        }}
                        className="w-full bg-slate-850 hover:bg-slate-800 border border-slate-800 text-white rounded-sm py-2.5 text-xs font-semibold transition mt-4 cursor-pointer"
                      >
                        Return to Store
                      </button>
                    </div>
                  )}

                </div>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );;
}
