import React, { useState } from "react";
import {
  ShoppingBag,
  Settings,
  Trash2,
  Globe,
  RefreshCw,
  CheckCircle,
  Plus,
} from "lucide-react";
import { Product, GitHubFile } from "../../types";

interface ProductForm {
  name: string;
  description: string;
  price: string;
  category: string;
  features: string;
  assetKey: string;
  codeContent: string;
}

const initialFormState: ProductForm = {
  name: "",
  description: "",
  price: "",
  category: "Blueprints",
  features: "",
  assetKey: "",
  codeContent: "",
};

interface ProductCatalogTabProps {
  products: Product[];
  gitRepo: string;
  setGitRepo: (v: string) => void;
  syncStatus: "idle" | "syncing" | "success" | "error";
  gitFiles: GitHubFile[];
  repoSource: "products.json" | "files-list" | null;
  isAnalyzingFile: string | null;
  syncGitHubRepository: () => void;
  analyzeGitHubFileWithAi: (
    file: GitHubFile,
    populateForm: (data: Partial<ProductForm>) => void,
  ) => void;
  importProductsJsonListing: (prod: GitHubFile) => void;
  deleteStoreProduct: (id: string) => void;
  initiateEditProduct: (p: Product) => void;
  onSubmitNewProduct: (newProductData: Omit<Product, "image">) => void;
}

export default function ProductCatalogTab({
  products,
  gitRepo,
  setGitRepo,
  syncStatus,
  gitFiles,
  repoSource,
  isAnalyzingFile,
  syncGitHubRepository,
  analyzeGitHubFileWithAi,
  importProductsJsonListing,
  deleteStoreProduct,
  initiateEditProduct,
  onSubmitNewProduct,
}: ProductCatalogTabProps) {
  // Single consolidated state object for product creation form
  const [form, setForm] = useState<ProductForm>(initialFormState);
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setValidationError(null); // clear alert when writing
  };

  const handleAiPopulation = (data: Partial<ProductForm>) => {
    setForm((prev) => ({
      ...prev,
      ...data,
    }));
    setValidationError(null);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.price || !form.description) {
      setValidationError(
        "Missing required attributes (Title, Price, or Description).",
      );
      return;
    }

    const priceNum = parseFloat(form.price);
    if (isNaN(priceNum)) {
      setValidationError(
        "Pricing requires a valid numerical currency decimal.",
      );
      return;
    }

    const finalId =
      form.assetKey.trim() ||
      "asset_custom_" + Math.random().toString(36).substring(2, 7);
    const newProductData: Omit<Product, "image"> = {
      id: finalId,
      name: form.name,
      description: form.description,
      price: priceNum,
      fileUrl: finalId,
      category: form.category,
      features: form.features
        .split(",")
        .map((f) => f.trim())
        .filter(Boolean),
      codeContent:
        form.codeContent ||
        `// ${form.name} Blueprint source code attached successfully`,
    };

    onSubmitNewProduct(newProductData);
    setForm(initialFormState); // Reset to blank cleanly
    setValidationError(null);
  };

  return (
    <div className="space-y-6">
      {/* Advanced Grid: Catalog table & GitHub sync, Right contains Add product spec form */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left block (Span 2): Live catalog table & GitHub syncer */}
        <div className="xl:col-span-2 space-y-6">
          {/* Live catalog list */}
          <div className="bg-slate-950 rounded-sm border border-slate-850 p-5 space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-850 pb-3">
              <div>
                <h4 className="font-display font-bold text-xs text-white uppercase tracking-wider">
                  Storefront Catalog Ledger
                </h4>
                <p className="text-[9px] font-mono text-slate-500">
                  Live products and downloadable script archives synced in
                  real-time
                </p>
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
                    <th className="py-2.5 px-3 text-right">
                      Operational Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850/50">
                  {products.map((p) => (
                    <tr
                      key={p.id}
                      className="hover:bg-slate-900/30 transition-colors text-slate-300"
                    >
                      <td className="py-3 px-3 font-semibold text-white">
                        <div>{p.name}</div>
                        <span className="text-[9px] text-slate-500 font-mono block max-w-xs truncate mt-0.5">
                          {p.description}
                        </span>
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
                            <span>
                              Custom code attached ({p.codeContent.length}{" "}
                              bytes)
                            </span>
                          </span>
                        ) : (
                          <span className="text-[9px] text-slate-500 block mt-0.5">
                            Static server file mapping
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-right space-x-2">
                        <button
                          onClick={() => initiateEditProduct(p)}
                          className="p-1.5 rounded-sm bg-slate-900 hover:bg-blue-600/10 text-blue-400 hover:text-blue-300 transition cursor-pointer border border-slate-800"
                          title="Edit Product"
                        >
                          <Settings className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => deleteStoreProduct(p.id)}
                          className="p-1.5 rounded-sm bg-slate-900 hover:bg-rose-950/25 text-rose-400 hover:text-rose-300 transition cursor-pointer border border-slate-850"
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
                <p className="text-[9px] font-mono text-slate-500">
                  Query and dynamically ingest digital catalog scripts and
                  products.json listings
                </p>
              </div>
              <span className="text-[9px] font-mono bg-emerald-950/20 text-emerald-400 px-2 py-0.5 border border-emerald-900/30 rounded-sm">
                Sync Engine Ready
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
            {syncStatus === "syncing" && (
              <div className="flex items-center gap-2 text-xs text-blue-300 font-mono p-4 bg-slate-900 rounded-sm">
                <RefreshCw className="w-4 h-4 animate-spin text-blue-400" />
                <span>
                  Establishing network handshake and scanning tree indexes...
                </span>
              </div>
            )}

            {syncStatus === "success" && gitFiles.length > 0 && (
              <div className="space-y-3 pt-2">
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest font-bold block">
                  Discovered GitHub Resources ({gitFiles.length})
                </span>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-80 overflow-y-auto fancy-scrollbar">
                  {repoSource === "products.json"
                    ? gitFiles.map((pf, idx) => (
                        <div
                          key={idx}
                          className="p-3 bg-slate-900 border border-slate-850 rounded-sm flex flex-col justify-between space-y-2 text-xs"
                        >
                          <div>
                            <span className="text-[10px] font-mono text-blue-400 uppercase">
                              products.json metadata
                            </span>
                            <h5 className="font-semibold text-white mt-1">
                              {pf.name}
                            </h5>
                            <p className="text-[10px] text-slate-400 truncate mt-0.5">
                              {pf.description}
                            </p>
                            <strong className="text-emerald-400 block mt-1 font-mono">
                              ${pf.price}
                            </strong>
                          </div>
                          <button
                            onClick={() => importProductsJsonListing(pf)}
                            className="w-full bg-slate-950 hover:bg-slate-800 text-[10px] font-mono py-1 rounded border border-slate-800 uppercase block cursor-pointer transition text-center font-bold"
                          >
                            Deploy Instantly Live
                          </button>
                        </div>
                      ))
                    : gitFiles.map((gf, idx) => (
                        <div
                          key={idx}
                          className="p-3 bg-slate-900 border border-slate-850 rounded-sm flex items-center justify-between text-xs font-mono"
                        >
                          <div className="max-w-[70%]">
                            <span
                              className="text-white block font-semibold truncate"
                              title={gf.name}
                            >
                              {gf.name}
                            </span>
                            <span className="text-[9.5px] text-slate-500 block mt-0.5">
                              {(gf.size / 1024).toFixed(1)} KB SPEC
                            </span>
                          </div>
                          <button
                            onClick={() =>
                              analyzeGitHubFileWithAi(gf, handleAiPopulation)
                            }
                            disabled={!!isAnalyzingFile}
                            className="bg-blue-600 hover:bg-blue-500 text-white text-[9px] px-2.5 py-1.5 rounded-sm uppercase cursor-pointer block transition shrink-0 font-bold"
                          >
                            {isAnalyzingFile === gf.name
                              ? "Analyzing..."
                              : "AI Draft Spec"}
                          </button>
                        </div>
                      ))}
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
              <h3 className="font-display font-bold text-xs text-white uppercase tracking-wider">
                Ingest New Blueprint Asset
              </h3>
            </div>

            <form
              onSubmit={handleFormSubmit}
              className="space-y-4 text-xs font-mono"
            >
              <div>
                <label className="block text-[8.5px] text-slate-400 uppercase tracking-widest font-bold mb-1">
                  Product Title
                </label>
                <input
                  type="text"
                  required
                  name="name"
                  placeholder="e.g. Telegram Lead Prospector SaaS"
                  value={form.name}
                  onChange={handleInputChange}
                  className="w-full bg-slate-900 border border-slate-800 rounded-sm p-2 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[8.5px] text-slate-400 uppercase tracking-widest font-bold mb-1">
                    Category
                  </label>
                  <select
                    name="category"
                    value={form.category}
                    onChange={handleInputChange}
                    className="w-full bg-slate-900 border border-slate-800 rounded-sm p-2 text-xs text-white focus:outline-none"
                  >
                    <option value="Blueprints">Blueprints</option>
                    <option value="Micro-SaaS">Micro-SaaS</option>
                    <option value="Controller">Controller</option>
                    <option value="Scripts">Scripts</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[8.5px] text-slate-400 uppercase tracking-widest font-bold mb-1">
                    Price USD
                  </label>
                  <input
                    type="text"
                    required
                    name="price"
                    placeholder="29.00"
                    value={form.price}
                    onChange={handleInputChange}
                    className="w-full bg-slate-900 border border-slate-800 rounded-sm p-2 text-xs text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[8.5px] text-slate-400 uppercase tracking-widest font-bold mb-1">
                  Dynamic Asset ID / FileUrl
                </label>
                <input
                  type="text"
                  name="assetKey"
                  placeholder="telegram_prospector_code"
                  value={form.assetKey}
                  onChange={handleInputChange}
                  className="w-full bg-slate-900 border border-slate-800 rounded-sm p-2 text-xs text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[8.5px] text-slate-400 uppercase tracking-widest font-bold mb-1">
                  Key Features (comma split)
                </label>
                <input
                  type="text"
                  name="features"
                  placeholder="Headless Chrome threads, Regex lead extractor"
                  value={form.features}
                  onChange={handleInputChange}
                  className="w-full bg-slate-900 border border-slate-800 rounded-sm p-2 text-xs text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[8.5px] text-slate-400 uppercase tracking-widest font-bold mb-1">
                  Brief Sales Description
                </label>
                <textarea
                  required
                  name="description"
                  placeholder="Explain the commercial value of this automation blueprint..."
                  value={form.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full bg-slate-900 border border-slate-800 rounded-sm p-2 text-xs text-white focus:outline-none leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-[8.5px] text-slate-400 uppercase tracking-widest font-bold mb-1">
                  Associated Downloadable Code Content
                </label>
                <textarea
                  name="codeContent"
                  placeholder="Paste actual compiled automation script or blueprint configuration code layout here... (This content will fetch dynamically on checkout for instant purchaser download!)"
                  value={form.codeContent}
                  onChange={handleInputChange}
                  rows={6}
                  className="w-full bg-slate-900 border border-slate-800 rounded-sm p-2 text-[10.5px] text-[#58a6ff] focus:outline-none leading-normal font-mono"
                />
              </div>

              {validationError && (
                <div className="bg-rose-950/40 border border-rose-900/60 p-2.5 rounded-sm text-rose-300 text-xs font-mono leading-normal">
                  ⚠ {validationError}
                </div>
              )}

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
  );
}
