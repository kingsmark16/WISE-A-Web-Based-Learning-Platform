import { getAuth } from '@clerk/express';
import prisma from '../lib/prisma.js'; 

// Default export: attaches req.user
export default async function authMiddleware(req, res, next) {
  try {
    const { userId } = getAuth(req);
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const user = await prisma.user.findUnique({ where: { clerkId: userId } });
    if (!user) return res.status(401).json({ message: 'User not found' });

    req.user = { id: user.id, role: user.role, clerkId: userId, email: user.emailAddress };
    next();
  } catch (e) {
    console.error('authMiddleware error:', e);
    res.status(401).json({ message: 'Unauthorized' });
  }
}

// Re-export role checks so existing imports keep working
export { requireRoles } from './roleMiddleware.js';
export const requireRole = (role) => (req, res, next) => {
  const r = req.user?.role;
  if (!r) return res.status(401).json({ message: 'Unauthorized' });
  if (r !== role) return res.status(403).json({ message: 'Forbidden' });
  next();
};
