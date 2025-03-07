
import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import MusicPlayer from '@/components/MusicPlayer';
import TrackCard, { Track } from '@/components/TrackCard';
import { Search, Plus, Library as LibraryIcon, GridIcon, List } from 'lucide-react';
import { cn } from '@/lib/utils';

const libraryTracks: Track[] = [
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
  {
    id: "5",
    title: "Urban Jungle",
    artist: "City Lights",
    coverUrl: "https://images.unsplash.com/photo-1477233534935-f5e6fe7c1159?q=80&w=2070&auto=format&fit=crop",
    duration: "3:56",
  },
  {
    id: "6",
    title: "Desert Mirage",
    artist: "Sand Dunes",
    coverUrl: "https://images.unsplash.com/photo-1473580044384-7ba9967e16a0?q=80&w=2070&auto=format&fit=crop",
    duration: "4:32",
  }
];

const playlists = [
  {
    id: "p1",
    title: "Favorite Tracks",
    trackCount: 24,
  },
  {
    id: "p2",
    title: "Workout Mix",
    trackCount: 18,
  },
  {
    id: "p3",
    title: "Focus Flow",
    trackCount: 32,
  },
  {
    id: "p4",
    title: "Chill Evening",
    trackCount: 15,
  }
];

type ViewMode = 'grid' | 'list';
type LibrarySection = 'tracks' | 'albums' | 'artists' | 'playlists';

const Library = () => {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playingTrackId, setPlayingTrackId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [activeSection, setActiveSection] = useState<LibrarySection>('tracks');
  const [searchQuery, setSearchQuery] = useState('');
  
  const filteredTracks = libraryTracks.filter(track => 
    track.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    track.artist.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
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
    
    const currentIndex = libraryTracks.findIndex(track => track.id === currentTrack.id);
    const nextIndex = (currentIndex + 1) % libraryTracks.length;
    setCurrentTrack(libraryTracks[nextIndex]);
    setPlayingTrackId(libraryTracks[nextIndex].id);
  };
  
  const handlePrevious = () => {
    if (!currentTrack) return;
    
    const currentIndex = libraryTracks.findIndex(track => track.id === currentTrack.id);
    const prevIndex = (currentIndex - 1 + libraryTracks.length) % libraryTracks.length;
    setCurrentTrack(libraryTracks[prevIndex]);
    setPlayingTrackId(libraryTracks[prevIndex].id);
  };
  
  const renderSectionContent = () => {
    switch(activeSection) {
      case 'tracks':
        return (
          <div className={viewMode === 'grid' ? 'grid grid-cols-2 md:grid-cols-4 gap-4' : 'space-y-2'}>
            {filteredTracks.map(track => (
              <TrackCard 
                key={track.id}
                track={track}
                isPlaying={isPlaying && playingTrackId === track.id}
                onPlay={() => handlePlayTrack(track)}
                onPause={handlePauseTrack}
                variant={viewMode}
              />
            ))}
          </div>
        );
      case 'playlists':
        return (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {playlists.map(playlist => (
              <div key={playlist.id} className="track-container p-5">
                <div className="flex justify-between items-center mb-2">
                  <LibraryIcon className="w-8 h-8 text-primary" />
                  <span className="text-xs text-muted-foreground">{playlist.trackCount} tracks</span>
                </div>
                <h3 className="font-medium text-lg">{playlist.title}</h3>
              </div>
            ))}
            <div className="track-container p-5 flex flex-col items-center justify-center text-muted-foreground hover:text-foreground transition-colors min-h-[150px] cursor-pointer">
              <Plus className="w-8 h-8 mb-2" />
              <span>Create Playlist</span>
            </div>
          </div>
        );
      case 'albums':
      case 'artists':
        return (
          <div className="flex items-center justify-center h-40 text-muted-foreground">
            <p>No {activeSection} in your library yet</p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen pb-20">
      <Navbar />
      
      <main className="container mx-auto px-4 md:px-6 pt-24 pb-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">My Library</h1>
          
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search your library"
                className="pl-9 pr-4 py-2 rounded-full bg-secondary border-none text-sm w-64 focus:outline-none focus:ring-2 ring-primary/50"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="flex bg-secondary rounded-full p-1">
              <button
                className={cn(
                  "rounded-full p-1.5 transition-colors",
                  viewMode === 'grid' ? "bg-primary text-primary-foreground" : "text-muted-foreground"
                )}
                onClick={() => setViewMode('grid')}
                aria-label="Grid view"
              >
                <GridIcon className="w-4 h-4" />
              </button>
              <button
                className={cn(
                  "rounded-full p-1.5 transition-colors",
                  viewMode === 'list' ? "bg-primary text-primary-foreground" : "text-muted-foreground"
                )}
                onClick={() => setViewMode('list')}
                aria-label="List view"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
        
        <div className="flex border-b border-white/10 mb-6">
          {(['tracks', 'albums', 'artists', 'playlists'] as LibrarySection[]).map((section) => (
            <button
              key={section}
              onClick={() => setActiveSection(section)}
              className={cn(
                "px-5 py-3 text-muted-foreground capitalize transition-colors",
                activeSection === section && "text-foreground font-medium border-b-2 border-primary"
              )}
            >
              {section}
            </button>
          ))}
        </div>
        
        <div className="min-h-[400px]">
          {renderSectionContent()}
        </div>
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

export default Library;
