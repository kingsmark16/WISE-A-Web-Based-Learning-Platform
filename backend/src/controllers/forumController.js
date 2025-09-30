// src/controllers/forumController.js
import { PrismaClient } from '@prisma/client';
import { addPhTimes, addPhTimesArray } from '../utils/withPhTime.js';
const prisma = new PrismaClient();

// ---------- helpers ----------
const clamp = (n, min = 1, max = 100) => Math.max(min, Math.min(+n || min, max));

const getDbUser = async (clerkUserId) => {
  if (!clerkUserId) return null;
  return prisma.user.findUnique({ where: { clerkId: clerkUserId } });
};

const isStaff = (role) => role === 'ADMIN' || role === 'FACULTY';
const ensureAuthorOrStaff = (dbUser, authorId) => isStaff(dbUser.role) || dbUser.id === authorId;

// ---------- THREADS (ForumPost) ----------

/**
 * GET /courses/:courseId/forum/threads?cursor=<id>&limit=20&q=search
 * Sorted by isPinned desc, updatedAt desc.
 */
export const listThreads = async (req, res) => {
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
      take,
      ...(cursor ? { skip: 1, cursor: { id: String(cursor) } } : {}),
      select: {
        id: true,
        title: true,
        content: true,
        isPinned: true,
        isLocked: true,
        createdAt: true,
        updatedAt: true,
        author: { select: { id: true, fullName: true, imageUrl: true } },
        _count: { select: { replies: true } }
      }
    });

    const nextCursor = threads.length === take ? threads[threads.length - 1].id : null;
    return res.json({ items: addPhTimesArray(threads), nextCursor });
  } catch (err) {
    console.error('listThreads error', err);
    return res.status(500).json({ message: 'Failed to list threads' });
  }
};

/**
 * POST /courses/:courseId/forum/threads
 * body: { title, content }
 */
export const createThread = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { title, content } = req.body;
    if (!title || !content) return res.status(400).json({ message: 'title and content are required' });

    const auth = req.auth?.();
    const dbUser = await getDbUser(auth?.userId);
    if (!dbUser) return res.status(401).json({ message: 'User not found' });

    const post = await prisma.forumPost.create({
      data: { title, content, courseId, authorId: dbUser.id }
    });

    return res.status(201).json(addPhTimes(post));
  } catch (err) {
    console.error('createThread error', err);
    return res.status(500).json({ message: 'Failed to create thread' });
  }
};

/**
 * GET /forum/posts/:postId
 * returns post + first page of replies
 * query: ?cursor=<replyId>&limit=50
 */
export const getThread = async (req, res) => {
  try {
    const { postId } = req.params;
    const { cursor, limit } = req.query;
    const take = clamp(limit, 1, 100);

    const post = await prisma.forumPost.findUnique({
      where: { id: String(postId) },
      select: {
        id: true,
        title: true,
        content: true,
        isPinned: true,
        isLocked: true,
        createdAt: true,
        updatedAt: true,
        courseId: true,
        author: { select: { id: true, fullName: true, imageUrl: true } }
      }
    });
    if (!post) return res.status(404).json({ message: 'Thread not found' });

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
        author: { select: { id: true, fullName: true, imageUrl: true } }
      }
    });

    const nextCursor = replies.length === take ? replies[replies.length - 1].id : null;
    return res.json({ post: addPhTimes(post), replies: addPhTimesArray(replies), nextCursor });
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
export const updateThread = async (req, res) => {
  try {
    const { postId } = req.params;
    const { title, content } = req.body;

    const existing = await prisma.forumPost.findUnique({
      where: { id: String(postId) },
      select: { id: true, authorId: true }
    });
    if (!existing) return res.status(404).json({ message: 'Thread not found' });

    const auth = req.auth?.();
    const dbUser = await getDbUser(auth?.userId);
    if (!dbUser) return res.status(401).json({ message: 'User not found' });
    if (!ensureAuthorOrStaff(dbUser, existing.authorId))
      return res.status(403).json({ message: 'Not allowed to edit this thread' });

    const updated = await prisma.forumPost.update({
      where: { id: existing.id },
      data: { ...(title && { title }), ...(content && { content }) }
    });
    return res.json(addPhTimes(updated));
  } catch (err) {
    console.error('updateThread error', err);
    return res.status(500).json({ message: 'Failed to update thread' });
  }
};

/**
 * DELETE /forum/posts/:postId
 * Staff only (faculty/admin)
 */
export const deleteThread = async (req, res) => {
  try {
    const { postId } = req.params;

    const existing = await prisma.forumPost.findUnique({ where: { id: String(postId) } });
    if (!existing) return res.status(404).json({ message: 'Thread not found' });

    await prisma.forumPost.delete({ where: { id: existing.id } });
    return res.json({ message: 'Deleted' });
  } catch (err) {
    console.error('deleteThread error', err);
    return res.status(500).json({ message: 'Failed to delete thread' });
  }
};

/**
 * POST /forum/posts/:postId/pin|unpin|lock|unlock
 * Staff only (faculty/admin)
 */
export const setThreadFlag = (flag, value) => {
  return async (req, res) => {
    try {
      const { postId } = req.params;
      const data =
        flag === 'pin' ? { isPinned: value } :
        flag === 'lock' ? { isLocked: value } :
        null;

      if (!data) return res.status(400).json({ message: 'Unknown flag' });

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
      select: { id: true, isLocked: true }
    });
    if (!post) return res.status(404).json({ message: 'Thread not found' });
    if (post.isLocked) return res.status(403).json({ message: 'Thread is locked' });

    const auth = req.auth?.();
    const dbUser = await getDbUser(auth?.userId);
    if (!dbUser) return res.status(401).json({ message: 'User not found' });

    const reply = await prisma.forumReply.create({
      data: { postId: post.id, content, authorId: dbUser.id }
    });

    // bump thread updatedAt for sorting
    await prisma.forumPost.update({ where: { id: post.id }, data: { updatedAt: new Date() } });

    return res.status(201).json(addPhTimes(reply));
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
      select: { id: true, authorId: true, postId: true }
    });
    if (!existing) return res.status(404).json({ message: 'Reply not found' });

    const auth = req.auth?.();
    const dbUser = await getDbUser(auth?.userId);
    if (!dbUser) return res.status(401).json({ message: 'User not found' });
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
      select: { id: true, authorId: true }
    });
    if (!existing) return res.status(404).json({ message: 'Reply not found' });

    const auth = req.auth?.();
    const dbUser = await getDbUser(auth?.userId);
    if (!dbUser) return res.status(401).json({ message: 'User not found' });
    if (!ensureAuthorOrStaff(dbUser, existing.authorId))
      return res.status(403).json({ message: 'Not allowed to delete this reply' });

    await prisma.forumReply.delete({ where: { id: existing.id } });
    return res.json({ message: 'Deleted' });
  } catch (err) {
    console.error('deleteReply error', err);
    return res.status(500).json({ message: 'Failed to delete reply' });
  }
};
