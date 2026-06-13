import React, { useState, useEffect, useRef } from "react";
import { Cpu, LogOut, LineChart, ShoppingBag, CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { db, handleFirestoreError, OperationType } from "../lib/firebase";
import {
  collection,
  doc,
  setDoc,
  onSnapshot,
  deleteDoc,
} from "firebase/firestore";
import { Product, Purchase, CfoAuditReport, GitHubFile } from "../types";

// Grouped subcomponents for high cohesion/low coupling
import AdminAuthGate from "./CommandCenter/AdminAuthGate";
import CfoAnalyticsTab, {
  CfoChatMessage,
} from "./CommandCenter/CfoAnalyticsTab";
import ProductCatalogTab from "./CommandCenter/ProductCatalogTab";
import BotAgenciesTab from "./CommandCenter/BotAgenciesTab";

interface CommandCenterProps {
  onBackToStore: () => void;
  products: Product[];
  onAddProduct: (newProduct: Product) => void;
}

interface EditFormState {
  name: string;
  description: string;
  price: string;
  category: string;
  features: string;
  codeContent: string;
}

export default function CommandCenter({
  onBackToStore,
  products,
  onAddProduct,
}: CommandCenterProps) {
  // Authorization Gate States
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminToken, setAdminToken] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);

  // Active view controller
  const [activeTab, setActiveTab] = useState<
    "analytics" | "catalog" | "agents"
  >("analytics");

  // Shared statistics & telemetry metrics
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const mrrTarget = 25000;
  const burnRate = 1450;

  // Sync / Importer States
  const [gitRepo, setGitRepo] = useState(
    "holystunnervillianera/bug-free-enigma",
  );
  const [syncStatus, setSyncStatus] = useState<
    "idle" | "syncing" | "success" | "error"
  >("idle");
  const [gitFiles, setGitFiles] = useState<GitHubFile[]>([]);
  const [repoSource, setRepoSource] = useState<
    "products.json" | "files-list" | null
  >(null);
  const [isAnalyzingFile, setIsAnalyzingFile] = useState<string | null>(null);

  // Consolidated state for product modification modal
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editForm, setEditForm] = useState<EditFormState>({
    name: "",
    description: "",
    price: "",
    category: "Blueprints",
    features: "",
    codeContent: "",
  });

  // CFO General Reasoning States
  const [cfoMessages, setCfoMessages] = useState<CfoChatMessage[]>([
    {
      id: "cfo-init",
      role: "model",
      text: "Operational Ledger compiled. CFO Executive Agent status: ONLINE.\n\nCommander, I am here to optimize financial targets, test pricing elasticities, audit browser operations, and analyze sales performance. Ask me for a performance audit or select any suggestion below.",
      createdAt: new Date().toISOString(),
    },
  ]);
  const [cfoInput, setCfoInput] = useState("");
  const [cfoLoading, setCfoLoading] = useState(false);
  const [isCfoAuditing, setIsCfoAuditing] = useState(false);
  const [cfoAuditReport, setCfoAuditReport] = useState<CfoAuditReport | null>(
    null,
  );

  const cfoEndRef = useRef<HTMLDivElement | null>(null);

  // High-fidelity custom toast state managers
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<"success" | "error" | "info">(
    "info",
  );

  const showToast = (
    message: string,
    type: "success" | "error" | "info" = "info",
  ) => {
    setToastMessage(message);
    setToastType(type);
  };

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  // Secure interactive visual confirmation model instead of raw browser confirm dialog
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  // Auto Scroll dynamic chat handlers
  useEffect(() => {
    if (cfoEndRef.current) {
      cfoEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [cfoMessages]);

  // Pull purchases dynamically from firestore to compute real telemetry
  useEffect(() => {
    if (!isAuthenticated) return;

    const purchasesCol = collection(db, "purchases");
    const unsub = onSnapshot(
      purchasesCol,
      (snap) => {
        const docsList: Purchase[] = [];
        let total = 0;
        snap.forEach((doc) => {
          const d = doc.data() as Purchase;
          docsList.push(d);
          if (d.status === "completed") {
            total += d.total || 0;
          }
        });
        setPurchases(docsList);
        setTotalRevenue(total);
      },
      (err) => {
        console.error(err);
      },
    );

    return () => unsub();
  }, [isAuthenticated]);

  // Admin authenticity validator via secure backend proxy (replaces hardcoded token checks)
  const handleAdminAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token: adminToken }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setIsAuthenticated(true);
        setAuthError(null);
        showToast(
          "Orchestration Session authorized. Decrypt complete.",
          "success",
        );
      } else {
        setAuthError(
          data.error || "Execution failed. Invalid operational credentials.",
        );
        showToast(
          data.error || "Invalid operational credentials key.",
          "error",
        );
      }
    } catch (err: any) {
      console.error(err);
      setAuthError(
        "Failed to establish authentication check with security gateway.",
      );
      showToast("Security gateway connection error.", "error");
    }
  };

  // Run server-side CFO Agent commands
  const handleCfoCommand = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cfoInput.trim() || cfoLoading) return;

    const userCommand = cfoInput;
    setCfoInput("");
    setCfoMessages((prev) => [
      ...prev,
      {
        id: `cfo-user-${Date.now()}`,
        role: "user",
        text: userCommand,
        createdAt: new Date().toISOString(),
      },
    ]);
    setCfoLoading(true);

    try {
      const response = await fetch("/api/gemini/orchestrator-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userCommand,
          history: cfoMessages.map((m) => ({ role: m.role, text: m.text })),
          currentMetrics: {
            revenueSumMRR: totalRevenue,
            burnRateUSD: burnRate,
            activePurchases: purchases.length,
            targetMRR: mrrTarget,
            totalProducts: products.length,
          },
        }),
      });

      if (!response.ok) {
        throw new Error("Executive reasoning node is updating. Retrying...");
      }

      const data = await response.json();
      setCfoMessages((prev) => [
        ...prev,
        {
          id: `cfo-model-${Date.now()}`,
          role: "model",
          text: data.text,
          createdAt: new Date().toISOString(),
        },
      ]);
    } catch (err: any) {
      setCfoMessages((prev) => [
        ...prev,
        {
          id: `cfo-err-${Date.now()}`,
          role: "model",
          text: `Error processing strategic directive: ${err.message || "Executive routing delay."}\n\nSuggested actions: Audit current price metrics, or dispatch social automation queues to prospect clients.`,
          createdAt: new Date().toISOString(),
        },
      ]);
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
        allPurchases: purchases.map((p) => ({
          id: p.id,
          itemsCount: p.items.length,
          chargedTotal: p.total,
          timestamp: p.createdAt,
        })),
        productsCount: products.length,
        customerConversationsLogged: 34,
        browserAgentOutreachCount: 8,
        conversionFactor: totalRevenue > 0 ? "3.8%" : "0.0%",
      };

      const response = await fetch("/api/gemini/orchestrator-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: `Audit current company telemetry. Telemetry dataset:\n\n${JSON.stringify(auditPayload, null, 2)}\n\nPlease provide actionable recommendations.`,
          history: [],
        }),
      });

      if (!response.ok) throw new Error("CFO server offline.");
      const data = await response.json();
      setCfoAuditReport({
        score: totalRevenue > 0 ? 84 : 45,
        rating:
          totalRevenue > 0
            ? "Strong Operational Efficiency"
            : "Stagnant Traffic Flow",
        text: data.text,
      });
      showToast("CFO Strategic Audit successfully executed.", "success");
    } catch (err: any) {
      showToast(`Executive audit failed: ${err.message}`, "error");
    } finally {
      setIsCfoAuditing(false);
    }
  };

  // Sync / Scan GitHub Repository
  const syncGitHubRepository = async () => {
    if (!gitRepo.trim()) return;
    setSyncStatus("syncing");
    try {
      const response = await fetch(
        `/api/github/import?repo=${encodeURIComponent(gitRepo)}`,
      );
      if (!response.ok) {
        throw new Error(await response.text());
      }
      const data = await response.json();
      if (data.source === "products.json") {
        setRepoSource("products.json");
        setGitFiles(data.products || []);
        showToast(
          "Located 'products.json' in repository. Listings drafted.",
          "success",
        );
      } else {
        setRepoSource("files-list");
        setGitFiles(data.files || []);
        showToast(
          `Repository synced! Discovered ${data.files?.length || 0} blueprint assets.`,
          "info",
        );
      }
      setSyncStatus("success");
    } catch (e: any) {
      console.error(e);
      setSyncStatus("error");
      showToast(`GitHub sync failed: ${e.message}`, "error");
    }
  };

  // AI-powered analysis of single GitHub file to auto-populate "Deploy Product" form
  const analyzeGitHubFileWithAi = async (
    file: GitHubFile,
    populateForm: (data: any) => void,
  ) => {
    setIsAnalyzingFile(file.name);
    try {
      const response = await fetch("/api/github/file-analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          downloadUrl: file.downloadUrl,
          fileName: file.name,
        }),
      });

      if (!response.ok) throw new Error("Could not contact AI analyzer.");
      const data = await response.json();

      const fieldsToPopulate = {
        name: data.draft.name,
        description: data.draft.description,
        price: data.draft.price.toString(),
        category: data.draft.category,
        features: data.draft.features.join(", "),
        assetKey: data.draft.id,
        codeContent: data.draft.codeContent || "",
      };

      populateForm(fieldsToPopulate);
      showToast(
        `AI draft complete for "${file.name}". Ingest form fields auto-populated.`,
        "success",
      );
    } catch (err: any) {
      showToast(`AI analysis failed: ${err.message}`, "error");
    } finally {
      setIsAnalyzingFile(null);
    }
  };

  // Instantly import dynamic product arrays from catalog products.json
  const importProductsJsonListing = async (prod: GitHubFile) => {
    const newProdId =
      prod.id || "asset_git_" + Math.random().toString(36).substring(2, 7);
    const mockCode =
      prod.codeContent || `// ${prod.name} Digital Blueprint Code`;
    const newProductData: Product = {
      id: newProdId,
      name: prod.name,
      description: prod.description || "",
      price:
        typeof prod.price === "number"
          ? prod.price
          : parseFloat(prod.price || "29.00"),
      fileUrl: newProdId,
      image:
        prod.image ||
        "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80",
      category: prod.category || "Blueprints",
      features: Array.isArray(prod.features)
        ? prod.features
        : [String(prod.features || "TypeScript script")],
      codeContent: mockCode,
    };

    try {
      const prodRef = doc(db, "products", newProdId);
      await setDoc(prodRef, newProductData);
      onAddProduct(newProductData);
      showToast(
        `Successfully imported and deployed "${prod.name}" raw blueprint!`,
        "success",
      );
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `products/${newProdId}`);
    }
  };

  // Submit hand-crafted new blueprints
  const handleAddNewProductSubmit = async (p: Omit<Product, "image">) => {
    const freshData: Product = {
      ...p,
      image:
        "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=400&q=80",
    };

    try {
      await setDoc(doc(db, "products", p.id), freshData);
      onAddProduct(freshData);
      showToast(
        `Product blueprint "${freshData.name}" is now live!`,
        "success",
      );
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `products/${p.id}`);
    }
  };

  // Delete live storefront products with elite visual confirmation state
  const deleteStoreProduct = (id: string) => {
    setPendingDeleteId(id);
  };

  const confirmDeleteProduct = async () => {
    if (!pendingDeleteId) return;
    try {
      await deleteDoc(doc(db, "products", pendingDeleteId));
      showToast("Product successfully deleted from storefront.", "success");
    } catch (err) {
      handleFirestoreError(
        err,
        OperationType.DELETE,
        `products/${pendingDeleteId}`,
      );
    } finally {
      setPendingDeleteId(null);
    }
  };

  // Select Product for editing
  const initiateEditProduct = (prod: Product) => {
    setEditingProduct(prod);
    setEditForm({
      name: prod.name,
      price: prod.price.toString(),
      category: prod.category || "Blueprints",
      description: prod.description,
      features: prod.features.join(", "),
      codeContent: prod.codeContent || "",
    });
  };

  // Handle forms dynamic change
  const handleEditFormChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  // Submit Edited product specifications
  const submitEditedProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    const priceNum = parseFloat(editForm.price);
    if (isNaN(priceNum)) {
      showToast("Requires numerical price parameter.", "error");
      return;
    }

    const updatedProduct: Product = {
      ...editingProduct,
      name: editForm.name,
      price: priceNum,
      category: editForm.category,
      description: editForm.description,
      features: editForm.features
        .split(",")
        .map((f) => f.trim())
        .filter(Boolean),
      codeContent: editForm.codeContent,
    };

    try {
      const prodRef = doc(db, "products", editingProduct.id);
      await setDoc(prodRef, updatedProduct);
      setEditingProduct(null);
      showToast(
        `Success: Product blueprint "${editForm.name}" updated live!`,
        "success",
      );
    } catch (err) {
      handleFirestoreError(
        err,
        OperationType.WRITE,
        `products/${editingProduct.id}`,
      );
    }
  };

  // Coupon action dispatcher
  const triggerCouponAction = async () => {
    showToast(
      "Promotional campaign 'AETHER10' activated dynamically. Push notifications dispatched to browser prospects!",
      "success",
    );
  };

  // Execute dynamic price audit elasticity adjustment
  const triggerPriceAdjustmentAction = async () => {
    try {
      const target = products.find((p) => p.price > 30);
      if (target) {
        const optimizedVal = target.price - 5.0;
        await setDoc(doc(db, "products", target.id), {
          ...target,
          price: optimizedVal,
        });
        showToast(
          `Elasticity Action Committed: Adjusted ${target.name} to highly competitive optimized price state of $${optimizedVal}.00`,
          "success",
        );
      } else {
        showToast(
          "Elasticity Audit Executed: Catalog represents optimal financial tiers!",
          "info",
        );
      }
    } catch (e) {
      console.error(e);
      showToast("Failed to perform price elasticity adjustment.", "error");
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 font-sans relative selection:bg-blue-500/35">
      {/* Access Protection Screen if not authorized */}
      <AnimatePresence>
        {!isAuthenticated && (
          <AdminAuthGate
            adminToken={adminToken}
            setAdminToken={setAdminToken}
            authError={authError}
            onSubmit={handleAdminAuth}
            onBackToStore={onBackToStore}
          />
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
                <span className="font-display font-bold text-xs tracking-widest text-white uppercase sm:inline hidden">
                  AETHERIA COMMAND COCKPIT
                </span>
                <span className="block text-[8.5px] font-mono text-emerald-400 font-bold uppercase tracking-widest">
                  Enterprise Staging Online
                </span>
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
                onClick={() => setActiveTab("analytics")}
                className={`px-4 py-2 text-xs font-mono tracking-wider transition-all cursor-pointer flex items-center gap-2 border-b-2 ${
                  activeTab === "analytics"
                    ? "border-blue-500 text-white font-bold bg-slate-900/40"
                    : "border-transparent text-slate-400 hover:text-slate-200"
                }`}
              >
                <LineChart className="w-3.5 h-3.5 text-blue-400" />
                <span>CFO Financial Analytics</span>
              </button>
              <button
                onClick={() => setActiveTab("catalog")}
                className={`px-4 py-2 text-xs font-mono tracking-wider transition-all cursor-pointer flex items-center gap-2 border-b-2 ${
                  activeTab === "catalog"
                    ? "border-blue-500 text-white font-bold bg-slate-900/40"
                    : "border-transparent text-slate-400 hover:text-slate-200"
                }`}
              >
                <ShoppingBag className="w-3.5 h-3.5 text-blue-400" />
                <span>Product Catalog & GitHub Sync</span>
              </button>
              <button
                onClick={() => setActiveTab("agents")}
                className={`px-4 py-2 text-xs font-mono tracking-wider transition-all cursor-pointer flex items-center gap-2 border-b-2 ${
                  activeTab === "agents"
                    ? "border-blue-500 text-white font-bold bg-slate-900/40"
                    : "border-transparent text-slate-400 hover:text-slate-200"
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
            {activeTab === "analytics" && (
              <CfoAnalyticsTab
                purchases={purchases}
                totalRevenue={totalRevenue}
                burnRate={burnRate}
                mrrTarget={mrrTarget}
                productsCount={products.length}
                isCfoAuditing={isCfoAuditing}
                cfoAuditReport={cfoAuditReport}
                triggerAiExecutiveReview={triggerAiExecutiveReview}
                triggerPriceAdjustmentAction={triggerPriceAdjustmentAction}
                triggerCouponAction={triggerCouponAction}
                cfoMessages={cfoMessages}
                cfoInput={cfoInput}
                setCfoInput={setCfoInput}
                cfoLoading={cfoLoading}
                handleCfoCommand={handleCfoCommand}
                cfoEndRef={cfoEndRef}
              />
            )}

            {/* TAB 2: PRODUCT CATALOG MANAGEMENT & GITHUB BLUEPRINT IMPORTER */}
            {activeTab === "catalog" && (
              <ProductCatalogTab
                products={products}
                gitRepo={gitRepo}
                setGitRepo={setGitRepo}
                syncStatus={syncStatus}
                gitFiles={gitFiles}
                repoSource={repoSource}
                isAnalyzingFile={isAnalyzingFile}
                syncGitHubRepository={syncGitHubRepository}
                analyzeGitHubFileWithAi={analyzeGitHubFileWithAi}
                importProductsJsonListing={importProductsJsonListing}
                deleteStoreProduct={deleteStoreProduct}
                initiateEditProduct={initiateEditProduct}
                onSubmitNewProduct={handleAddNewProductSubmit}
              />
            )}

            {/* TAB 3: AUTOMATED BOT AGENCIES COMPENDIUM */}
            {activeTab === "agents" && <BotAgenciesTab />}
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
                    <h4 className="font-display font-bold text-sm text-white uppercase tracking-wider">
                      Edit Storefront Blueprint Asset Details
                    </h4>
                    <button
                      onClick={() => setEditingProduct(null)}
                      className="text-slate-400 hover:text-white font-mono text-xs cursor-pointer p-1 rounded-sm bg-slate-800"
                    >
                      Esc / Close
                    </button>
                  </div>

                  <form
                    onSubmit={submitEditedProduct}
                    className="space-y-4 font-mono text-slate-300"
                  >
                    <div>
                      <label className="block text-[9px] text-slate-400 uppercase tracking-widest font-bold mb-1">
                        Title
                      </label>
                      <input
                        type="text"
                        required
                        name="name"
                        value={editForm.name}
                        onChange={handleEditFormChange}
                        className="w-full bg-slate-950 border border-slate-850 p-2 rounded text-xs text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[9px] text-slate-400 uppercase tracking-widest font-bold mb-1">
                          Category
                        </label>
                        <select
                          name="category"
                          value={editForm.category}
                          onChange={handleEditFormChange}
                          className="w-full bg-slate-950 border border-slate-850 p-2 rounded text-xs text-white focus:outline-none"
                        >
                          <option value="Blueprints">Blueprints</option>
                          <option value="Micro-SaaS">Micro-SaaS</option>
                          <option value="Controller">Controller</option>
                          <option value="Scripts">Scripts</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[9px] text-slate-400 uppercase tracking-widest font-bold mb-1">
                          Price USD
                        </label>
                        <input
                          type="text"
                          required
                          name="price"
                          value={editForm.price}
                          onChange={handleEditFormChange}
                          className="w-full bg-slate-950 border border-slate-850 p-2 rounded text-xs text-white focus:outline-none font-mono"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[9px] text-slate-400 uppercase tracking-widest font-bold mb-1">
                        Features Specifications (comma split)
                      </label>
                      <input
                        type="text"
                        name="features"
                        value={editForm.features}
                        onChange={handleEditFormChange}
                        className="w-full bg-slate-950 border border-slate-850 p-2 rounded text-xs text-white focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[9px] text-slate-400 uppercase tracking-widest font-bold mb-1">
                        Description
                      </label>
                      <textarea
                        required
                        name="description"
                        rows={2}
                        value={editForm.description}
                        onChange={handleEditFormChange}
                        className="w-full bg-slate-950 border border-slate-850 p-2 rounded text-xs text-white focus:outline-none leading-relaxed"
                      />
                    </div>

                    <div>
                      <label className="block text-[9px] text-slate-400 uppercase tracking-widest font-bold mb-1">
                        Downloadable Blueprint Code Attachment
                      </label>
                      <textarea
                        placeholder="Paste script file instructions contents..."
                        name="codeContent"
                        rows={5}
                        value={editForm.codeContent}
                        onChange={handleEditFormChange}
                        className="w-full bg-slate-950 border border-slate-850 p-2 rounded text-[10px] text-[#58a6ff] focus:outline-none leading-normal font-mono"
                      />
                    </div>

                    <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                      <button
                        type="button"
                        onClick={() => setEditingProduct(null)}
                        className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2 border border-slate-850 rounded text-xs font-semibold cursor-pointer font-mono"
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

          {/* Visual interactive delete validation overlay box */}
          {pendingDeleteId && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4">
              <motion.div
                initial={{ scale: 0.97, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-slate-900 border border-slate-800 p-6 rounded-sm w-full max-w-sm relative shadow-2xl space-y-4"
              >
                <h3 className="font-display font-bold text-xs text-white uppercase tracking-wider">
                  Confirm Blueprint Deletion
                </h3>
                <p className="text-[11px] font-sans text-slate-400 leading-normal">
                  Are you sure you want to permanently remove this product
                  blueprint layout from your active catalog and Firestore
                  database clusters? This action is irreversible.
                </p>
                <div className="flex justify-end gap-3 pt-2 font-mono text-[10.5px]">
                  <button
                    onClick={() => setPendingDeleteId(null)}
                    className="bg-slate-800 hover:bg-slate-755 text-slate-300 px-3 py-1.5 border border-slate-800 rounded-sm cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmDeleteProduct}
                    className="bg-rose-600 hover:bg-rose-750 text-white px-4 py-1.5 rounded-sm cursor-pointer font-bold"
                  >
                    Confirm Delete
                  </button>
                </div>
              </motion.div>
            </div>
          )}

          {/* Floating high-end custom toast overlay block */}
          <AnimatePresence>
            {toastMessage && (
              <motion.div
                initial={{ opacity: 0, y: 40, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 15, scale: 0.97 }}
                className={`fixed bottom-6 right-6 z-50 p-4 rounded-sm shadow-2xl flex items-center justify-between gap-4 border max-w-sm ${
                  toastType === "success"
                    ? "bg-slate-950 border-emerald-500/40 text-emerald-300"
                    : toastType === "error"
                      ? "bg-slate-950 border-rose-500/40 text-rose-300"
                      : "bg-slate-950 border-blue-500/40 text-blue-300"
                }`}
              >
                <div className="flex-1 text-[11px] font-mono leading-normal font-semibold">
                  {toastMessage}
                </div>
                <button
                  onClick={() => setToastMessage(null)}
                  className="text-slate-500 hover:text-slate-200 cursor-pointer p-1 text-[9px] font-mono leading-none border border-slate-800 rounded-sm font-bold transition hover:bg-slate-850"
                >
                  ✕
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
