import PostCard from './PostCard';

const PostList = ({ posts, categories, onViewPost, onDeletePost, onEditPost, onPinPost, onLockPost }) => {
  if (!posts || posts.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No posts found.
      </div>
    );
  }

  return (
    <div className="space-y-2 sm:space-y-3">
      {posts.map((post) => (
        <PostCard
          key={post.id}
          post={post}
          categories={categories}
          onView={onViewPost}
          onDelete={onDeletePost}
          onEdit={onEditPost}
          onPin={onPinPost}
          onLock={onLockPost}
        />
      ))}
    </div>
  );
};

export default PostList;