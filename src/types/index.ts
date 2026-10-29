export type CameraPreset =
  | 'static'
  | 'slow_zoom_in'
  | 'slow_zoom_out'
  | 'pan_left'
  | 'pan_right'
  | 'tilt_up'
  | 'tilt_down'
  | 'dolly_in'
  | 'dolly_out'
  | 'orbit'
  | 'cinematic_tracking'
  | 'handheld_cinematic';

export type AspectRatio = '16:9' | '9:16' | '1:1' | '4:3';
export type Resolution = '720p' | '1080p' | '4k';
export type VideoDuration = 4 | 5 | 8 | 10;
export type GenerationQuality = 'draft' | 'standard' | 'high';

export interface MotionSettings {
  cameraPreset: CameraPreset;
  intensity: number; // 0 - 100
  animationSpeed: number; // 0.5 - 2.0
  motionSmoothness: number; // 0 - 100
  cameraMovementStrength: number; // 0 - 100
  subjectMovementStrength: number; // 0 - 100
  backgroundMovementStrength: number; // 0 - 100
  depthParallax: boolean;
  loopAnimation: boolean;
  preserveSubject: boolean;
  preserveComposition: boolean;
}

export interface VideoSettings {
  duration: VideoDuration;
  aspectRatio: AspectRatio;
  resolution: Resolution;
  frameRate: 24 | 30 | 60;
  quality: GenerationQuality;
  variationsCount: number; // 1 - 4
}

export interface ImageAnalysisResult {
  subject: string;
  scene: string;
  background: string;
  lighting: string;
  recommendedCameraPreset: CameraPreset;
  recommendedIntensity: number;
  motionOpportunities: string[];
  suggestedPrompt: string;
}

export interface VideoVariation {
  id: string;
  url: string;
  thumbnailUrl?: string;
  duration: number;
  width: number;
  height: number;
  createdAt: string;
  seed: number;
}

export interface Project {
  id: string;
  name: string;
  imageUrl: string;
  imageFileName?: string;
  imageDimensions?: { width: number; height: number };
  motionSettings: MotionSettings;
  videoSettings: VideoSettings;
  prompt: string;
  negativePrompt: string;
  variations: VideoVariation[];
  selectedVariationIndex: number;
  status: 'draft' | 'queued' | 'processing' | 'completed' | 'failed';
  isFavorite: boolean;
  createdAt: string;
  updatedAt: string;
  imageAnalysis?: ImageAnalysisResult;
}

export interface GenerationJob {
  id: string;
  projectId: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  progress: number; // 0 - 100
  stage: string;
  error?: string;
  videoUrl?: string;
  variations?: VideoVariation[];
  createdAt: string;
  updatedAt: string;
  estimatedSecondsRemaining: number;
}

export interface TemplateItem {
  id: string;
  title: string;
  category: 'Cinematic' | 'Landscape' | 'Portrait' | 'Action' | 'Sci-Fi' | 'Nature';
  description: string;
  thumbnailUrl: string;
  sampleVideoUrl?: string;
  motionSettings: MotionSettings;
  videoSettings: VideoSettings;
  prompt: string;
  negativePrompt: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  role: 'admin' | 'user';
  isAdmin: boolean;
  isInfiniteCredits: boolean;
  hasUltra4k: boolean;
  plan: 'Free Trial' | 'Creator Pro' | 'Studio Max';
  creditsRemaining: number;
  totalCredits: number;
}
