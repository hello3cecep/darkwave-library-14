
import React, { useState } from 'react';
import { 
  Play, Pause, SkipBack, SkipForward, Volume2, Volume1, VolumeX,
  Repeat, Shuffle, Heart, ListMusic, Maximize2, Minimize2 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { type Track } from './TrackCard';

interface MusicPlayerProps {
  currentTrack: Track | null;
  isPlaying: boolean;
  onPlayPause: () => void;
  onNext: () => void;
  onPrevious: () => void;
}

const MusicPlayer: React.FC<MusicPlayerProps> = ({
  currentTrack,
  isPlaying,
  onPlayPause,
  onNext,
  onPrevious,
}) => {
  const [volume, setVolume] = useState(80);
  const [isExpanded, setIsExpanded] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  
  // For this demo we'll just simulate progress
  React.useEffect(() => {
    let timer: any = null;
    
    if (isPlaying && currentTrack) {
      timer = setInterval(() => {
        setCurrentTime((prevTime) => {
          // Convert duration from "3:45" format to seconds
          const [mins, secs] = currentTrack.duration.split(':').map(Number);
          const totalDuration = mins * 60 + secs;
          
          if (prevTime >= totalDuration) {
            clearInterval(timer);
            return 0;
          }
          return prevTime + 1;
        });
      }, 1000);
    }
    
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isPlaying, currentTrack]);

  const formatTime = (timeInSeconds: number) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };
  
  const getProgress = () => {
    if (!currentTrack) return 0;
    
    // Convert duration from "3:45" format to seconds
    const [mins, secs] = currentTrack.duration.split(':').map(Number);
    const totalDuration = mins * 60 + secs;
    
    return (currentTime / totalDuration) * 100;
  };
  
  // Handle volume icon based on volume level
  const VolumeIcon = () => {
    if (isMuted || volume === 0) return <VolumeX className="w-5 h-5" />;
    if (volume < 50) return <Volume1 className="w-5 h-5" />;
    return <Volume2 className="w-5 h-5" />;
  };
  
  const handleVolumeClick = () => {
    setIsMuted(!isMuted);
  };
  
  // If no track is loaded, show a minimal player
  if (!currentTrack) {
    return (
      <div className="fixed bottom-0 left-0 right-0 h-16 bg-card/90 backdrop-blur-lg border-t border-white/5 z-40 px-4 flex items-center justify-center">
        <p className="text-muted-foreground text-sm">No track selected</p>
      </div>
    );
  }
  
  return (
    <div 
      className={cn(
        "fixed left-0 right-0 bg-card/90 backdrop-blur-lg border-t border-white/5 z-40 transition-all duration-300",
        isExpanded ? "bottom-0 h-96" : "bottom-0 h-20"
      )}
    >
      <div className="container mx-auto h-full px-4">
        {/* Progress bar at the top */}
        <div className="h-1 w-full bg-secondary relative -mt-px">
          <div 
            className="h-full bg-primary"
            style={{ width: `${getProgress()}%` }}
          ></div>
        </div>
        
        <div className="flex items-center justify-between h-20">
          {/* Track info */}
          <div className="flex items-center gap-3 w-1/3">
            <div className="w-12 h-12 rounded overflow-hidden">
              <img 
                src={currentTrack.coverUrl} 
                alt={currentTrack.title}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="truncate">
              <h4 className="font-medium truncate">{currentTrack.title}</h4>
              <p className="text-sm text-muted-foreground truncate">{currentTrack.artist}</p>
            </div>
            <button 
              className={cn("text-muted-foreground hover:text-primary transition-colors", 
                isLiked && "text-primary"
              )}
              onClick={() => setIsLiked(!isLiked)}
              aria-label={isLiked ? "Unlike" : "Like"}
            >
              <Heart className="w-5 h-5" fill={isLiked ? "currentColor" : "none"} />
            </button>
          </div>
          
          {/* Player controls */}
          <div className="flex items-center gap-4 justify-center w-1/3">
            <button 
              className={cn("text-muted-foreground hover:text-foreground transition-colors",
                isShuffle && "text-primary"
              )}
              onClick={() => setIsShuffle(!isShuffle)}
              aria-label="Shuffle"
            >
              <Shuffle className="w-5 h-5" />
            </button>
            
            <button 
              className="text-muted-foreground hover:text-foreground transition-colors"
              onClick={onPrevious}
              aria-label="Previous track"
            >
              <SkipBack className="w-5 h-5" />
            </button>
            
            <button 
              className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center hover:opacity-90 transition-opacity"
              onClick={onPlayPause}
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            </button>
            
            <button 
              className="text-muted-foreground hover:text-foreground transition-colors"
              onClick={onNext}
              aria-label="Next track"
            >
              <SkipForward className="w-5 h-5" />
            </button>
            
            <button 
              className={cn("text-muted-foreground hover:text-foreground transition-colors",
                isRepeat && "text-primary"
              )}
              onClick={() => setIsRepeat(!isRepeat)}
              aria-label="Repeat"
            >
              <Repeat className="w-5 h-5" />
            </button>
          </div>
          
          {/* Volume and additional controls */}
          <div className="flex items-center gap-4 justify-end w-1/3">
            <div className="flex items-center gap-2">
              <button 
                onClick={handleVolumeClick}
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label={isMuted ? "Unmute" : "Mute"}
              >
                <VolumeIcon />
              </button>
              <input
                type="range"
                min="0"
                max="100"
                value={isMuted ? 0 : volume}
                onChange={(e) => {
                  setVolume(Number(e.target.value));
                  if (isMuted) setIsMuted(false);
                }}
                className="w-20 accent-primary"
                aria-label="Volume"
              />
            </div>
            
            <button 
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Queue"
            >
              <ListMusic className="w-5 h-5" />
            </button>
            
            <button 
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label={isExpanded ? "Minimize" : "Expand"}
            >
              {isExpanded ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
            </button>
          </div>
        </div>
        
        {/* Expanded view content */}
        {isExpanded && (
          <div className="h-[calc(100%-5rem)] p-4 animate-fade-in">
            <div className="flex h-full">
              <div className="w-1/2 pr-4 flex items-center justify-center">
                <div className="w-64 h-64 rounded-lg overflow-hidden shadow-xl hover-scale">
                  <img 
                    src={currentTrack.coverUrl} 
                    alt={currentTrack.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              <div className="w-1/2 pl-4 flex flex-col justify-center">
                <h2 className="text-3xl font-bold mb-2">{currentTrack.title}</h2>
                <p className="text-xl text-muted-foreground mb-6">{currentTrack.artist}</p>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>{formatTime(currentTime)}</span>
                      <span>{currentTrack.duration}</span>
                    </div>
                    <div className="h-1.5 w-full bg-secondary rounded-full">
                      <div 
                        className="h-full bg-primary rounded-full"
                        style={{ width: `${getProgress()}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MusicPlayer;
