import React from 'react';
import { Play, Pause } from 'lucide-react';
import LikeButton from './LikeButton';

export type Track = {
  id: string;
  title: string;
  artist: string;
  coverUrl: string;
  duration: string;
  description?: string;
  audioUrl?: string; // Add the audio URL field
};

interface TrackCardProps {
  track: Track;
  isPlaying?: boolean;
  onPlay?: () => void;
  onPause?: () => void;
  variant?: 'grid' | 'list';
}

const TrackCard: React.FC<TrackCardProps> = ({
  track,
  isPlaying = false,
  onPlay,
  onPause,
  variant = 'grid'
}) => {
  const handlePlayPause = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isPlaying) {
      onPause?.();
    } else {
      onPlay?.();
    }
  };
  
  if (variant === 'list') {
    return (
      <div className="track-container flex items-center p-3 gap-3 group">
        <div className="relative w-12 h-12 rounded-md overflow-hidden flex-shrink-0">
          <img
            src={track.coverUrl}
            alt={`${track.title} by ${track.artist}`}
            className="w-full h-full object-cover"
            loading="lazy"
          />
          <button
            onClick={handlePlayPause}
            className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? (
              <Pause className="w-5 h-5 text-white" />
            ) : (
              <Play className="w-5 h-5 text-white" />
            )}
          </button>
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium truncate">{track.title}</h3>
          <p className="text-xs text-muted-foreground truncate">{track.artist}</p>
          {track.description && (
            <p className="text-xs text-muted-foreground line-clamp-1">{track.description}</p>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">{track.duration}</span>
          <LikeButton trackId={track.id} size="sm" />
        </div>
      </div>
    );
  }
  
  return (
    <div className="track-container group">
      <div className="relative aspect-square overflow-hidden">
        <img
          src={track.coverUrl}
          alt={`${track.title} by ${track.artist}`}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
        />
        <button
          onClick={handlePlayPause}
          className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          aria-label={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying ? (
            <Pause className="w-10 h-10 text-white" />
          ) : (
            <Play className="w-10 h-10 text-white" />
          )}
        </button>
      </div>
      
      <div className="p-3">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-medium truncate">{track.title}</h3>
            <p className="text-sm text-muted-foreground truncate">{track.artist}</p>
            {track.description && (
              <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{track.description}</p>
            )}
          </div>
          <LikeButton trackId={track.id} size="sm" />
        </div>
      </div>
    </div>
  );
};

export default TrackCard;
