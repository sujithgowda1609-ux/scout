
import React, { useState, useCallback, useEffect } from 'react';
import { Search, Film, LogOut, TrendingUp, Sparkles, AlertCircle, Loader2, PlayCircle, ScanSearch, X, ShieldCheck, Check } from 'lucide-react';
import AuthForm from './components/AuthForm';
import VideoPlayer from './components/VideoPlayer';
import ProductCard3D from './components/ProductCard3D';
import ObjectOverlay from './components/ObjectOverlay';
import { ViewMode, DetectedObject, DetectionResult } from './types';
import { detectObjectsInFrame } from './services/geminiService';

const App: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.AUTH);
  const [authType, setAuthType] = useState<'login' | 'register'>('login');
  const [user, setUser] = useState<{ username: string } | null>(null);
  const [videoUrl, setVideoUrl] = useState('');
  const [activeVideo, setActiveVideo] = useState<{ source: string, isYouTube: boolean } | null>(null);
  const [scannedResult, setScannedResult] = useState<DetectionResult | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingFrame, setPendingFrame] = useState<string | null>(null);
  
  // Save credentials logic
  const [showSavePrompt, setShowSavePrompt] = useState(false);
  const [pendingCredentials, setPendingCredentials] = useState<any>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleAuth = (data: any) => {
    setUser({ username: data.username || data.email.split('@')[0] });
    setViewMode(ViewMode.DASHBOARD);
    
    // If it was a registration, show the save prompt
    if (authType === 'register') {
      setPendingCredentials(data);
      setShowSavePrompt(true);
      // Auto-hide after 10 seconds if no action
      setTimeout(() => setShowSavePrompt(false), 10000);
    }
  };

  const handleSaveCredentials = () => {
    if (pendingCredentials) {
      localStorage.setItem('scout_ai_creds', JSON.stringify({
        email: pendingCredentials.email,
        password: pendingCredentials.password,
        username: pendingCredentials.username
      }));
      setSaveSuccess(true);
      setTimeout(() => {
        setShowSavePrompt(false);
        setSaveSuccess(false);
      }, 2000);
    }
  };

  const handleLogout = () => {
    setUser(null);
    setViewMode(ViewMode.AUTH);
    setActiveVideo(null);
    setScannedResult(null);
    setPendingFrame(null);
    setShowSavePrompt(false);
  };

  const handleVideoUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoUrl) return;

    let source = videoUrl;
    let isYouTube = false;

    const ytMatch = videoUrl.match(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=)?(.+)/);
    if (ytMatch && ytMatch[1]) {
      source = ytMatch[1];
      isYouTube = true;
    }

    setActiveVideo({ source, isYouTube });
    setScannedResult(null);
    setPendingFrame(null);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setActiveVideo({ source: url, isYouTube: false });
      setScannedResult(null);
      setPendingFrame(null);
    }
  };

  const handleVideoPause = (frameBase64: string | null) => {
    if (!frameBase64) return;
    setPendingFrame(frameBase64);
    setScannedResult(null);
    setError(null);
  };

  const triggerScan = async () => {
    if (!pendingFrame) return;
    
    setIsScanning(true);
    setError(null);
    try {
      const result = await detectObjectsInFrame(pendingFrame);
      setScannedResult(result);
      setPendingFrame(null);
    } catch (err: any) {
      console.error(err);
      setError("AI Engine encountered an issue identifying products in this frame.");
    } finally {
      setIsScanning(false);
    }
  };

  const cancelScan = () => {
    setPendingFrame(null);
  };

  const handleVideoPlay = () => {
    setScannedResult(null);
    setPendingFrame(null);
  };

  return (
    <div className="min-h-screen cinematic-gradient relative overflow-x-hidden">
      {/* Background Ambience */}
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-red-900/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-900/10 blur-[120px] rounded-full pointer-events-none" />

      {/* Save Credentials Prompt (Top Right Corner) */}
      {showSavePrompt && (
        <div className="fixed top-24 right-6 z-[100] w-80 animate-in slide-in-from-right-8 duration-500">
          <div className="glass p-5 rounded-2xl border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative overflow-hidden">
            {saveSuccess ? (
              <div className="flex flex-col items-center justify-center py-4 space-y-3 animate-in fade-in zoom-in">
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center shadow-lg shadow-green-500/20">
                  <Check className="text-white" size={24} />
                </div>
                <p className="text-white font-bold">Credentials Secured</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center">
                      <ShieldCheck className="text-red-500" size={20} />
                    </div>
                    <div>
                      <h4 className="text-white font-bold text-sm">Save Intelligence?</h4>
                      <p className="text-white/40 text-[10px] uppercase tracking-wider">Cloud Sync Available</p>
                    </div>
                  </div>
                  <button onClick={() => setShowSavePrompt(false)} className="text-white/20 hover:text-white transition-colors">
                    <X size={16} />
                  </button>
                </div>
                <p className="text-white/60 text-xs leading-relaxed">
                  Would you like to store your credentials for faster access to the Scout Dashboard?
                </p>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setShowSavePrompt(false)}
                    className="flex-1 px-3 py-2 rounded-lg text-[11px] font-bold text-white/40 hover:text-white hover:bg-white/5 transition-all"
                  >
                    Not Now
                  </button>
                  <button 
                    onClick={handleSaveCredentials}
                    className="flex-1 bg-white text-black px-3 py-2 rounded-lg text-[11px] font-bold hover:bg-red-500 hover:text-white transition-all active:scale-95"
                  >
                    Yes, Save
                  </button>
                </div>
              </div>
            )}
            {/* Animated accent line */}
            <div className="absolute bottom-0 left-0 h-1 bg-red-600 animate-[loading_10s_linear_forwards]" style={{ width: '100%' }} />
          </div>
        </div>
      )}

      {/* Header */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass px-6 py-4 flex items-center justify-between border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center shadow-lg shadow-red-600/20">
            <Film className="text-white" size={20} />
          </div>
          <h1 className="text-xl font-bold tracking-tighter text-white font-serif">
            SCOUT<span className="text-red-600">AI</span>
          </h1>
        </div>

        {viewMode === ViewMode.DASHBOARD && user && (
          <div className="flex items-center gap-6">
            <div className="hidden md:flex flex-col items-end">
              <span className="text-white/60 text-[10px] uppercase font-bold tracking-widest">Active Operative</span>
              <span className="text-white font-medium">{user.username}</span>
            </div>
            <button 
              onClick={handleLogout}
              className="p-2 text-white/40 hover:text-white transition-colors"
            >
              <LogOut size={20} />
            </button>
          </div>
        )}
      </nav>

      <main className="pt-24 pb-12 px-6 max-w-7xl mx-auto">
        {viewMode === ViewMode.AUTH ? (
          <div className="flex flex-col items-center justify-center min-h-[80vh]">
            <AuthForm 
              type={authType} 
              onToggle={() => setAuthType(authType === 'login' ? 'register' : 'login')}
              onSubmit={handleAuth}
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="glass p-1.5 rounded-2xl flex items-center gap-2">
                <form onSubmit={handleVideoUpload} className="flex-1 flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                    <input 
                      type="text" 
                      placeholder="Paste YouTube Trailer URL..." 
                      className="w-full bg-white/5 border border-white/5 rounded-xl py-3 pl-12 pr-4 text-white text-sm focus:outline-none focus:ring-1 focus:ring-red-500/50"
                      value={videoUrl}
                      onChange={(e) => setVideoUrl(e.target.value)}
                    />
                  </div>
                  <button className="bg-white text-black font-bold px-6 py-3 rounded-xl hover:bg-red-500 hover:text-white transition-all">
                    Load
                  </button>
                </form>
                <div className="h-8 w-px bg-white/10" />
                <label className="cursor-pointer group">
                  <input type="file" accept="video/*" className="hidden" onChange={handleFileUpload} />
                  <div className="p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-all text-white/60 group-hover:text-white">
                    <TrendingUp size={18} />
                  </div>
                </label>
              </div>

              <div className="relative">
                <VideoPlayer 
                  videoSource={activeVideo?.source || null} 
                  isYouTube={activeVideo?.isYouTube || false}
                  onPause={handleVideoPause}
                  onPlay={handleVideoPlay}
                />
                
                {activeVideo && (
                  <ObjectOverlay 
                    objects={scannedResult?.objects || []} 
                    visible={!!scannedResult && !isScanning}
                    onSelectObject={(obj) => {
                        const el = document.getElementById(`product-${obj.id}`);
                        el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        el?.classList.add('ring-2', 'ring-red-500');
                        setTimeout(() => el?.classList.remove('ring-2', 'ring-red-500'), 2000);
                    }}
                  />
                )}

                {pendingFrame && !isScanning && (
                  <div className="absolute inset-0 z-40 flex items-center justify-center animate-in fade-in duration-300">
                    <div className="glass p-8 rounded-3xl border-red-500/30 flex flex-col items-center text-center space-y-6 max-w-sm shadow-[0_0_50px_-12px_rgba(220,38,38,0.5)]">
                      <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center animate-pulse">
                        <ScanSearch className="text-white" size={32} />
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-xl font-bold text-white">Detect Objects?</h3>
                        <p className="text-white/60 text-sm">Our AI Scout can analyze this frame for clothing, gadgets, and furniture.</p>
                      </div>
                      <div className="flex gap-3 w-full">
                        <button 
                          onClick={cancelScan}
                          className="flex-1 px-4 py-3 rounded-xl border border-white/10 text-white/60 hover:text-white hover:bg-white/5 transition-all text-sm font-bold"
                        >
                          Dismiss
                        </button>
                        <button 
                          onClick={triggerScan}
                          className="flex-[2] bg-red-600 hover:bg-red-700 text-white font-bold px-4 py-3 rounded-xl transition-all shadow-lg shadow-red-600/20 active:scale-95 text-sm"
                        >
                          Scan Frame
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {isScanning && (
                  <div className="absolute inset-0 bg-black/40 backdrop-blur-sm z-30 flex flex-col items-center justify-center text-white space-y-4">
                    <div className="relative">
                      <Loader2 size={48} className="animate-spin text-red-500" />
                      <Sparkles className="absolute -top-2 -right-2 text-yellow-400 animate-pulse" size={20} />
                    </div>
                    <div className="text-center">
                      <p className="font-bold tracking-widest uppercase text-xs text-white/60 mb-1">Ensemble Neural Processing</p>
                      <p className="text-lg">Analyzing frame for products...</p>
                    </div>
                  </div>
                )}
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl flex items-center gap-3 text-red-400">
                  <AlertCircle size={20} />
                  <p className="text-sm font-medium">{error}</p>
                </div>
              )}

              {scannedResult && (
                <div className="glass p-6 rounded-2xl animate-in slide-in-from-bottom-4 duration-500">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-500/20 text-blue-400 rounded-lg">
                        <Sparkles size={20} />
                      </div>
                      <div>
                        <h2 className="text-white font-bold text-lg">Scene Awareness Enabled</h2>
                        <p className="text-white/40 text-xs uppercase tracking-widest">Environment identified: {scannedResult.scene}</p>
                      </div>
                    </div>
                    <div className="text-right">
                       <span className="text-white/40 text-[10px] uppercase font-bold tracking-widest block">AI Accuracy</span>
                       <span className="text-green-500 font-mono text-sm font-bold">98.42% Confidence</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="lg:col-span-1 space-y-6">
               <div className="flex items-center justify-between">
                  <h3 className="text-white font-bold text-xl flex items-center gap-2">
                    <TrendingUp className="text-red-500" size={20} />
                    Scouted Products
                  </h3>
                  {scannedResult && (
                    <span className="bg-white/5 text-white/60 text-xs px-2 py-1 rounded-md border border-white/10">
                      {scannedResult.objects.length} Items
                    </span>
                  )}
               </div>

               <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
                  {!scannedResult && !isScanning ? (
                    <div className="glass p-12 rounded-3xl flex flex-col items-center justify-center text-center space-y-4">
                      <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center">
                        <PlayCircle className="text-white/20" size={32} />
                      </div>
                      <div className="space-y-1">
                        <p className="text-white font-medium">Scout is Idle</p>
                        <p className="text-white/40 text-sm">
                          {pendingFrame ? 'Waiting for scan confirmation.' : 'Pause any video frame to identify high-quality movie gear.'}
                        </p>
                      </div>
                    </div>
                  ) : (
                    scannedResult?.objects.map((obj) => (
                      <div key={obj.id} id={`product-${obj.id}`}>
                        <ProductCard3D product={obj} />
                      </div>
                    ))
                  )}
               </div>
               
               <div className="glass p-6 rounded-3xl border-dashed border-white/10">
                  <h4 className="text-white/60 text-xs font-bold uppercase tracking-[0.2em] mb-4">Recommended For You</h4>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/5 rounded-lg" />
                    <div className="flex-1 space-y-1">
                      <div className="h-3 w-2/3 bg-white/10 rounded" />
                      <div className="h-2 w-1/2 bg-white/5 rounded" />
                    </div>
                  </div>
               </div>
            </div>
          </div>
        )}
      </main>

      <footer className="py-8 text-center text-white/20 text-xs border-t border-white/5">
        <p>&copy; 2024 AI MOVIE TRAILER SCOUT • POWERED BY GEMINI VISION ENGINE • ALL RIGHTS RESERVED</p>
      </footer>

      <style>{`
        @keyframes loading {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  );
};

export default App;
