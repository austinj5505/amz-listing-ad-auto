
export enum Category {
  SWIMWEAR = 'Swimwear',
  SPORTSWEAR = 'Sportswear'
}

export interface ProductInput {
  name: string;
  category: Category;
  material: string;
  features: string;
  style: string;
  targetAudience: string;
  imageFront?: string;
  imageBack?: string;
}

export interface VisualAssetSuggestion {
  mainImage: {
    composition: string;
    lightingAndTone: string;
    exampleDescription: string;
    rationale: string;
    generationPrompt: string; // 新增：主图 AI 生成提示词
  };
  secondaryImages: {
    title: string;
    description: string;
    keySellingPoint: string;
    usageScenario: string; // 新增：使用场景
    visualExample: string;
    rationale: string;
    generationPrompt: string; // 新增：附图 AI 生成提示词
  }[];
  aPlusContent: {
    layoutStrategy: string;
    modules: {
      type: string;
      content: string;
      designGoal: string;
    }[];
    rationale: string;
  };
  productVideo: {
    tone: string;
    usageScenario: string; // 新增：视频使用场景
    scriptOutline: string;
    keyScenes: string[];
    rationale: string;
    generationPrompt: string; // 新增：视频/场景生成提示词
  };
}

export interface ListingContent {
  mainTitle: string;
  altTitles: string[];
  bulletPoints: string[];
  description: string;
  searchTerms: string[];
  specs: {
    materialComposition: string;
    sizingDetail: string;
    careInstructions: string;
  };
  visualAssets: VisualAssetSuggestion;
  rationales: {
    titleLogic: string;
    bulletLogic: string;
    keywordLogic: string;
  };
}

export interface LaunchStep {
  dayRange: string;
  phaseName: string;
  objective: string;
  adTypes: string[];
  dailyBudget: number;
  targetingFocus: string;
  placementStrategy: string;
  biddingStrategy: string;
  suggestedBidRange: string;
  contentInstruction: string;
  strategicLogic: string;
  optimizationTask: string;
}

export interface AdStrategy {
  campaignName: string;
  asinTargeting: string[];
  detailedRoadmap: LaunchStep[];
  marketIntel: {
    suggestedLaunchPrice: number;
    regularPrice: number;
    competitorBenchmark: string;
    positioning: string;
  };
  creativeCopy: {
    headline: string;
    videoConcept: string;
    callToAction: string;
  };
}

export interface GenerationResult {
  listing: ListingContent;
  ads: AdStrategy;
  sources?: { title: string; uri: string }[];
}

export interface SavedRecord {
  id: string;
  timestamp: number;
  input: ProductInput;
  result: GenerationResult;
}
