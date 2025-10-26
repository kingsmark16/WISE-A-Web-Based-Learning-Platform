// src/controllers/forumController.js
import prisma from '../lib/prisma.js';
import { addPhTimes, addPhTimesArray } from '../utils/withPhTime.js';

// ---------- helpers ----------
const clamp = (n, min = 1, max = 100) => Math.max(min, Math.min(+n || min, max));

const getDbUser = async (clerkUserId) => {
  if (!clerkUserId) return null;
  return prisma.user.findUnique({ where: { clerkId: clerkUserId } });
};

const isStaff = (role) => role === 'ADMIN' || role === 'FACULTY';
const ensureAuthorOrStaff = (dbUser, authorId) => isStaff(dbUser.role) || dbUser.id === authorId;

// ---------- FORUM CATEGORIES ----------
/**
 * GET /courses/:courseId/forum/categories
 * Returns available forum categories for a course
 */
export const getForumCategories = async (req, res) => {
  try {
    const { courseId } = req.params;

    // Verify course exists
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: { id: true, title: true }
    });

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Get actual post counts for each category
    const categoryCounts = await prisma.forumPost.groupBy({
      by: ['category'],
      where: { courseId: courseId },
      _count: {
        category: true
      }
    });

    // Define forum categories with actual counts
    const categories = [
      { name: 'General Discussion', color: '#2563eb', count: 0 },      // Bright Blue (blue-600)
      { name: 'Questions & Answers', color: '#059669', count: 0 },     // Emerald Green (emerald-600)
      { name: 'Announcements', color: '#dc2626', count: 0 },           // Red (red-600)
      { name: 'Others', color: '#64748b', count: 0 }                   // Slate Gray (slate-500)
    ];

    // Update counts based on actual data
    categoryCounts.forEach(item => {
      const category = categories.find(cat => cat.name === item.category);
      if (category) {
        category.count = item._count.category;
      }
    });

    return res.status(200).json({ data: categories });
  } catch (err) {
    console.error('getForumCategories error:', err);
    return res.status(500).json({ 
      message: 'Failed to get forum categories',
      error: err.message 
    });
  }
};

// ---------- THREADS (ForumPost) ----------

/**
 * GET /courses/:courseId/forum/threads?cursor=<id>&limit=10&q=search
 * Sorted by isPinned desc, updatedAt desc.
 */
export const listOfPost = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { cursor, limit, q } = req.query;
    const take = clamp(limit, 1, 50);

    const where = {
      courseId,
      ...(q
        ? {
            OR: [
              { title: { contains: q, mode: 'insensitive' } },
              { content: { contains: q, mode: 'insensitive' } }
            ]
          }
        : {})
    };

    const threads = await prisma.forumPost.findMany({
      where,
      orderBy: [{ isPinned: 'desc' }, { updatedAt: 'desc' }],
      take: take + 1, // Fetch one extra to determine if there's a next page
      ...(cursor ? { skip: 1, cursor: { id: String(cursor) } } : {}),
      select: {
        id: true,
        title: true,
        content: true,
        category: true,
        likes: true,
        isPinned: true,
        isLocked: true,
        createdAt: true,
        updatedAt: true,
        author: { select: { id: true, clerkId: true, fullName: true, imageUrl: true } },
        _count: { select: { replies: true, likedBy: true } }
      }
    });

    const hasNextPage = threads.length > take;
    const items = hasNextPage ? threads.slice(0, -1) : threads;
    const nextCursor = hasNextPage ? items[items.length - 1].id : null;

    return res.json({ 
      items: addPhTimesArray(items), 
      nextCursor,
      hasNextPage 
    });
  } catch (err) {
    console.error('listThreads error', err);
    return res.status(500).json({ message: 'Failed to list threads' });
  }
};

/**
 * POST /courses/:courseId/forum/threads
 * body: { title, content }
 */
export const createPost = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { title, content, category } = req.body;
    
    console.log('Creating post:', { courseId, title, content, category, userId: req.auth?.userId });

    if (!title || !content) {
      return res.status(400).json({ message: 'title and content are required' });
    }

    // Get clerk user ID from req.auth (set by Clerk middleware)
    const clerkUserId = req.auth().userId;
    if (!clerkUserId) {
      return res.status(401).json({ message: 'Unauthorized - No clerk user ID' });
    }

    const dbUser = await getDbUser(clerkUserId);
    if (!dbUser) {
      return res.status(401).json({ message: 'User not found in database' });
    }

    const post = await prisma.forumPost.create({
      data: { 
        title, 
        content,
        category: category || null,
        courseId, 
        authorId: dbUser.id 
      },
      include: {
        author: {
          select: {
            id: true,
            fullName: true,
            imageUrl: true
          }
        },
        _count: {
          select: {
            replies: true
          }
        }
      }
    });

    return res.status(201).json(addPhTimes(post));
  } catch (err) {
    console.error('createThread error:', err);
    return res.status(500).json({ 
      message: 'Failed to create thread',
      error: err.message 
    });
  }
};

/**
 * GET /forum/posts/:postId
 * returns post + first page of replies
 * query: ?cursor=<replyId>&limit=50
 */
export const getPost = async (req, res) => {
  try {
    const { postId } = req.params;
    const { cursor, limit } = req.query;
    const take = clamp(limit, 1, 100);

    const clerkUserId = req.auth?.userId;
    let dbUser = null;
    if (clerkUserId) {
      dbUser = await getDbUser(clerkUserId);
    }

    const post = await prisma.forumPost.findUnique({
      where: { id: String(postId) },
      select: {
        id: true,
        title: true,
        content: true,
        category: true,
        likes: true,
        isPinned: true,
        isLocked: true,
        createdAt: true,
        updatedAt: true,
        courseId: true,
        author: { select: { id: true, clerkId: true, fullName: true, imageUrl: true } },
        _count: { select: { likedBy: true } },
        likedBy: dbUser ? {
          where: { userId: dbUser.id },
          select: { id: true }
        } : false
      }
    });
    if (!post) return res.status(404).json({ message: 'Thread not found' });

    // Verify user is enrolled in the course (for students)
    if (dbUser && dbUser.role === 'STUDENT') {
      const enrollment = await prisma.enrollment.findUnique({
        where: {
          studentId_courseId: {
            studentId: dbUser.id,
            courseId: post.courseId
          }
        }
      });
      if (!enrollment) {
        return res.status(403).json({ message: 'You must be enrolled in this course to view forum posts' });
      }
    }

    // Check if current user has liked this post
    const isLikedByCurrentUser = dbUser && post.likedBy && post.likedBy.length > 0;

    const replies = await prisma.forumReply.findMany({
      where: { postId: post.id },
      orderBy: { createdAt: 'asc' },
      take,
      ...(cursor ? { skip: 1, cursor: { id: String(cursor) } } : {}),
      select: {
        id: true,
        content: true,
        isAnswer: true,
        createdAt: true,
        updatedAt: true,
        author: { select: { id: true, clerkId: true, fullName: true, imageUrl: true } }
      }
    });

    const nextCursor = replies.length === take ? replies[replies.length - 1].id : null;
    
    // Remove likedBy from response and add isLiked flag
    const { likedBy, ...postWithoutLikedBy } = post;
    const postResponse = { ...postWithoutLikedBy, isLiked: isLikedByCurrentUser };
    
    return res.json({ post: addPhTimes(postResponse), replies: addPhTimesArray(replies), nextCursor });
  } catch (err) {
    console.error('getThread error', err);
    return res.status(500).json({ message: 'Failed to fetch thread' });
  }
};

/**
 * PATCH /forum/posts/:postId
 * body: { title?, content? }
 * Author OR staff (faculty/admin)
 */
export const updatePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const { title, content, category } = req.body;

    const existing = await prisma.forumPost.findUnique({
      where: { id: String(postId) },
      select: { id: true, authorId: true, courseId: true }
    });
    if (!existing) return res.status(404).json({ message: 'Thread not found' });

    const clerkUserId = req.auth?.userId;
    if (!clerkUserId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const dbUser = await getDbUser(clerkUserId);
    if (!dbUser) return res.status(401).json({ message: 'User not found' });

    // Verify user is enrolled in the course (for students)
    if (dbUser.role === 'STUDENT') {
      const enrollment = await prisma.enrollment.findUnique({
        where: {
          studentId_courseId: {
            studentId: dbUser.id,
            courseId: existing.courseId
          }
        }
      });
      if (!enrollment) {
        return res.status(403).json({ message: 'You must be enrolled in this course to update forum posts' });
      }
    }

    if (!ensureAuthorOrStaff(dbUser, existing.authorId))
      return res.status(403).json({ message: 'Not allowed to edit this thread' });

    const updated = await prisma.forumPost.update({
      where: { id: existing.id },
      data: { 
        ...(title && { title }), 
        ...(content && { content }),
        ...(category !== undefined && { category })
      }
    });
    return res.json(addPhTimes(updated));
  } catch (err) {
    console.error('updateThread error', err);
    return res.status(500).json({ message: 'Failed to update thread' });
  }
};

/**
 * DELETE /forum/posts/:postId
 * Author only (post creator)
 */
export const deletePost = async (req, res) => {
  try {
    const { postId } = req.params;

    const existing = await prisma.forumPost.findUnique({
      where: { id: String(postId) },
      select: { id: true, authorId: true, courseId: true }
    });
    if (!existing) return res.status(404).json({ message: 'Thread not found' });

    const clerkUserId = req.auth?.userId;
    if (!clerkUserId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const dbUser = await getDbUser(clerkUserId);
    if (!dbUser) return res.status(401).json({ message: 'User not found' });

    // Check if user is the author or staff
    if (!ensureAuthorOrStaff(dbUser, existing.authorId)) {
      return res.status(403).json({ message: 'Not allowed to delete this thread' });
    }

    // For students who are NOT the author, verify they are enrolled in the course
    if (dbUser.role === 'STUDENT' && dbUser.id !== existing.authorId) {
      const enrollment = await prisma.enrollment.findUnique({
        where: {
          studentId_courseId: {
            studentId: dbUser.id,
            courseId: existing.courseId
          }
        }
      });
      if (!enrollment) {
        return res.status(403).json({ message: 'You must be enrolled in this course to delete forum posts' });
      }
    }    await prisma.forumPost.delete({ where: { id: existing.id } });
    return res.json({ message: 'Deleted' });
  } catch (err) {
    console.error('deleteThread error', err);
    return res.status(500).json({ message: 'Failed to delete thread' });
  }
};

/**
 * POST /forum/posts/:postId/pin|unpin|lock|unlock
 * Pin: All roles
 * Lock: All roles (post author only)
 */
export const setPostFlag = (flag, value) => {
  return async (req, res) => {
    try {
      const { postId } = req.params;
      const clerkUserId = req.auth().userId;
      
      const data =
        flag === 'pin' ? { isPinned: value } :
        flag === 'lock' ? { isLocked: value } :
        null;

      if (!data) return res.status(400).json({ message: 'Unknown flag' });

      // Get the database user
      const dbUser = await getDbUser(clerkUserId);
      if (!dbUser) {
        return res.status(401).json({ message: 'User not found in database' });
      }

      // Get the post to check course enrollment
      const post = await prisma.forumPost.findUnique({
        where: { id: String(postId) },
        select: { id: true, authorId: true, courseId: true }
      });
      if (!post) {
        return res.status(404).json({ message: 'Post not found' });
      }

      // Verify user is enrolled in the course (for students)
      if (dbUser.role === 'STUDENT') {
        const enrollment = await prisma.enrollment.findUnique({
          where: {
            studentId_courseId: {
              studentId: dbUser.id,
              courseId: post.courseId
            }
          }
        });
        if (!enrollment) {
          return res.status(403).json({ message: 'You must be enrolled in this course to moderate forum posts' });
        }
      }

      // For lock/unlock, only allow the post author
      if (flag === 'lock') {
        const isAuthor = post.authorId === dbUser.id;
        
        if (!isAuthor) {
          return res.status(403).json({ message: 'Only the post author can lock/unlock this post' });
        }
      }

      const updated = await prisma.forumPost.update({
        where: { id: String(postId) },
        data
      });
      return res.json(addPhTimes(updated));
    } catch (err) {
      console.error('setThreadFlag error', err);
      return res.status(500).json({ message: 'Failed to update thread flag' });
    }
  };
};

// ---------- REPLIES (ForumReply) ----------

/**
 * POST /forum/posts/:postId/replies
 * body: { content }
 */
export const createReply = async (req, res) => {
  try {
    const { postId } = req.params;
    const { content } = req.body;
    if (!content) return res.status(400).json({ message: 'content is required' });

    const post = await prisma.forumPost.findUnique({
      where: { id: String(postId) },
      select: { id: true, isLocked: true, courseId: true }
    });
    if (!post) return res.status(404).json({ message: 'Thread not found' });
    if (post.isLocked) return res.status(403).json({ message: 'Thread is locked' });

    const clerkUserId = req.auth?.userId;
    if (!clerkUserId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const dbUser = await getDbUser(clerkUserId);
    if (!dbUser) return res.status(401).json({ message: 'User not found' });

    // Verify user is enrolled in the course (for students)
    if (dbUser.role === 'STUDENT') {
      const enrollment = await prisma.enrollment.findUnique({
        where: {
          studentId_courseId: {
            studentId: dbUser.id,
            courseId: post.courseId
          }
        }
      });
      if (!enrollment) {
        return res.status(403).json({ message: 'You must be enrolled in this course to reply to forum posts' });
      }
    }

    const reply = await prisma.forumReply.create({
      data: { postId: post.id, content, authorId: dbUser.id },
      include: {
        author: {
          select: {
            id: true,
            clerkId: true,
            fullName: true,
            imageUrl: true
          }
        }
      }
    });

    // bump thread updatedAt for sorting
    await prisma.forumPost.update({ where: { id: post.id }, data: { updatedAt: new Date() } });

    const replyData = addPhTimes(reply);

    // Emit Socket.IO event for real-time updates
    const io = req.app.get('io');
    if (io) {
      io.to(`post-${post.id}`).emit('new-reply', {
        postId: post.id,
        reply: replyData
      });
    }

    return res.status(201).json(replyData);
  } catch (err) {
    console.error('createReply error', err);
    return res.status(500).json({ message: 'Failed to create reply' });
  }
};

/**
 * PATCH /forum/replies/:replyId
 * body: { content?, isAnswer? }
 * Author OR staff
 */
export const updateReply = async (req, res) => {
  try {
    const { replyId } = req.params;
    const { content, isAnswer } = req.body;

    const existing = await prisma.forumReply.findUnique({
      where: { id: String(replyId) },
      select: { 
        id: true, 
        authorId: true, 
        postId: true,
        post: { select: { courseId: true } }
      }
    });
    if (!existing) return res.status(404).json({ message: 'Reply not found' });

    const clerkUserId = req.auth?.userId;
    if (!clerkUserId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const dbUser = await getDbUser(clerkUserId);
    if (!dbUser) return res.status(401).json({ message: 'User not found' });

    // Verify user is enrolled in the course (for students)
    if (dbUser.role === 'STUDENT') {
      const enrollment = await prisma.enrollment.findUnique({
        where: {
          studentId_courseId: {
            studentId: dbUser.id,
            courseId: existing.post.courseId
          }
        }
      });
      if (!enrollment) {
        return res.status(403).json({ message: 'You must be enrolled in this course to update forum replies' });
      }
    }
    if (!ensureAuthorOrStaff(dbUser, existing.authorId))
      return res.status(403).json({ message: 'Not allowed to edit this reply' });

    const updated = await prisma.forumReply.update({
      where: { id: existing.id },
      data: {
        ...(typeof content === 'string' ? { content } : {}),
        ...(typeof isAnswer === 'boolean' ? { isAnswer } : {})
      }
    });

    // optional: bump parent thread updatedAt
    await prisma.forumPost.update({ where: { id: existing.postId }, data: { updatedAt: new Date() } });

    return res.json(addPhTimes(updated));
  } catch (err) {
    console.error('updateReply error', err);
    return res.status(500).json({ message: 'Failed to update reply' });
  }
};

/**
 * DELETE /forum/replies/:replyId
 * Author OR staff
 */
export const deleteReply = async (req, res) => {
  try {
    const { replyId } = req.params;

    const existing = await prisma.forumReply.findUnique({
      where: { id: String(replyId) },
      select: { 
        id: true, 
        authorId: true, 
        postId: true,
        post: { select: { courseId: true } }
      }
    });
    if (!existing) return res.status(404).json({ message: 'Reply not found' });

    const clerkUserId = req.auth?.userId;
    if (!clerkUserId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const dbUser = await getDbUser(clerkUserId);
    if (!dbUser) return res.status(401).json({ message: 'User not found' });

    // Verify user is enrolled in the course (for students)
    if (dbUser.role === 'STUDENT') {
      const enrollment = await prisma.enrollment.findUnique({
        where: {
          studentId_courseId: {
            studentId: dbUser.id,
            courseId: existing.post.courseId
          }
        }
      });
      if (!enrollment) {
        return res.status(403).json({ message: 'You must be enrolled in this course to delete forum replies' });
      }
    }

    if (!ensureAuthorOrStaff(dbUser, existing.authorId))
      return res.status(403).json({ message: 'Not allowed to delete this reply' });

    await prisma.forumReply.delete({ where: { id: existing.id } });
    
    // Emit Socket.IO event for real-time updates
    const io = req.app.get('io');
    if (io) {
      io.to(`post-${existing.postId}`).emit('delete-reply', {
        postId: existing.postId,
        replyId: existing.id
      });
    }
    
    return res.json({ message: 'Deleted' });
  } catch (err) {
    console.error('deleteReply error', err);
    return res.status(500).json({ message: 'Failed to delete reply' });
  }
};

/**
 * POST /forum/posts/:postId/like
 * Toggle like on a post
 */
export const toggleLikePost = async (req, res) => {
  try {
    const { postId } = req.params;

    const clerkUserId = req.auth?.userId;
    if (!clerkUserId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const dbUser = await getDbUser(clerkUserId);
    if (!dbUser) return res.status(401).json({ message: 'User not found' });

    const post = await prisma.forumPost.findUnique({
      where: { id: String(postId) },
      select: { id: true, likes: true, courseId: true }
    });
    if (!post) return res.status(404).json({ message: 'Post not found' });

    // Verify user is enrolled in the course (for students)
    if (dbUser.role === 'STUDENT') {
      const enrollment = await prisma.enrollment.findUnique({
        where: {
          studentId_courseId: {
            studentId: dbUser.id,
            courseId: post.courseId
          }
        }
      });
      if (!enrollment) {
        return res.status(403).json({ message: 'You must be enrolled in this course to like forum posts' });
      }
    }

    // Check if user already liked this post
    const existingLike = await prisma.forumPostLike.findUnique({
      where: {
        postId_userId: {
          postId: post.id,
          userId: dbUser.id
        }
      }
    });

    if (existingLike) {
      // Unlike: remove the like and decrement likes
      await prisma.$transaction([
        prisma.forumPostLike.delete({
          where: { id: existingLike.id }
        }),
        prisma.forumPost.update({
          where: { id: post.id },
          data: { likes: { decrement: 1 } }
        })
      ]);
      return res.json({ liked: false, likes: post.likes - 1 });
    } else {
      // Like: add the like and increment likes
      await prisma.$transaction([
        prisma.forumPostLike.create({
          data: {
            postId: post.id,
            userId: dbUser.id
          }
        }),
        prisma.forumPost.update({
          where: { id: post.id },
          data: { likes: { increment: 1 } }
        })
      ]);
      return res.json({ liked: true, likes: post.likes + 1 });
    }
  } catch (err) {
    console.error('toggleLikePost error', err);
    return res.status(500).json({ message: 'Failed to toggle like' });
  }
};
