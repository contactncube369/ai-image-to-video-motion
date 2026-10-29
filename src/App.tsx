import React, { useState, useEffect } from 'react';
import {
  Film,
  Sparkles,
  Play,
  RotateCcw,
  Video,
  Download,
  FolderKanban,
  AlertCircle,
  CheckCircle2,
  Sliders,
  Camera,
  Layers,
} from 'lucide-react';

import {
  CameraPreset,
  ImageAnalysisResult,
  MotionSettings,
  Project,
  TemplateItem,
  UserProfile,
  VideoSettings as IVideoSettings,
  VideoVariation,
} from './types';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { ImageUploader } from './components/editor/ImageUploader';
import { MotionControls } from './components/editor/MotionControls';
import { PromptEditor } from './components/editor/PromptEditor';
import { VideoSettings } from './components/editor/VideoSettings';
import { VideoPlayer } from './components/editor/VideoPlayer';
import { GenerationProgress } from './components/editor/GenerationProgress';
import { ProjectsView } from './components/projects/ProjectsView';
import { HistoryView } from './components/history/HistoryView';
import { TemplatesView } from './components/templates/TemplatesView';
import { PricingView } from './components/pricing/PricingView';
import { SettingsView } from './components/settings/SettingsView';
import { LandingView } from './components/landing/LandingView';
import { ConfirmationModal } from './components/common/ConfirmationModal';
import { NotificationToast, ToastMessage } from './components/common/NotificationToast';
import { AuthModal } from './components/auth/AuthModal';
import { synthesizeVideoFromImage } from './services/videoSynthesizer';
import { checkServerHealth, createGenerationJob } from './services/api';
import { getDefaultNegativePrompt } from './utils/motionMath';

const DEFAULT_MOTION_SETTINGS: MotionSettings = {
  cameraPreset: 'slow_zoom_in',
  intensity: 35,
  animationSpeed: 1.0,
  motionSmoothness: 85,
  cameraMovementStrength: 45,
  subjectMovementStrength: 30,
  backgroundMovementStrength: 60,
  depthParallax: true,
  loopAnimation: false,
  preserveSubject: true,
  preserveComposition: true,
};

const DEFAULT_VIDEO_SETTINGS: IVideoSettings = {
  duration: 5,
  aspectRatio: '16:9',
  resolution: '720p',
  frameRate: 30,
  quality: 'standard',
  variationsCount: 1,
};

const INITIAL_USER: UserProfile = {
  id: 'usr-1',
  name: 'Alex Rivera',
  email: 'alex.rivera@cinema.ai',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
  role: 'user',
  isAdmin: false,
  isInfiniteCredits: false,
  hasUltra4k: false,
  plan: 'Creator Pro',
  creditsRemaining: 48,
  totalCredits: 200,
};

// Seed initial projects
const INITIAL_PROJECTS: Project[] = [
  {
    id: 'proj-alpine',
    name: 'Alpine Sunrise Drift',
    imageUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80',
    imageFileName: 'alpine-summit.jpg',
    imageDimensions: { width: 1200, height: 800 },
    motionSettings: { ...DEFAULT_MOTION_SETTINGS, cameraPreset: 'slow_zoom_in', intensity: 35 },
    videoSettings: { ...DEFAULT_VIDEO_SETTINGS, duration: 5, aspectRatio: '16:9' },
    prompt: 'Slow optical push into jagged mountain peaks with rolling low-altitude clouds and morning rays.',
    negativePrompt: getDefaultNegativePrompt(),
    variations: [],
    selectedVariationIndex: 0,
    status: 'draft',
    isFavorite: true,
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: 'proj-cyber',
    name: 'Cyberpunk Rain Street',
    imageUrl: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=1200&q=80',
    imageFileName: 'neo-tokyo.jpg',
    imageDimensions: { width: 1200, height: 800 },
    motionSettings: { ...DEFAULT_MOTION_SETTINGS, cameraPreset: 'cinematic_tracking', intensity: 50 },
    videoSettings: { ...DEFAULT_VIDEO_SETTINGS, duration: 5, aspectRatio: '16:9' },
    prompt: 'Cinematic tracking pass through a neon-lit cyberpunk metropolis with puddle reflections.',
    negativePrompt: getDefaultNegativePrompt(),
    variations: [],
    selectedVariationIndex: 0,
    status: 'draft',
    isFavorite: false,
    createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 6).toISOString(),
  },
];

export default function App() {
  // Navigation & View state
  const [currentView, setCurrentView] = useState<string>(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('autostart') === '1') {
      return 'editor';
    }
    return 'editor'; // Open directly into creative workspace
  });
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // User & projects state
  const [user, setUser] = useState<UserProfile>(() => {
    try {
      const savedUser = localStorage.getItem('motionai_user');
      if (savedUser) return JSON.parse(savedUser);
    } catch (e) {}
    return INITIAL_USER;
  });
  const [projects, setProjects] = useState<Project[]>(() => {
    try {
      const saved = localStorage.getItem('motionai_projects');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return INITIAL_PROJECTS;
  });

  // Current active project in editor
  const [activeProject, setActiveProject] = useState<Project>(projects[0]);

  // Generation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generationStage, setGenerationStage] = useState('');
  const [estSecondsRemaining, setEstSecondsRemaining] = useState(0);
  const [cancelGenerationRef, setCancelGenerationRef] = useState<boolean>(false);

  // Gemini health status
  const [geminiConnected, setGeminiConnected] = useState(true);

  // Modal & Toast states
  const [deleteModalState, setDeleteModalState] = useState<{
    isOpen: boolean;
    projectId: string | null;
  }>({ isOpen: false, projectId: null });
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Check backend Gemini health on mount
  useEffect(() => {
    checkServerHealth().then((health) => {
      setGeminiConnected(health.geminiConfigured);
    });
  }, []);

  // Save projects to localStorage on update
  useEffect(() => {
    try {
      localStorage.setItem('motionai_projects', JSON.stringify(projects));
    } catch (e) {}
  }, [projects]);

  const addToast = (type: 'success' | 'error' | 'info', title: string, description?: string) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    setToasts((prev) => [...prev, { id, type, title, description }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const handleCreateNewProject = () => {
    const newProj: Project = {
      id: `proj-${Date.now()}`,
      name: `Cinematic Project #${projects.length + 1}`,
      imageUrl: '',
      motionSettings: { ...DEFAULT_MOTION_SETTINGS },
      videoSettings: { ...DEFAULT_VIDEO_SETTINGS },
      prompt: '',
      negativePrompt: getDefaultNegativePrompt(),
      variations: [],
      selectedVariationIndex: 0,
      status: 'draft',
      isFavorite: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setProjects((prev) => [newProj, ...prev]);
    setActiveProject(newProj);
    setCurrentView('editor');
    addToast('info', 'New Project Created', 'Upload an image to start animating');
  };

  const handleOpenProject = (proj: Project) => {
    setActiveProject(proj);
    setCurrentView('editor');
  };

  const handleToggleFavorite = (projectId: string) => {
    setProjects((prev) =>
      prev.map((p) => (p.id === projectId ? { ...p, isFavorite: !p.isFavorite } : p))
    );
    if (activeProject.id === projectId) {
      setActiveProject((prev) => ({ ...prev, isFavorite: !prev.isFavorite }));
    }
  };

  const handleDeleteProject = (projectId: string) => {
    setDeleteModalState({ isOpen: true, projectId });
  };

  const confirmDeleteProject = () => {
    if (!deleteModalState.projectId) return;
    const pid = deleteModalState.projectId;
    setProjects((prev) => prev.filter((p) => p.id !== pid));

    if (activeProject.id === pid) {
      const remaining = projects.filter((p) => p.id !== pid);
      if (remaining.length > 0) {
        setActiveProject(remaining[0]);
      } else {
        handleCreateNewProject();
      }
    }

    setDeleteModalState({ isOpen: false, projectId: null });
    addToast('success', 'Project Deleted', 'Project removed from your studio');
  };

  const handleDuplicateProject = (proj: Project) => {
    const dup: Project = {
      ...proj,
      id: `proj-${Date.now()}`,
      name: `${proj.name} (Copy)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setProjects((prev) => [dup, ...prev]);
    setActiveProject(dup);
    addToast('success', 'Project Duplicated', 'Duplicated project opened in editor');
  };

  const handleUseTemplate = (template: TemplateItem) => {
    const templatedProject: Project = {
      id: `proj-${Date.now()}`,
      name: template.title,
      imageUrl: template.thumbnailUrl,
      imageFileName: `${template.title.toLowerCase().replace(/\s+/g, '-')}.jpg`,
      imageDimensions: { width: 1200, height: 800 },
      motionSettings: { ...template.motionSettings },
      videoSettings: { ...template.videoSettings },
      prompt: template.prompt,
      negativePrompt: template.negativePrompt,
      variations: [],
      selectedVariationIndex: 0,
      status: 'draft',
      isFavorite: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setProjects((prev) => [templatedProject, ...prev]);
    setActiveProject(templatedProject);
    setCurrentView('editor');
    addToast('success', 'Template Applied', `Loaded "${template.title}" with cinematic settings`);
  };

  // Trigger Video Synthesis Pipeline
  const handleStartGeneration = async () => {
    if (!activeProject.imageUrl) {
      addToast('error', 'Image Required', 'Please upload an image before generating video');
      return;
    }

    if (!user.isInfiniteCredits && !user.isAdmin && user.creditsRemaining <= 0) {
      addToast('error', 'Insufficient Credits', 'Please upgrade your plan to generate more clips');
      setCurrentView('pricing');
      return;
    }

    setIsGenerating(true);
    setGenerationProgress(5);
    setGenerationStage('Initializing neural video pipeline...');
    setCancelGenerationRef(false);

    try {
      // Create backend job record
      createGenerationJob(activeProject.id).catch(() => {});

      const variationsToGenerate = activeProject.videoSettings.variationsCount || 1;
      const generatedVariations: VideoVariation[] = [];

      for (let i = 0; i < variationsToGenerate; i++) {
        setGenerationStage(
          variationsToGenerate > 1
            ? `Synthesizing variation ${i + 1} of ${variationsToGenerate}...`
            : 'Analyzing motion vectors and spatial camera trajectory...'
        );

        const variation = await synthesizeVideoFromImage(
          activeProject.imageUrl,
          activeProject.motionSettings,
          activeProject.videoSettings,
          (prog, stg) => {
            const overallProgress =
              (i / variationsToGenerate) * 100 + (prog / variationsToGenerate);
            setGenerationProgress(overallProgress);
            setGenerationStage(stg);
            const remainingSec = Math.max(
              1,
              Math.round(
                (activeProject.videoSettings.duration * 2 * (100 - overallProgress)) / 100
              )
            );
            setEstSecondsRemaining(remainingSec);
          },
          Date.now() + i * 100
        );

        generatedVariations.push(variation);
      }

      // Update project with generated video
      const updatedProject: Project = {
        ...activeProject,
        variations: generatedVariations,
        selectedVariationIndex: 0,
        status: 'completed',
        updatedAt: new Date().toISOString(),
      };

      setActiveProject(updatedProject);
      setProjects((prev) =>
        prev.map((p) => (p.id === activeProject.id ? updatedProject : p))
      );

      // Deduct credit only for normal users
      if (!user.isInfiniteCredits && !user.isAdmin) {
        setUser((prev) => ({
          ...prev,
          creditsRemaining: Math.max(0, prev.creditsRemaining - variationsToGenerate),
        }));
      }

      addToast(
        'success',
        'Video Generated Successfully',
        `Rendered ${variationsToGenerate} cinematic variation${variationsToGenerate > 1 ? 's' : ''}`
      );
    } catch (err: any) {
      console.error('Generation error:', err);
      addToast('error', 'Generation Failed', err.message || 'Video synthesis encountered an issue');
    } finally {
      setIsGenerating(false);
      setGenerationProgress(0);
    }
  };

  const handleCancelJob = () => {
    setIsGenerating(false);
    setGenerationProgress(0);
    addToast('info', 'Generation Cancelled', 'Video synthesis was stopped');
  };

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-[#F5F5F7] flex flex-col font-sans selection:bg-[#8B5CF6]/30">
      {/* Top Navigation */}
      <Navbar
        user={user}
        currentView={currentView}
        onNavigate={(view) => {
          setCurrentView(view);
          setMobileSidebarOpen(false);
        }}
        geminiConnected={geminiConnected}
        onToggleMobileMenu={() => setMobileSidebarOpen(!mobileSidebarOpen)}
        onOpenAuth={() => setIsAuthModalOpen(true)}
      />

      {/* Main Body Shell */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <Sidebar
          currentView={currentView}
          onNavigate={(view) => {
            setCurrentView(view);
            setMobileSidebarOpen(false);
          }}
          onNewProject={() => {
            handleCreateNewProject();
            setMobileSidebarOpen(false);
          }}
          projectsCount={projects.length}
          favoritesCount={projects.filter((p) => p.isFavorite).length}
          user={user}
          isOpenMobile={mobileSidebarOpen}
          onCloseMobile={() => setMobileSidebarOpen(false)}
          onOpenAuth={() => setIsAuthModalOpen(true)}
        />

        {/* Center Content Workspace */}
        <main className="flex-1 overflow-y-auto px-4 py-6 lg:px-8">
          {/* VIEW: Landing Page */}
          {currentView === 'landing' && (
            <LandingView
              onStartCreating={() => setCurrentView('editor')}
              onExploreTemplates={() => setCurrentView('templates')}
            />
          )}

          {/* VIEW: Projects */}
          {currentView === 'projects' && (
            <ProjectsView
              projects={projects}
              onOpenProject={handleOpenProject}
              onNewProject={handleCreateNewProject}
              onToggleFavorite={handleToggleFavorite}
              onDeleteProject={handleDeleteProject}
              onDuplicateProject={handleDuplicateProject}
              favoritesOnly={false}
            />
          )}

          {/* VIEW: Favorites */}
          {currentView === 'favorites' && (
            <ProjectsView
              projects={projects}
              onOpenProject={handleOpenProject}
              onNewProject={handleCreateNewProject}
              onToggleFavorite={handleToggleFavorite}
              onDeleteProject={handleDeleteProject}
              onDuplicateProject={handleDuplicateProject}
              favoritesOnly={true}
            />
          )}

          {/* VIEW: Generation History */}
          {currentView === 'history' && (
            <HistoryView
              projects={projects}
              onOpenProject={handleOpenProject}
              onRerun={(p) => {
                handleOpenProject(p);
                handleStartGeneration();
              }}
            />
          )}

          {/* VIEW: Templates */}
          {currentView === 'templates' && (
            <TemplatesView onUseTemplate={handleUseTemplate} />
          )}

          {/* VIEW: Pricing & Usage */}
          {currentView === 'pricing' && (
            <PricingView
              user={user}
              onUpgradePlan={(planName) => {
                setUser((prev) => ({
                  ...prev,
                  plan: planName as any,
                  creditsRemaining: planName === 'Studio Max' ? 800 : 200,
                  totalCredits: planName === 'Studio Max' ? 800 : 200,
                }));
                addToast('success', 'Plan Upgraded', `You are now on ${planName}`);
              }}
            />
          )}

          {/* VIEW: Settings */}
          {currentView === 'settings' && (
            <SettingsView
              user={user}
              onUpdateUser={(updated) => {
                setUser((prev) => ({ ...prev, ...updated }));
                addToast('success', 'Settings Saved', 'Profile settings updated');
              }}
            />
          )}

          {/* VIEW: Video Editor Workspace */}
          {currentView === 'editor' && (
            <div className="space-y-6 max-w-7xl mx-auto">
              {/* Header Banner */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#292930]">
                <div>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={activeProject.name}
                      onChange={(e) => {
                        const name = e.target.value;
                        setActiveProject((prev) => ({ ...prev, name }));
                        setProjects((prev) =>
                          prev.map((p) => (p.id === activeProject.id ? { ...p, name } : p))
                        );
                      }}
                      className="text-xl sm:text-2xl font-extrabold text-white bg-transparent border-b border-transparent hover:border-[#292930] focus:border-[#8B5CF6] outline-none transition-colors max-w-md"
                    />
                  </div>
                  <p className="text-xs text-zinc-400 mt-1">
                    Bring Your Images to Life — Turn a single frame into a cinematic moment.
                  </p>
                </div>

                {/* Primary Action Button */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleStartGeneration}
                    disabled={isGenerating || !activeProject.imageUrl}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#8B5CF6] to-[#7C3AED] hover:from-[#9d74f7] hover:to-[#8B5CF6] text-white font-bold text-sm shadow-xl shadow-[#8B5CF6]/30 transition-all active:scale-95 disabled:opacity-40 disabled:pointer-events-none cursor-pointer border border-[#8B5CF6]/50"
                  >
                    <Play className="w-4 h-4 fill-white" />
                    <span>
                      {isGenerating
                        ? 'Synthesizing Video...'
                        : activeProject.variations.length > 0
                        ? 'Regenerate Video'
                        : 'Generate Cinematic Video'}
                    </span>
                  </button>
                </div>
              </div>

              {/* Progress Indicator if generating */}
              {isGenerating && (
                <GenerationProgress
                  progress={generationProgress}
                  stage={generationStage}
                  estimatedSecondsRemaining={estSecondsRemaining}
                  onCancel={handleCancelJob}
                />
              )}

              {/* If Video is Generated, display the professional cinema player at the top */}
              {activeProject.variations.length > 0 && !isGenerating && (
                <VideoPlayer
                  originalImageUrl={activeProject.imageUrl}
                  variations={activeProject.variations}
                  selectedIndex={activeProject.selectedVariationIndex}
                  onSelectVariation={(idx) =>
                    setActiveProject((prev) => ({
                      ...prev,
                      selectedVariationIndex: idx,
                    }))
                  }
                  onRegenerate={handleStartGeneration}
                  onDuplicate={() => handleDuplicateProject(activeProject)}
                  onSave={() => addToast('success', 'Project Saved', 'Project saved to library')}
                  onDelete={() => handleDeleteProject(activeProject.id)}
                />
              )}

              {/* Two Column Creation Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left Column: Image Uploader & Prompt Editor */}
                <div className="lg:col-span-7 space-y-6">
                  {/* Image Uploader */}
                  <ImageUploader
                    imageUrl={activeProject.imageUrl || null}
                    imageFileName={activeProject.imageFileName}
                    imageDimensions={activeProject.imageDimensions}
                    onImageSelected={(url, fileName, dimensions) => {
                      const updated = {
                        ...activeProject,
                        imageUrl: url,
                        imageFileName: fileName,
                        imageDimensions: dimensions,
                        updatedAt: new Date().toISOString(),
                      };
                      setActiveProject(updated);
                      setProjects((prev) =>
                        prev.map((p) => (p.id === activeProject.id ? updated : p))
                      );
                      addToast('success', 'Image Uploaded', `${fileName} ready for animation`);
                    }}
                    onClearImage={() => {
                      const updated = {
                        ...activeProject,
                        imageUrl: '',
                        imageFileName: undefined,
                        imageDimensions: undefined,
                        variations: [],
                      };
                      setActiveProject(updated);
                      setProjects((prev) =>
                        prev.map((p) => (p.id === activeProject.id ? updated : p))
                      );
                    }}
                    onAnalysisComplete={(analysis) => {
                      const updated: Project = {
                        ...activeProject,
                        imageAnalysis: analysis,
                        motionSettings: {
                          ...activeProject.motionSettings,
                          cameraPreset: analysis.recommendedCameraPreset,
                          intensity: analysis.recommendedIntensity,
                        },
                        prompt: analysis.suggestedPrompt || activeProject.prompt,
                      };
                      setActiveProject(updated);
                      setProjects((prev) =>
                        prev.map((p) => (p.id === activeProject.id ? updated : p))
                      );
                      addToast(
                        'success',
                        'Gemini Analysis Complete',
                        `Detected: ${analysis.subject}`
                      );
                    }}
                    analysis={activeProject.imageAnalysis}
                  />

                  {/* Prompt Editor */}
                  <PromptEditor
                    prompt={activeProject.prompt}
                    negativePrompt={activeProject.negativePrompt}
                    onPromptChange={(val) => {
                      setActiveProject((prev) => ({ ...prev, prompt: val }));
                      setProjects((prev) =>
                        prev.map((p) => (p.id === activeProject.id ? { ...p, prompt: val } : p))
                      );
                    }}
                    onNegativePromptChange={(val) => {
                      setActiveProject((prev) => ({ ...prev, negativePrompt: val }));
                      setProjects((prev) =>
                        prev.map((p) =>
                          p.id === activeProject.id ? { ...p, negativePrompt: val } : p
                        )
                      );
                    }}
                    cameraPreset={activeProject.motionSettings.cameraPreset}
                    intensity={activeProject.motionSettings.intensity}
                    aspectRatio={activeProject.videoSettings.aspectRatio}
                  />
                </div>

                {/* Right Column: Motion Controls & Video Settings */}
                <div className="lg:col-span-5 space-y-6">
                  {/* Motion Controls */}
                  <MotionControls
                    settings={activeProject.motionSettings}
                    onChange={(updatedSettings) => {
                      setActiveProject((prev) => ({
                        ...prev,
                        motionSettings: updatedSettings,
                      }));
                      setProjects((prev) =>
                        prev.map((p) =>
                          p.id === activeProject.id
                            ? { ...p, motionSettings: updatedSettings }
                            : p
                        )
                      );
                    }}
                  />

                  {/* Video Settings */}
                  <VideoSettings
                    settings={activeProject.videoSettings}
                    user={user}
                    onOpenAuth={() => setIsAuthModalOpen(true)}
                    onChange={(updatedSettings) => {
                      setActiveProject((prev) => ({
                        ...prev,
                        videoSettings: updatedSettings,
                      }));
                      setProjects((prev) =>
                        prev.map((p) =>
                          p.id === activeProject.id
                            ? { ...p, videoSettings: updatedSettings }
                            : p
                        )
                      );
                    }}
                  />
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteModalState.isOpen}
        title="Delete Project?"
        message="Are you sure you want to delete this video project? This will permanently remove the generation metadata and output files."
        confirmLabel="Delete Project"
        cancelLabel="Keep Project"
        isDestructive={true}
        onConfirm={confirmDeleteProject}
        onCancel={() => setDeleteModalState({ isOpen: false, projectId: null })}
      />

      {/* User & Admin Login Authentication Portal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentUser={user}
        onLogin={(newUser) => {
          setUser(newUser);
          try {
            localStorage.setItem('motionai_user', JSON.stringify(newUser));
          } catch (e) {}
          addToast(
            'success',
            newUser.isAdmin ? 'Admin Authenticated (Studio Max)' : 'Logged In as User',
            newUser.isAdmin
              ? 'Infinite generation with Ultra 4K Quality unlocked (Administrator Privileges)'
              : `Welcome, ${newUser.name}`
          );
        }}
      />

      {/* Global Notification Toasts */}
      <NotificationToast toasts={toasts} onDismiss={(id) => setToasts((prev) => prev.filter((t) => t.id !== id))} />
    </div>
  );
}
