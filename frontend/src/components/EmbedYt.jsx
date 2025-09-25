import React, { useEffect, useRef, useState, useCallback } from 'react';
import { X, SkipForward, SkipBack, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
} from '@/components/ui/dialog';

const EmbedYt = ({ 
  open, 
  onOpenChange, 
  lesson, 
  onNext, 
  onPrevious, 
  hasNext, 
  hasPrevious 
}) => {
  const playerRef = useRef(null);
  const playerInstanceRef = useRef(null);
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  const [isAPIReady, setIsAPIReady] = useState(false);
  const [error, setError] = useState(null);
  const [playerState, setPlayerState] = useState({
    playing: false,
    muted: false,
    currentTime: 0,
    duration: 0,
  });

  // Load YouTube IFrame Player API
  useEffect(() => {
    const loadYouTubeAPI = () => {
      if (window.YT && window.YT.Player) {
        console.log('YouTube API already loaded');
        setIsAPIReady(true);
        return;
      }

      if (document.querySelector('script[src*="youtube.com/iframe_api"]')) {
        console.log('YouTube API script already exists, waiting...');
        const checkReady = () => {
          if (window.YT && window.YT.Player) {
            setIsAPIReady(true);
          } else {
            setTimeout(checkReady, 100);
          }
        };
        checkReady();
        return;
      }

      console.log('Loading YouTube API...');
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      tag.async = true;
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

      // Global callback for when API is ready
      window.onYouTubeIframeAPIReady = () => {
        console.log('YouTube IFrame API Ready');
        setIsAPIReady(true);
      };
    };

    loadYouTubeAPI();
  }, []);

  const initializePlayer = useCallback(() => {
    if (!lesson?.youtubeId || !playerRef.current || !isAPIReady) {
      console.log('Cannot initialize player:', { 
        youtubeId: lesson?.youtubeId, 
        playerRef: !!playerRef.current, 
        isAPIReady 
      });
      return;
    }

    // Destroy existing player if any
    if (playerInstanceRef.current) {
      try {
        playerInstanceRef.current.destroy();
      } catch (error) {
        console.warn('Error destroying existing player:', error);
      }
      playerInstanceRef.current = null;
      setIsPlayerReady(false);
      setError(null);
    }

    console.log('Initializing YouTube player with video ID:', lesson.youtubeId);

    try {
      // Clear the container
      playerRef.current.innerHTML = '';
      
      playerInstanceRef.current = new window.YT.Player(playerRef.current, {
        height: '100%',
        width: '100%',
        videoId: lesson.youtubeId,
        playerVars: {
          autoplay: 1,
          controls: 1,
          modestbranding: 1,
          rel: 0, // Don't show related videos
          showinfo: 0,
          fs: 1,
          cc_load_policy: 0,
          iv_load_policy: 3,
          autohide: 0,
          origin: window.location.origin,
          enablejsapi: 1,
          // Additional parameters to prevent recommendations
          playlist: lesson.youtubeId, // Play only this video
          loop: 0, // Don't loop
          disablekb: 0, // Keep keyboard controls
          playsinline: 1,
        },
        events: {
          onReady: onPlayerReady,
          onStateChange: onPlayerStateChange,
          onError: onPlayerError,
        },
      });
    } catch (error) {
      console.error('Error initializing YouTube player:', error);
      setError('Failed to initialize player');
    }
  }, [lesson?.youtubeId, isAPIReady]);

  // Initialize player when dialog opens and everything is ready
  useEffect(() => {
    if (open && lesson?.youtubeId && isAPIReady) {
      // Wait for dialog to be fully rendered
      const timer = setTimeout(() => {
        if (playerRef.current) {
          initializePlayer();
        }
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [open, lesson?.youtubeId, isAPIReady, initializePlayer]);

  // Cleanup when dialog closes
  useEffect(() => {
    if (!open && playerInstanceRef.current) {
      try {
        playerInstanceRef.current.destroy();
      } catch (error) {
        console.warn('Error destroying YouTube player:', error);
      }
      playerInstanceRef.current = null;
      setIsPlayerReady(false);
      setError(null);
    }
  }, [open]);

  const onPlayerReady = (event) => {
    console.log('Player ready, starting playback');
    setIsPlayerReady(true);
    setError(null);
    
    // Try to play the video with a small delay
    setTimeout(() => {
      try {
        event.target.playVideo();
      } catch (error) {
        console.error('Error starting playback:', error);
        setError('Failed to start playback');
      }
    }, 100);
  };

  const onPlayerStateChange = (event) => {
    const player = event.target;
    console.log('Player state changed:', event.data);
    
    setPlayerState(prev => ({
      ...prev,
      playing: event.data === window.YT.PlayerState.PLAYING,
    }));

    // Update time and duration
    try {
      if (player.getCurrentTime && player.getDuration) {
        setPlayerState(prev => ({
          ...prev,
          currentTime: player.getCurrentTime() || 0,
          duration: player.getDuration() || 0,
        }));
      }
    } catch (error) {
      console.warn('Error getting player time:', error);
    }

    // Handle video end - auto advance to next lesson
    if (event.data === window.YT.PlayerState.ENDED && hasNext) {
      setTimeout(() => {
        onNext?.();
      }, 1000);
    }
  };

  const onPlayerError = (event) => {
    console.error('YouTube player error:', event.data);
    const errorMessages = {
      2: 'Invalid video ID',
      5: 'HTML5 player error',
      100: 'Video not found or private',
      101: 'Video not allowed in embedded players',
      150: 'Video not allowed in embedded players',
    };
    const errorMessage = errorMessages[event.data] || 'Unknown error';
    console.error('Error details:', errorMessage);
    setError(errorMessage);
  };

  // Handle lesson change
  const handleNext = () => {
    if (hasNext) {
      onNext?.();
    }
  };

  const handlePrevious = () => {
    if (hasPrevious) {
      onPrevious?.();
    }
  };

  // Update player when lesson changes
  useEffect(() => {
    if (playerInstanceRef.current && isPlayerReady && lesson?.youtubeId) {
      console.log('Loading new video:', lesson.youtubeId);
      try {
        playerInstanceRef.current.loadVideoById({
          videoId: lesson.youtubeId,
          suggestedQuality: 'default'
        });
      } catch (error) {
        console.error('Error loading new video:', error);
        setError('Failed to load video');
      }
    }
  }, [lesson?.youtubeId, isPlayerReady]);

  const toggleMute = () => {
    if (!playerInstanceRef.current || !isPlayerReady) return;

    try {
      if (playerInstanceRef.current.isMuted()) {
        playerInstanceRef.current.unMute();
        setPlayerState(prev => ({ ...prev, muted: false }));
      } else {
        playerInstanceRef.current.mute();
        setPlayerState(prev => ({ ...prev, muted: true }));
      }
    } catch (error) {
      console.error('Error toggling mute:', error);
    }
  };

  if (!lesson) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl w-full h-[80vh] p-0 border-0 shadow-2xl rounded-xl overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <DialogHeader className="px-6 py-3 border-b border-slate-200/60 dark:border-slate-700/60 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/30">
                <svg 
                  className="w-5 h-5 text-red-600 dark:text-red-400" 
                  viewBox="0 0 24 24" 
                  fill="currentColor"
                >
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </div>
              <span className="font-semibold text-lg text-slate-800 dark:text-slate-200">Video Player</span>
            </div>
          </div>
        </DialogHeader>

        <div className="flex flex-col h-full">
          {/* Video Player Container */}
          <div className="flex-1 bg-black relative rounded-lg m-4 overflow-hidden shadow-inner border border-slate-300/20 dark:border-slate-600/20">
            <div 
              ref={playerRef}
              className="w-full h-full rounded-lg overflow-hidden"
              style={{ minHeight: '400px' }}
              id={`youtube-player-${lesson.youtubeId}`}
            />
            
            {/* Loading overlay */}
            {(!isAPIReady || !isPlayerReady) && !error && lesson.youtubeId && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm rounded-lg">
                <div className="text-white text-center p-6 rounded-xl bg-black/40 border border-white/10">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-white/30 border-t-white mx-auto mb-3"></div>
                  <div className="text-sm font-medium">
                    {!isAPIReady ? 'Loading YouTube API...' : 'Loading player...'}
                  </div>
                </div>
              </div>
            )}

            {/* Error overlay */}
            {error && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/75 backdrop-blur-sm rounded-lg">
                <div className="text-white text-center p-6 rounded-xl bg-red-900/40 border border-red-500/20">
                  <div className="text-red-400 mb-2 font-semibold">Error</div>
                  <div className="text-sm mb-4">{error}</div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-white/20 text-white hover:bg-white/10 hover:border-white/30"
                    onClick={() => {
                      setError(null);
                      if (isAPIReady) {
                        initializePlayer();
                      }
                    }}
                  >
                    Retry
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Controls Bar */}
          <div className="px-6 py-4 bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm border-t border-slate-200/60 dark:border-slate-700/60">
            <div className="flex items-center justify-between gap-4">
              {/* Lesson Navigation */}
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePrevious}
                  disabled={!hasPrevious}
                  className="border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-sm"
                >
                  <SkipBack className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNext}
                  disabled={!hasNext}
                  className="border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-sm"
                >
                  <SkipForward className="h-4 w-4" />
                </Button>
              </div>

              {/* Lesson Info */}
              <div className="flex-1 text-center">
                <div className="font-medium text-sm text-slate-800 dark:text-slate-200 bg-slate-100/50 dark:bg-slate-800/50 px-4 py-2 rounded-lg border border-slate-200/50 dark:border-slate-700/50 shadow-sm">
                  {lesson.title}
                </div>
              </div>

              {/* Player Controls */}
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleMute}
                  disabled={!isPlayerReady}
                  className="hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 shadow-sm"
                >
                  {playerState.muted ? (
                    <VolumeX className="h-4 w-4" />
                  ) : (
                    <Volume2 className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EmbedYt;