import { Pin, Lock, MessageCircle, ThumbsUp, Trash2, Edit } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { useUser } from '@clerk/clerk-react';

const PostCard = ({ post, categories, onView, onDelete, onEdit }) => {
  const { user } = useUser();
  const isAuthor = user?.id === post.author?.clerkId;
  const getCategoryColor = (categoryName) => {
    return categories.find(c => c.name === categoryName)?.color || 'bg-gray-500';
  };

  const getCategoryName = (categoryName) => {
    return categoryName || 'Uncategorized';
  };

  return (
    <Card className="hover:bg-accent/50 transition-colors">
      <CardContent className="pt-6">
        <div className="flex items-start gap-4">
          <Avatar>
            <AvatarImage src={post.author?.imageUrl} />
            <AvatarFallback>{post.author?.fullName?.split(' ').map(n => n[0]).join('') || '?'}</AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex items-start gap-2 mb-2">
              {post.isPinned && <Pin className="h-4 w-4 text-primary flex-shrink-0 mt-1" />}
              {post.isLocked && <Lock className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-1" />}
              <h5 
                className="font-semibold text-base hover:text-primary transition-colors cursor-pointer flex-1"
                onClick={() => onView(post)}
              >
                {post.title}
              </h5>
              {isAuthor && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-foreground"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(post);
                  }}
                >
                  <Edit className="h-4 w-4" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(post);
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>

            <p className="text-sm text-muted-foreground mb-3 line-clamp-1">
              {post.excerpt}
            </p>

            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
              <span>by <span className="font-medium text-foreground">{post.author?.fullName || 'Unknown'}</span></span>
              <Separator orientation="vertical" className="h-4" />
              {post.category && (
                <Badge variant="outline" className={`${getCategoryColor(post.category)} text-white border-none`}>
                  {getCategoryName(post.category)}
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <MessageCircle className="h-4 w-4" />
                <span>{post.replies}</span>
              </div>
              <div className="flex items-center gap-1">
                <ThumbsUp className="h-4 w-4" />
                <span>{post.likeCount}</span>
              </div>
              <Separator orientation="vertical" className="h-4" />
              <span>{post.lastActivity}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PostCard;