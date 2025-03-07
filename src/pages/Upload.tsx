
import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import MusicPlayer from '@/components/MusicPlayer';
import { Upload as UploadIcon, Music, Info, AlertCircle, Check, Image, FileMusic } from 'lucide-react';
import { Track } from '@/components/TrackCard';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Form, FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const formSchema = z.object({
  title: z.string().min(2, {
    message: "Title must be at least 2 characters.",
  }),
  artist: z.string().min(2, {
    message: "Artist name must be at least 2 characters.",
  }),
  description: z.string().optional(),
});

const Upload = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedTracks, setUploadedTracks] = useState<Track[]>([]);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedAudioFile, setSelectedAudioFile] = useState<File | null>(null);
  const [selectedCoverFile, setSelectedCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      artist: "",
      description: "",
    },
  });
  
  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  
  const getAudioDuration = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const audio = new Audio();
      audio.src = URL.createObjectURL(file);
      
      audio.onloadedmetadata = () => {
        URL.revokeObjectURL(audio.src);
        resolve(formatDuration(audio.duration));
      };
      
      // Default duration if we can't determine it
      audio.onerror = () => resolve("0:00");
    });
  };
  
  const handleCoverFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file for the cover",
        variant: "destructive",
      });
      return;
    }
    
    setSelectedCoverFile(file);
    
    // Create a preview URL
    const previewUrl = URL.createObjectURL(file);
    setCoverPreview(previewUrl);
  };

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to upload tracks",
        variant: "destructive",
      });
      return;
    }
    
    // Filter only audio files
    const audioFiles = Array.from(files).filter(file => file.type.startsWith('audio/'));
    
    if (audioFiles.length === 0) {
      toast({
        title: "Invalid files",
        description: "Please upload audio files only (mp3, wav, etc.)",
        variant: "destructive",
      });
      return;
    }
    
    // Use only the first audio file
    setSelectedAudioFile(audioFiles[0]);
    
    // Auto-fill the title based on the filename
    const fileName = audioFiles[0].name.replace(/\.[^/.]+$/, "");
    form.setValue("title", fileName);
    
    toast({
      title: "File selected",
      description: "Now fill in the details and upload your track",
    });
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
  
  const handleSubmit = form.handleSubmit(async (data) => {
    if (!selectedAudioFile || !user) return;
    
    setIsUploading(true);
    setUploadProgress(0);
    
    try {
      // Create a simulated progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 95) {
            clearInterval(progressInterval);
            return 95;
          }
          return prev + 5;
        });
      }, 300);
      
      // Get audio duration
      const duration = await getAudioDuration(selectedAudioFile);
      
      // 1. Upload audio file to Supabase storage
      const audioFileName = `${Date.now()}-${selectedAudioFile.name}`;
      const { data: audioData, error: audioError } = await supabase.storage
        .from('tracks')
        .upload(`${user.id}/${audioFileName}`, selectedAudioFile);
      
      if (audioError) {
        throw new Error(`Error uploading audio: ${audioError.message}`);
      }
      
      // Get the audio URL
      const { data: audioUrl } = supabase.storage
        .from('tracks')
        .getPublicUrl(`${user.id}/${audioFileName}`);
      
      // 2. Upload cover image if provided
      let coverUrl = null;
      if (selectedCoverFile) {
        const coverFileName = `${Date.now()}-${selectedCoverFile.name}`;
        const { data: coverData, error: coverError } = await supabase.storage
          .from('covers')
          .upload(`${user.id}/${coverFileName}`, selectedCoverFile);
        
        if (coverError) {
          throw new Error(`Error uploading cover: ${coverError.message}`);
        }
        
        // Get the cover URL
        const { data: coverUrlData } = supabase.storage
          .from('covers')
          .getPublicUrl(`${user.id}/${coverFileName}`);
        
        coverUrl = coverUrlData.publicUrl;
      }
      
      // 3. Save track metadata to the database
      const { data: trackData, error: trackError } = await supabase
        .from('tracks')
        .insert({
          title: data.title,
          artist: data.artist,
          description: data.description || null,
          audio_url: audioUrl.publicUrl,
          cover_url: coverUrl || 'https://images.unsplash.com/photo-1614149162883-504ce4d13909',
          duration: duration,
          uploaded_by: user.id,
          is_public: true
        })
        .select()
        .single();
      
      if (trackError) {
        throw new Error(`Error saving track metadata: ${trackError.message}`);
      }
      
      // Complete the upload
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      // Create track object for the player
      const newTrack: Track = {
        id: trackData.id,
        title: trackData.title,
        artist: trackData.artist,
        coverUrl: trackData.cover_url,
        duration: trackData.duration,
      };
      
      setUploadedTracks(prev => [...prev, newTrack]);
      setSelectedAudioFile(null);
      setSelectedCoverFile(null);
      setCoverPreview(null);
      form.reset();
      
      toast({
        title: "Upload successful",
        description: "Your track has been uploaded",
        variant: "default",
      });
      
      setTimeout(() => {
        setIsUploading(false);
        navigate('/library');
      }, 1500);
      
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message || "There was an error uploading your track",
        variant: "destructive",
      });
      setIsUploading(false);
    }
  });
  
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
        
        {!selectedAudioFile ? (
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
                accept="audio/*"
                onChange={(e) => handleFileUpload(e.target.files)}
              />
              <label 
                htmlFor="file-upload" 
                className="hover-scale bg-primary text-primary-foreground px-6 py-3 rounded-full cursor-pointer font-medium"
              >
                Select Audio File
              </label>
            </div>
          </div>
        ) : (
          <div className="glass-effect rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Track Details</h2>
            
            <Form {...form}>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-2 space-y-4">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Title</FormLabel>
                          <FormControl>
                            <Input placeholder="Track title" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="artist"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Artist</FormLabel>
                          <FormControl>
                            <Input placeholder="Artist name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description (Optional)</FormLabel>
                          <FormControl>
                            <textarea 
                              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none min-h-[100px]"
                              placeholder="Add a description for your track"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <FileMusic className="w-4 h-4" />
                      <span>Selected file: {selectedAudioFile.name}</span>
                    </div>
                  </div>
                  
                  <div>
                    <Label className="block mb-2">Cover Image</Label>
                    <div className="border border-dashed border-white/20 rounded-lg aspect-square flex flex-col items-center justify-center overflow-hidden">
                      {coverPreview ? (
                        <img 
                          src={coverPreview} 
                          alt="Cover preview"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center p-4 text-center">
                          <Image className="w-10 h-10 text-muted-foreground mb-2" />
                          <p className="text-sm text-muted-foreground mb-2">Upload cover image</p>
                          <p className="text-xs text-muted-foreground mb-4">Recommended size: 1000x1000 px</p>
                        </div>
                      )}
                    </div>
                    
                    <input 
                      type="file" 
                      id="cover-upload" 
                      className="hidden" 
                      accept="image/*"
                      onChange={handleCoverFileChange}
                    />
                    <label 
                      htmlFor="cover-upload" 
                      className="mt-3 inline-flex items-center justify-center w-full bg-secondary text-secondary-foreground px-4 py-2 rounded-md cursor-pointer text-sm font-medium"
                    >
                      {coverPreview ? "Change Cover" : "Upload Cover"}
                    </label>
                  </div>
                </div>
                
                <div className="flex justify-end gap-3">
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => {
                      setSelectedAudioFile(null);
                      setSelectedCoverFile(null);
                      setCoverPreview(null);
                      form.reset();
                    }}
                    disabled={isUploading}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={isUploading}
                    className="gap-2"
                  >
                    {isUploading ? "Uploading..." : "Upload Track"}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        )}
        
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
