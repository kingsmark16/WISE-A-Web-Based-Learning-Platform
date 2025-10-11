import prisma from '../lib/prisma.js';

export const requireCourseMembership = () => async (req, res, next) => {
  try {
    const auth = req.auth?.();
    const clerkUserId = auth?.userId;
    if (!clerkUserId) return res.status(401).json({ message: 'Not authenticated' });

    const { courseId } = req.params;
    if (!courseId) return res.status(400).json({ message: 'courseId missing in params' });

    const dbUser = await prisma.user.findUnique({
      where: { clerkId: clerkUserId },
      select: { id: true, role: true }
    });
    if (!dbUser) return res.status(401).json({ message: 'User not synced' });

    if (dbUser.role === 'ADMIN') return next(); // ADMIN sees all forums

    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: { id: true, createdById: true, facultyId: true }
    });
    if (!course) return res.status(404).json({ message: 'Course not found' });

    if (dbUser.role === 'FACULTY') {
      const manages = course.createdById === dbUser.id || course.facultyId === dbUser.id;
      if (manages) return next();
      return res.status(403).json({ message: 'Not a faculty of this course' });
    }

    if (dbUser.role === 'STUDENT') {
      const enrolled = await prisma.enrollment.findFirst({
        where: { courseId, studentId: dbUser.id }
      });
      if (enrolled) return next();
      return res.status(403).json({ message: 'Not enrolled in this course' });
    }

    return res.status(403).json({ message: 'Role not permitted' });
  } catch (err) {
    console.error('requireCourseMembership error', err);
    return res.status(500).json({ message: 'Membership check failed' });
  }
};

export default requireCourseMembership;
