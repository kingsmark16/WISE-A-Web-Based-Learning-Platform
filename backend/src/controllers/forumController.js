// src/controllers/forumController.js
import prisma from '../lib/prisma.js';
import { addPhTimes, addPhTimesArray } from '../utils/withPhTime.js';
import {
  getDbUserByCleark,
  verifyCourseAccess,
  validatePostData,
  validateReplyData,
  isStaff,
  isAuthorOrStaff,
  clampLimit,
  checkCourseEnrollment,
  getForumCategoryCounts,
  buildCategoryList,
  FORUM_CATEGORIES
} from '../utils/forumHelper.js';
import {
  sendError,
  sendValidationError,
  sendSuccess,
  FORUM_ERRORS
} from '../utils/forumErrorHandler.js';

// ---------- FORUM CATEGORIES ----------
/**
 * GET /courses/:courseId/forum/categories
 * Returns available forum categories for a course with post counts
 */
export const getForumCategories = async (req, res) => {
  try {
    const { courseId } = req.params;

    // Verify course exists
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: { id: true }
    });
    if (!course) return sendError(res, 'COURSE_NOT_FOUND');

    // Get category counts efficiently
    const categoryMap = await getForumCategoryCounts(courseId);
    const categories = buildCategoryList(categoryMap);

    return sendSuccess(res, { data: categories });
  } catch (err) {
    console.error('getForumCategories error:', err);
    return sendError(res, 'SERVER_ERROR', err.message);
  }
};

// ---------- THREADS (ForumPost) ----------

/**
 * GET /courses/:courseId/forum/threads?cursor=<id>&limit=10&q=search
 * Sorted by isPinned desc, updatedAt desc.
 * Optimized with proper pagination and field selection
 */
export const listOfPost = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { cursor, limit, q } = req.query;
    const take = clampLimit(limit);

    // Verify course exists
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: { id: true }
    });
    if (!course) return sendError(res, 'COURSE_NOT_FOUND');

    // Build where clause for search
    const where = {
      courseId,
      ...(q && q.trim()
        ? {
            OR: [
              { title: { contains: q.trim(), mode: 'insensitive' } },
              { content: { contains: q.trim(), mode: 'insensitive' } }
            ]
          }
        : {})
    };

    // Fetch one extra to determine if there's a next page
    const threads = await prisma.forumPost.findMany({
      where,
      orderBy: [{ isPinned: 'desc' }, { updatedAt: 'desc' }],
      take: take + 1,
      ...(cursor ? { skip: 1, cursor: { id: String(cursor) } } : {}),
      select: {
        id: true,
        title: true,
        content: true,
        category: true,
        isPinned: true,
        isLocked: true,
        createdAt: true,
        updatedAt: true,
        author: {
          select: { id: true, clerkId: true, fullName: true, imageUrl: true }
        },
        _count: { select: { replies: true, likedBy: true } }
      }
    });

    // Determine pagination info
    const hasNextPage = threads.length > take;
    const items = hasNextPage ? threads.slice(0, -1) : threads;
    const nextCursor = hasNextPage ? items[items.length - 1]?.id : null;

    return sendSuccess(res, {
      items: addPhTimesArray(items),
      pagination: {
        nextCursor,
        hasNextPage,
        count: items.length
      }
    });
  } catch (err) {
    console.error('listOfPost error:', err);
    return sendError(res, 'SERVER_ERROR', err.message);
  }
};

/**
 * POST /courses/:courseId/forum/threads
 * body: { title, content, category }
 * Creates a new forum post with validation
 */
export const createPost = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { title, content, category } = req.body;

    console.log('createPost called with:', { courseId, title, content, category });

    // Validate input
    const validationErrors = validatePostData(title, content, category);
    if (validationErrors.length > 0) {
      console.log('Validation errors:', validationErrors);
      return sendValidationError(res, validationErrors);
    }

    // Verify course exists
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: { id: true }
    });
    if (!course) return sendError(res, 'COURSE_NOT_FOUND');

    // Get authenticated user
    const clerkUserId = req.auth?.userId;
    if (!clerkUserId) return sendError(res, 'UNAUTHORIZED');

    const dbUser = await getDbUserByCleark(clerkUserId);
    if (!dbUser) return sendError(res, 'USER_NOT_FOUND');

    // Verify course access
    const hasAccess = await verifyCourseAccess(dbUser, courseId);
    if (!hasAccess) return sendError(res, 'NOT_ENROLLED');

    // Create post
    const post = await prisma.forumPost.create({
      data: {
        title: title.trim(),
        content: content.trim(),
        category: category || null,
        courseId,
        authorId: dbUser.id
      },
      select: {
        id: true,
        title: true,
        content: true,
        category: true,
        isPinned: true,
        isLocked: true,
        createdAt: true,
        updatedAt: true,
        author: {
          select: { id: true, clerkId: true, fullName: true, imageUrl: true }
        },
        _count: { select: { replies: true, likedBy: true } }
      }
    });

    return sendSuccess(res, addPhTimes(post), 201);
  } catch (err) {
    console.error('createPost error:', err);
    return sendError(res, 'SERVER_ERROR', err.message);
  }
};

/**
 * GET /forum/posts/:postId?cursor=<replyId>&limit=50
 * Returns post with paginated replies
 * Optimized with efficient queries and field selection
 */
export const getPost = async (req, res) => {
  try {
    const { postId } = req.params;
    const { cursor, limit } = req.query;
    const take = clampLimit(limit);

    const clerkUserId = req.auth?.userId;
    let dbUser = null;

    if (clerkUserId) {
      dbUser = await getDbUserByCleark(clerkUserId);
    }

    // Get post with user like info
    const post = await prisma.forumPost.findUnique({
      where: { id: String(postId) },
      select: {
        id: true,
        title: true,
        content: true,
        category: true,
        isPinned: true,
        isLocked: true,
        createdAt: true,
        updatedAt: true,
        courseId: true,
        authorId: true,
        author: { select: { id: true, clerkId: true, fullName: true, imageUrl: true } },
        _count: { select: { likedBy: true, replies: true } },
        ...(dbUser && {
          likedBy: {
            where: { userId: dbUser.id },
            select: { id: true }
          }
        })
      }
    });

    if (!post) return sendError(res, 'POST_NOT_FOUND');

    // Verify course access for students
    if (dbUser && !isStaff(dbUser.role)) {
      const hasAccess = await verifyCourseAccess(dbUser, post.courseId);
      if (!hasAccess) return sendError(res, 'NOT_ENROLLED');
    }

    // Get paginated replies
    const replies = await prisma.forumReply.findMany({
      where: { postId: post.id },
      orderBy: { createdAt: 'asc' },
      take,
      ...(cursor ? { skip: 1, cursor: { id: String(cursor) } } : {}),
      select: {
        id: true,
        content: true,
        createdAt: true,
        updatedAt: true,
        author: { select: { id: true, clerkId: true, fullName: true, imageUrl: true } }
      }
    });

    const nextCursor = replies.length === take ? replies[replies.length - 1]?.id : null;

    // Build response without exposing internal likes array
    const isLiked = dbUser && post.likedBy && post.likedBy.length > 0;
    const { likedBy, ...postResponse } = post;

    return sendSuccess(res, {
      post: addPhTimes({ ...postResponse, isLiked }),
      replies: addPhTimesArray(replies),
      pagination: { nextCursor, count: replies.length }
    });
  } catch (err) {
    console.error('getPost error:', err);
    return sendError(res, 'SERVER_ERROR', err.message);
  }
};

/**
 * PATCH /forum/posts/:postId
 * body: { title?, content?, category? }
 * Updates post - Author or staff only
 */
export const updatePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const { title, content, category } = req.body;

    console.log('updatePost called with:', { postId, title, content, category });

    // Get post basic info
    const post = await prisma.forumPost.findUnique({
      where: { id: String(postId) },
      select: { id: true, authorId: true, courseId: true }
    });
    if (!post) {
      console.log('Post not found:', postId);
      return sendError(res, 'POST_NOT_FOUND');
    }

    // Get user
    const clerkUserId = req.auth?.userId;
    console.log('Clerk user ID:', clerkUserId);
    if (!clerkUserId) return sendError(res, 'UNAUTHORIZED');

    const dbUser = await getDbUserByCleark(clerkUserId);
    if (!dbUser) {
      console.log('DB user not found for clerk ID:', clerkUserId);
      return sendError(res, 'USER_NOT_FOUND');
    }

    // Check permissions
    if (!isAuthorOrStaff(dbUser, post.authorId)) {
      console.log('User not authorized to edit post');
      return sendError(res, 'NOT_AUTHOR_OR_STAFF');
    }

    // Verify course access for students
    if (!isStaff(dbUser.role)) {
      const hasAccess = await verifyCourseAccess(dbUser, post.courseId);
      if (!hasAccess) {
        console.log('User not enrolled in course');
        return sendError(res, 'NOT_ENROLLED');
      }
    }

    // Update post
    const updateData = {};
    if (title) updateData.title = title.trim();
    if (content) updateData.content = content.trim();
    if (category !== undefined) updateData.category = category;

    console.log('Updating post with data:', updateData);

    const updated = await prisma.forumPost.update({
      where: { id: post.id },
      data: updateData,
      select: {
        id: true,
        title: true,
        content: true,
        category: true,
        isPinned: true,
        isLocked: true,
        createdAt: true,
        updatedAt: true,
        author: { select: { id: true, fullName: true, imageUrl: true } },
        _count: { select: { replies: true, likedBy: true } }
      }
    });

    return sendSuccess(res, addPhTimes(updated));
  } catch (err) {
    console.error('updatePost error:', err);
    return sendError(res, 'SERVER_ERROR', err.message);
  }
};

/**
 * DELETE /forum/posts/:postId
 * Author or staff only
 */
export const deletePost = async (req, res) => {
  try {
    const { postId } = req.params;

    const post = await prisma.forumPost.findUnique({
      where: { id: String(postId) },
      select: { id: true, authorId: true, courseId: true }
    });
    if (!post) return sendError(res, 'POST_NOT_FOUND');

    const clerkUserId = req.auth?.userId;
    if (!clerkUserId) return sendError(res, 'UNAUTHORIZED');

    const dbUser = await getDbUserByCleark(clerkUserId);
    if (!dbUser) return sendError(res, 'USER_NOT_FOUND');

    // Check permissions
    if (!isAuthorOrStaff(dbUser, post.authorId)) {
      return sendError(res, 'NOT_AUTHOR_OR_STAFF');
    }

    // Verify course access for students
    if (!isStaff(dbUser.role)) {
      const hasAccess = await verifyCourseAccess(dbUser, post.courseId);
      if (!hasAccess) return sendError(res, 'NOT_ENROLLED');
    }

    // Delete post (cascade will handle replies via database)
    await prisma.forumPost.delete({
      where: { id: post.id }
    });

    return sendSuccess(res, { message: 'Post deleted successfully' });
  } catch (err) {
    console.error('deletePost error:', err);
    return sendError(res, 'SERVER_ERROR', err.message);
  }
};

/**
 * Factory function for post flag operations (pin/lock)
 * POST /forum/posts/:postId/pin|unpin|lock|unlock
 */
export const setPostFlag = (flag, value) => {
  return async (req, res) => {
    try {
      const { postId } = req.params;
      const clerkUserId = req.auth?.userId;

      if (!clerkUserId) return sendError(res, 'UNAUTHORIZED');

      // Validate flag
      const flagData =
        flag === 'pin' ? { isPinned: value } :
        flag === 'lock' ? { isLocked: value } :
        null;

      if (!flagData) return sendError(res, 'VALIDATION_ERROR', 'Unknown flag');

      // Get post
      const post = await prisma.forumPost.findUnique({
        where: { id: String(postId) },
        select: { id: true, authorId: true, courseId: true }
      });
      if (!post) return sendError(res, 'POST_NOT_FOUND');

      // Get user
      const dbUser = await getDbUserByCleark(clerkUserId);
      if (!dbUser) return sendError(res, 'USER_NOT_FOUND');

      // Verify course access
      if (!isStaff(dbUser.role)) {
        const hasAccess = await verifyCourseAccess(dbUser, post.courseId);
        if (!hasAccess) return sendError(res, 'NOT_ENROLLED');
      }

      // For lock/unlock, only allow post author
      if (flag === 'lock' && post.authorId !== dbUser.id) {
        return sendError(res, 'NOT_AUTHOR', 'Only post author can lock/unlock');
      }

      // Update flag
      const updated = await prisma.forumPost.update({
        where: { id: post.id },
        data: flagData,
        select: {
          id: true,
          title: true,
          isPinned: true,
          isLocked: true,
          updatedAt: true
        }
      });

      return sendSuccess(res, addPhTimes(updated));
    } catch (err) {
      console.error('setPostFlag error:', err);
      return sendError(res, 'SERVER_ERROR', err.message);
    }
  };
};

// ---------- REPLIES (ForumReply) ----------

/**
 * POST /forum/posts/:postId/replies
 * body: { content }
 * Creates a reply with validation
 */
export const createReply = async (req, res) => {
  try {
    const { postId } = req.params;
    const { content } = req.body;

    // Validate input
    const validationErrors = validateReplyData(content);
    if (validationErrors.length > 0) {
      return sendValidationError(res, validationErrors);
    }

    // Get post
    const post = await prisma.forumPost.findUnique({
      where: { id: String(postId) },
      select: { id: true, isLocked: true, courseId: true }
    });
    if (!post) return sendError(res, 'POST_NOT_FOUND');
    if (post.isLocked) return sendError(res, 'POST_LOCKED');

    // Get user
    const clerkUserId = req.auth?.userId;
    if (!clerkUserId) return sendError(res, 'UNAUTHORIZED');

    const dbUser = await getDbUserByCleark(clerkUserId);
    if (!dbUser) return sendError(res, 'USER_NOT_FOUND');

    // Verify course access
    const hasAccess = await verifyCourseAccess(dbUser, post.courseId);
    if (!hasAccess) return sendError(res, 'NOT_ENROLLED');

    // Create reply
    const reply = await prisma.forumReply.create({
      data: {
        postId: post.id,
        content: content.trim(),
        authorId: dbUser.id
      },
      select: {
        id: true,
        content: true,
        createdAt: true,
        updatedAt: true,
        author: {
          select: { id: true, clerkId: true, fullName: true, imageUrl: true }
        }
      }
    });

    // Update post's updatedAt for sorting
    await prisma.forumPost.update({
      where: { id: post.id },
      data: { updatedAt: new Date() },
      select: { id: true }
    });

    // Emit socket event if available
    const io = req.app?.get('io');
    if (io) {
      io.to(`post-${post.id}`).emit('new-reply', {
        postId: post.id,
        reply: addPhTimes(reply)
      });
    }

    return sendSuccess(res, addPhTimes(reply), 201);
  } catch (err) {
    console.error('createReply error:', err);
    return sendError(res, 'SERVER_ERROR', err.message);
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

    const dbUser = await getDbUserByCleark(clerkUserId);
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
    if (!isAuthorOrStaff(dbUser, existing.authorId))
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

    const dbUser = await getDbUserByCleark(clerkUserId);
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

    if (!isAuthorOrStaff(dbUser, existing.authorId))
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

    const dbUser = await getDbUserByCleark(clerkUserId);
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
