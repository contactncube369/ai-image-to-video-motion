import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Increase JSON payload limit for base64 image uploads
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Initialize GoogleGenAI server client
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
};

// In-memory generation jobs store
interface ServerJob {
  id: string;
  projectId: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  progress: number;
  stage: string;
  error?: string;
  videoUrl?: string;
  createdAt: string;
  updatedAt: string;
}

const jobsStore = new Map<string, ServerJob>();

// 1. Health check & Gemini status
app.get('/api/health', (req: Request, res: Response) => {
  const hasGeminiKey = !!process.env.GEMINI_API_KEY;
  res.json({
    status: 'ok',
    version: '1.0.0',
    geminiConfigured: hasGeminiKey,
    activeModel: 'gemini-3.8-flash',
    timestamp: new Date().toISOString(),
  });
});

// 2. AI Image Analysis via Gemini
app.post('/api/gemini/analyze-image', async (req: Request, res: Response) => {
  try {
    const { imageBase64, mimeType = 'image/jpeg', imageUrl } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      // Graceful fallback if no API key is provided
      return res.json({
        analysis: {
          subject: 'Detected visual focal subject',
          scene: 'High dynamic range environment with rich spatial depth',
          background: 'Layered atmospheric depth',
          lighting: 'Cinematic directional lighting',
          recommendedCameraPreset: 'slow_zoom_in',
          recommendedIntensity: 35,
          motionOpportunities: [
            'Gentle atmospheric depth parallax',
            'Subtle optical camera zoom',
            'Soft volumetric light shift',
          ],
          suggestedPrompt:
            'Cinematic slow push towards the central subject, maintaining crisp focus and natural environmental depth.',
        },
        provider: 'fallback',
      });
    }

    let contentsParts: any[] = [];

    if (imageBase64) {
      const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');
      contentsParts.push({
        inlineData: {
          mimeType,
          data: cleanBase64,
        },
      });
    }

    contentsParts.push({
      text: `You are an expert film director and AI cinematographer for MotionAI, an image-to-video studio.
Analyze this image and provide precise recommendations for transforming it into a cinematic animated video.
Identify:
1. Primary subject
2. Overall scene and spatial layout
3. Background layers
4. Lighting characteristics
5. Recommended camera preset from: static, slow_zoom_in, slow_zoom_out, pan_left, pan_right, tilt_up, tilt_down, dolly_in, dolly_out, orbit, cinematic_tracking, handheld_cinematic
6. Recommended motion intensity (0-100)
7. Specific motion opportunities (e.g., wind in hair, water reflections, cloud drift, particle motes, camera push)
8. A polished motion prompt for video generation.`,
    });

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: { parts: contentsParts },
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            subject: { type: Type.STRING },
            scene: { type: Type.STRING },
            background: { type: Type.STRING },
            lighting: { type: Type.STRING },
            recommendedCameraPreset: { type: Type.STRING },
            recommendedIntensity: { type: Type.INTEGER },
            motionOpportunities: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            suggestedPrompt: { type: Type.STRING },
          },
          required: [
            'subject',
            'scene',
            'background',
            'lighting',
            'recommendedCameraPreset',
            'recommendedIntensity',
            'motionOpportunities',
            'suggestedPrompt',
          ],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json({ analysis: parsed, provider: 'gemini' });
  } catch (error: any) {
    console.error('Gemini image analysis error:', error);
    res.status(500).json({
      error: 'Failed to analyze image with Gemini',
      message: error.message || 'Unknown error',
    });
  }
});

// 3. Prompt Enhancement via Gemini
app.post('/api/gemini/enhance-prompt', async (req: Request, res: Response) => {
  try {
    const { rawPrompt, cameraPreset, intensity, aspectRatio } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      // Local enhancement fallback
      const enhanced = `Cinematic ${cameraPreset?.replace(/_/g, ' ') || 'motion'} capture. ${rawPrompt || 'Smooth movement'}. Natural environmental depth, continuous fluid motion vectors, volumetric lighting, photorealistic textures, zero jitter.`;
      return res.json({
        enhancedPrompt: enhanced,
        negativePrompt:
          'Flickering, warped objects, distorted faces, unnatural motion, sudden camera jumps, excessive blur, inconsistent lighting, unwanted object deformation.',
        provider: 'fallback',
      });
    }

    const promptRequest = `You are a master cinematic prompt engineer for video generation models (like Veo, Runway, Luma).
User's raw prompt: "${rawPrompt || 'bring this image to life'}"
Camera preset: ${cameraPreset || 'slow_zoom_in'}
Intensity level: ${intensity || 40}/100
Aspect ratio: ${aspectRatio || '16:9'}

Generate:
1. enhancedPrompt: An expanded, descriptive, cinematic video prompt preserving the user's scene while specifying camera trajectory, environmental physics, lighting continuity, and temporal stability.
2. negativePrompt: Negative keywords to eliminate artifacts, warping, jitter, and facial distortion.
3. cameraDirectives: Short bullet summary of camera movement instructions.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: promptRequest,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            enhancedPrompt: { type: Type.STRING },
            negativePrompt: { type: Type.STRING },
            cameraDirectives: { type: Type.STRING },
          },
          required: ['enhancedPrompt', 'negativePrompt', 'cameraDirectives'],
        },
      },
    });

    const result = JSON.parse(response.text || '{}');
    res.json({ ...result, provider: 'gemini' });
  } catch (error: any) {
    console.error('Gemini prompt enhancement error:', error);
    res.status(500).json({
      error: 'Failed to enhance prompt',
      message: error.message || 'Unknown error',
    });
  }
});

// 4. Job creation endpoint
app.post('/api/jobs', (req: Request, res: Response) => {
  const { projectId } = req.body;
  const jobId = `job-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;

  const newJob: ServerJob = {
    id: jobId,
    projectId: projectId || 'proj-default',
    status: 'queued',
    progress: 5,
    stage: 'Queued in generation cluster',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  jobsStore.set(jobId, newJob);

  res.status(201).json(newJob);
});

// 5. Job status poll endpoint
app.get('/api/jobs/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const job = jobsStore.get(id);

  if (!job) {
    return res.status(404).json({ error: 'Job not found' });
  }

  res.json(job);
});

// 6. Job cancel endpoint
app.post('/api/jobs/:id/cancel', (req: Request, res: Response) => {
  const { id } = req.params;
  const job = jobsStore.get(id);

  if (!job) {
    return res.status(404).json({ error: 'Job not found' });
  }

  job.status = 'failed';
  job.stage = 'Cancelled by user';
  job.updatedAt = new Date().toISOString();
  jobsStore.set(id, job);

  res.json({ success: true, job });
});

// Start server with Vite middleware in dev or static files in production
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`MotionAI Studio Server running at http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
