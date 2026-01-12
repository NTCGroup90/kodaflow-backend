// KODAFLOW Marketing Platform - Type Definitions

// ==================== Brand DNA ====================
export interface BrandDNA {
  id: string;
  userId: string;
  projectName: string;
  sourceUrl?: string;
  
  // Brand Identity
  slogan: string;
  missionStatement?: string;
  coreValues: string[];
  
  // Visual Identity
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  fontPrimary: string;
  fontSecondary?: string;
  logoUrl?: string;
  
  // Brand Voice
  toneOfVoice: 'professional' | 'friendly' | 'bold' | 'playful';
  voiceAttributes: string[];
  writingStyle?: string;
  
  // Target Audience
  targetDemographics?: {
    ageRange: string;
    gender: string;
    locations: string[];
  };
  painPoints: string[];
  desires: string[];
  
  status: 'draft' | 'active' | 'archived';
  createdAt: Date;
  updatedAt: Date;
}

// ==================== Visual Assets ====================
export interface VisualAsset {
  id: string;
  brandId: string;
  assetType: 'product' | 'lifestyle' | 'concept' | 'logo';
  source: 'scraped' | 'uploaded' | 'ai_generated';
  
  originalUrl: string;
  cdnUrl?: string;
  filename?: string;
  
  width?: number;
  height?: number;
  qualityScore?: number;
  
  aiDescription?: string;
  aiTags?: string[];
  dominantColors?: string[];
  
  isSelected: boolean;
  usageCount: number;
  createdAt: Date;
}

// ==================== Competitor Analysis ====================
export interface Competitor {
  id: string;
  reportId: string;
  competitorRank: 1 | 2 | 3;
  companyName: string;
  websiteUrl?: string;
  
  socialChannels?: {
    facebook?: string;
    instagram?: string;
    tiktok?: string;
  };
  
  // SWOT Analysis (Required)
  strengths: string;    // Tại sao họ thắng?
  weaknesses: string;   // Họ đang làm tệ ở đâu?
  attackAngles: string; // Ngách tấn công
  
  sampleAds?: Array<{
    url: string;
    platform: string;
    engagement?: number;
  }>;
  
  createdAt: Date;
}

export interface CompetitorReport {
  id: string;
  brandId: string;
  analysisType: 'url_based' | 'keyword_based';
  searchQuery: string;
  
  competitors: Competitor[];
  
  marketSummary?: string;
  recommendedPositioning?: string;
  confidenceScore?: number;
  
  createdAt: Date;
}

// ==================== Campaign ====================
export interface Campaign {
  id: string;
  brandId: string;
  reportId?: string;
  
  angleNumber: 1 | 2 | 3;
  angleTitle: string;
  angleDescription: string;
  basedOnWeakness?: string;
  
  adCopies: AdCopy[];
  videoScripts: VideoScript[];
  creatives: Creative[];
  
  status: 'draft' | 'approved' | 'deployed';
  approvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface AdCopy {
  id: string;
  campaignId: string;
  
  headline: string;
  description: string;
  callToAction: string;
  
  targetPlatform?: 'google' | 'facebook' | 'tiktok';
  isApproved: boolean;
  editedContent?: object;
  
  createdAt: Date;
}

export interface VideoScript {
  id: string;
  campaignId: string;
  
  durationSeconds: 15 | 30;
  format: 'shorts' | 'reels' | 'story';
  
  storyboard: StoryboardScene[];
  
  isApproved: boolean;
  createdAt: Date;
}

export interface StoryboardScene {
  scene: number;
  visual: string;      // Mô tả hình ảnh
  voiceover: string;   // Lời dẫn/Text overlay
  imageUrl?: string;   // URL ảnh từ Asset Library
  duration: number;    // Giây
}

// ==================== Creatives ====================
export interface Creative {
  id: string;
  campaignId: string;
  adCopyId?: string;
  scriptId?: string;
  
  creativeType: 'banner' | 'video';
  dimensions: string;  // '1200x628', '1080x1920'
  
  previewUrl?: string;
  finalUrl?: string;
  
  editorState?: object; // Fabric.js canvas JSON
  
  status: 'draft' | 'approved' | 'deployed';
  deployedTo?: Array<{
    platform: string;
    campaignId: string;
    status: string;
  }>;
  
  createdAt: Date;
  updatedAt: Date;
}

// ==================== Credits & Wallet ====================
export interface UserWallet {
  userId: string;
  credits: number;
  totalPurchased: number;
  totalUsed: number;
  updatedAt: Date;
}

export interface CreditTransaction {
  id: string;
  userId: string;
  type: 'purchase' | 'usage' | 'bonus';
  amount: number;       // Positive for purchase, negative for usage
  
  description: string;
  relatedResourceId?: string;  // campaignId, videoId, etc.
  
  createdAt: Date;
}

export interface CreditPricing {
  packageId: string;
  name: string;         // 'Starter', 'Pro', 'Agency'
  credits: number;
  priceVND: number;
  pricePerCredit: number;
  popular?: boolean;
}

// ==================== Workflow State ====================
export interface WorkflowState {
  currentModule: 1 | 2 | 3 | 4 | 5;
  brandDNA?: BrandDNA;
  visualAssets: VisualAsset[];
  competitorReport?: CompetitorReport;
  campaigns: Campaign[];
  selectedCampaign?: Campaign;
  creatives: Creative[];
}
