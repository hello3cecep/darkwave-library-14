
import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import FeaturedContent from '@/components/FeaturedContent';
import TrackCard, { Track } from '@/components/TrackCard';
import MusicPlayer from '@/components/MusicPlayer';
import { Play } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useLikes } from '@/hooks/useLikes';

const featuredContent = {
  title: "Midnight Memory",
  artist: "Aurora Skies",
  coverUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?q=80&w=2070&auto=format&fit=crop",
};

// These tracks will be used as fallback if we can't load data from Supabase
const fallbackTracks: Track[] = [
  {
    id: "1",
    title: "Midnight Memory",
    artist: "Aurora Skies",
    coverUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?q=80&w=2070&auto=format&fit=crop",
    duration: "3:45",
  },
  {
    id: "2",
    title: "Ocean Waves",
    artist: "Serene Sound",
    coverUrl: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?q=80&w=2070&auto=format&fit=crop",
    duration: "4:12",
  },
  {
    id: "3",
    title: "Neon Dreams",
    artist: "Electric Echo",
    coverUrl: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=2074&auto=format&fit=crop",
    duration: "3:28",
  },
  {
    id: "4",
    title: "Mountain High",
    artist: "The Climbers",
    coverUrl: "https://images.unsplash.com/photo-1501612780327-45045538702b?q=80&w=2070&auto=format&fit=crop",
    duration: "5:16",
  },
];

const popularPlaylists = [
  {
    id: "p1",
    title: "Chill Vibes",
    description: "Relaxing tunes for your evening",
    coverUrl: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?q=80&w=2069&auto=format&fit=crop",
    trackCount: 24,
  },
  {
    id: "p2",
    title: "Workout Mix",
    description: "Energetic beats to keep you moving",
    coverUrl: "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?q=80&w=2070&auto=format&fit=crop",
    trackCount: 18,
  },
  {
    id: "p3",
    title: "Focus Flow",
    description: "Ambient sounds for deep concentration",
    coverUrl: "https://images.unsplash.com/photo-1558021212-51b6ecfa0db9?q=80&w=2083&auto=format&fit=crop",
    trackCount: 32,
  },
];

const Index = () => {
  const { user } = useAuth();
  const { isTrackLiked } = useLikes();
  const [tracks, setTracks] = useState<Track[]>(fallbackTracks);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playingTrackId, setPlayingTrackId] = useState<string | null>(null);
  const [isLoadingTracks, setIsLoadingTracks] = useState(true);
  
  useEffect(() => {
    const fetchTracks = async () => {
      try {
        setIsLoadingTracks(true);
        
        const { data, error } = await supabase
          .from('tracks')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(8);
        
        if (error) {
          console.error('Error fetching tracks:', error);
          return;
        }
        
        if (data && data.length > 0) {
          const formattedTracks: Track[] = data.map(track => ({
            id: track.id,
            title: track.title,
            artist: track.artist,
            coverUrl: track.cover_url || 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?q=80&w=2070&auto=format&fit=crop',
            duration: track.duration
          }));
          
          setTracks(formattedTracks);
        }
      } catch (error) {
        console.error('Error in fetchTracks:', error);
      } finally {
        setIsLoadingTracks(false);
      }
    };
    
    fetchTracks();
  }, []);
  
  const handlePlayTrack = (track: Track) => {
    setCurrentTrack(track);
    setPlayingTrackId(track.id);
    setIsPlaying(true);
  };
  
  const handlePauseTrack = () => {
    setIsPlaying(false);
  };
  
  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };
  
  const handleNext = () => {
    if (!currentTrack) return;
    
    const currentIndex = tracks.findIndex(track => track.id === currentTrack.id);
    const nextIndex = (currentIndex + 1) % tracks.length;
    setCurrentTrack(tracks[nextIndex]);
    setPlayingTrackId(tracks[nextIndex].id);
  };
  
  const handlePrevious = () => {
    if (!currentTrack) return;
    
    const currentIndex = tracks.findIndex(track => track.id === currentTrack.id);
    const prevIndex = (currentIndex - 1 + tracks.length) % tracks.length;
    setCurrentTrack(tracks[prevIndex]);
    setPlayingTrackId(tracks[prevIndex].id);
  };
  
  const handlePlayFeatured = () => {
    const featured = tracks.find(track => track.title === "Midnight Memory");
    if (featured) {
      handlePlayTrack(featured);
    } else if (tracks.length > 0) {
      handlePlayTrack(tracks[0]);
    }
  };

  return (
    <div className="min-h-screen pb-20">
      <Navbar />
      
      <main className="container mx-auto px-4 md:px-6 pt-24 pb-8">
        <section className="mb-10">
          <FeaturedContent 
            title={featuredContent.title}
            artist={featuredContent.artist}
            coverUrl={featuredContent.coverUrl}
            onPlay={handlePlayFeatured}
          />
        </section>
        
        <section className="mb-10">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-2xl font-semibold">Recently Played</h2>
            <a href="#" className="text-sm text-primary hover:underline">View All</a>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {isLoadingTracks ? (
              // Loading skeleton
              Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="space-y-3">
                  <div className="aspect-square bg-muted animate-pulse rounded-md"></div>
                  <div className="h-4 bg-muted animate-pulse rounded"></div>
                  <div className="h-3 bg-muted animate-pulse rounded w-2/3"></div>
                </div>
              ))
            ) : (
              tracks.map(track => (
                <TrackCard 
                  key={track.id}
                  track={track}
                  isPlaying={isPlaying && playingTrackId === track.id}
                  onPlay={() => handlePlayTrack(track)}
                  onPause={handlePauseTrack}
                />
              ))
            )}
          </div>
        </section>
        
        <section className="mb-10">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-2xl font-semibold">Popular Playlists</h2>
            <a href="#" className="text-sm text-primary hover:underline">View All</a>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {popularPlaylists.map(playlist => (
              <div key={playlist.id} className="track-container group">
                <div className="relative aspect-square overflow-hidden">
                  <img
                    src={playlist.coverUrl}
                    alt={playlist.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Play className="w-10 h-10 text-white" />
                  </div>
                </div>
                
                <div className="p-4">
                  <h3 className="font-medium">{playlist.title}</h3>
                  <p className="text-sm text-muted-foreground mb-1">{playlist.description}</p>
                  <p className="text-xs text-muted-foreground">{playlist.trackCount} tracks</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
      
      <MusicPlayer 
        currentTrack={currentTrack}
        isPlaying={isPlaying}
        onPlayPause={handlePlayPause}
        onNext={handleNext}
        onPrevious={handlePrevious}
      />
    </div>
  );
};

export default Index;
