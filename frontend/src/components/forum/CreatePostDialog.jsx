import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useCreatePost } from '../../hooks/forum/useCreatePost';
import { toast } from 'react-toastify';

const CreatePostDialog = ({ open, onOpenChange, categories, courseId }) => {
  const [newPost, setNewPost] = useState({ title: '', content: '', category: '' });
  const createPostMutation = useCreatePost();

  const handleCreatePost = async () => {
    if (!newPost.title?.trim()) {
      toast.error('Please enter a post title');
      return;
    }

    if (!newPost.content?.trim()) {
      toast.error('Please enter post content');
      return;
    }

    const toastId = toast.loading('Creating post...');
    try {
      await createPostMutation.mutateAsync({
        courseId,
        title: newPost.title.trim(),
        content: newPost.content.trim(),
        category: newPost.category && newPost.category.trim() ? newPost.category : 'Others',
      });

      toast.update(toastId, {
        render: 'Post created successfully',
        type: 'success',
        isLoading: false,
        autoClose: 3000,
      });

      onOpenChange(false);
      setNewPost({ title: '', content: '', category: '' });
    } catch (error) {
      console.error('Failed to create post:', error);
      toast.update(toastId, {
        render: error.response?.data?.message || 'Failed to create post. Please try again.',
        type: 'error',
        isLoading: false,
        autoClose: 3000,
      });
    }
  };

  const handleCancel = () => {
    setNewPost({ title: '', content: '', category: '' });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create New Post</DialogTitle>
          <DialogDescription>
            Start a new discussion in the forum
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">
              Title <span className="text-destructive">*</span>
            </Label>
            <Input
              id="title"
              placeholder="Enter post title..."
              value={newPost.title}
              onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
              disabled={createPostMutation.isPending}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="category">Category (optional)</Label>
            <Select
              onValueChange={(value) => setNewPost({ ...newPost, category: value })}
              disabled={createPostMutation.isPending}
            >
              <SelectTrigger id="category">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.name} value={cat.name}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="content">
              Content <span className="text-destructive">*</span>
            </Label>
            <Textarea
              
              id="content"
              placeholder="Write your post content..."
              className="h-24 resize-none"
              value={newPost.content}
              onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
              disabled={createPostMutation.isPending}
            />
          </div>
        </div>
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={handleCancel}
            disabled={createPostMutation.isPending}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleCreatePost}
            disabled={createPostMutation.isPending}
          >
            {createPostMutation.isPending ? 'Creating...' : 'Create Post'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreatePostDialog;