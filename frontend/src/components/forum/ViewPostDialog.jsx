import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { 
  Pin,
  Lock,
  MessageSquare, 
  ThumbsUp, 
  Edit, 
  Trash2,
  Send,
  Loader2,
  ArrowUpDown,
  ArrowDown,
  ArrowUp
} from 'lucide-react';
import { useUser } from '@clerk/clerk-react';
import { useCreateReply } from '../../hooks/forum/useCreateReply';
import { useGetPostWithReplies } from '../../hooks/forum/useGetPostWithReplies';
import { useLikePost } from '../../hooks/forum/useLikePost';
import { toast } from 'react-toastify';
import axiosInstance from '../../lib/axios';
import { useSocket } from '../../contexts/SocketContext';
import DeleteReplyDialog from './DeleteReplyDialog';

const ViewPostDialog = ({ open, onOpenChange, post, categories, onEditPost }) => {
  const { user } = useUser();
  const { socket } = useSocket();
  const [replyContent, setReplyContent] = useState('');
  const [repliesCursor, setRepliesCursor] = useState(null);
  const [allReplies, setAllReplies] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const scrollContainerRef = React.useRef(null);
  const hasScrolledRef = React.useRef(false);
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);
  const [sortOrder, setSortOrder] = useState('oldest');
  const [showNewRepliesButton, setShowNewRepliesButton] = useState(false);
  const [newRepliesCount, setNewRepliesCount] = useState(0);
  const [showNewRepliesTopButton, setShowNewRepliesTopButton] = useState(false);
  const [newRepliesTopCount, setNewRepliesTopCount] = useState(0);
  const [deleteReplyObject, setDeleteReplyObject] = useState(null);
  const [isDeletingReply, setIsDeletingReply] = useState(false);
  
  const createReplyMutation = useCreateReply();
  const likePostMutation = useLikePost();

  // Fetch post with initial replies when dialog opens
  const { data: postData, isLoading } = useGetPostWithReplies(post?.id, {
    enabled: open && !!post?.id,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    staleTime: Infinity,
  });

  // Reset state when dialog opens/closes
  React.useEffect(() => {
    if (open && postData) {
      setAllReplies(postData.replies || []);
      setRepliesCursor(postData.nextCursor);
      setHasMore(!!postData.nextCursor);
      setLikeCount(postData.post?._count?.likedBy || 0);
      setIsLiked(postData.post?.isLiked || false);
      setIsPinned(postData.post?.isPinned || false);
      setIsLocked(postData.post?.isLocked || false);
      hasScrolledRef.current = false; // Reset scroll flag
      setShowNewRepliesButton(false);
      setNewRepliesCount(0);
      setShowNewRepliesTopButton(false);
      setNewRepliesTopCount(0);
      
      // Add history state when modal opens to handle back button
      window.history.pushState({ modalOpen: true }, '');
    } else if (!open) {
      setAllReplies([]);
      setRepliesCursor(null);
      setHasMore(true);
      setLikeCount(0);
      setIsLiked(false);
      setIsPinned(false);
      setIsLocked(false);
      hasScrolledRef.current = false;
      setShowNewRepliesButton(false);
      setNewRepliesCount(0);
      setShowNewRepliesTopButton(false);
      setNewRepliesTopCount(0);
    }
  }, [open, postData]);

  // Handle browser back button to close modal instead of navigating away
  React.useEffect(() => {
    const handlePopState = () => {
      // If modal is open and back button is pressed, close the modal
      if (open) {
        onOpenChange(false);
        // Re-push the state to keep the user on the forum page
        window.history.pushState(null, '');
      }
    };

    // Only add listener when modal is open
    if (open) {
      window.addEventListener('popstate', handlePopState);
    }

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [open, onOpenChange]);

  // Socket.IO real-time updates
  React.useEffect(() => {
    if (!socket || !open || !post?.id) return;

    const currentUserId = user?.id;
    const currentPostId = post.id;

    // Join the post room
    socket.emit('join-post', currentPostId);
    
    // Listen for new replies from other users
    const handleNewReply = (data) => {
      if (data.postId === currentPostId) {
        // Check if reply is from current user (already added optimistically)
        const isOwnReply = data.reply.author?.clerkId === currentUserId;
        if (!isOwnReply) {
          setAllReplies(prev => {
            // Check if reply already exists to prevent duplicates
            const exists = prev.some(reply => reply.id === data.reply.id);
            if (exists) return prev;
            
            // Add reply in correct position based on sort order
            if (sortOrder === 'newest') {
              // For newest first, add to beginning
              return [data.reply, ...prev];
            } else {
              // For oldest first, add to end
              return [...prev, data.reply];
            }
          });
          
          // Show button based on sort order and scroll position
          setTimeout(() => {
            if (scrollContainerRef.current) {
              const element = scrollContainerRef.current;
              const currentScrollTop = element.scrollTop;
              const scrollHeight = element.scrollHeight;
              const clientHeight = element.clientHeight;
              
              if (sortOrder === 'oldest') {
                // For oldest first, show button at bottom if not at bottom
                const isAtBottom = scrollHeight - currentScrollTop <= clientHeight;
                
                if (!isAtBottom) {
                  setNewRepliesCount(prev => prev + 1);
                  setShowNewRepliesButton(true);
                }
              } else {
                // For newest first, show button at top if not at top
                const isAtTop = currentScrollTop <= 5;
                
                if (!isAtTop) {
                  setNewRepliesTopCount(prev => prev + 1);
                  setShowNewRepliesTopButton(true);
                }
              }
            }
          }, 100);
          
          // Show toast notification
          toast.info(`New reply from ${data.reply.author?.fullName || 'Someone'}`);
        }
      }
    };

    // Listen for deleted replies
    const handleDeleteReply = (data) => {
      if (data.postId === currentPostId) {
        setAllReplies(prev => prev.filter(r => r.id !== data.replyId));
      }
    };

    socket.on('new-reply', handleNewReply);
    socket.on('delete-reply', handleDeleteReply);

    // Cleanup
    return () => {
      socket.emit('leave-post', currentPostId);
      socket.off('new-reply', handleNewReply);
      socket.off('delete-reply', handleDeleteReply);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket, open, post?.id, sortOrder]); // Added sortOrder to dependencies

  // Restore scroll position when dialog reopens
  React.useEffect(() => {
    if (open && scrollContainerRef.current && !hasScrolledRef.current && allReplies.length > 0) {
      // Only scroll once when dialog opens
      hasScrolledRef.current = true;
      // Removed auto-scroll to newest replies - user prefers to start at top
      // setTimeout(() => {
      //   if (scrollContainerRef.current) {
      //     scrollContainerRef.current.scrollTo({
      //       top: scrollContainerRef.current.scrollHeight,
      //       behavior: 'smooth'
      //     });
      //   }
      // }, 100);
    }
  }, [open, allReplies.length]);

  if (!post) return null;

  const category = categories.find((c) => c.name === post.category);
  console.log('ViewPostDialog - Category:', post.category, 'Found:', category);

  // Check if current user is the author or admin/faculty
  const isAuthor = user?.id === post.author?.clerkId;

  const handleLike = async () => {
    if (!post.id) return;
    
    // Optimistic update
    setIsLiked(!isLiked);
    setLikeCount(prev => isLiked ? prev - 1 : prev + 1);
    
    try {
      await likePostMutation.mutateAsync({ postId: post.id });
    } catch (error) {
      // Revert on error
      setIsLiked(isLiked);
      setLikeCount(prev => isLiked ? prev + 1 : prev - 1);
      console.error('Failed to like post:', error);
      toast.error('Failed to like post');
    }
  };

  const loadMoreReplies = async () => {
    if (!repliesCursor || loadingMore) return;
    
    setLoadingMore(true);
    try {
      const response = await axiosInstance.get(
        `/course/forum/posts/${post.id}?cursor=${repliesCursor}&limit=5`
      );
      
      // Store current scroll position before updating replies
      const currentScrollTop = scrollContainerRef.current?.scrollTop || 0;
      
      setAllReplies(prev => {
        // Filter out any replies that already exist to prevent duplicates
        const newReplies = (response.data.replies || []).filter(newReply => 
          !prev.some(existingReply => existingReply.id === newReply.id)
        );
        return [...prev, ...newReplies];
      });
      setRepliesCursor(response.data.nextCursor);
      setHasMore(!!response.data.nextCursor);
      
      // Restore scroll position after DOM updates
      setTimeout(() => {
        if (scrollContainerRef.current) {
          scrollContainerRef.current.scrollTop = currentScrollTop;
        }
      }, 50);
    } catch (error) {
      console.error('Failed to load more replies:', error);
      toast.error('Failed to load more replies');
    } finally {
      setLoadingMore(false);
    }
  };

  // Handle scroll to bottom
  const handleScroll = (e) => {
    const element = e.target;
    const currentScrollTop = element.scrollTop;
    
    const isBottom = element.scrollHeight - currentScrollTop <= element.clientHeight + 100;
    const isTop = currentScrollTop <= 5;
    
    // Hide new replies button if user scrolls to bottom (for oldest first)
    if (isBottom) {
      setShowNewRepliesButton(false);
      setNewRepliesCount(0);
    }
    
    // Hide new replies top button if user scrolls to top (for newest first)
    if (isTop) {
      setShowNewRepliesTopButton(false);
      setNewRepliesTopCount(0);
    }
    
    if (isBottom && hasMore && !loadingMore) {
      loadMoreReplies();
    }
  };

  const handleScrollToBottom = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        top: scrollContainerRef.current.scrollHeight,
        behavior: 'smooth'
      });
      setShowNewRepliesButton(false);
      setNewRepliesCount(0);
    }
  };

  const handleScrollToTop = async () => {
    // If there are more replies to load, load them all first
    if (hasMore && repliesCursor) {
      await loadAllRemainingReplies();
    }
    
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
      setShowNewRepliesTopButton(false);
      setNewRepliesTopCount(0);
    }
  };

  const handleDeleteReply = async (reply) => {
    setIsDeletingReply(true);
    
    try {
      await axiosInstance.delete(`/course/forum/posts/${post.id}/replies/${reply.id}`);
      
      // Optimistically remove from UI
      setAllReplies(prev => prev.filter(r => r.id !== reply.id));
      toast.success('Reply deleted successfully');
      
      // Socket.IO will handle broadcasting to other users
    } catch (error) {
      console.error('Failed to delete reply:', error);
      toast.error('Failed to delete reply. Please try again.');
    } finally {
      setIsDeletingReply(false);
      setDeleteReplyObject(null);
    }
  };

  const handleReplySubmit = async (e) => {
    e.preventDefault();
    
    if (!replyContent.trim() || isSubmittingReply || createReplyMutation.isPending) {
      return;
    }

    setIsSubmittingReply(true);
    
    try {
      // If there are more replies to load, load them all first
      if (hasMore && repliesCursor) {
        await loadAllRemainingReplies();
      }
      
      const response = await createReplyMutation.mutateAsync({
        postId: post.id,
        content: replyContent.trim(),
      });

      // Immediately add the new reply to the list (with deduplication)
      // Backend returns the reply directly, not wrapped in { reply: ... }
      if (response && response.id) {
        setAllReplies(prev => {
          // Check if reply already exists to prevent duplicates
          const exists = prev.some(reply => reply.id === response.id);
          if (exists) return prev;
          
          return [...prev, response];
        });
        
        // Scroll to bottom after reply is added (only if sorted by oldest)
        if (sortOrder === 'oldest') {
          setTimeout(() => {
            if (scrollContainerRef.current) {
              scrollContainerRef.current.scrollTo({
                top: scrollContainerRef.current.scrollHeight,
                behavior: 'smooth'
              });
            }
          }, 100);
        }
        
        // Reset new replies button since user just posted
        setShowNewRepliesButton(false);
        setNewRepliesCount(0);
      }

      setReplyContent('');
    } catch (error) {
      console.error('Failed to post reply:', error);
      toast.error('Failed to post reply. Please try again.');
    } finally {
      setIsSubmittingReply(false);
    }
  };

  const loadAllRemainingReplies = async () => {
    let cursor = repliesCursor;
    let allNewReplies = [];
    
    while (cursor) {
      try {
        const response = await axiosInstance.get(
          `/course/forum/posts/${post.id}?cursor=${cursor}&limit=5`
        );
        
        allNewReplies = [...allNewReplies, ...(response.data.replies || [])];
        cursor = response.data.nextCursor;
      } catch (error) {
        console.error('Failed to load remaining replies:', error);
        break;
      }
    }
    
    if (allNewReplies.length > 0) {
      setAllReplies(prev => [...prev, ...allNewReplies]);
    }
    setRepliesCursor(null);
    setHasMore(false);
  };

  const replies = [...allReplies].sort((a, b) => {
    const dateA = new Date(a.createdAt);
    const dateB = new Date(b.createdAt);

    // Handle invalid dates by treating them as equal (maintain original order)
    if (isNaN(dateA.getTime()) && isNaN(dateB.getTime())) return 0;
    if (isNaN(dateA.getTime())) return 1; // Move invalid dates to end
    if (isNaN(dateB.getTime())) return -1; // Move invalid dates to end

    return sortOrder === 'newest'
      ? dateB.getTime() - dateA.getTime()  // Newest first
      : dateA.getTime() - dateB.getTime(); // Oldest first
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
  <DialogContent className="max-w-full sm:max-w-[95vw] md:max-w-6xl h-[100dvh] sm:h-[95vh] flex flex-col overflow-hidden pt-2 pb-2 sm:pt-4 sm:pb-6 px-2 sm:px-6 gap-1">
  <DialogHeader className="px-2 sm:px-6 pt-2 sm:pt-0 pb-2 sm:pb-4 flex-shrink-0">
          <DialogTitle className="sr-only">View Post</DialogTitle>
        </DialogHeader>

  <div className="flex-1 overflow-y-auto scrollbar-hide pt-2 pb-3 sm:pb-6 px-2 sm:px-1 min-h-0" onScroll={handleScroll} ref={scrollContainerRef}>
          {/* Post Header */}
          <div className="space-y-3 sm:space-y-4 px-0 sm:px-1">
            {/* Title and Badges - Full width on mobile */}
            <div className="space-y-1.5 sm:space-y-2 pr-1 sm:pr-0 min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                {category && (
                  <span 
                    style={{ 
                      backgroundColor: category.color, 
                      color: '#ffffff',
                      border: 'none'
                    }} 
                    className="text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded-md font-medium inline-flex items-center flex-shrink-0"
                  >
                    {category.name}
                  </span>
                )}
                {isPinned && (
                  <Badge variant="secondary" className="gap-1 text-[10px] sm:text-xs px-1.5 sm:px-2 flex-shrink-0">
                    <Pin className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                    <span className="hidden xs:inline">Pinned</span>
                  </Badge>
                )}
                {isLocked && (
                  <Badge variant="secondary" className="gap-1 text-[10px] sm:text-xs px-1.5 sm:px-2 flex-shrink-0">
                    <Lock className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                    <span className="hidden xs:inline">Locked</span>
                  </Badge>
                )}
              </div>
              <h2 className="text-sm sm:text-lg md:text-xl font-bold break-words leading-tight sm:leading-normal">{post.title}</h2>
            </div>
            
            {/* Action buttons - Below title on mobile, inline on desktop */}
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap sm:flex-nowrap sm:justify-end pt-2 sm:pt-0 border-t sm:border-t-0">
              {isAuthor && onEditPost && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    onEditPost(post);
                    onOpenChange(false);
                  }}
                  className="gap-1 sm:gap-2 h-8 sm:h-9 px-2 sm:px-3 text-xs sm:text-sm"
                >
                  <Edit className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4" />
                  <span className="hidden sm:inline">Edit</span>
                  <span className="sm:hidden">Edit</span>
                </Button>
              )}
            </div>

          {/* Author Info and Like Button */}
          <div className="flex items-center justify-between gap-2 sm:gap-3 flex-wrap">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
              <Avatar className="h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10 flex-shrink-0">
                <AvatarImage src={post.author?.imageUrl} />
                <AvatarFallback className="text-xs sm:text-sm">
                  {post.author?.fullName?.charAt(0).toUpperCase() || '?'}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="font-medium text-sm sm:text-base truncate">{post.author?.fullName || 'Unknown'}</p>
                <p className="text-xs sm:text-sm text-muted-foreground truncate">{post.lastActivity}</p>
              </div>
            </div>
          </div>

          {/* Post Content */}
          <div className="prose prose-sm max-w-none text-xs sm:text-sm">
            <p className="whitespace-pre-wrap">{post.content}</p>
          </div>

          {/* Like Button and Reply Count */}
          <div className="flex items-center gap-3 sm:gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLike}
              disabled={likePostMutation.isPending}
              className={`gap-1.5 sm:gap-2 transition-all h-8 sm:h-9 px-2 sm:px-3 ${isLiked ? 'text-primary' : 'text-muted-foreground'}`}
            >
              <ThumbsUp className={`h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4 transition-all ${isLiked ? 'fill-current' : ''} ${likePostMutation.isPending ? 'animate-pulse' : ''}`} />
              <span className="text-xs sm:text-sm">{likeCount}</span>
            </Button>
            <div className="flex items-center gap-1 text-xs sm:text-sm text-muted-foreground">
              <MessageSquare className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4" />
              <span>{allReplies.length}</span>
            </div>
          </div>

          <Separator />

          {/* Replies Section */}
          <div className="space-y-3 sm:space-y-4">
            <div className="flex items-center justify-between gap-2">
              <h3 className="font-semibold text-sm sm:text-base">Replies</h3>
              <button
                onClick={() => {
                  const newSortOrder = sortOrder === 'oldest' ? 'newest' : 'oldest';
                  setSortOrder(newSortOrder);
                  
                  // Scroll to appropriate position when sorting changes
                  setTimeout(() => {
                    if (scrollContainerRef.current) {
                      // Always scroll to top when changing sort order to show the primary replies
                      scrollContainerRef.current.scrollTo({
                        top: 0,
                        behavior: 'smooth'
                      });
                    }
                  }, 100);
                }}
                className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-colors"
              >
                <ArrowUpDown className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4" />
                <span className="hidden sm:inline">{sortOrder === 'oldest' ? 'Oldest First' : 'Newest First'}</span>
                <span className="sm:hidden">{sortOrder === 'oldest' ? 'Oldest' : 'Newest'}</span>
              </button>
            </div>

            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                <p className="text-sm">Loading replies...</p>
              </div>
            ) : replies.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No replies yet. Be the first to respond!</p>
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  {replies.map((reply) => {
                    const isReplyAuthor = user?.id === reply.author?.clerkId;
                    
                    return (
                      <div key={reply.id} className="flex gap-3 p-4 rounded-lg border bg-card">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={reply.author?.imageUrl} />
                          <AvatarFallback>
                            {reply.author?.fullName?.charAt(0).toUpperCase() || '?'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-sm">{reply.author?.fullName || 'Unknown'}</p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(reply.createdAt).toLocaleString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </p>
                            </div>
                            {isReplyAuthor && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setDeleteReplyObject(reply)}
                                className="h-8 w-8 p-0"
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            )}
                          </div>
                          <p className="text-sm whitespace-pre-wrap">{reply.content}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                {/* Loading indicator when fetching more replies */}
                {loadingMore && (
                  <div className="text-center py-4 text-muted-foreground">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                    <p className="text-sm">Loading more replies...</p>
                  </div>
                )}
              </>
            )}
          </div>
          </div>
        </div>

        {/* New Replies Button at Top - For newest first sort */}
        {showNewRepliesTopButton && newRepliesTopCount > 0 && sortOrder === 'newest' && (
          <div className="absolute top-12 sm:top-16 left-1/2 transform -translate-x-1/2 z-10">
            <Button
              onClick={handleScrollToTop}
              className="shadow-lg bg-primary hover:bg-primary/90 text-primary-foreground gap-1.5 sm:gap-2 rounded-full px-3 py-1.5 sm:px-4 sm:py-2 animate-bounce text-xs sm:text-sm"
              size="sm"
            >
              <ArrowUp className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4" />
              <span className="hidden sm:inline">{newRepliesTopCount} new {newRepliesTopCount === 1 ? 'reply' : 'replies'}</span>
              <span className="sm:hidden">{newRepliesTopCount}</span>
            </Button>
          </div>
        )}

        {/* New Replies Button at Bottom - For oldest first sort */}
        {showNewRepliesButton && newRepliesCount > 0 && sortOrder === 'oldest' && (
          <div className="absolute bottom-16 sm:bottom-20 md:bottom-28 left-1/2 transform -translate-x-1/2 z-10">
            <Button
              onClick={handleScrollToBottom}
              className="shadow-lg bg-primary hover:bg-primary/90 text-primary-foreground gap-1.5 sm:gap-2 rounded-full px-3 py-1.5 sm:px-4 sm:py-2 animate-bounce text-xs sm:text-sm"
              size="sm"
            >
              <ArrowDown className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4" />
              <span className="hidden sm:inline">{newRepliesCount} new {newRepliesCount === 1 ? 'reply' : 'replies'}</span>
              <span className="sm:hidden">{newRepliesCount}</span>
            </Button>
          </div>
        )}

        {/* Reply Form - Fixed at bottom */}
        {!isLocked && (
          <div className="border-t bg-background p-2 sm:p-3 md:p-4 flex-shrink-0">
            <form onSubmit={handleReplySubmit} className="space-y-2 sm:space-y-3">
              <Textarea
                placeholder="Write a reply..."
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                rows={2}
                disabled={createReplyMutation.isPending || isSubmittingReply}
                className="resize-none min-h-[60px] sm:min-h-[72px] max-h-[60px] sm:max-h-[72px] overflow-y-auto text-sm"
              />
              <div className="flex justify-end">
                <Button 
                  type="submit" 
                  disabled={createReplyMutation.isPending || isSubmittingReply || !replyContent.trim()}
                  className="gap-1.5 sm:gap-2 h-8 sm:h-9 px-3 sm:px-4 text-xs sm:text-sm"
                >
                  {createReplyMutation.isPending || isSubmittingReply ? (
                    <>
                      <Loader2 className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4 animate-spin" />
                      <span className="hidden sm:inline">Posting...</span>
                      <span className="sm:hidden">Post...</span>
                    </>
                  ) : (
                    <>
                      <Send className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4" />
                      <span className="hidden sm:inline">Post Reply</span>
                      <span className="sm:hidden">Reply</span>
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        )}
        
        {/* Locked Post Message */}
        {isLocked && (
          <div className="border-t bg-muted/50 p-2 sm:p-3 md:p-4 flex-shrink-0">
            <div className="flex items-center justify-center gap-1.5 sm:gap-2 text-muted-foreground">
              <Lock className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4 flex-shrink-0" />
              <p className="text-xs sm:text-sm text-center">This post is locked. No new replies can be added.</p>
            </div>
          </div>
        )}
      </DialogContent>

      {/* Delete Reply Dialog */}
      <DeleteReplyDialog
        open={!!deleteReplyObject}
        onOpenChange={() => setDeleteReplyObject(null)}
        onConfirm={handleDeleteReply}
        reply={deleteReplyObject}
        isLoading={isDeletingReply}
      />
    </Dialog>
  );
};

export default ViewPostDialog;
