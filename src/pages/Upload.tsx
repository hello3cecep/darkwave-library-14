
import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import MusicPlayer from '@/components/MusicPlayer';
import { Upload as UploadIcon, Music, Info, AlertCircle, Check } from 'lucide-react';
import { Track } from '@/components/TrackCard';
import { useToast } from '@/hooks/use-toast';

const Upload = () => {
  const { toast } = useToast();
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedTracks, setUploadedTracks] = useState<Track[]>([]);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  
  // For demo purposes, we'll simulate the upload
  const handleFileUpload = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    setIsUploading(true);
    setUploadProgress(0);
    
    // Filter only audio files
    const audioFiles = Array.from(files).filter(file => file.type.startsWith('audio/'));
    
    if (audioFiles.length === 0) {
      toast({
        title: "Invalid files",
        description: "Please upload audio files only (mp3, wav, etc.)",
        variant: "destructive",
      });
      setIsUploading(false);
      return;
    }
    
    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          
          // When upload is "complete", add some mock tracks to our uploaded list
          setTimeout(() => {
            const newTracks: Track[] = [
              {
                id: `u${uploadedTracks.length + 1}`,
                title: audioFiles[0].name.replace(/\.[^/.]+$/, ""),
                artist: "Your Upload",
                coverUrl: `https://picsum.photos/400/400?random=${Math.random()}`,
                duration: "3:45",
              }
            ];
            
            setUploadedTracks(prev => [...prev, ...newTracks]);
            setIsUploading(false);
            
            toast({
              title: "Upload complete",
              description: `Successfully uploaded ${audioFiles.length} track(s)`,
              variant: "default",
            });
          }, 500);
          
          return 100;
        }
        return prev + 5;
      });
    }, 200);
  };
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  
  const handleDragLeave = () => {
    setIsDragging(false);
  };
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileUpload(e.dataTransfer.files);
  };
  
  const handlePlayTrack = (track: Track) => {
    setCurrentTrack(track);
    setIsPlaying(true);
  };
  
  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };
  
  const handleNext = () => {
    if (!currentTrack || uploadedTracks.length === 0) return;
    
    const currentIndex = uploadedTracks.findIndex(track => track.id === currentTrack.id);
    const nextIndex = (currentIndex + 1) % uploadedTracks.length;
    setCurrentTrack(uploadedTracks[nextIndex]);
  };
  
  const handlePrevious = () => {
    if (!currentTrack || uploadedTracks.length === 0) return;
    
    const currentIndex = uploadedTracks.findIndex(track => track.id === currentTrack.id);
    const prevIndex = (currentIndex - 1 + uploadedTracks.length) % uploadedTracks.length;
    setCurrentTrack(uploadedTracks[prevIndex]);
  };

  return (
    <div className="min-h-screen pb-20">
      <Navbar />
      
      <main className="container mx-auto px-4 md:px-6 pt-24 pb-8">
        <h1 className="text-3xl font-bold mb-6">Upload Your Music</h1>
        
        <div 
          className={`mb-8 border-2 border-dashed rounded-lg p-8 transition-colors text-center ${
            isDragging ? 'border-primary bg-primary/5' : 'border-white/10 hover:border-white/20'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="flex flex-col items-center justify-center">
            <UploadIcon className="w-16 h-16 text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">Drag & Drop your audio files here</h2>
            <p className="text-muted-foreground mb-6">or click to browse your files</p>
            
            <input 
              type="file" 
              id="file-upload" 
              className="hidden" 
              multiple 
              accept="audio/*"
              onChange={(e) => handleFileUpload(e.target.files)}
            />
            <label 
              htmlFor="file-upload" 
              className="hover-scale bg-primary text-primary-foreground px-6 py-3 rounded-full cursor-pointer font-medium"
            >
              Select Files
            </label>
          </div>
        </div>
        
        {isUploading && (
          <div className="mb-8 glass-effect rounded-lg p-6 animate-fade-in">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium">Uploading...</h3>
              <span className="text-sm text-muted-foreground">{uploadProgress}%</span>
            </div>
            <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary transition-all duration-300 ease-out"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
          </div>
        )}
        
        {uploadedTracks.length > 0 && (
          <div className="glass-effect rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-4">Your Uploads</h3>
            
            <div className="space-y-2">
              {uploadedTracks.map(track => (
                <div 
                  key={track.id}
                  className="flex items-center justify-between p-3 hover:bg-white/5 rounded-md transition-colors cursor-pointer"
                  onClick={() => handlePlayTrack(track)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded overflow-hidden flex-shrink-0">
                      <img 
                        src={track.coverUrl} 
                        alt={track.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <h4 className="font-medium">{track.title}</h4>
                      <p className="text-sm text-muted-foreground">{track.artist}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-muted-foreground">{track.duration}</span>
                    <Check className="w-5 h-5 text-green-500" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        <div className="mt-10">
          <h2 className="text-xl font-semibold mb-4">Upload Guidelines</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="glass-effect rounded-lg p-5">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Music className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium mb-1">Supported Formats</h3>
                  <p className="text-sm text-muted-foreground">MP3, WAV, FLAC, AAC, and OGG files up to 50MB each.</p>
                </div>
              </div>
            </div>
            
            <div className="glass-effect rounded-lg p-5">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Info className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium mb-1">Metadata</h3>
                  <p className="text-sm text-muted-foreground">Include accurate titles, artists, and album info for better organization.</p>
                </div>
              </div>
            </div>
            
            <div className="glass-effect rounded-lg p-5">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium mb-1">Copyright</h3>
                  <p className="text-sm text-muted-foreground">Only upload content you own rights to or have permission to share.</p>
                </div>
              </div>
            </div>
          </div>
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

export default Upload;
