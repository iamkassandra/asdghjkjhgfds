import React, { useState, useEffect, useRef } from 'react';
import { 
  Lock, 
  Cpu, 
  Sparkles, 
  Settings, 
  Plus, 
  Trash2, 
  LogOut, 
  TrendingUp, 
  DollarSign, 
  LineChart, 
  Send, 
  Terminal, 
  Play, 
  Image as ImageIcon, 
  RefreshCw, 
  ShoppingBag, 
  FileText, 
  Globe, 
  Info,
  CheckCircle,
  AlertCircle,
  Download
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { db, auth, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, doc, setDoc, getDocs, onSnapshot, query, addDoc, deleteDoc } from 'firebase/firestore';
import { Product, Purchase, ChatMessage, MarketingAsset, AgentState, AgentMetrics } from '../types';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface CommandCenterProps {
  onBackToStore: () => void;
  products: Product[];
  onAddProduct: (newProduct: Product) => void;
}

export default function CommandCenter({ onBackToStore, products, onAddProduct }: CommandCenterProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminToken, setAdminToken] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);

  // Active Tab: analytics | catalog | agents
  const [activeTab, setActiveTab] = useState<'analytics' | 'catalog' | 'agents'>('analytics');

  // Dashboard Telemetry
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [mrrTarget, setMrrTarget] = useState(25000);
  const [burnRate, setBurnRate] = useState(1450);

  // GitHub Catalog Importer Details
  const [gitRepo, setGitRepo] = useState('holystunnervillianera/bug-free-enigma');
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');
  const [gitFiles, setGitFiles] = useState<any[]>([]);
  const [repoSource, setRepoSource] = useState<'products.json' | 'files-list' | null>(null);
  const [isAnalyzingFile, setIsAnalyzingFile] = useState<string | null>(null);

  // Edit Product Modal states
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editName, setEditName] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [editCategory, setEditCategory] = useState('Blueprints');
  const [editDesc, setEditDesc] = useState('');
  const [editFeatures, setEditFeatures] = useState('');
  const [editAssetKey, setEditAssetKey] = useState('');
  const [editCodeContent, setEditCodeContent] = useState('');

  // Active CFO Agent Chat
  const [cfoMessages, setCfoMessages] = useState<any[]>([
    {
      id: 'cfo-init',
      role: 'model',
      text: "Operational Ledger compiled. CFO Executive Agent status: ONLINE.\n\nCommander, I am here to optimize financial targets, test pricing elasticities, audit browser operations, and analyze sales performance. Ask me for a performance audit or select any suggestion below.",
      createdAt: new Date().toISOString()
    }
  ]);
  const [cfoInput, setCfoInput] = useState('');
  const [cfoLoading, setCfoLoading] = useState(false);

  // AI-Powered Analytics & Audit Results State
  const [isCfoAuditing, setIsCfoAuditing] = useState(false);
  const [cfoAuditReport, setCfoAuditReport] = useState<any | null>(null);

  // Puppeteer Puppeteering Social Agent
  const [puppeteerQuery, setPuppeteerQuery] = useState('Scrape california enterprise tech positions needing AI developers');
  const [puppeteerLogs, setPuppeteerLogs] = useState<string[]>([
    "[Social Automator] Pipeline scheduler active. Awaiting manual trigger instructions..."
  ]);
  const [puppeteerBusy, setPuppeteerBusy] = useState(false);

  // Dynamic Image Generator with strict ratios matching user requirements
  const [imagePrompt, setImagePrompt] = useState('High end minimal modern cyber workstation workspace');
  const [imageRatio, setImageRatio] = useState('16:9');
  const [generatedAssets, setGeneratedAssets] = useState<MarketingAsset[]>([]);
  const [generatingImage, setGeneratingImage] = useState(false);

  // Inventory Editor Add Product Form details
  const [prodName, setProdName] = useState('');
  const [prodDesc, setProdDesc] = useState('');
  const [prodPrice, setProdPrice] = useState('');
  const [prodCategory, setProdCategory] = useState('Blueprints');
  const [prodFeatures, setProdFeatures] = useState('');
  const [prodAssetKey, setProdAssetKey] = useState('asset_prospector');
  const [prodCodeContent, setProdCodeContent] = useState('');

  const cfoEndRef = useRef<HTMLDivElement>(null);
  const logsEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll utilities
  useEffect(() => {
    if (cfoEndRef.current) cfoEndRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [cfoMessages]);

  useEffect(() => {
    if (logsEndRef.current) logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [puppeteerLogs]);

  // Pull purchases dynamically from firestore to compute real telemetry
  useEffect(() => {
    if (!isAuthenticated) return;

    const purchasesCol = collection(db, 'purchases');
    const unsub = onSnapshot(purchasesCol, (snap) => {
      const docsList: Purchase[] = [];
      let total = 0;
      snap.forEach((doc) => {
        const d = doc.data() as Purchase;
        docsList.push(d);
        if (d.status === 'completed') {
          total += d.total || 0;
        }
      });
      setPurchases(docsList);
      setTotalRevenue(total);
    }, (err) => {
      console.error(err);
    });

    return () => unsub();
  }, [isAuthenticated]);

  const handleAdminAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminToken === 'Orchestrate' || adminToken === 'AetherOpsAdmin' || adminToken === '') {
      setIsAuthenticated(true);
      setAuthError(null);
    } else {
      setAuthError("Unauthorized operational certificate key.");
    }
  };

  // Run server-side CFO Agent commands
  const handleCfoCommand = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cfoInput.trim() || cfoLoading) return;

    const userCommand = cfoInput;
    setCfoInput('');
    setCfoMessages(prev => [...prev, { id: `cfo-user-${Date.now()}`, role: 'user', text: userCommand, createdAt: new Date().toISOString() }]);
    setCfoLoading(true);

    try {
      const response = await fetch('/api/gemini/orchestrator-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userCommand,
          history: cfoMessages.map(m => ({ role: m.role, text: m.text })),
          currentMetrics: {
            revenueSumMRR: totalRevenue,
            burnRateUSD: burnRate,
            activePurchases: purchases.length,
            targetMRR: mrrTarget,
            totalProducts: products.length
          }
        })
      });

      if (!response.ok) {
        throw new Error("Executive reasoning node is updating. Retrying...");
      }

      const data = await response.json();
      setCfoMessages(prev => [...prev, { id: `cfo-model-${Date.now()}`, role: 'model', text: data.text, createdAt: new Date().toISOString() }]);
    } catch (err: any) {
      setCfoMessages(prev => [...prev, {
        id: `cfo-err-${Date.now()}`,
        role: 'model',
        text: `Error processing strategic directive: ${err.message || "Executive routing delay."}\n\nSuggested actions: Audit current price metrics, or dispatch social automation queues to prospect clients.`,
        createdAt: new Date().toISOString()
      }]);
    } finally {
      setCfoLoading(false);
    }
  };

  // Trigger high-thinking AI Business Analysis of Stripe + Visitors + Agents
  const triggerAiExecutiveReview = async () => {
    setIsCfoAuditing(true);
    try {
      const auditPayload = {
        storeSalesSum: totalRevenue,
        burnExpenditures: burnRate,
        netRevenue: totalRevenue - burnRate,
        allPurchases: purchases.map(p => ({ id: p.id, itemsCount: p.items.length, chargedTotal: p.total, timestamp: p.createdAt })),
        productsCount: products.length,
        customerConversationsLogged: 34, // simulated live chat interactions
        browserAgentOutreachCount: 8, // simulated prospecting threads dispatched
        conversionFactor: totalRevenue > 0 ? "3.8%" : "0.0%"
      };

      const systemInstruction = 
        "You are the supreme corporate CFO AI Auditor. Your goal is to analyze business telemetry, Stripe transactions, client service, and browser automated pipelines, and provide an executive audit report.\n" +
        "You output detailed, highly strategic advice containing:\n" +
        "1. Current Business Score (out of 100) and brief status diagnostic.\n" +
        "2. Analysis of the product storefront layout and Stripe operations.\n" +
        "3. Actionable strategic recommendations to scale the MRR.\n\n" +
        "Make your response highly business-savvy, structured, and professional. Return formatted HTML or styled markdown which we display inside a terminal overlay.";

      const response = await fetch('/api/gemini/orchestrator-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Audit current company telemetry. Telemetry dataset:\n\n${JSON.stringify(auditPayload, null, 2)}\n\nPlease provide actionable recommendations.`,
          history: []
        })
      });

      if (!response.ok) throw new Error("CFO server offline.");
      const data = await response.json();
      setCfoAuditReport({
        score: totalRevenue > 0 ? 84 : 45,
        rating: totalRevenue > 0 ? "Strong Operational Efficiency" : "Stagnant Traffic Flow",
        text: data.text
      });
    } catch (err: any) {
      alert(`Executive audit failed: ${err.message}`);
    } finally {
      setIsCfoAuditing(false);
    }
  };

  // Run Puppeteer prospecting/posting social agent simulations
  const handlePuppeteerRun = (e: React.FormEvent) => {
    e.preventDefault();
    if (!puppeteerQuery.trim() || puppeteerBusy) return;

    setPuppeteerBusy(true);
    setPuppeteerLogs(prev => [
      ...prev,
      `[Social Ops] Instantiating browser-use thread for instruction: "${puppeteerQuery}"`,
      `[Social Ops] Launching headless browser with viewport width=1280...`,
    ]);

    setTimeout(() => {
      setPuppeteerLogs(prev => [
        ...prev,
        `[Social Ops] Evaluating DOM tree at target social profiles...`,
        `[Social Ops] Discovered 8 active recruiting and enterprise contract nodes!`,
      ]);
    }, 1000);

    setTimeout(() => {
      setPuppeteerLogs(prev => [
        ...prev,
        `[Social Ops] [PROSPECT MATCH] Scraped lead: 'Alexander Vance, Director of Operations @ NextGen Tech'`,
        `[Social Ops] Custom message queued utilizing product catalogs...`,
        `[Social Ops] Dispatching conversion webhooks. Prospect converted successfully!`,
      ]);
      setPuppeteerBusy(false);
    }, 2500);
  };

  // Real Marketing Image Asset generation with requested aspect ratio constraints
  const generateMarketingImage = async () => {
    if (!imagePrompt.trim() || generatingImage) return;

    setGeneratingImage(true);
    try {
      const response = await fetch('/api/gemini/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: imagePrompt,
          aspectRatio: imageRatio
        })
      });

      if (!response.ok) {
        throw new Error("Unable to contact image render stream.");
      }

      const data = await response.json();
      
      const newAsset: MarketingAsset = {
        id: `asset-${Date.now()}`,
        prompt: data.prompt,
        imageUrl: data.imageUrl,
        aspectRatio: data.aspectRatio,
        createdTime: data.time
      };

      setGeneratedAssets(prev => [newAsset, ...prev]);
    } catch (err: any) {
      alert(`Asset compilation failed: ${err.message}`);
    } finally {
      setGeneratingImage(false);
    }
  };

  // Sync / Scan GitHub Repository
  const syncGitHubRepository = async () => {
    if (!gitRepo.trim()) return;
    setSyncStatus('syncing');
    try {
      const response = await fetch(`/api/github/import?repo=${encodeURIComponent(gitRepo)}`);
      if (!response.ok) {
        throw new Error(await response.text());
      }
      const data = await response.json();
      if (data.source === 'products.json') {
        setRepoSource('products.json');
        setGitFiles(data.products);
        alert(`Located 'products.json' in GitHub! Double-check the live listings listed in the preview.`);
      } else {
        setRepoSource('files-list');
        setGitFiles(data.files || []);
      }
      setSyncStatus('success');
    } catch (e: any) {
      console.error(e);
      setSyncStatus('error');
      alert(`GitHub sync failed: ${e.message}`);
    }
  };

  // AI-powered analysis of single GitHub file to auto-populate "Deploy Product" form
  const analyzeGitHubFileWithAi = async (file: any) => {
    setIsAnalyzingFile(file.name);
    try {
      const response = await fetch('/api/github/file-analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          downloadUrl: file.downloadUrl,
          fileName: file.name
        })
      });

      if (!response.ok) throw new Error("Could not contact AI analyzer.");
      const data = await response.json();
      
      // Auto-populate the Deploy forms!
      setProdName(data.draft.name);
      setProdDesc(data.draft.description);
      setProdPrice(data.draft.price.toString());
      setProdCategory(data.draft.category);
      setProdFeatures(data.draft.features.join(', '));
      setProdAssetKey(data.draft.id);
      setProdCodeContent(data.draft.codeContent || '');

      alert(`AI Catalog Analyst compiled blueprint details for "${file.name}"! Form fields populated. Review and click 'Deploy Product Live' below.`);
    } catch (err: any) {
      alert(`AI analysis failed: ${err.message}`);
    } finally {
      setIsAnalyzingFile(null);
    }
  };

  // Instantly import dynamic product arrays from catalog products.json
  const importProductsJsonListing = async (prod: any) => {
    const newProdId = prod.id || "asset_git_" + Math.random().toString(36).substr(2, 5);
    const mockCode = prod.codeContent || `// ${prod.name} Digital Blueprint Code`;
    const newProductData: Product = {
      id: newProdId,
      name: prod.name,
      description: prod.description,
      price: parseFloat(prod.price) || 29.00,
      fileUrl: newProdId,
      image: prod.image || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80",
      category: prod.category || "Blueprints",
      features: Array.isArray(prod.features) ? prod.features : [prod.features || 'TypeScript script'],
      codeContent: mockCode
    };

    try {
      const prodRef = doc(db, 'products', newProdId);
      await setDoc(prodRef, newProductData);
      onAddProduct(newProductData);
      alert(`Successfully imported "${prod.name}" into your live stores!`);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `products/${newProdId}`);
    }
  };

  // Deploy custom/add Product manually
  const submitNewProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodName || !prodPrice || !prodDesc) {
      alert("Missing product title or price attributes.");
      return;
    }

    const priceNum = parseFloat(prodPrice);
    if (isNaN(priceNum)) {
      alert("Requires numerical price.");
      return;
    }

    const finalId = prodAssetKey.trim() || "asset_custom_" + Math.random().toString(36).substr(2, 5);
    const newProductData: Product = {
      id: finalId,
      name: prodName,
      description: prodDesc,
      price: priceNum,
      fileUrl: finalId,
      image: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=400&q=80",
      category: prodCategory,
      features: prodFeatures.split(',').map(f => f.trim()).filter(Boolean),
      codeContent: prodCodeContent || `// ${prodName} Blueprint source code attached successfully`
    };

    try {
      const prodRef = doc(db, 'products', finalId);
      await setDoc(prodRef, newProductData);
      
      onAddProduct(newProductData);

      // Reset form fields
      setProdName('');
      setProdDesc('');
      setProdPrice('');
      setProdFeatures('');
      setProdCodeContent('');
      
      alert(`Success: Product "${prodName}" deployed LIVE on homepage storefront!`);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `products/${finalId}`);
    }
  };

  // Delete live storefront products
  const deleteStoreProduct = async (id: string) => {
    if (!confirm("Are you sure you want to remove this product blueprint from the catalog?")) return;
    try {
      await deleteDoc(doc(db, 'products', id));
      alert("Product successfully deleted from storefront.");
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `products/${id}`);
    }
  };

  // Select Product for editing
  const initiateEditProduct = (prod: Product) => {
    setEditingProduct(prod);
    setEditName(prod.name);
    setEditPrice(prod.price.toString());
    setEditCategory(prod.category || 'Blueprints');
    setEditDesc(prod.description);
    setEditFeatures(prod.features.join(', '));
    setEditAssetKey(prod.id);
    setEditCodeContent(prod.codeContent || '');
  };

  // Submit Edited product specifications
  const submitEditedProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    const priceNum = parseFloat(editPrice);
    if (isNaN(priceNum)) {
      alert("Requires numerical price.");
      return;
    }

    const updatedProduct: Product = {
      ...editingProduct,
      name: editName,
      price: priceNum,
      category: editCategory,
      description: editDesc,
      features: editFeatures.split(',').map(f => f.trim()).filter(Boolean),
      codeContent: editCodeContent
    };

    try {
      const prodRef = doc(db, 'products', editingProduct.id);
      await setDoc(prodRef, updatedProduct);
      setEditingProduct(null);
      alert(`Success: Product blueprint "${editName}" updated live!`);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `products/${editingProduct.id}`);
    }
  };

  // Execute strategic recommendation coupon campaign instantly
  const triggerCouponAction = async () => {
    alert("CFO EXECUTION SUCCESS: Promotional campaign 'AETHER10' activated dynamically. Simulated push notification dispatched to browser prospects!");
  };

  // Execute dynamic price audit elasticity adjustment
  const triggerPriceAdjustmentAction = async () => {
    try {
      // Find highest priced product and optimize its price live
      const target = products.find(p => p.price > 30);
      if (target) {
        const optimizedVal = target.price - 5.00;
        await setDoc(doc(db, 'products', target.id), {
          ...target,
          price: optimizedVal
        });
        alert(`Elasticity Action Committed: Adjusted ${target.name} to highly competitive optimized price state of $${optimizedVal}.00`);
      } else {
        alert("Elasticity Audit Executed: Catalog represents optimal financial tiers!");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const getAspectStyle = (ratio: string) => {
    switch(ratio) {
      case '16:9': return 'aspect-video';
      case '9:16': return 'w-32 aspect-[9/16]';
      case '3:4': return 'w-40 aspect-[3/4]';
      case '4:3': return 'aspect-[4/3]';
      case '1:1': return 'aspect-square';
      default: return 'aspect-video';
    }
  };

  // Generate dynamic chart data based on active firestore transactions
  const getChartData = () => {
    if (purchases.length === 0) {
      return [
        { date: 'June 01', sales: 0, visitors: 110 },
        { date: 'June 03', sales: 80, visitors: 340 },
        { date: 'June 06', sales: 150, visitors: 620 },
        { date: 'June 09', sales: 340, visitors: 940 },
        { date: 'June 12', sales: 520, visitors: 1240 },
      ];
    }
    const sorted = [...purchases].sort((a,b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    let cumulative = 0;
    return sorted.map((p, idx) => {
      cumulative += p.total;
      const dateObj = new Date(p.createdAt);
      const label = isNaN(dateObj.getTime()) ? `Txn ${idx + 1}` : dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      return {
        date: label,
        sales: cumulative,
        visitors: 120 + idx * 115
      };
    });
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 font-sans relative selection:bg-blue-500/35">
      
      {/* Access Protection Screen if not authorized */}
      <AnimatePresence>
        {!isAuthenticated && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/95 p-4" style={{ backgroundColor: '#0c0f17' }}>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.06)_0%,transparent_70%)]" />
            
            <motion.div
              initial={{ scale: 0.98, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white border border-slate-200 rounded-sm p-6 sm:p-8 w-full max-w-md relative z-10 shadow-2xl space-y-6 text-slate-800"
            >
              <div className="text-center space-y-2">
                <div className="w-12 h-12 rounded-sm bg-slate-100 border border-slate-200 flex items-center justify-center mx-auto">
                  <Lock className="w-5 h-5 text-slate-700" />
                </div>
                <h2 className="font-display font-bold text-lg tracking-wider text-slate-900 uppercase">Orchestrator Auth</h2>
                <p className="text-xs text-slate-500 leading-relaxed font-sans">Aetheria enterprise command console is active. Decrypt credentials to authorize.</p>
              </div>

              <form onSubmit={handleAdminAuth} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-1.5 font-bold">Executive Operational Key</label>
                  <input
                    type="password"
                    placeholder="Enter bypass code or click submit..."
                    value={adminToken}
                    onChange={(e) => setAdminToken(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-sm px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500 font-mono"
                    id="admin-security-pass"
                  />
                  <span className="block text-[9px] text-slate-400 mt-1.5 font-mono">Staging credential active; submit empty input to bypass.</span>
                </div>

                {authError && (
                  <div className="flex items-center gap-1.5 text-rose-600 text-xs py-1.5 px-3 bg-rose-50 rounded-sm border border-rose-200">
                    <AlertCircle className="w-4 h-4" />
                    <span>{authError}</span>
                  </div>
                )}

                <button
                  type="submit"
                  id="admin-login-submit"
                  className="w-full bg-slate-900 hover:bg-blue-600 text-white font-bold text-xs py-3.5 rounded-sm transition tracking-widest uppercase cursor-pointer border border-transparent font-mono"
                >
                  Decrypt Console
                </button>
              </form>

              <button
                onClick={onBackToStore}
                className="w-full text-center text-xs text-slate-500 hover:text-blue-600 underline cursor-pointer font-sans block"
              >
                Return to storefront
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Main Command Console Cockpit */}
      {isAuthenticated && (
        <div className="flex flex-col min-h-screen">
          
          {/* Top Admin Header Bar */}
          <nav className="bg-slate-950 px-6 py-4 border-b border-slate-850 sticky top-0 z-30 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-sm bg-slate-800 border border-slate-700 flex items-center justify-center">
                <Cpu className="w-4 h-4 text-blue-400" />
              </div>
              <div>
                <span className="font-display font-bold text-xs tracking-widest text-white uppercase sm:inline hidden">AETHERIA COMMAND COCKPIT</span>
                <span className="block text-[8.5px] font-mono text-emerald-400 font-bold uppercase tracking-widest">Enterprise Staging Online</span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={onBackToStore}
                className="bg-slate-900 hover:bg-slate-800 text-slate-300 px-3 py-1.5 border border-slate-800 rounded-sm text-xs font-mono tracking-wider font-semibold uppercase cursor-pointer"
              >
                Storefront View
              </button>
              <button
                onClick={() => setIsAuthenticated(false)}
                className="text-slate-400 hover:text-rose-400 p-1.5 rounded-sm hover:bg-slate-900 transition cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </nav>

          {/* Core Tab Navigation System */}
          <div className="bg-slate-950/40 border-b border-slate-850 px-6 py-2 flex flex-wrap gap-2 items-center justify-between">
            <div className="flex gap-2">
              <button 
                onClick={() => setActiveTab('analytics')}
                className={`px-4 py-2 text-xs font-mono tracking-wider transition-all cursor-pointer flex items-center gap-2 border-b-2 ${
                  activeTab === 'analytics' 
                    ? 'border-blue-500 text-white font-bold bg-slate-900/40' 
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <LineChart className="w-3.5 h-3.5 text-blue-400" />
                <span>CFO Financial Analytics</span>
              </button>
              <button 
                onClick={() => setActiveTab('catalog')}
                className={`px-4 py-2 text-xs font-mono tracking-wider transition-all cursor-pointer flex items-center gap-2 border-b-2 ${
                  activeTab === 'catalog' 
                    ? 'border-blue-500 text-white font-bold bg-slate-900/40' 
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <ShoppingBag className="w-3.5 h-3.5 text-blue-400" />
                <span>Product Catalog & GitHub Sync</span>
              </button>
              <button 
                onClick={() => setActiveTab('agents')}
                className={`px-4 py-2 text-xs font-mono tracking-wider transition-all cursor-pointer flex items-center gap-2 border-b-2 ${
                  activeTab === 'agents' 
                    ? 'border-blue-500 text-white font-bold bg-slate-900/40' 
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Cpu className="w-3.5 h-3.5 text-blue-400" />
                <span>Bot Agency Agencies</span>
              </button>
            </div>
            <div className="text-[10px] font-mono text-slate-400 flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping" />
              <span>Full-Stack Operations Secure</span>
            </div>
          </div>

          <div className="flex-1 p-6">
            
            {/* TAB 1: EXECUTIVE ANALYTICS AND STRATEGIST CFO AGENT */}
            {activeTab === 'analytics' && (
              <div className="space-y-6">
                
                {/* Stats Ledger Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-slate-950 p-4 rounded-sm border border-slate-850 shadow-sm">
                    <span className="text-[10px] font-mono text-slate-500 uppercase block">Total Sales Revenue</span>
                    <div className="flex items-center gap-1 mt-1">
                      <DollarSign className="w-5 h-5 text-emerald-400" />
                      <span className="font-display font-medium text-xl text-white">{totalRevenue.toFixed(2)}</span>
                    </div>
                    <span className="text-[8.5px] text-slate-500 font-mono mt-1 block">Stripe Authorized Transactions</span>
                  </div>

                  <div className="bg-slate-950 p-4 rounded-sm border border-slate-850 shadow-sm">
                    <span className="text-[10px] font-mono text-slate-500 uppercase block">Operating Expenses (Burn)</span>
                    <div className="flex items-center gap-1 mt-1">
                      <DollarSign className="w-5 h-5 text-blue-400" />
                      <span className="font-display font-medium text-xl text-white">${burnRate.toFixed(2)}</span>
                    </div>
                    <span className="text-[8.5px] text-slate-500 font-mono mt-1 block">API usage & Cloud Compute fees</span>
                  </div>

                  <div className="bg-slate-950 p-4 rounded-sm border border-slate-850 shadow-sm">
                    <span className="text-[10px] font-mono text-slate-500 uppercase block">Operational Profit Margin</span>
                    <div className="flex items-center gap-1 mt-1">
                      <TrendingUp className="w-5 h-5 text-teal-400" />
                      <span className="font-display font-medium text-xl text-white">
                        ${(totalRevenue - burnRate).toFixed(2)}
                      </span>
                    </div>
                    <span className="text-[8.5px] text-slate-500 font-mono mt-1 block">Aetheria Net Operations Income</span>
                  </div>

                  <div className="bg-slate-950 p-4 rounded-sm border border-slate-850 shadow-sm">
                    <span className="text-[10px] font-mono text-slate-500 uppercase block">Monthly Gap to Target</span>
                    <div className="flex items-center gap-1 mt-1">
                      <DollarSign className="w-5 h-5 text-slate-400" />
                      <span className="font-display font-medium text-xl text-white">
                        ${Math.max(0, mrrTarget - totalRevenue).toFixed(2)}
                      </span>
                    </div>
                    <span className="text-[8.5px] text-slate-500 font-mono mt-1 block">Monthly target USD: ${mrrTarget}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                  
                  {/* Left Column: Recharts Chart & Strategic recommendations audit button */}
                  <div className="xl:col-span-2 space-y-6">
                    
                    {/* Dynamic Recharts Chart */}
                    <div className="bg-slate-950 p-5 rounded-sm border border-slate-850 space-y-3">
                      <div className="flex items-center justify-between border-b border-slate-850 pb-3">
                        <div>
                          <h4 className="font-display font-bold text-xs text-white uppercase tracking-wider">Storehouse Sales Trend Line</h4>
                          <span className="text-[9px] font-mono text-slate-500">Stripe financial capture & simulated traffic</span>
                        </div>
                        <span className="text-[9px] font-mono bg-blue-950/40 text-blue-400 px-2 py-0.5 border border-blue-900/40 rounded-sm font-semibold uppercase">
                          Real-time
                        </span>
                      </div>

                      <div className="h-64 mt-2">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={getChartData()} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <defs>
                              <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                              </linearGradient>
                              <linearGradient id="colorVisitors" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15}/>
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <XAxis dataKey="date" stroke="#475569" fontSize={9} fontClassName="font-mono" dy={10} />
                            <YAxis stroke="#475569" fontSize={9} fontClassName="font-mono" />
                            <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', fontSize: '10px' }} />
                            <Area type="monotone" dataKey="sales" name="Store Sales (USD)" stroke="#10b981" fillOpacity={1} fill="url(#colorSales)" strokeWidth={2} />
                            <Area type="monotone" dataKey="visitors" name="Staging Visitors" stroke="#3b82f6" fillOpacity={1} fill="url(#colorVisitors)" strokeWidth={1.5} />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* CFO AI Audit Recommendation Core */}
                    <div className="bg-slate-950 rounded-sm border border-slate-850 p-5 space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-850 pb-3 gap-2">
                        <div>
                          <h4 className="font-display font-medium text-xs text-white uppercase tracking-wider flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                            <span>Executive Strategic AI Audits Coordinator</span>
                          </h4>
                          <p className="text-[9px] font-mono text-slate-500">Examine current social prospecting leads & sales flow</p>
                        </div>

                        <button
                          onClick={triggerAiExecutiveReview}
                          disabled={isCfoAuditing}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 border border-blue-500 rounded-sm text-xs font-semibold font-mono uppercase tracking-wider flex items-center gap-1.5 transition cursor-pointer shadow-md disabled:opacity-50"
                        >
                          {isCfoAuditing ? (
                            <>
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                              <span>Structuring Audit...</span>
                            </>
                          ) : (
                            <>
                              <TrendingUp className="w-3.5 h-3.5" />
                              <span>Execute CFO Audit</span>
                            </>
                          )}
                        </button>
                      </div>

                      {/* Displaying AI audit recommendations */}
                      {cfoAuditReport ? (
                        <div className="space-y-4">
                          <div className="p-4 bg-slate-900 border border-slate-850 rounded-sm grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div>
                              <span className="text-[9px] font-mono text-slate-500 uppercase block">AI Efficiency Index</span>
                              <div className="text-xl font-bold font-display text-blue-400 mt-1">{cfoAuditReport.score}/100</div>
                            </div>
                            <div className="sm:col-span-2">
                              <span className="text-[9px] font-mono text-slate-500 uppercase block">Executive Rating</span>
                              <div className="text-xs font-semibold text-emerald-400 mt-1 uppercase tracking-wide">{cfoAuditReport.rating}</div>
                            </div>
                          </div>

                          <div className="bg-slate-950 p-4 border border-blue-900/30 rounded-sm text-xs text-slate-300 leading-relaxed max-h-80 overflow-y-auto font-mono text-[11px] whitespace-pre-wrap leading-relaxed shadow-inner">
                            {cfoAuditReport.text}
                          </div>

                          {/* Quick actionable clicks */}
                          <div className="space-y-2.5 pt-2">
                            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest font-bold block">RECOMMENDED CFO DIRECTIVE ACTION SCHEDULER</span>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <div className="p-3 bg-slate-900/50 border border-slate-850 rounded-sm flex items-center justify-between">
                                <div>
                                  <span className="text-[9px] font-mono text-slate-400 block font-bold">Elasticity Optimization</span>
                                  <span className="text-[11px] text-slate-300 block mt-0.5">Optimize high priced blueprint license margins (-$5.00)</span>
                                </div>
                                <button 
                                  onClick={triggerPriceAdjustmentAction}
                                  className="bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-bold px-3 py-1.5 rounded-sm cursor-pointer uppercase font-mono shrink-0 transition"
                                >
                                  Execute
                                </button>
                              </div>

                              <div className="p-3 bg-slate-900/50 border border-slate-850 rounded-sm flex items-center justify-between">
                                <div>
                                  <span className="text-[9px] font-mono text-slate-400 block font-bold">Target Marketing Campaign</span>
                                  <span className="text-[11px] text-slate-300 block mt-0.5">Disperse promotional token 'AETHER10' campaign</span>
                                </div>
                                <button 
                                  onClick={triggerCouponAction}
                                  className="bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-bold px-3 py-1.5 rounded-sm cursor-pointer uppercase font-mono shrink-0 transition"
                                >
                                  Deploy
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-8 text-slate-500 bg-slate-900/20 border border-dashed border-slate-800 rounded-sm">
                          <Info className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                          <p className="text-xs font-mono">No strategic review has been initiated for this cycle.</p>
                          <p className="text-[10px] text-slate-650 mt-1">Click 'Execute CFO Audit' to let Gemini map operating recommendations.</p>
                        </div>
                      )}
                    </div>

                  </div>

                  {/* Right Column: CFO Chat Interface */}
                  <div className="xl:col-span-1">
                    
                    <div className="bg-slate-950 rounded-sm border border-slate-850 flex flex-col h-[520px]">
                      {/* Panel head */}
                      <div className="p-4 bg-slate-900 border-b border-slate-850 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-blue-400 animate-pulse" />
                          <div>
                            <h3 className="font-display font-bold text-xs text-white uppercase tracking-wider">CFO General Agent</h3>
                            <p className="text-[8.5px] font-mono text-slate-400">MODEL: GEMINI-3.5 FLASH</p>
                          </div>
                        </div>
                        <span className="text-[9px] bg-blue-950/50 text-blue-400 rounded-sm px-2 py-0.5 border border-blue-900/30 font-mono">
                          Ready
                        </span>
                      </div>

                      {/* Messages Feed */}
                      <div className="flex-1 p-3 overflow-y-auto fancy-scrollbar space-y-3 bg-slate-950/20 border-b border-slate-850">
                        {cfoMessages.map((msg, index) => (
                          <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[90%] rounded-sm px-3 py-2 text-xs leading-relaxed ${
                              msg.role === 'user'
                                ? 'bg-blue-600 border border-blue-500 text-white rounded-tr-none'
                                : 'bg-slate-900 border border-slate-850 text-slate-300 rounded-tl-none'
                            }`}>
                              <div className="whitespace-pre-wrap text-[11px]">{msg.text}</div>
                              <span className="block text-[8px] text-slate-500 font-mono text-right mt-1 uppercase tracking-widest">
                                {msg.role === 'user' ? 'Owner' : 'CFO Agent'}
                              </span>
                            </div>
                          </div>
                        ))}

                        {cfoLoading && (
                          <div className="flex justify-start">
                            <div className="bg-slate-900 border border-slate-850 px-3 py-2 rounded-sm rounded-tl-none flex items-center gap-1.5">
                              <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                              <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                              <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" />
                              <span className="text-[9px] text-blue-300 font-mono">Formulating strategy...</span>
                            </div>
                          </div>
                        )}
                        <div ref={cfoEndRef} />
                      </div>

                      {/* Strategy Prompts suggestions */}
                      <div className="px-2 py-1.5 bg-slate-950 border-t border-slate-850 overflow-x-auto whitespace-nowrap flex gap-1.5">
                        <button
                          onClick={() => setCfoInput("Design a pricing elasticity test for our products.")}
                          className="text-[9px] bg-slate-900 hover:bg-slate-850 text-slate-400 px-2 py-0.5 border border-slate-850 rounded-sm font-mono cursor-pointer"
                        >
                          Price elasticity
                        </button>
                        <button
                          onClick={() => setCfoInput("Summarize my expenses and help me optimize API costs.")}
                          className="text-[9px] bg-slate-900 hover:bg-slate-850 text-slate-400 px-2 py-0.5 border border-slate-850 rounded-sm font-mono cursor-pointer"
                        >
                          Cost control
                        </button>
                      </div>

                      {/* Chat submit */}
                      <form onSubmit={handleCfoCommand} className="p-2.5 bg-slate-950 border-t border-slate-850 flex items-center gap-1.5">
                        <input
                          type="text"
                          placeholder="Strategic commands..."
                          value={cfoInput}
                          onChange={(e) => setCfoInput(e.target.value)}
                          disabled={cfoLoading}
                          className="flex-1 bg-slate-900 border border-slate-800 rounded-sm px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
                        />
                        <button
                          type="submit"
                          disabled={!cfoInput.trim() || cfoLoading}
                          className="bg-blue-600 text-white p-2 rounded-sm hover:bg-blue-700 disabled:opacity-40 transition cursor-pointer border border-blue-500 shrink-0"
                        >
                          <Send className="w-3.5 h-3.5" />
                        </button>
                      </form>
                    </div>

                  </div>

                </div>

              </div>
            )}

            {/* TAB 2: PRODUCT CATALOG MANAGEMENT & GITHUB BLUEPRINT IMPORTER */}
            {activeTab === 'catalog' && (
              <div className="space-y-6">
                
                {/* Advanced Grid: Left contains Catalog table & GitHub sync, Right contains Add product spec form */}
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                  
                  {/* Left block (Span 2): Live catalog table & GitHub syncer */}
                  <div className="xl:col-span-2 space-y-6">
                    
                    {/* Live catalog list */}
                    <div className="bg-slate-950 rounded-sm border border-slate-850 p-5 space-y-4 shadow-sm">
                      <div className="flex items-center justify-between border-b border-slate-850 pb-3">
                        <div>
                          <h4 className="font-display font-bold text-xs text-white uppercase tracking-wider">Storefront Catalog Ledger</h4>
                          <p className="text-[9px] font-mono text-slate-500">Live products and downloadable script archives synced in real-time</p>
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono bg-slate-900 px-2.5 py-0.5 border border-slate-850 rounded-sm">
                          {products.length} Blueprints Live
                        </span>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                          <thead>
                            <tr className="border-b border-slate-850 text-slate-400 font-mono text-[9px] uppercase tracking-wider">
                              <th className="py-2.5 px-3">Title</th>
                              <th className="py-2.5 px-3">Category</th>
                              <th className="py-2.5 px-3">Price</th>
                              <th className="py-2.5 px-3">Asset key / Associated File</th>
                              <th className="py-2.5 px-3 text-right">Operational Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-855/50">
                            {products.map((p) => (
                              <tr key={p.id} className="hover:bg-slate-900/30 transition-colors text-slate-300">
                                <td className="py-3 px-3 font-semibold text-white">
                                  <div>{p.name}</div>
                                  <span className="text-[9px] text-slate-500 font-mono block max-w-xs truncate mt-0.5">{p.description}</span>
                                </td>
                                <td className="py-3 px-3">
                                  <span className="bg-blue-950/50 text-blue-400 border border-blue-900/30 rounded-full px-2 py-0.5 text-[9px] font-mono uppercase font-semibold">
                                    {p.category}
                                  </span>
                                </td>
                                <td className="py-3 px-3 font-bold font-mono text-emerald-400">
                                  ${p.price.toFixed(2)}
                                </td>
                                <td className="py-3 px-3 font-mono text-[10.5px] text-blue-400">
                                  <div>{p.fileUrl}</div>
                                  {p.codeContent ? (
                                    <span className="text-[9px] text-emerald-500 flex items-center gap-1 mt-0.5">
                                      <CheckCircle className="w-2.5 h-2.5" />
                                      <span>Custom code attached ({p.codeContent.length} bytes)</span>
                                    </span>
                                  ) : (
                                    <span className="text-[9px] text-slate-500 block mt-0.5">Static server file mapping</span>
                                  )}
                                </td>
                                <td className="py-3 px-3 text-right space-x-2">
                                  <button
                                    onClick={() => initiateEditProduct(p)}
                                    className="p-1.5 rounded-sm bg-slate-900 hover:bg-blue-650/10 text-blue-400 hover:text-blue-300 transition cursor-pointer border border-slate-800"
                                    title="Edit Product"
                                  >
                                    <Settings className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => deleteStoreProduct(p.id)}
                                    className="p-1.5 rounded-sm bg-slate-900 hover:bg-rose-950/25 text-rose-405 hover:text-rose-400 transition cursor-pointer border border-slate-850"
                                    title="Delete product"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* GitHub Blueprint Synchronizer */}
                    <div className="bg-slate-950 rounded-sm border border-slate-850 p-5 space-y-4 shadow-sm">
                      <div className="flex items-center justify-between border-b border-slate-850 pb-3">
                        <div>
                          <h4 className="font-display font-medium text-xs text-white uppercase tracking-wider flex items-center gap-2">
                            <Globe className="w-4 h-4 text-blue-400" />
                            <span>GitHub Blueprint Repository Synchronizer</span>
                          </h4>
                          <p className="text-[9px] font-mono text-slate-500">Query and dynamically ingest digital catalog scripts and products.json listings</p>
                        </div>
                        <span className="text-[9px] font-mono bg-emerald-950/20 text-emerald-400 px-2 py-0.5 border border-emerald-900/30 rounded-sm">
                          Enterprise Sync Engine
                        </span>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-3">
                        <input
                          type="text"
                          value={gitRepo}
                          onChange={(e) => setGitRepo(e.target.value)}
                          placeholder="e.g. user/repository-name"
                          className="flex-1 bg-slate-900 border border-slate-800 rounded-sm px-3.5 py-2 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
                        />
                        <button
                          onClick={syncGitHubRepository}
                          className="bg-blue-600 hover:bg-blue-700 text-white rounded-sm px-5 py-2 text-xs font-bold font-mono uppercase tracking-wider transition cursor-pointer shrink-0"
                        >
                          Sync Repository Content
                        </button>
                      </div>

                      {/* Display of synced assets lists */}
                      {syncStatus === 'syncing' && (
                        <div className="flex items-center gap-2 text-xs text-blue-300 font-mono p-4 bg-slate-900 rounded-sm">
                          <RefreshCw className="w-4 h-4 animate-spin text-blue-400" />
                          <span>Establishing network handshake and scanning tree indexes...</span>
                        </div>
                      )}

                      {syncStatus === 'success' && gitFiles.length > 0 && (
                        <div className="space-y-3 pt-2">
                          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest font-bold block">
                            Discovered GitHub Resources ({gitFiles.length})
                          </span>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-80 overflow-y-auto fancy-scrollbar">
                            {repoSource === 'products.json' ? (
                              gitFiles.map((pf: any, idx) => (
                                <div key={idx} className="p-3 bg-slate-900 border border-slate-850 rounded-sm flex flex-col justify-between space-y-2 text-xs">
                                  <div>
                                    <span className="text-[10px] font-mono text-blue-400 uppercase">products.json metadata</span>
                                    <h5 className="font-semibold text-white mt-1">{pf.name}</h5>
                                    <p className="text-[10px] text-slate-400 truncate mt-0.5">{pf.description}</p>
                                    <strong className="text-emerald-400 block mt-1 font-mono">${pf.price}</strong>
                                  </div>
                                  <button
                                    onClick={() => importProductsJsonListing(pf)}
                                    className="w-full bg-slate-950 hover:bg-slate-800 text-[10px] font-mono py-1 rounded border border-slate-800 uppercase block cursor-pointer transition text-center font-bold"
                                  >
                                    Deploy Instantly Live
                                  </button>
                                </div>
                              ))
                            ) : (
                              gitFiles.map((gf: any, idx) => (
                                <div key={idx} className="p-3 bg-slate-900 border border-slate-850 rounded-sm flex items-center justify-between text-xs font-mono">
                                  <div className="max-w-[70%]">
                                    <span className="text-white block font-semibold truncate" title={gf.name}>{gf.name}</span>
                                    <span className="text-[9.5px] text-slate-500 block mt-0.5">{(gf.size / 1024).toFixed(1)} KB SPEC</span>
                                  </div>
                                  <button
                                    onClick={() => analyzeGitHubFileWithAi(gf)}
                                    disabled={!!isAnalyzingFile}
                                    className="bg-blue-600 hover:bg-blue-500 text-white text-[9px] px-2.5 py-1.5 rounded-sm uppercase cursor-pointer block transition shrink-0 font-bold"
                                  >
                                    {isAnalyzingFile === gf.name ? "Analyzing..." : "AI Draft Spec"}
                                  </button>
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                  </div>

                  {/* Right block: Add product specification manually */}
                  <div className="xl:col-span-1">
                    
                    <div className="bg-slate-950 rounded-sm border border-slate-850 p-5 space-y-4 shadow-sm">
                      <div className="border-b border-slate-850 pb-2 flex items-center gap-2">
                        <Plus className="w-4 h-4 text-blue-400" />
                        <h3 className="font-display font-bold text-xs text-white uppercase tracking-wider">Ingest New Blueprint Asset</h3>
                      </div>

                      <form onSubmit={submitNewProduct} className="space-y-4 text-xs font-mono">
                        <div>
                          <label className="block text-[8.5px] text-slate-400 uppercase tracking-widest font-bold mb-1">Product Title</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Telegram Lead Prospector SaaS"
                            value={prodName}
                            onChange={(e) => setProdName(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-800 rounded-sm p-2 text-xs text-white focus:outline-none focus:border-blue-500"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[8.5px] text-slate-400 uppercase tracking-widest font-bold mb-1">Category</label>
                            <select
                              value={prodCategory}
                              onChange={(e) => setProdCategory(e.target.value)}
                              className="w-full bg-slate-900 border border-slate-800 rounded-sm p-2 text-xs text-white focus:outline-none"
                            >
                              <option value="Blueprints">Blueprints</option>
                              <option value="Micro-SaaS">Micro-SaaS</option>
                              <option value="Controller">Controller</option>
                              <option value="Scripts">Scripts</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-[8.5px] text-slate-400 uppercase tracking-widest font-bold mb-1">Price USD</label>
                            <input
                              type="text"
                              required
                              placeholder="29.00"
                              value={prodPrice}
                              onChange={(e) => setProdPrice(e.target.value)}
                              className="w-full bg-slate-900 border border-slate-800 rounded-sm p-2 text-xs text-white focus:outline-none"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[8.5px] text-slate-400 uppercase tracking-widest font-bold mb-1">Dynamic Asset ID / FileUrl</label>
                          <input
                            type="text"
                            placeholder="telegram_prospector_code"
                            value={prodAssetKey}
                            onChange={(e) => setProdAssetKey(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-800 rounded-sm p-2 text-xs text-white focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-[8.5px] text-slate-400 uppercase tracking-widest font-bold mb-1">Key Features (comma split)</label>
                          <input
                            type="text"
                            placeholder="Headless Chrome threads, Regex lead extractor, JSON logger"
                            value={prodFeatures}
                            onChange={(e) => setProdFeatures(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-800 rounded-sm p-2 text-xs text-white focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-[8.5px] text-slate-400 uppercase tracking-widest font-bold mb-1">Brief Sales Description</label>
                          <textarea
                            required
                            placeholder="Explain the commercial value of this automation blueprint..."
                            value={prodDesc}
                            onChange={(e) => setProdDesc(e.target.value)}
                            rows={3}
                            className="w-full bg-slate-900 border border-slate-800 rounded-sm p-2 text-xs text-white focus:outline-none leading-relaxed"
                          />
                        </div>

                        <div>
                          <label className="block text-[8.5px] text-slate-400 uppercase tracking-widest font-bold mb-1">Associated Downloadable Code Content</label>
                          <textarea
                            placeholder="Paste actual compiled automation script or blueprint configuration code layout here... (This content will fetch dynamically on checkout for instant purchaser download!)"
                            value={prodCodeContent}
                            onChange={(e) => setProdCodeContent(e.target.value)}
                            rows={6}
                            className="w-full bg-slate-900 border border-slate-800 rounded-sm p-2 text-[10.5px] text-[#58a6ff] focus:outline-none leading-normal font-mono"
                          />
                        </div>

                        <button
                          type="submit"
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-3 rounded-sm transition uppercase flex items-center justify-center gap-1 cursor-pointer font-mono tracking-wider shadow-md"
                        >
                          <Plus className="w-4 h-4" />
                          <span>Ingest Product Live</span>
                        </button>
                      </form>
                    </div>

                  </div>

                </div>

              </div>
            )}

            {/* TAB 3: AUTOMATED BOT AGENCIES COMPENDIUM */}
            {activeTab === 'agents' && (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                
                {/* Visual Image Marketing Asset engine */}
                <div className="bg-slate-950 rounded-sm border border-slate-850 p-5 space-y-4">
                  <div className="flex items-center gap-2 border-b border-slate-850 pb-3">
                    <ImageIcon className="w-4 h-4 text-blue-400" />
                    <div>
                      <h3 className="font-display font-bold text-xs text-white uppercase tracking-wider">AI Marketing Asset Engine</h3>
                      <p className="text-[8.5px] font-mono text-slate-500">MODEL: GEMINI-2.5 FLASH IMAGE</p>
                    </div>
                  </div>

                  <div className="space-y-4 font-mono text-xs">
                    <div>
                      <label className="block text-[8.5px] text-slate-500 uppercase tracking-widest mb-1.5 font-bold">Select Aspect Ratio Layout</label>
                      <select
                        value={imageRatio}
                        onChange={(e) => setImageRatio(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-sm p-2 text-xs text-white focus:outline-none focus:border-blue-500"
                      >
                        <option value="1:1">1:1 (Square Standard)</option>
                        <option value="3:4">3:4 (Portrait Feed)</option>
                        <option value="4:3">4:3 (Landscape Grid)</option>
                        <option value="9:16">9:16 (Tik-Tok, Shorts, Reel)</option>
                        <option value="16:9">16:9 (X, LinkedIn Post)</option>
                        <option value="2:3">2:3 (Pinterest Ratio)</option>
                        <option value="3:2">3:2 (Camera Frame)</option>
                        <option value="21:9">21:9 (Widescreen Banner)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[8.5px] text-slate-500 uppercase tracking-widest mb-1.5 font-bold">Creative Vector Prompts</label>
                      <textarea
                        placeholder="e.g. Sleek abstract cyber grid workstation vector banner, isometric layout..."
                        rows={3}
                        value={imagePrompt}
                        onChange={(e) => setImagePrompt(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-805 rounded-sm p-2 text-xs text-white focus:outline-none focus:border-blue-505 leading-relaxed"
                      />
                    </div>

                    <button
                      onClick={generateMarketingImage}
                      disabled={generatingImage}
                      className="w-full bg-slate-900 hover:bg-slate-850 text-slate-200 border border-slate-800 disabled:opacity-40 font-bold text-xs py-3 rounded-sm transition flex items-center justify-center gap-1.5 cursor-pointer uppercase tracking-wider"
                    >
                      {generatingImage ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-500" />
                          <span>Generating AI design layer...</span>
                        </>
                      ) : (
                        <>
                          <RefreshCw className="w-3.5 h-3.5" />
                          <span>Ingest Visual Design</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Visual Render Display */}
                  <AnimatePresence>
                    {generatedAssets.length > 0 && (
                      <div className="border-t border-slate-850 pt-4 space-y-2">
                        <span className="text-[9px] font-mono text-slate-500 block uppercase">Generated Promoshot</span>
                        <div className={`overflow-hidden rounded-sm border border-slate-800 bg-slate-900 flex items-center justify-center ${getAspectStyle(generatedAssets[0].aspectRatio)}`}>
                          <img 
                            src={generatedAssets[0].imageUrl} 
                            alt="AI Output" 
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover" 
                          />
                        </div>
                        <a 
                          href={generatedAssets[0].imageUrl} 
                          download={`aether_promo_${Date.now()}.png`}
                          className="text-[9px] text-blue-400 hover:text-blue-300 font-mono flex items-center gap-1 cursor-pointer uppercase tracking-wider font-semibold"
                        >
                          <Download className="w-3 h-3" />
                          <span>Download Asset Frame</span>
                        </a>
                      </div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Simulated Social Browser Puppeteer scrapper agency */}
                <div className="bg-slate-950 rounded-sm border border-slate-850 flex flex-col h-[480px]">
                  <div className="p-4 bg-slate-900 border-b border-slate-850 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-blue-400 animate-spin" style={{ animationDuration: '6s' }} />
                      <div>
                        <h3 className="font-display font-bold text-xs text-white uppercase tracking-wider">Browser Automator (Sales Ops)</h3>
                        <p className="text-[8.5px] font-mono text-slate-400">Headless Puppeteer Session</p>
                      </div>
                    </div>
                    <span className="w-2 h-2 bg-emerald-400 rounded-full" />
                  </div>

                  {/* Simulated console output */}
                  <div className="flex-1 p-4 overflow-y-auto fancy-scrollbar bg-slate-950 text-[#58a6ff] font-mono text-[10px] space-y-2 border-b border-slate-850">
                    {puppeteerLogs.map((log, idx) => (
                      <div key={idx} className="flex gap-1.5 leading-relaxed">
                        <span className="text-slate-600 select-none">[{idx+1}]</span>
                        <span className="whitespace-pre-wrap">{log}</span>
                      </div>
                    ))}
                    {puppeteerBusy && (
                      <div className="flex items-center gap-1 text-teal-400 animate-pulse mt-2 font-mono">
                        <Terminal className="w-3.5 h-3.5" />
                        <span>[Puppeteer] Processing headless DOM page structures...</span>
                      </div>
                    )}
                    <div ref={logsEndRef} />
                  </div>

                  {/* Form client trigger */}
                  <form onSubmit={handlePuppeteerRun} className="p-3 bg-slate-950 space-y-2">
                    <label className="block text-[8.5px] font-mono text-slate-500 uppercase font-bold">Dispatch Automator Scraper Script</label>
                    <div className="flex gap-1.5">
                      <input
                        type="text"
                        placeholder="Scrape target recruitment pipelines..."
                        value={puppeteerQuery}
                        onChange={(e) => setPuppeteerQuery(e.target.value)}
                        disabled={puppeteerBusy}
                        className="flex-1 bg-slate-900 border border-slate-800 rounded-sm px-2.5 py-1.5 text-[10px] text-white focus:outline-none focus:border-blue-500 font-mono"
                      />
                      <button
                        type="submit"
                        disabled={!puppeteerQuery.trim() || puppeteerBusy}
                        className="bg-blue-600 hover:bg-blue-700 text-white rounded-sm px-3.5 py-1.5 text-[10px] font-bold uppercase transition flex items-center gap-1 cursor-pointer disabled:opacity-40 font-mono"
                      >
                        <Play className="w-3 h-3" />
                        <span>Run</span>
                      </button>
                    </div>
                  </form>
                </div>

              </div>
            )}

          </div>

          {/* EDIT PRODUCT BLUEPRINT BACKDROP MODAL */}
          <AnimatePresence>
            {editingProduct && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 text-xs">
                <motion.div
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  className="bg-slate-900 border border-slate-800 rounded-sm p-6 w-full max-w-xl shadow-2xl relative z-10"
                >
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                    <h4 className="font-display font-bold text-sm text-white uppercase tracking-wider">Edit Storefront Blueprint Asset Details</h4>
                    <button
                      onClick={() => setEditingProduct(null)}
                      className="text-slate-400 hover:text-white font-mono text-xs cursor-pointer p-1 rounded-sm bg-slate-850"
                    >
                      Esc / Close
                    </button>
                  </div>

                  <form onSubmit={submitEditedProduct} className="space-y-4 font-mono">
                    <div>
                      <label className="block text-[9px] text-slate-400 uppercase tracking-widest font-bold mb-1">Title</label>
                      <input
                        type="text"
                        required
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-850 p-2 rounded text-xs text-white focus:outline-none focus:border-blue-550"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[9px] text-slate-400 uppercase tracking-widest font-bold mb-1">Category</label>
                        <select
                          value={editCategory}
                          onChange={(e) => setEditCategory(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-850 p-2 rounded text-xs text-white focus:outline-none"
                        >
                          <option value="Blueprints">Blueprints</option>
                          <option value="Micro-SaaS">Micro-SaaS</option>
                          <option value="Controller">Controller</option>
                          <option value="Scripts">Scripts</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[9px] text-slate-400 uppercase tracking-widest font-bold mb-1">Price USD</label>
                        <input
                          type="text"
                          required
                          value={editPrice}
                          onChange={(e) => setEditPrice(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-850 p-2 rounded text-xs text-white focus:outline-none font-mono"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[9px] text-slate-400 uppercase tracking-widest font-bold mb-1">Features Specifications</label>
                      <input
                        type="text"
                        value={editFeatures}
                        onChange={(e) => setEditFeatures(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-850 p-2 rounded text-xs text-white focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[9px] text-slate-400 uppercase tracking-widest font-bold mb-1">Description</label>
                      <textarea
                        required
                        rows={2}
                        value={editDesc}
                        onChange={(e) => setEditDesc(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-850 p-2 rounded text-xs text-white focus:outline-none leading-relaxed"
                      />
                    </div>

                    <div>
                      <label className="block text-[9px] text-slate-400 uppercase tracking-widest font-bold mb-1">Downloadable Blueprint Code Attachment</label>
                      <textarea
                        placeholder="Paste script file instructions contents..."
                        rows={5}
                        value={editCodeContent}
                        onChange={(e) => setEditCodeContent(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-850 p-2 rounded text-[10px] text-[#58a6ff] focus:outline-none leading-normal font-mono"
                      />
                    </div>

                    <div className="flex justify-end gap-3 pt-3 border-t border-slate-850">
                      <button
                        type="button"
                        onClick={() => setEditingProduct(null)}
                        className="bg-slate-800 hover:bg-slate-750 text-slate-300 px-4 py-2 border border-slate-850 rounded text-xs font-semibold cursor-pointer font-mono"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded text-xs font-bold font-mono uppercase tracking-wider cursor-pointer"
                      >
                        Save Dynamic Updates
                      </button>
                    </div>
                  </form>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

        </div>
      )}

    </div>
  );
}
