
import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Play, Pause, RotateCcw, Upload } from 'lucide-react';

interface VideoPlayerProps {
  onPause: (frameData: string | null) => void;
  onPlay: () => void;
  videoSource: string | null;
  isYouTube: boolean;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ onPause, onPlay, videoSource, isYouTube }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const controlsTimeoutRef = useRef<number | null>(null);

  const resetControlsTimeout = useCallback(() => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      window.clearTimeout(controlsTimeoutRef.current);
    }
    if (isPlaying) {
      controlsTimeoutRef.current = window.setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }
  }, [isPlaying]);

  useEffect(() => {
    if (!isPlaying) {
      setShowControls(true);
      if (controlsTimeoutRef.current) window.clearTimeout(controlsTimeoutRef.current);
    } else {
      resetControlsTimeout();
    }
    return () => {
      if (controlsTimeoutRef.current) window.clearTimeout(controlsTimeoutRef.current);
    };
  }, [isPlaying, resetControlsTimeout]);

  const captureFrame = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return null;
    const canvas = canvasRef.current;
    const video = videoRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      return canvas.toDataURL('image/jpeg', 0.8).split(',')[1];
    }
    return null;
  }, []);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      const frame = captureFrame();
      onPause(frame);
    } else {
      videoRef.current.play();
      onPlay();
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const p = (videoRef.current.currentTime / videoRef.current.duration) * 100;
      setProgress(p);
    }
  };

  const handleReplay = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play();
      setIsPlaying(true);
      onPlay();
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!videoRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    videoRef.current.currentTime = percentage * videoRef.current.duration;
  };

  if (!videoSource) {
    return (
      <div className="w-full aspect-video glass rounded-2xl flex flex-col items-center justify-center border-2 border-dashed border-white/10 text-white/40">
        <Upload size={48} className="mb-4 animate-bounce" />
        <p className="text-xl font-medium font-serif italic">The Cinema Awaits</p>
        <p className="text-xs uppercase tracking-widest mt-2 opacity-50">Upload Local File or Enter YouTube Link</p>
      </div>
    );
  }

  return (
    <div 
      className="relative group w-full aspect-video rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-black cursor-none"
      onMouseMove={resetControlsTimeout}
      style={{ cursor: showControls ? 'default' : 'none' }}
    >
      {isYouTube ? (
        <iframe
          className="w-full h-full pointer-events-auto"
          src={`https://www.youtube.com/embed/${videoSource}?enablejsapi=1&autoplay=0`}
          title="YouTube Video"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        ></iframe>
      ) : (
        <video
          ref={videoRef}
          src={videoSource}
          className="w-full h-full object-contain"
          onTimeUpdate={handleTimeUpdate}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onClick={togglePlay}
        />
      )}

      {/* Custom Cinematic Controls for local video */}
      {!isYouTube && (
        <div 
          className={`absolute inset-0 flex flex-col justify-end transition-opacity duration-700 bg-gradient-to-t from-black/90 via-transparent to-transparent p-6 ${showControls ? 'opacity-100' : 'opacity-0'}`}
        >
          {/* Timeline */}
          <div 
            className="group/timeline w-full h-1.5 bg-white/10 rounded-full mb-6 cursor-pointer relative overflow-hidden"
            onClick={handleSeek}
          >
            <div 
              className="absolute top-0 left-0 h-full bg-red-600 transition-all duration-100 shadow-[0_0_15px_rgba(220,38,38,0.8)]" 
              style={{ width: `${progress}%` }}
            />
            <div className="absolute inset-0 bg-white/5 opacity-0 group-hover/timeline:opacity-100 transition-opacity" />
          </div>

          <div className="flex items-center gap-8">
            <button 
              onClick={togglePlay}
              className="p-4 bg-white text-black rounded-full hover:scale-110 active:scale-95 transition-all shadow-xl shadow-white/5"
            >
              {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" className="ml-0.5" />}
            </button>

            <button 
              onClick={handleReplay}
              className="text-white/60 hover:text-white hover:scale-110 transition-all flex items-center gap-2"
            >
              <RotateCcw size={20} />
              <span className="text-[10px] font-bold tracking-widest uppercase">Restart</span>
            </button>

            <div className="flex-1" />

            <div className="flex flex-col items-end">
              <div className="text-[10px] font-bold tracking-[0.3em] text-red-500 uppercase mb-1">
                Scout System Active
              </div>
              <div className="text-[10px] font-mono text-white/40">
                FRAME ANALYSIS READY
              </div>
            </div>
          </div>
        </div>
      )}

      {isYouTube && (
        <div className="absolute top-4 right-4 z-10">
          <div className="glass px-4 py-2 rounded-full text-[10px] font-bold text-red-500 flex items-center gap-3 border border-red-500/20">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
            LIVE YOUTUBE STREAM
          </div>
        </div>
      )}

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default VideoPlayer;
