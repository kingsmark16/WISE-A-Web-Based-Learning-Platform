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
  Send 
} from 'lucide-react';
import { useUser } from '@clerk/clerk-react';
import { useCreateReply } from '../../hooks/forum/useCreateReply';
import { useGetPostWithReplies } from '../../hooks/forum/useGetPostWithReplies';
import { toast } from 'react-toastify';

const ViewPostDialog = ({ open, onOpenChange, post, categories, onDeleteReply, onEditPost }) => {
  const { user } = useUser();
  const [replyContent, setReplyContent] = useState('');
  const createReplyMutation = useCreateReply();

  // Fetch post with replies when dialog opens
  const { data: postData, isLoading } = useGetPostWithReplies(post?.id, {
    enabled: open && !!post?.id
  });

  if (!post) return null;

  const category = categories.find((c) => c.id === post.category) || categories[0];

  // Check if current user is the author
  const isAuthor = user?.id === post.authorId;

  const handleReplySubmit = async (e) => {
    e.preventDefault();
    
    if (!replyContent.trim()) {
      toast.error('Reply content is required');
      return;
    }

    const toastId = toast.loading('Posting reply...');

    try {
      await createReplyMutation.mutateAsync({
        postId: post.id,
        content: replyContent.trim(),
      });

      toast.update(toastId, {
        render: 'Reply posted successfully',
        type: 'success',
        isLoading: false,
        autoClose: 3000,
      });

      setReplyContent('');
    } catch (error) {
      console.error('Failed to post reply:', error);
      toast.update(toastId, {
        render: 'Failed to post reply. Please try again.',
        type: 'error',
        isLoading: false,
        autoClose: 3000,
      });
    }
  };

  const replies = postData?.replies || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="sr-only">View Post</DialogTitle>
        </DialogHeader>

        {/* Post Header */}
        <div className="space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge className={category.color}>{category.name}</Badge>
                {post.isPinned && (
                  <Badge variant="secondary" className="gap-1">
                    <Pin className="h-3 w-3" />
                    Pinned
                  </Badge>
                )}
                {post.isLocked && (
                  <Badge variant="secondary" className="gap-1">
                    <Lock className="h-3 w-3" />
                    Locked
                  </Badge>
                )}
              </div>
              <h2 className="text-2xl font-bold">{post.title}</h2>
            </div>
            
            {/* Edit button - only show if user is the author */}
            {isAuthor && onEditPost && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  onEditPost(post);
                  onOpenChange(false);
                }}
                className="gap-2"
              >
                <Edit className="h-4 w-4" />
                Edit
              </Button>
            )}
          </div>

          {/* Author Info */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarImage src={post.authorAvatar} />
                <AvatarFallback>
                  {post.author.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{post.author}</p>
                <p className="text-sm text-muted-foreground">{post.lastActivity}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <MessageSquare className="h-4 w-4" />
                <span>{post.replies}</span>
              </div>
              <div className="flex items-center gap-1">
                <ThumbsUp className="h-4 w-4" />
                <span>{post.likes}</span>
              </div>
            </div>
          </div>

          {/* Post Content */}
          <div className="prose prose-sm max-w-none">
            <p className="whitespace-pre-wrap">{post.content}</p>
          </div>
        </div>

        <Separator />

        {/* Replies Section */}
        <div className="space-y-4">
          <h3 className="font-semibold flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            {replies.length} {replies.length === 1 ? 'Reply' : 'Replies'}
          </h3>

          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
              <p className="text-sm">Loading replies...</p>
            </div>
          ) : replies.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No replies yet. Be the first to respond!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {replies.map((reply) => {
                const isReplyAuthor = user?.id === reply.authorId;
                
                return (
                  <div key={reply.id} className="flex gap-3 p-4 rounded-lg border bg-card">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={reply.author?.imageUrl} />
                      <AvatarFallback>
                        {reply.author?.fullName?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-sm">{reply.author?.fullName}</p>
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
                        {isReplyAuthor && onDeleteReply && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onDeleteReply(reply.id)}
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
          )}
        </div>

        {/* Reply Form */}
        {!post.isLocked && (
          <>
            <Separator />
            <form onSubmit={handleReplySubmit} className="space-y-4">
              <Textarea
                placeholder="Write a reply..."
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                rows={3}
                disabled={createReplyMutation.isPending}
              />
              <div className="flex justify-end">
                <Button 
                  type="submit" 
                  disabled={createReplyMutation.isPending || !replyContent.trim()}
                  className="gap-2"
                >
                  {createReplyMutation.isPending ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      Posting...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Post Reply
                    </>
                  )}
                </Button>
              </div>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ViewPostDialog;