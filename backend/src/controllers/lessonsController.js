import prisma from '../lib/prisma.js';

// Reorder lessons within a module (pattern aligned with moduleControllers)
export const reorderLessons = async (req, res) => {
  try {
    const { orderedLessons } = req.body; // expected: [{ id, position }, ...]

    if (!Array.isArray(orderedLessons) || orderedLessons.length === 0) {
      return res.status(400).json({ message: "orderedLessons (non-empty array) is required" });
    }

    const ids = orderedLessons.map(m => m.id);
    if (ids.some(id => !id)) {
      return res.status(400).json({ message: "Each ordered lesson must include an id" });
    }

    // fetch lessons + module + course (we need course.facultyId for auth)
    const lessons = await prisma.lesson.findMany({
      where: { id: { in: ids } },
      include: {
        module: {
          include: {
            course: {
              select: {
                id: true,
                createdById: true,
                facultyId: true
              }
            }
          }
        }
      }
    });

    if (lessons.length !== ids.length) {
      return res.status(404).json({ message: "One or more lessons not found" });
    }

    // ensure all lessons belong to the same module
    const moduleIds = new Set(lessons.map(l => l.module.id));
    if (moduleIds.size !== 1) {
      return res.status(400).json({ message: "Lessons must belong to the same module" });
    }

    const module = lessons[0].module;
    const moduleId = module.id;
    const course = module.course;

    // authorization (req.auth() should be available if route is protected)
    const auth = req.auth ? req.auth() : null;
    const userId = auth?.userId;
    if (!userId) return res.status(403).json({ message: "Not authenticated" });

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { id: true, role: true }
    });
    if (!user) return res.status(403).json({ message: "Not authorized" });

    // Check if user is course creator, assigned faculty, or admin
    const isAuthorized = (course.facultyId && user.id === course.facultyId) || 
                        (!course.facultyId && user.id === course.createdById);
    
    if (!isAuthorized) {
      return res.status(403).json({ message: "Not authorized to reorder lessons for this module" });
    }

    // Normalize positions: use provided order to assign final positions (1-based)
    // Use the order of orderedLessons to assign final positions
    const ordered = orderedLessons.map((m, idx) => ({ id: m.id, position: idx + 1 }));

    // To avoid unique constraint conflicts, first assign temporary positions that cannot collide
    const NEG_OFFSET = 1000000;
    const tempUpdates = ordered.map(u => ({ id: u.id, tempPosition: -(u.position + NEG_OFFSET) }));

    // Build transaction:
    // 1) set temp positions for all affected lessons
    // 2) set final positions for all affected lessons and return selected scalar fields
    const tx = [
      // set temporary positions
      ...tempUpdates.map(tu =>
        prisma.lesson.update({
          where: { id: tu.id },
          data: { position: tu.tempPosition }
        })
      ),
      // set final positions and select useful fields
      ...ordered.map(u =>
        prisma.lesson.update({
          where: { id: u.id },
          data: { position: u.position },
          select: {
            id: true,
            title: true,
            description: true,
            type: true,
            position: true,
            duration: true,
            thumbnail: true,
            url: true,
            moduleId: true
          }
        })
      )
    ];

    const results = await prisma.$transaction(tx);

    // last `ordered.length` entries are the final updated lessons
    const updated = results.slice(tempUpdates.length);

    return res.status(200).json({
      message: "Lessons reordered successfully",
      lessons: updated,
      moduleId
    });
  } catch (error) {
    console.error("Error in reorderLessons controller", error);
    return res.status(500).json({ message: "Internal server error", error: String(error) });
  }
};

export default {
  reorderLessons
};