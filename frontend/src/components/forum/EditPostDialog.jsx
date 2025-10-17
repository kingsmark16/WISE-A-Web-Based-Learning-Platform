import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { useEditPost } from '../../hooks/forum/useEditPost';
import { toast } from 'react-toastify';

const EditPostDialog = ({ open, onOpenChange, post, categories }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('');
  const editPostMutation = useEditPost();

  // Update form when post changes or dialog opens
  useEffect(() => {
    if (post && open) {
      setTitle(post.title || '');
      setContent(post.content || '');
      setCategory(post.category || '');
    }
  }, [post, open]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error('Title is required');
      return;
    }

    if (!content.trim()) {
      toast.error('Content is required');
      return;
    }

    const toastId = toast.loading('Updating post...');

    try {
      await editPostMutation.mutateAsync({
        postId: post.id,
        title: title.trim(),
        content: content.trim(),
        category: category.trim() || 'Others',
      });

      toast.update(toastId, {
        render: 'Post updated successfully',
        type: 'success',
        isLoading: false,
        autoClose: 3000,
      });

      onOpenChange(false);
      setTitle('');
      setContent('');
    } catch (error) {
      console.error('Failed to update post:', error);
      toast.update(toastId, {
        render: error.response?.data?.message || 'Failed to update post',
        type: 'error',
        isLoading: false,
        autoClose: 3000,
      });
    }
  };

  const handleClose = () => {
    if (!editPostMutation.isPending) {
      onOpenChange(false);
      setTitle('');
      setContent('');
      setCategory('');
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">Edit Post</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title">Title</Label>
              <Input
                id="edit-title"
                placeholder="Enter post title..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={editPostMutation.isPending}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-content">Content</Label>
              <Textarea
                className="h-24 resize-none"
                id="edit-content"
                placeholder="Write your post content..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={10}
                disabled={editPostMutation.isPending}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-category">Category</Label>
              <Select
                value={category}
                onValueChange={setCategory}
                disabled={editPostMutation.isPending}
              >
                <SelectTrigger id="edit-category">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories?.map((cat) => (
                    <SelectItem key={cat.name} value={cat.name}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </form>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={editPostMutation.isPending}
          >
            Cancel
          </Button>
          <Button 
            type="button" 
            onClick={handleSubmit}
            disabled={editPostMutation.isPending}
          >
            {editPostMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              'Update Post'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditPostDialog;