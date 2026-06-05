export interface SlideContent {
  headline: string;
  support: string;
}

export interface FormInputs {
  headline: string;
  highlight: string;
  support: string;
  cta: string;
  emotion: string;
  context: string;
  heroMode: 'SMARTPHONE' | 'WORKSPACE' | 'HUMAN';
  typography: string;
  heroConfig: string;
  teamMoodDir: string;
  bgMood: string;
  
  // Carousel Global Variable Fields (V5.3 PRO)
  carouselHeadline: string;
  carouselHighlight: string;
  carouselSupport: string;
  carouselCta: string;
  
  // Slide Contents Data (WYSIWYG overrides)
  carouselSlides: SlideContent[];
}

export interface DesignSettings {
  headlineSize: number;
  supportSize: number;
  layoutY: number;
  blurIntensity: number;
  logoAlign: 'left' | 'center' | 'right';
  mockupPhoto: 'corporate-stress' | 'modern-office' | 'jakarta-commuter';
}

export interface HistoryLogItem {
  id: number;
  timestamp: string;
  headline: string;
  mode: 'poster' | 'carousel';
  emotion: string;
  promptText: string;
  savedState: {
    engineMode: 'poster' | 'carousel';
    formInputs: FormInputs;
    designSettings: DesignSettings;
  };
}
