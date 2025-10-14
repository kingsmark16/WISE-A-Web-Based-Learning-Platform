import React, { useState, useMemo, useRef, useCallback } from 'react';
import { MessageSquare, Plus, Search, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { toast } from 'react-toastify';
import { Card } from '@/components/ui/card';
import ForumAnalytics from '../forum/ForumAnalytics';
import Categories from '../forum/Categories';
import PostList from '../forum/PostList';
import CreatePostDialog from '../forum/CreatePostDialog';
import ViewPostDialog from '../forum/ViewPostDialog';
import EditPostDialog from '../forum/EditPostDialog';
import DeletePostDialog from '../forum/DeletePostDialog';
import { useGetPostList } from '../../hooks/forum/useGetPostList';
import { useSearchPosts } from '../../hooks/forum/useSearchPosts';
import { useDeletePost } from '../../hooks/forum/useDeletePost';
import { useGetForumCategories } from '../../hooks/forum/useGetForumCategories';

const Forum = ({ courseId }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [newPostOpen, setNewPostOpen] = useState(false);
  const [viewPostOpen, setViewPostOpen] = useState(false);
  const [editPostOpen, setEditPostOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [deletePostObject, setDeletePostObject] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [activeCategory, setActiveCategory] = useState(null);

  // Intersection observer for infinite scroll
  const loadMoreRef = useRef(null);

  // Fetch posts with pagination (10 posts at a time)
  const { 
    data: postsData, 
    isLoading, 
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = useGetPostList(courseId, { limit: 10 });

  // Search posts (searches all posts, not just loaded ones)
  const { data: searchData, isLoading: isSearching } = useSearchPosts(
    courseId, 
    searchQuery
  );

  // Mutations
  const deletePostMutation = useDeletePost();

  // Fetch forum categories
  const { data: categories = [] } = useGetForumCategories(courseId);

  // Transform backend data to match frontend structure
  const transformPosts = (items) => {
    if (!items) return [];
    return items.map(item => ({
      id: item.id,
      title: item.title,
      content: item.content,
      category: item.category,
      likes: item.likes || 0,
      author: {
        id: item.author.id,
        clerkId: item.author.clerkId,
        fullName: item.author.fullName,
        imageUrl: item.author.imageUrl || ''
      },
      isPinned: item.isPinned,
      isLocked: item.isLocked,
      replies: item._count?.replies || 0,
      likeCount: item._count?.likedBy || 0,
      lastActivity: new Date(item.updatedAt).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      excerpt: item.content.length > 100 ? item.content.substring(0, 100) + '...' : item.content,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    }));
  };

  // Flatten paginated results
  const allPosts = useMemo(() => {
    if (!postsData?.pages) return [];
    return postsData.pages.flatMap(page => transformPosts(page.items));
  }, [postsData]);

  // Search results (searches ALL posts in database)
  const searchFilteredPosts = useMemo(() => {
    if (!searchQuery.trim() || !searchData?.items) return [];
    return transformPosts(searchData.items);
  }, [searchQuery, searchData]);

  // Intersection observer for lazy loading
  const handleObserver = useCallback((entries) => {
    const [target] = entries;
    if (target.isIntersecting && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  React.useEffect(() => {
    const element = loadMoreRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(handleObserver, {
      threshold: 0.1,
      rootMargin: '100px'
    });

    observer.observe(element);
    return () => observer.disconnect();
  }, [handleObserver]);

  console.log('Forum component - courseId prop:', courseId);

  // Check for courseId after all hooks
  if (!courseId) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center text-destructive">
          <p className="font-semibold">Error: No Course ID</p>
          <p className="text-sm">Forum component requires courseId prop</p>
        </div>
      </div>
    );
  }

  // Filter posts based on active tab and category (for main list)
  const getFilteredPosts = () => {
    let filtered = allPosts;

    // First apply category filter
    if (activeCategory) {
      filtered = filtered.filter(p => p.category === activeCategory);
    }

    // Then apply tab filter
    switch (activeTab) {
      case 'pinned':
        return filtered.filter(p => p.isPinned);
      case 'recent':
        return [...filtered].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
      case 'popular':
        return [...filtered].sort((a, b) => b.replies - a.replies);
      default:
        return filtered;
    }
  };

  // Calculate stats from real data
  const forumStats = {
    totalPosts: allPosts.length,
    totalReplies: allPosts.reduce((acc, post) => acc + post.replies, 0),
    activeUsers: 0,
    todaysActivity: allPosts.filter(p => {
      const today = new Date();
      const postDate = new Date(p.createdAt);
      return postDate.toDateString() === today.toDateString();
    }).length,
  };

  const handleViewPost = (post) => {
    setSelectedPost(post);
    setViewPostOpen(true);
    setShowSearchResults(false);
    setSearchQuery('');
  };

  const handleEditPost = (post) => {
    setSelectedPost(post);
    setEditPostOpen(true);
  };

  const handleDeletePost = async (post) => {
    const toastId = toast.loading('Deleting post...');
    try {
      await deletePostMutation.mutateAsync(post.id);
      toast.update(toastId, {
        render: 'Post deleted successfully',
        type: 'success',
        isLoading: false,
        autoClose: 3000,
      });
      setDeletePostObject(null);
    } catch (error) {
      console.error('Failed to delete post:', error);
      toast.update(toastId, {
        render: 'Failed to delete post. Please try again.',
        type: 'error',
        isLoading: false,
        autoClose: 3000,
      });
    }
  };

  const handleCategoryClick = (categoryName) => {
    setActiveCategory(activeCategory === categoryName ? null : categoryName);
    setActiveTab('all'); // Reset tab when category is selected
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    setShowSearchResults(value.trim().length > 0);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setShowSearchResults(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-sm text-muted-foreground">Loading forum...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center text-destructive">
          <p className="font-semibold">Failed to load forum</p>
          <p className="text-sm">{error.message}</p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => window.location.reload()}
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 px-2 sm:px-0">
      {/* Header */}
      <div className="flex items-start sm:items-center justify-between gap-2">
        <div className="flex items-start sm:items-center gap-2 sm:gap-3 flex-1 min-w-0">
          <MessageSquare className="h-5 w-5 sm:h-6 sm:w-6 text-primary flex-shrink-0 mt-0.5 sm:mt-0" />
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-lg sm:text-xl truncate">Course Forum</h4>
            <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block">Discuss, ask questions, and collaborate</p>
          </div>
        </div>
      </div>

      {/* Analytics */}
      <ForumAnalytics stats={forumStats} />

      {/* Search and Create Post */}
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
        <div className="relative flex-1 order-1 sm:order-none">
          <Search className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground z-10" />
          <Input
            placeholder="Search posts..."
            className="pl-8 sm:pl-10 pr-8 sm:pr-10 h-9 sm:h-10 text-sm"
            value={searchQuery}
            onChange={handleSearchChange}
            onFocus={() => searchQuery.trim() && setShowSearchResults(true)}
          />
          {searchQuery && (
            <button
              onClick={clearSearch}
              className="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground z-10"
            >
              <X className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </button>
          )}

          {/* Search Results Dropdown */}
          {showSearchResults && (
            <Card className="absolute top-full mt-2 w-full max-h-[60vh] sm:max-h-96 overflow-y-auto z-50 shadow-lg">
              {isSearching ? (
                <div className="p-3 sm:p-4 text-center">
                  <Loader2 className="h-5 w-5 sm:h-6 sm:w-6 animate-spin mx-auto mb-2 text-primary" />
                  <p className="text-xs sm:text-sm text-muted-foreground">Searching...</p>
                </div>
              ) : searchFilteredPosts.length === 0 ? (
                <div className="p-3 sm:p-4 text-center text-muted-foreground">
                  <p className="text-xs sm:text-sm">No posts found matching "{searchQuery}"</p>
                </div>
              ) : (
                <div className="p-1.5 sm:p-2">
                  <div className="text-[10px] sm:text-xs text-muted-foreground px-2 py-1 mb-1">
                    {searchFilteredPosts.length} result{searchFilteredPosts.length !== 1 ? 's' : ''} found
                  </div>
                  {searchFilteredPosts.map((post) => (
                    <button
                      key={post.id}
                      onClick={() => handleViewPost(post)}
                      className="w-full text-left p-2 sm:p-3 hover:bg-accent rounded-lg transition-colors"
                    >
                      <div className="flex items-start gap-2 sm:gap-3">
                        <MessageSquare className="h-3.5 w-3.5 sm:h-4 sm:w-4 mt-0.5 sm:mt-1 flex-shrink-0 text-muted-foreground" />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-xs sm:text-sm mb-1 truncate">{post.title}</h4>
                          <p className="text-[10px] sm:text-xs text-muted-foreground line-clamp-2">{post.excerpt}</p>
                          <div className="flex items-center gap-2 sm:gap-3 mt-1.5 sm:mt-2 text-[10px] sm:text-xs text-muted-foreground flex-wrap">
                            <span className="truncate max-w-[100px] sm:max-w-none">{post.author?.fullName || 'Unknown'}</span>
                            <span className="hidden sm:inline">•</span>
                            <span>{post.replies} replies</span>
                            <span className="hidden sm:inline">•</span>
                            <span className="hidden sm:inline">{post.lastActivity}</span>
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </Card>
          )}
        </div>

        <Button className="gap-1.5 sm:gap-2 h-9 sm:h-10 text-sm whitespace-nowrap" onClick={() => setNewPostOpen(true)}>
          <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          <span className="hidden sm:inline">New Post</span>
          <span className="sm:hidden">New</span>
        </Button>
      </div>

      {/* Categories */}
      <Categories 
        categories={categories} 
        onCategoryClick={handleCategoryClick}
        activeCategory={activeCategory}
      />

      {/* Tabs for filtering */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full grid grid-cols-2 sm:grid-cols-4 h-auto">
          <TabsTrigger value="all" className="text-xs sm:text-sm px-2 sm:px-3 py-2">
            <span className="hidden sm:inline">All Posts ({getFilteredPosts().length})</span>
            <span className="sm:hidden">All ({getFilteredPosts().length})</span>
          </TabsTrigger>
          <TabsTrigger value="pinned" className="text-xs sm:text-sm px-2 sm:px-3 py-2">
            <span className="hidden sm:inline">Pinned ({allPosts.filter(p => p.isPinned && (!activeCategory || p.category === activeCategory)).length})</span>
            <span className="sm:hidden">Pinned ({allPosts.filter(p => p.isPinned && (!activeCategory || p.category === activeCategory)).length})</span>
          </TabsTrigger>
          <TabsTrigger value="recent" className="text-xs sm:text-sm px-2 sm:px-3 py-2">Recent</TabsTrigger>
          <TabsTrigger value="popular" className="text-xs sm:text-sm px-2 sm:px-3 py-2">Popular</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-3 mt-3 sm:mt-4">
          {getFilteredPosts().length === 0 ? (
            <div className="text-center py-8 sm:py-12 text-muted-foreground px-4">
              <MessageSquare className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-3 sm:mb-4 opacity-50" />
              <p className="text-base sm:text-lg font-medium">No posts found</p>
              <p className="text-xs sm:text-sm mt-1">Be the first to start a discussion!</p>
              <Button 
                className="mt-3 sm:mt-4 text-sm" 
                onClick={() => setNewPostOpen(true)}
              >
                Create First Post
              </Button>
            </div>
          ) : (
            <>
              <PostList
                posts={getFilteredPosts()}
                categories={categories}
                onViewPost={handleViewPost}
                onDeletePost={setDeletePostObject}
                onEditPost={handleEditPost}
              />
              
              {/* Infinite Scroll Trigger */}
              {hasNextPage && (
                <div ref={loadMoreRef} className="flex justify-center py-3 sm:py-4">
                  {isFetchingNextPage ? (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Loader2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin" />
                      <span className="text-xs sm:text-sm">Loading more...</span>
                    </div>
                  ) : (
                    <Button 
                      variant="outline" 
                      onClick={() => fetchNextPage()}
                      className="gap-1.5 sm:gap-2 text-xs sm:text-sm h-8 sm:h-9"
                    >
                      Load More Posts
                    </Button>
                  )}
                </div>
              )}
              
              {!hasNextPage && allPosts.length > 0 && (
                <p className="text-center text-xs sm:text-sm text-muted-foreground py-3 sm:py-4">
                  You've reached the end of posts
                </p>
              )}
            </>
          )}
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <CreatePostDialog
        open={newPostOpen}
        onOpenChange={setNewPostOpen}
        categories={categories}
        courseId={courseId}
      />

      <ViewPostDialog
        open={viewPostOpen}
        onOpenChange={setViewPostOpen}
        post={selectedPost}
        categories={categories}
        onEditPost={handleEditPost}
      />

      <EditPostDialog
        open={editPostOpen}
        onOpenChange={setEditPostOpen}
        post={selectedPost}
        categories={categories}
      />

      <DeletePostDialog
        open={!!deletePostObject}
        onOpenChange={() => setDeletePostObject(null)}
        onConfirm={() => handleDeletePost(deletePostObject)}
        post={deletePostObject}
        isLoading={deletePostMutation.isPending}
      />
    </div>
  );
};

export default Forum;