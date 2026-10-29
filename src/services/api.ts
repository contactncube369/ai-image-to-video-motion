import { CameraPreset, ImageAnalysisResult } from '../types';

export interface HealthCheckResponse {
  status: string;
  version: string;
  geminiConfigured: boolean;
  activeModel: string;
  timestamp: string;
}

export async function checkServerHealth(): Promise<HealthCheckResponse> {
  try {
    const res = await fetch('/api/health');
    if (!res.ok) throw new Error('Health check failed');
    return await res.json();
  } catch (err) {
    return {
      status: 'offline',
      version: '1.0.0',
      geminiConfigured: false,
      activeModel: 'gemini-3.8-flash',
      timestamp: new Date().toISOString(),
    };
  }
}

export async function analyzeImageWithGemini(
  imageBase64: string,
  mimeType: string = 'image/jpeg'
): Promise<ImageAnalysisResult> {
  const res = await fetch('/api/gemini/analyze-image', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ imageBase64, mimeType }),
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.message || 'Failed to analyze image with Gemini');
  }

  const data = await res.json();
  return data.analysis;
}

export interface EnhancePromptResponse {
  enhancedPrompt: string;
  negativePrompt: string;
  cameraDirectives?: string;
  provider: string;
}

export async function enhancePromptWithGemini(
  rawPrompt: string,
  cameraPreset: CameraPreset,
  intensity: number,
  aspectRatio: string
): Promise<EnhancePromptResponse> {
  const res = await fetch('/api/gemini/enhance-prompt', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ rawPrompt, cameraPreset, intensity, aspectRatio }),
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.message || 'Failed to enhance prompt with Gemini');
  }

  return await res.json();
}

export async function createGenerationJob(projectId: string) {
  const res = await fetch('/api/jobs', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ projectId }),
  });
  if (!res.ok) throw new Error('Failed to create generation job');
  return await res.json();
}

export async function pollJob(jobId: string) {
  const res = await fetch(`/api/jobs/${jobId}`);
  if (!res.ok) throw new Error('Failed to fetch job status');
  return await res.json();
}

export async function cancelJob(jobId: string) {
  const res = await fetch(`/api/jobs/${jobId}/cancel`, { method: 'POST' });
  if (!res.ok) throw new Error('Failed to cancel job');
  return await res.json();
}
