import PostCard from './PostCard';

const PostList = ({ posts, categories, onViewPost, onDeletePost }) => {
  if (!posts || posts.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No posts found.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {posts.map((post) => (
        <PostCard
          key={post.id}
          post={post}
          categories={categories}
          onView={onViewPost}
          onDelete={onDeletePost}
        />
      ))}
    </div>
  );
};

export default PostList;