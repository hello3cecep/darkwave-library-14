
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface UseLikesReturn {
  likedTrackIds: string[];
  isTrackLiked: (trackId: string) => boolean;
  isLoading: boolean;
}

export function useLikes(): UseLikesReturn {
  const [likedTrackIds, setLikedTrackIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { user } = useAuth();

  useEffect(() => {
    async function fetchLikes() {
      if (!user) {
        setLikedTrackIds([]);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('likes')
          .select('track_id')
          .eq('user_id', user.id);

        if (error) {
          console.error('Error fetching likes:', error);
          return;
        }

        setLikedTrackIds(data.map(like => like.track_id));
      } catch (error) {
        console.error('Error in fetchLikes:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchLikes();
  }, [user]);

  const isTrackLiked = (trackId: string): boolean => {
    return likedTrackIds.includes(trackId);
  };

  return {
    likedTrackIds,
    isTrackLiked,
    isLoading
  };
}
