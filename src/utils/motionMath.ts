import { AspectRatio, CameraPreset, GenerationQuality, Resolution } from '../types';

export interface MotionIntensityInfo {
  label: 'Subtle' | 'Natural' | 'Dynamic' | 'Highly Expressive';
  description: string;
  badgeColor: string;
  warning?: string;
}

export function classifyMotionIntensity(intensity: number): MotionIntensityInfo {
  const clamped = Math.max(0, Math.min(100, Math.round(intensity)));
  if (clamped <= 20) {
    return {
      label: 'Subtle',
      description: 'Micro-movements, gentle breathing, soft light shift.',
      badgeColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    };
  }
  if (clamped <= 45) {
    return {
      label: 'Natural',
      description: 'Realistic physical motion, natural wind, and camera drift.',
      badgeColor: 'text-sky-400 bg-sky-500/10 border-sky-500/20',
    };
  }
  if (clamped <= 70) {
    return {
      label: 'Dynamic',
      description: 'Energetic camera movements and fluid subject displacement.',
      badgeColor: 'text-violet-400 bg-violet-500/10 border-violet-500/20',
    };
  }
  return {
    label: 'Highly Expressive',
    description: 'High velocity transitions. May cause temporal warping or edge artifacts.',
    badgeColor: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    warning: 'High intensity can introduce distortion. Consider reducing if faces or geometry warp.',
  };
}

export function getAspectRatioDimensions(
  aspectRatio: AspectRatio,
  resolution: Resolution
): { width: number; height: number; ratioFloat: number } {
  const is4k = resolution === '4k';
  const is1080p = resolution === '1080p';

  switch (aspectRatio) {
    case '16:9':
      return {
        width: is4k ? 3840 : is1080p ? 1920 : 1280,
        height: is4k ? 2160 : is1080p ? 1080 : 720,
        ratioFloat: 16 / 9,
      };
    case '9:16':
      return {
        width: is4k ? 2160 : is1080p ? 1080 : 720,
        height: is4k ? 3840 : is1080p ? 1920 : 1280,
        ratioFloat: 9 / 16,
      };
    case '1:1':
      return {
        width: is4k ? 2160 : is1080p ? 1080 : 720,
        height: is4k ? 2160 : is1080p ? 1080 : 720,
        ratioFloat: 1,
      };
    case '4:3':
      return {
        width: is4k ? 2880 : is1080p ? 1440 : 960,
        height: is4k ? 2160 : is1080p ? 1080 : 720,
        ratioFloat: 4 / 3,
      };
    default:
      return { width: 1280, height: 720, ratioFloat: 16 / 9 };
  }
}

export function calculateEstimatedProcessingTime(
  duration: number,
  resolution: Resolution,
  quality: GenerationQuality,
  variationsCount: number = 1
): number {
  // Base seconds per video second
  const baseRate = resolution === '4k' ? 4.0 : resolution === '1080p' ? 2.5 : 1.5;
  const qualityMultiplier = quality === 'high' ? 1.4 : quality === 'draft' ? 0.7 : 1.0;
  const estSeconds = Math.round(duration * baseRate * qualityMultiplier * variationsCount);
  return Math.max(6, Math.min(240, estSeconds));
}

export function getDefaultNegativePrompt(): string {
  return 'Flickering, warped objects, distorted faces, unnatural motion, sudden camera jumps, excessive blur, inconsistent lighting, unwanted object deformation, jittery artifacts, morphing hands.';
}

export const CAMERA_PRESET_METADATA: Record<
  CameraPreset,
  { label: string; icon: string; description: string }
> = {
  static: {
    label: 'Static Camera',
    icon: 'camera',
    description: 'Stationary tripod framing; only in-scene elements animate.',
  },
  slow_zoom_in: {
    label: 'Slow Zoom In',
    icon: 'zoom-in',
    description: 'Smooth optical push towards the central subject.',
  },
  slow_zoom_out: {
    label: 'Slow Zoom Out',
    icon: 'zoom-out',
    description: 'Gradual pull-back revealing surrounding landscape and context.',
  },
  pan_left: {
    label: 'Pan Left',
    icon: 'arrow-left',
    description: 'Horizontal camera rotation sweeping across to the left.',
  },
  pan_right: {
    label: 'Pan Right',
    icon: 'arrow-right',
    description: 'Horizontal camera rotation sweeping across to the right.',
  },
  tilt_up: {
    label: 'Tilt Up',
    icon: 'arrow-up',
    description: 'Vertical camera pivot tilting upward from base to sky/head.',
  },
  tilt_down: {
    label: 'Tilt Down',
    icon: 'arrow-down',
    description: 'Vertical camera pivot tilting downward to anchor foreground.',
  },
  dolly_in: {
    label: 'Dolly In',
    icon: 'move',
    description: 'Physical camera movement moving smoothly forward into scene.',
  },
  dolly_out: {
    label: 'Dolly Out',
    icon: 'minimize',
    description: 'Physical camera movement tracking backward from scene.',
  },
  orbit: {
    label: 'Orbit',
    icon: 'rotate-cw',
    description: 'Curved circular camera trajectory circling around focal point.',
  },
  cinematic_tracking: {
    label: 'Cinematic Tracking',
    icon: 'navigation',
    description: 'Dynamic Steadicam tracking alongside subject with depth parallax.',
  },
  handheld_cinematic: {
    label: 'Handheld Cinematic',
    icon: 'activity',
    description: 'Subtle human operator micro-drift and natural filmic breathing.',
  },
};

export interface TransformState {
  scale: number;
  translateX: number; // percentage
  translateY: number; // percentage
  rotate: number; // degrees
  blur: number; // px
}

export function calculateCameraTransform(
  preset: CameraPreset,
  progress: number, // 0.0 to 1.0
  intensity: number = 40 // 0 to 100
): TransformState {
  const normIntensity = intensity / 100;
  const p = Math.max(0, Math.min(1, progress));
  // Smooth sine ease in-out
  const eased = 0.5 - Math.cos(p * Math.PI) / 2;

  switch (preset) {
    case 'static':
      return {
        scale: 1.0,
        translateX: 0,
        translateY: 0,
        rotate: 0,
        blur: 0,
      };

    case 'slow_zoom_in':
      return {
        scale: 1.0 + eased * 0.25 * normIntensity,
        translateX: 0,
        translateY: 0,
        rotate: 0,
        blur: 0,
      };

    case 'slow_zoom_out':
      return {
        scale: 1.25 - eased * 0.25 * normIntensity,
        translateX: 0,
        translateY: 0,
        rotate: 0,
        blur: 0,
      };

    case 'pan_left':
      return {
        scale: 1.1,
        translateX: -eased * 14 * normIntensity,
        translateY: 0,
        rotate: 0,
        blur: 0,
      };

    case 'pan_right':
      return {
        scale: 1.1,
        translateX: eased * 14 * normIntensity,
        translateY: 0,
        rotate: 0,
        blur: 0,
      };

    case 'tilt_up':
      return {
        scale: 1.1,
        translateX: 0,
        translateY: -eased * 12 * normIntensity,
        rotate: 0,
        blur: 0,
      };

    case 'tilt_down':
      return {
        scale: 1.1,
        translateX: 0,
        translateY: eased * 12 * normIntensity,
        rotate: 0,
        blur: 0,
      };

    case 'dolly_in':
      return {
        scale: 1.0 + eased * 0.35 * normIntensity,
        translateX: Math.sin(p * Math.PI) * 1.5 * normIntensity,
        translateY: -eased * 4 * normIntensity,
        rotate: 0,
        blur: 0,
      };

    case 'dolly_out':
      return {
        scale: 1.35 - eased * 0.35 * normIntensity,
        translateX: -Math.sin(p * Math.PI) * 1.5 * normIntensity,
        translateY: eased * 4 * normIntensity,
        rotate: 0,
        blur: 0,
      };

    case 'orbit':
      return {
        scale: 1.12 + Math.sin(p * Math.PI) * 0.08 * normIntensity,
        translateX: Math.sin(p * Math.PI * 2) * 8 * normIntensity,
        translateY: Math.cos(p * Math.PI * 2) * 3 * normIntensity,
        rotate: Math.sin(p * Math.PI * 2) * 2 * normIntensity,
        blur: 0,
      };

    case 'cinematic_tracking':
      return {
        scale: 1.15 + eased * 0.1 * normIntensity,
        translateX: (eased - 0.5) * 16 * normIntensity,
        translateY: Math.sin(p * Math.PI * 2) * 2.5 * normIntensity,
        rotate: (eased - 0.5) * 1.5 * normIntensity,
        blur: 0,
      };

    case 'handheld_cinematic': {
      // Natural organic breathing and micro-shake
      const shakeX = (Math.sin(p * 14) + Math.cos(p * 23) * 0.5) * 2.5 * normIntensity;
      const shakeY = (Math.cos(p * 18) + Math.sin(p * 29) * 0.5) * 2.0 * normIntensity;
      const tilt = Math.sin(p * 11) * 1.2 * normIntensity;
      return {
        scale: 1.08 + Math.sin(p * 8) * 0.03 * normIntensity,
        translateX: shakeX,
        translateY: shakeY,
        rotate: tilt,
        blur: 0,
      };
    }
  }
}
