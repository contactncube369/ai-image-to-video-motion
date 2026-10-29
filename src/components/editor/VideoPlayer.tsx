import React, { useRef, useState, useEffect } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Maximize2,
  Download,
  Copy,
  Trash2,
  Sparkles,
  Layers,
  Columns,
  Split,
  Eye,
  Check,
} from 'lucide-react';
import { VideoVariation } from '../../types';

interface VideoPlayerProps {
  originalImageUrl: string;
  variations: VideoVariation[];
  selectedIndex: number;
  onSelectVariation: (idx: number) => void;
  onRegenerate: () => void;
  onDuplicate: () => void;
  onSave: () => void;
  onDelete: () => void;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  originalImageUrl,
  variations,
  selectedIndex,
  onSelectVariation,
  onRegenerate,
  onDuplicate,
  onSave,
  onDelete,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const [isLooping, setIsLooping] = useState(true);
  const [viewMode, setViewMode] = useState<'video' | 'split' | 'side-by-side'>('video');
  const [splitPosition, setSplitPosition] = useState(50); // percentage
  const [isDraggingSplit, setIsDraggingSplit] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const activeVariation = variations[selectedIndex] || variations[0];

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => setCurrentTime(video.currentTime);
    const handleLoadedMetadata = () => {
      setDuration(video.duration || 5);
      video.play().catch(() => {});
      setIsPlaying(true);
    };
    const handleEnded = () => {
      if (!isLooping) setIsPlaying(false);
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('ended', handleEnded);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('ended', handleEnded);
    };
  }, [activeVariation?.url, isLooping]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (isPlaying) {
      video.pause();
      setIsPlaying(false);
    } else {
      video.play();
      setIsPlaying(true);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      containerRef.current.requestFullscreen().catch(() => {});
    }
  };

  const handleDownload = () => {
    if (!activeVariation?.url) return;
    const a = document.createElement('a');
    a.href = activeVariation.url;
    a.download = `motionai-clip-${Date.now()}.mp4`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleSplitMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDraggingSplit) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percent = Math.max(5, Math.min(95, (x / rect.width) * 100));
    setSplitPosition(percent);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSaveClick = () => {
    onSave();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div className="space-y-4 rounded-2xl bg-[#141417] border border-[#292930] p-5">
      {/* Top Header & View Modes */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
          <h3 className="text-sm font-semibold text-white">Cinematic Video Preview</h3>
          {activeVariation && (
            <span className="text-xs font-mono text-zinc-400 bg-[#1B1B20] px-2 py-0.5 rounded-md border border-[#292930]">
              {activeVariation.width} × {activeVariation.height} • {activeVariation.duration}s
            </span>
          )}
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-[#1B1B20] border border-[#292930] text-xs">
          <button
            onClick={() => setViewMode('video')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
              viewMode === 'video'
                ? 'bg-[#8B5CF6] text-white font-medium shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Video Only</span>
          </button>

          <button
            onClick={() => setViewMode('split')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
              viewMode === 'split'
                ? 'bg-[#8B5CF6] text-white font-medium shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Split className="w-3.5 h-3.5" />
            <span>Split Wipe</span>
          </button>

          <button
            onClick={() => setViewMode('side-by-side')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
              viewMode === 'side-by-side'
                ? 'bg-[#8B5CF6] text-white font-medium shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Columns className="w-3.5 h-3.5" />
            <span>Side-by-Side</span>
          </button>
        </div>
      </div>

      {/* Variation Tabs if multiple */}
      {variations.length > 1 && (
        <div className="flex items-center gap-2">
          <span className="text-xs text-zinc-400">Variations:</span>
          <div className="flex gap-1.5">
            {variations.map((v, i) => (
              <button
                key={v.id}
                onClick={() => onSelectVariation(i)}
                className={`px-3 py-1 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                  selectedIndex === i
                    ? 'border-[#8B5CF6] bg-[#8B5CF6]/20 text-white'
                    : 'border-[#292930] bg-[#1B1B20] text-zinc-400 hover:text-white'
                }`}
              >
                Variation {i + 1}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main View Area */}
      <div
        ref={containerRef}
        className="relative rounded-2xl overflow-hidden bg-black border border-[#292930] flex items-center justify-center min-h-[380px] max-h-[560px] select-none"
      >
        {/* Mode: Video Only */}
        {viewMode === 'video' && (
          <video
            ref={videoRef}
            src={activeVariation?.url}
            loop={isLooping}
            muted={isMuted}
            playsInline
            onClick={togglePlay}
            className="w-full h-full object-contain cursor-pointer max-h-[520px]"
          />
        )}

        {/* Mode: Split Screen Wipe */}
        {viewMode === 'split' && (
          <div
            className="relative w-full h-full flex items-center justify-center max-h-[520px] cursor-col-resize overflow-hidden"
            onMouseMove={handleSplitMouseMove}
            onMouseDown={() => setIsDraggingSplit(true)}
            onMouseUp={() => setIsDraggingSplit(false)}
            onMouseLeave={() => setIsDraggingSplit(false)}
          >
            {/* Background: Video */}
            <video
              ref={videoRef}
              src={activeVariation?.url}
              loop={isLooping}
              muted={isMuted}
              playsInline
              className="w-full h-full object-cover pointer-events-none max-h-[520px]"
            />

            {/* Foreground: Image clipped to splitPosition */}
            <div
              className="absolute inset-0 overflow-hidden pointer-events-none"
              style={{ width: `${splitPosition}%` }}
            >
              <img
                src={originalImageUrl}
                alt="Original"
                className="w-full h-full object-cover max-h-[520px]"
                style={{ width: containerRef.current?.clientWidth || '100%' }}
              />
            </div>

            {/* Divider Line */}
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-[#22D3EE] shadow-lg pointer-events-none flex items-center justify-center"
              style={{ left: `${splitPosition}%` }}
            >
              <div className="w-6 h-6 rounded-full bg-[#141417] border border-[#22D3EE] text-[#22D3EE] flex items-center justify-center text-[10px] shadow-md">
                ⇄
              </div>
            </div>

            {/* Labels */}
            <div className="absolute top-3 left-3 px-2 py-0.5 rounded bg-black/70 backdrop-blur-md text-[10px] uppercase font-semibold tracking-wider text-zinc-300 border border-white/10 pointer-events-none">
              Original Still
            </div>
            <div className="absolute top-3 right-3 px-2 py-0.5 rounded bg-[#8B5CF6]/80 backdrop-blur-md text-[10px] uppercase font-semibold tracking-wider text-white border border-white/10 pointer-events-none">
              MotionAI Video
            </div>
          </div>
        )}

        {/* Mode: Side-by-Side */}
        {viewMode === 'side-by-side' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-1 w-full h-full max-h-[520px]">
            <div className="relative flex items-center justify-center bg-[#0e0e11] p-2 border-r border-[#292930]">
              <span className="absolute top-3 left-3 px-2 py-0.5 rounded bg-black/70 backdrop-blur-md text-[10px] uppercase font-semibold tracking-wider text-zinc-300 border border-white/10 z-10">
                Original Frame
              </span>
              <img
                src={originalImageUrl}
                alt="Original"
                className="w-full h-full object-contain max-h-[480px]"
              />
            </div>

            <div className="relative flex items-center justify-center bg-black p-2">
              <span className="absolute top-3 left-3 px-2 py-0.5 rounded bg-[#8B5CF6]/80 backdrop-blur-md text-[10px] uppercase font-semibold tracking-wider text-white border border-white/10 z-10">
                Generated Motion
              </span>
              <video
                ref={videoRef}
                src={activeVariation?.url}
                loop={isLooping}
                muted={isMuted}
                playsInline
                onClick={togglePlay}
                className="w-full h-full object-contain cursor-pointer max-h-[480px]"
              />
            </div>
          </div>
        )}

        {/* Floating Play/Pause overlay button when paused */}
        {!isPlaying && (
          <button
            onClick={togglePlay}
            className="absolute w-16 h-16 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white flex items-center justify-center hover:scale-110 hover:bg-[#8B5CF6]/80 transition-all cursor-pointer shadow-2xl z-20"
            aria-label="Play Video"
          >
            <Play className="w-7 h-7 ml-1 fill-white" />
          </button>
        )}
      </div>

      {/* Playback Controls & Timeline Bar */}
      <div className="p-3.5 rounded-xl bg-[#1B1B20] border border-[#292930] space-y-3">
        {/* Scrubber slider */}
        <div className="space-y-1">
          <input
            type="range"
            min="0"
            max={duration || 5}
            step="0.05"
            value={currentTime}
            onChange={handleSeek}
            className="w-full accent-[#8B5CF6] h-1.5 bg-[#292930] rounded-lg cursor-pointer"
          />
        </div>

        {/* Action Row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={togglePlay}
              className="p-2 rounded-lg bg-[#292930] hover:bg-[#8B5CF6] text-white transition-colors cursor-pointer"
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white" />}
            </button>

            <button
              onClick={() => {
                if (videoRef.current) {
                  videoRef.current.currentTime = 0;
                  videoRef.current.play();
                  setIsPlaying(true);
                }
              }}
              className="p-2 rounded-lg hover:bg-[#292930] text-zinc-400 hover:text-white transition-colors cursor-pointer"
              title="Restart"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              onClick={toggleMute}
              className="p-2 rounded-lg hover:bg-[#292930] text-zinc-400 hover:text-white transition-colors cursor-pointer"
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>

            {/* Timecode display */}
            <span className="font-mono text-xs text-zinc-300">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsLooping(!isLooping)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                isLooping
                  ? 'border-[#22D3EE]/40 bg-[#22D3EE]/10 text-[#22D3EE]'
                  : 'border-[#292930] text-zinc-500'
              }`}
              title="Toggle loop"
            >
              Loop
            </button>

            <button
              onClick={toggleFullscreen}
              className="p-2 rounded-lg hover:bg-[#292930] text-zinc-400 hover:text-white transition-colors cursor-pointer"
              title="Fullscreen"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Export & Project Actions Footer */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-2">
          {/* Download button */}
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#22D3EE] to-[#06B6D4] hover:brightness-110 text-zinc-950 font-semibold text-xs shadow-lg shadow-[#22D3EE]/20 transition-all active:scale-95 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Download MP4 Video</span>
          </button>

          {/* Regenerate button */}
          <button
            onClick={onRegenerate}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-[#1B1B20] hover:bg-[#23232a] border border-[#292930] hover:border-[#8B5CF6]/50 text-white font-medium text-xs transition-colors cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-[#8B5CF6]" />
            <span>Regenerate Variation</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          {/* Save to projects */}
          <button
            onClick={handleSaveClick}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#1B1B20] hover:bg-[#23232a] border border-[#292930] text-zinc-300 hover:text-white text-xs transition-colors cursor-pointer"
          >
            {isSaved ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Project Saved</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Save Project</span>
              </>
            )}
          </button>

          {/* Duplicate project */}
          <button
            onClick={onDuplicate}
            className="px-3 py-2 rounded-lg bg-[#1B1B20] hover:bg-[#23232a] border border-[#292930] text-zinc-400 hover:text-white text-xs transition-colors cursor-pointer"
          >
            Duplicate
          </button>

          {/* Delete Project */}
          <button
            onClick={onDelete}
            className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 transition-colors cursor-pointer"
            title="Delete Project"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
