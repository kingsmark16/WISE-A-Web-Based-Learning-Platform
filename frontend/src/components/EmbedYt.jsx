import React, { useEffect, useRef, useState, useCallback } from 'react';
import { X } from 'lucide-react';

const EmbedYt = ({ 
  open, 
  onOpenChange, 
  lesson, 
  onNext, 
  hasNext 
}) => {
  const playerRef = useRef(null);
  const playerInstanceRef = useRef(null);
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  const [isAPIReady, setIsAPIReady] = useState(false);

  // Disable body scroll when modal is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [open]);

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
    }

    console.log('Initializing YouTube player with video ID:', lesson.youtubeId);

    const onPlayerReady = (event) => {
      console.log('Player ready, starting playback');
      setIsPlayerReady(true);
      
      // Try to play the video with a small delay
      setTimeout(() => {
        try {
          event.target.playVideo();
        } catch (error) {
          console.error('Error starting playback:', error);
        }
      }, 100);
    };

    const onPlayerStateChange = (event) => {
      const player = event.target;
      console.log('Player state changed:', event.data);
      
      // Update time and duration
      try {
        if (player.getCurrentTime && player.getDuration) {
          // Removed unused state updates
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
    };

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
    }
  }, [lesson?.youtubeId, isAPIReady, hasNext, onNext]);

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
    }
  }, [open]);

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
      }
    }
  }, [lesson?.youtubeId, isPlayerReady]);

  if (!lesson) return null;

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-[70] min-h-screen w-screen"
        onClick={() => onOpenChange(false)}
      />
      
      {/* Modal */}
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[70] w-[95vw] sm:w-[85vw] md:w-[75vw] lg:w-[900px] max-w-[1200px]">
        <div className="bg-white rounded-lg shadow-2xl overflow-hidden">
          {/* YouTube Header */}
          <div className="flex items-center justify-between px-2 sm:px-4 py-1.5 sm:py-2 bg-white border-b border-gray-200">
            <div className="flex items-center">
              <svg className="w-16 h-4 sm:w-20 md:w-24 sm:h-5 md:h-6" viewBox="0 0 90 20" xmlns="http://www.w3.org/2000/svg">
                <g fill="none" fillRule="evenodd">
                  <path fill="#FF0000" d="M27.9727 3.12324C27.6435 1.89323 26.6768 0.926623 25.4468 0.597366C23.2197 0 14.285 0 14.285 0C14.285 0 5.35042 0 3.12323 0.597366C1.89323 0.926623 0.926623 1.89323 0.597366 3.12324C0 5.35042 0 10 0 10C0 10 0 14.6496 0.597366 16.8768C0.926623 18.1068 1.89323 19.0734 3.12323 19.4026C5.35042 20 14.285 20 14.285 20C14.285 20 23.2197 20 25.4468 19.4026C26.6768 19.0734 27.6435 18.1068 27.9727 16.8768C28.5701 14.6496 28.5701 10 28.5701 10C28.5701 10 28.5677 5.35042 27.9727 3.12324Z"/>
                  <path fill="#FFFFFF" d="M11.4253 14.2854L18.8477 10.0004L11.4253 5.71533V14.2854Z"/>
                </g>
              </svg>
            </div>
            <button
              className="h-7 w-7 sm:h-8 sm:w-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-600 transition-colors flex-shrink-0"
              onClick={() => onOpenChange(false)}
            >
              <X className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
          </div>

          {/* Video Player */}
          <div className="bg-black" style={{ aspectRatio: '16/9' }}>
            <div 
              ref={playerRef}
              className="w-full h-full"
              id={`youtube-player-${lesson.youtubeId}`}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default EmbedYt;