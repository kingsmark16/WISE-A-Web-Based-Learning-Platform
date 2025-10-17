import { Pin, Lock, MessageCircle, ThumbsUp, Trash2, Edit } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useUser } from '@clerk/clerk-react';

const PostCard = ({ post, categories, onView, onDelete, onEdit, onPin, onLock }) => {
  const { user } = useUser();
  const isAuthor = user?.id === post.author?.clerkId;
  const userRole = user?.publicMetadata?.role;
  const canModerate = userRole === 'ADMIN' || userRole === 'FACULTY';
  const getCategoryColor = (categoryName) => {
    const color = categories.find(c => c.name === categoryName)?.color || '#64748b';
    console.log('Category:', categoryName, 'Color:', color);
    return color;
  };

  const getCategoryName = (categoryName) => {
    return categoryName || 'Uncategorized';
  };

  return (
    <Card className="hover:bg-accent/50 transition-colors">
      <CardContent className="pt-3 sm:pt-4 md:pt-6 pb-3 sm:pb-4 md:pb-6 px-3 sm:px-4 md:px-6">
        <div className="flex items-start gap-2 sm:gap-3 md:gap-4">
          <Avatar className="h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10 flex-shrink-0">
            <AvatarImage src={post.author?.imageUrl} />
            <AvatarFallback className="text-xs sm:text-sm">{post.author?.fullName?.split(' ').map(n => n[0]).join('') || '?'}</AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex items-start gap-1 sm:gap-2 mb-1 sm:mb-2">
              {post.isPinned && <Pin className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4 text-primary flex-shrink-0 mt-0.5 sm:mt-1" />}
              {post.isLocked && <Lock className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4 text-muted-foreground flex-shrink-0 mt-0.5 sm:mt-1" />}
              <h5 
                className="font-semibold text-sm sm:text-base hover:text-primary transition-colors cursor-pointer flex-1 line-clamp-2"
                onClick={() => onView(post)}
              >
                {post.title}
              </h5>
            </div>
            
            {/* Action buttons - On separate line on mobile */}
            <div className="flex items-center gap-0.5 sm:gap-1 flex-wrap mb-1 sm:mb-2">
              {canModerate && (
                <>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className={`transition-all h-7 w-7 sm:h-8 sm:w-8 p-0 ${
                            post.isPinned 
                              ? 'text-primary bg-primary/10 hover:bg-primary/20' 
                              : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                          }`}
                          onClick={(e) => {
                            e.stopPropagation();
                            onPin?.(post);
                          }}
                        >
                          <Pin className={`h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4 ${post.isPinned ? 'fill-current' : ''}`} />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        {post.isPinned ? 'Unpin Post' : 'Pin Post'}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className={`transition-all h-7 w-7 sm:h-8 sm:w-8 p-0 ${
                            post.isLocked 
                              ? 'text-destructive bg-destructive/10 hover:bg-destructive/20' 
                              : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                          }`}
                          onClick={(e) => {
                            e.stopPropagation();
                            onLock?.(post);
                          }}
                        >
                          <Lock className={`h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4 ${post.isLocked ? 'fill-current' : ''}`} />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        {post.isLocked ? 'Unlock Post' : 'Lock Post'}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </>
              )}
              {isAuthor && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-muted-foreground hover:text-foreground h-7 w-7 sm:h-8 sm:w-8 p-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEdit(post);
                        }}
                      >
                        <Edit className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Edit Post</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive hover:bg-destructive/10 h-7 w-7 sm:h-8 sm:w-8 p-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(post);
                      }}
                    >
                      <Trash2 className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Delete Post</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            <p className="text-xs sm:text-sm text-muted-foreground mb-2 sm:mb-3 line-clamp-2 sm:line-clamp-1">
              {post.excerpt}
            </p>

            <div className="flex flex-wrap items-center gap-2 sm:gap-3 md:gap-4 text-xs sm:text-sm text-muted-foreground mb-2 sm:mb-3">
              <span className="truncate max-w-[150px] sm:max-w-none">by <span className="font-medium text-foreground">{post.author?.fullName || 'Unknown'}</span></span>
              <Separator orientation="vertical" className="h-3 sm:h-4 hidden sm:block" />
              {post.category && (
                <span 
                  style={{ 
                    backgroundColor: getCategoryColor(post.category), 
                    color: '#ffffff',
                    border: 'none'
                  }} 
                  className="text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded-md font-medium inline-flex items-center"
                >
                  {getCategoryName(post.category)}
                </span>
              )}
            </div>

            <div className="flex items-center gap-3 sm:gap-4 md:gap-6 text-xs sm:text-sm text-muted-foreground flex-wrap">
              <div className="flex items-center gap-1">
                <MessageCircle className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4" />
                <span>{post.replies}</span>
              </div>
              <div className="flex items-center gap-1">
                <ThumbsUp className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4" />
                <span>{post.likeCount}</span>
              </div>
              <Separator orientation="vertical" className="h-3 sm:h-4 hidden sm:block" />
              <span className="text-[10px] sm:text-xs md:text-sm truncate">{post.lastActivity}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PostCard;