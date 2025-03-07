
import React from 'react';
import { Play } from 'lucide-react';

interface FeaturedContentProps {
  title: string;
  artist: string;
  coverUrl: string;
  onPlay: () => void;
}

const FeaturedContent: React.FC<FeaturedContentProps> = ({
  title,
  artist,
  coverUrl,
  onPlay,
}) => {
  return (
    <div className="relative h-[300px] md:h-[400px] overflow-hidden rounded-lg glass-effect animate-fade-in">
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent z-10"></div>
      <img
        src={coverUrl}
        alt={`${title} by ${artist}`}
        className="absolute inset-0 w-full h-full object-cover"
      />
      
      <div className="absolute bottom-0 left-0 right-0 p-6 z-20">
        <div className="space-y-4">
          <div>
            <p className="text-sm uppercase tracking-wider text-muted-foreground font-medium">Featured Artist</p>
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight mt-1">{artist}</h1>
          </div>
          
          <div>
            <p className="text-muted-foreground">Latest Release</p>
            <h2 className="text-xl md:text-2xl font-semibold">{title}</h2>
          </div>
          
          <button 
            onClick={onPlay}
            className="hover-scale inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-full font-medium"
          >
            <Play className="w-5 h-5" />
            Play Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default FeaturedContent;
