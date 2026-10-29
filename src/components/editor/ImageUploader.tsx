import React, { useRef, useState } from 'react';
import {
  Upload,
  Image as ImageIcon,
  Sparkles,
  Trash2,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Maximize2,
  Eye,
  Camera,
} from 'lucide-react';
import { CameraPreset, ImageAnalysisResult } from '../../types';
import { analyzeImageWithGemini } from '../../services/api';

interface ImageUploaderProps {
  imageUrl: string | null;
  imageFileName?: string;
  imageDimensions?: { width: number; height: number };
  onImageSelected: (
    url: string,
    fileName: string,
    dimensions: { width: number; height: number }
  ) => void;
  onClearImage: () => void;
  onAnalysisComplete?: (analysis: ImageAnalysisResult) => void;
  analysis?: ImageAnalysisResult;
}

const SAMPLE_FRAMES = [
  {
    name: 'Alpine Peak',
    url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80',
    dimensions: { width: 1200, height: 800 },
  },
  {
    name: 'Cyberpunk Girl',
    url: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=1200&q=80',
    dimensions: { width: 1200, height: 800 },
  },
  {
    name: 'Studio Portrait',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1200&q=80',
    dimensions: { width: 1200, height: 1600 },
  },
  {
    name: 'Pacific Surf',
    url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
    dimensions: { width: 1200, height: 800 },
  },
];

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  imageUrl,
  imageFileName,
  imageDimensions,
  onImageSelected,
  onClearImage,
  onAnalysisComplete,
  analysis,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showAnalysisDetails, setShowAnalysisDetails] = useState(true);

  const handleFileProcess = (file: File) => {
    setUploadError(null);

    // Validate type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setUploadError('Unsupported format. Please upload a JPEG, PNG, or WebP image.');
      return;
    }

    // Validate size (max 25MB)
    const maxSize = 25 * 1024 * 1024;
    if (file.size > maxSize) {
      setUploadError('File exceeds 25MB limit. Please upload a smaller image file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      const img = new Image();
      img.onload = () => {
        onImageSelected(dataUrl, file.name, {
          width: img.naturalWidth,
          height: img.naturalHeight,
        });
      };
      img.src = dataUrl;
    };
    reader.onerror = () => {
      setUploadError('Failed to read image file. Please try again.');
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileProcess(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleTriggerAnalysis = async () => {
    if (!imageUrl || isAnalyzing) return;
    setIsAnalyzing(true);
    setUploadError(null);

    try {
      const result = await analyzeImageWithGemini(imageUrl);
      onAnalysisComplete?.(result);
      setShowAnalysisDetails(true);
    } catch (err: any) {
      setUploadError(err.message || 'Image analysis failed. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-[#8B5CF6]" />
            Source Image
          </h3>
          <p className="text-xs text-zinc-400">
            Upload a still photo to transform into continuous cinematic video
          </p>
        </div>

        {imageUrl && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleTriggerAnalysis}
              disabled={isAnalyzing}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-lg bg-[#8B5CF6]/15 hover:bg-[#8B5CF6]/25 border border-[#8B5CF6]/30 text-[#8B5CF6] font-medium transition-colors cursor-pointer disabled:opacity-50"
              title="Analyze visual depth and motion opportunities using Gemini Vision"
            >
              <Sparkles
                className={`w-3.5 h-3.5 ${isAnalyzing ? 'animate-spin' : ''}`}
              />
              <span>{isAnalyzing ? 'Analyzing...' : 'Gemini Scene Analysis'}</span>
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-1.5 rounded-lg bg-[#141417] hover:bg-[#1B1B20] border border-[#292930] text-zinc-300 hover:text-white transition-colors"
              title="Replace image"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={onClearImage}
              className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 transition-colors"
              title="Remove image"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            handleFileProcess(e.target.files[0]);
          }
        }}
      />

      {/* Upload Zone / Preview */}
      {!imageUrl ? (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center gap-3 transition-all cursor-pointer text-center relative overflow-hidden group ${
            isDragging
              ? 'border-[#8B5CF6] bg-[#8B5CF6]/10 scale-[1.01]'
              : 'border-[#292930] bg-[#141417]/60 hover:border-[#8B5CF6]/40 hover:bg-[#141417]'
          }`}
        >
          <div className="w-14 h-14 rounded-2xl bg-[#1B1B20] border border-[#292930] flex items-center justify-center text-[#8B5CF6] group-hover:scale-110 group-hover:border-[#8B5CF6]/50 transition-all shadow-inner">
            <Upload className="w-6 h-6 group-hover:text-[#22D3EE] transition-colors" />
          </div>

          <div>
            <p className="text-sm font-medium text-white">
              Drop your image here, or{' '}
              <span className="text-[#8B5CF6] underline underline-offset-2">browse</span>
            </p>
            <p className="text-xs text-zinc-500 mt-1">
              Supports JPEG, PNG, and WebP (up to 25MB)
            </p>
          </div>

          {/* Preset quick-picks */}
          <div
            className="mt-3 pt-3 border-t border-[#292930]/80 w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-[11px] font-semibold text-zinc-400 mb-2 uppercase tracking-wider">
              Or pick an instant cinematic sample frame:
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {SAMPLE_FRAMES.map((sample) => (
                <button
                  key={sample.name}
                  onClick={() =>
                    onImageSelected(sample.url, `${sample.name}.jpg`, sample.dimensions)
                  }
                  className="flex items-center gap-2 p-1.5 rounded-lg bg-[#1B1B20] hover:bg-[#23232a] border border-[#292930] hover:border-[#8B5CF6]/50 transition-all group/btn text-left cursor-pointer"
                >
                  <img
                    src={sample.url}
                    alt={sample.name}
                    className="w-8 h-8 rounded-md object-cover"
                  />
                  <div className="overflow-hidden">
                    <p className="text-xs font-medium text-zinc-300 group-hover/btn:text-white truncate">
                      {sample.name}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="relative rounded-2xl overflow-hidden bg-[#141417] border border-[#292930] group">
            <div className="aspect-video w-full max-h-[380px] bg-black/40 flex items-center justify-center overflow-hidden">
              <img
                src={imageUrl}
                alt="Uploaded source"
                className="w-full h-full object-contain"
              />
            </div>

            {/* Floating badge info */}
            <div className="absolute bottom-3 left-3 flex items-center gap-2">
              {imageDimensions && (
                <span className="px-2.5 py-1 rounded-md bg-black/75 backdrop-blur-md text-[11px] font-mono text-zinc-300 border border-white/10">
                  {imageDimensions.width} × {imageDimensions.height} px
                </span>
              )}
              {imageFileName && (
                <span className="px-2.5 py-1 rounded-md bg-black/75 backdrop-blur-md text-[11px] text-zinc-300 border border-white/10 max-w-[200px] truncate">
                  {imageFileName}
                </span>
              )}
            </div>
          </div>

          {/* Gemini AI Scene Analysis Panel */}
          {analysis && showAnalysisDetails && (
            <div className="rounded-xl bg-gradient-to-r from-[#8B5CF6]/10 via-[#1B1B20] to-[#22D3EE]/10 border border-[#8B5CF6]/30 p-3.5 space-y-2.5 text-xs animate-in fade-in">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-semibold text-white">
                  <Sparkles className="w-4 h-4 text-[#8B5CF6]" />
                  <span>Gemini Vision Scene Intelligence</span>
                </div>
                <button
                  onClick={() => setShowAnalysisDetails(!showAnalysisDetails)}
                  className="text-zinc-400 hover:text-white text-[11px]"
                >
                  Hide
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-zinc-300">
                <div>
                  <span className="text-zinc-500">Subject:</span>{' '}
                  <strong className="text-zinc-200">{analysis.subject}</strong>
                </div>
                <div>
                  <span className="text-zinc-500">Lighting:</span>{' '}
                  <span className="text-zinc-300">{analysis.lighting}</span>
                </div>
                <div>
                  <span className="text-zinc-500">Recommended Move:</span>{' '}
                  <span className="text-[#8B5CF6] font-medium uppercase tracking-wide">
                    {analysis.recommendedCameraPreset.replace(/_/g, ' ')}
                  </span>
                </div>
                <div>
                  <span className="text-zinc-500">Suggested Intensity:</span>{' '}
                  <span className="text-[#22D3EE] font-medium">
                    {analysis.recommendedIntensity}%
                  </span>
                </div>
              </div>

              {analysis.motionOpportunities?.length > 0 && (
                <div className="pt-2 border-t border-[#292930]/80">
                  <span className="text-zinc-500 block mb-1">
                    Detected Animation Vectors:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {analysis.motionOpportunities.map((opp, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-full bg-[#1B1B20] text-zinc-300 border border-[#292930] text-[11px]"
                      >
                        • {opp}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Error display */}
      {uploadError && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{uploadError}</span>
        </div>
      )}
    </div>
  );
};
