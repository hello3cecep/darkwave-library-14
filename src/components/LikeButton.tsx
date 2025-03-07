
import React, { useState } from 'react';
import { Heart } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface LikeButtonProps {
  trackId: string;
  isLiked?: boolean;
  size?: 'sm' | 'md';
}

const LikeButton: React.FC<LikeButtonProps> = ({ trackId, isLiked = false, size = 'md' }) => {
  const [liked, setLiked] = useState(isLiked);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const handleLikeClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!user) {
      toast({
        title: 'Authentication required',
        description: 'Please sign in to like tracks',
        variant: 'destructive'
      });
      return;
    }
    
    try {
      setIsLoading(true);
      
      if (liked) {
        // Unlike the track
        const { error } = await supabase
          .from('likes')
          .delete()
          .eq('user_id', user.id)
          .eq('track_id', trackId);
          
        if (error) throw error;
        setLiked(false);
      } else {
        // Like the track
        const { error } = await supabase
          .from('likes')
          .insert({
            user_id: user.id,
            track_id: trackId
          });
          
        if (error) throw error;
        setLiked(true);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      toast({
        title: 'Something went wrong',
        description: 'Could not update like status',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant="ghost"
      size={size === 'sm' ? 'icon' : 'default'}
      className={`rounded-full ${liked ? 'text-primary' : 'text-muted-foreground'} hover:text-primary transition-colors`}
      onClick={handleLikeClick}
      disabled={isLoading}
    >
      <Heart className={`${size === 'sm' ? 'h-4 w-4' : 'h-5 w-5'} ${liked ? 'fill-current' : ''}`} />
    </Button>
  );
};

export default LikeButton;
