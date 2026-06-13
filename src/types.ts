/**
 * TypeScript definitions for the AI Orchestrator Command Suite
 */

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  fileUrl: string; // The downloadable mock source code or blueprint content
  image: string; // Cover image or illustration
  category: string;
  features: string[]; // Key selling technical points
  codeContent?: string; // Optional actual download file attachment code
}

export interface PurchaseItem {
  id: string;
  name: string;
  price: number;
  fileUrl: string;
}

export interface Purchase {
  id: string;
  email: string;
  phone: string;
  items: PurchaseItem[];
  total: number;
  status: 'pending' | 'completed';
  createdAt: string;
  token?: string; // Token used to secure downloads
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  createdAt: string;
  chatType: 'sales' | 'cfo';
  userId: string;
}

export interface AgentMetrics {
  activeCampaigns?: number;
  profilesMonitored?: number;
  queuesScheduled?: number;
  dailyConversions?: number;
  totalIncome?: number;
  monthlyTargetUSD?: number;
  burnRateUSD?: number;
  netRevenueUSD?: number;
  growthProgress?: number; // percentage
}

export interface AgentState {
  id: 'cfo' | 'growth' | 'sales';
  name: string;
  status: 'idle' | 'running' | 'active' | 'success' | 'failed';
  metrics: AgentMetrics;
  logs: string[];
}

export interface MarketingAsset {
  id: string;
  prompt: string;
  imageUrl: string;
  aspectRatio: string;
  createdTime: string;
}

export interface CfoAuditReport {
  score: number;
  rating: string;
  text: string;
}

export interface GitHubFile {
  name: string;
  size: number;
  downloadUrl?: string;
  id?: string;
  description?: string;
  price?: string | number;
  category?: string;
  features?: string | string[];
  codeContent?: string;
  image?: string;
}

