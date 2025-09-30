import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const isoOrEpoch = (s) => (s ? new Date(s) : new Date(0));
const clampLimit = (n, d = 20, max = 100) => Math.max(1, Math.min(+n || d, max));

export const getCourseForumSummary = async (req, res) => {
  try {
    const { courseId } = req.params;
    const since = isoOrEpoch(req.query.since);

    const newThreads = await prisma.forumPost.count({
      where: { courseId, createdAt: { gt: since } }
    });

    const ids = (await prisma.forumPost.findMany({
      where: { courseId }, select: { id: true }
    })).map(t => t.id);

    const newReplies = ids.length
      ? await prisma.forumReply.count({ where: { postId: { in: ids }, createdAt: { gt: since } } })
      : 0;

    return res.json({ newThreads, newReplies, since: since.toISOString() });
  } catch (e) { console.error(e); res.status(500).json({ message: 'Failed to compute course forum summary' }); }
};

export const getThreadSummary = async (req, res) => {
  try {
    const { postId } = req.params;
    const since = isoOrEpoch(req.query.since);

    const exists = await prisma.forumPost.findUnique({ where: { id: postId }, select: { id: true } });
    if (!exists) return res.status(404).json({ message: 'Thread not found' });

    const newReplies = await prisma.forumReply.count({ where: { postId, createdAt: { gt: since } } });
    return res.json({ newReplies, since: since.toISOString() });
  } catch (e) { console.error(e); res.status(500).json({ message: 'Failed to compute thread summary' }); }
};

export const listChangedThreads = async (req, res) => {
  try {
    const { courseId } = req.params;
    const since = isoOrEpoch(req.query.since);
    const take = clampLimit(req.query.limit);

    const items = await prisma.forumPost.findMany({
      where: { courseId, OR: [{ createdAt: { gt: since } }, { updatedAt: { gt: since } }] },
      orderBy: [{ isPinned: 'desc' }, { updatedAt: 'desc' }],
      take,
      select: {
        id: true, title: true, content: true, isPinned: true, isLocked: true,
        createdAt: true, updatedAt: true,
        _count: { select: { replies: true } }
      }
    });

    return res.json({ items, since: since.toISOString() });
  } catch (e) { console.error(e); res.status(500).json({ message: 'Failed to list changed threads' }); }
};

export const listNewReplies = async (req, res) => {
  try {
    const { postId } = req.params;
    const since = isoOrEpoch(req.query.since);
    const take = clampLimit(req.query.limit, 50);

    const replies = await prisma.forumReply.findMany({
      where: { postId, createdAt: { gt: since } },
      orderBy: { createdAt: 'asc' },
      take,
      select: {
        id: true, content: true, createdAt: true, updatedAt: true, isAnswer: true,
        author: { select: { id: true, fullName: true, imageUrl: true } }
      }
    });

    return res.json({ replies, since: since.toISOString() });
  } catch (e) { console.error(e); res.status(500).json({ message: 'Failed to list new replies' }); }
};
