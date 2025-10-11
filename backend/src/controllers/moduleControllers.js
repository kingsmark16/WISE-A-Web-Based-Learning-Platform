import prisma from "../lib/prisma.js";

export const createModule = async (req, res) => {
    try {
        
        const {title, description, courseId, position} = req.body;

        if(!title || !courseId) return res.status(400).json({message: "Title and courseId are required"});

        const course = await prisma.course.findUnique({
            where: {id: courseId},
            select: {
                id: true,
                createdById: true,
                facultyId: true
            }
        });

        if(!course) return res.status(404).json({message: "Course not found"});

        const auth = req.auth();
        const userId = auth.userId;

        const user = await prisma.user.findUnique({
            where: { clerkId: userId },
            select: { id: true, role: true }
        });

        // Check if user is course creator or faculty
        if (user.id !== course.facultyId && user.role !== 'ADMIN' ) {
            return res.status(403).json({ message: "Not authorized to create modules for this course" });
        }

        let modulePosition = position;
        if (!modulePosition) {
            const lastModule = await prisma.module.findFirst({
                where: { courseId },
                orderBy: { position: 'desc' },
                select: { position: true }
            });
            modulePosition = lastModule ? lastModule.position + 1 : 1;
        }

        const newModule = await prisma.module.create({
            data: {
                title,
                description,
                courseId,
                position: modulePosition
            },
            include: {
                course: {
                    select: {
                        id: true,
                        title: true
                    }
                },
                _count: {
                    select: {
                        lessons: true,
                    }
                }
            }
        });

        res.status(201).json({
            message: "Module created successfully",
            module: newModule
        });


    } catch (error) {
        console.log("Error in createModule controller", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

export const getModules = async (req, res) => {
    try {

        const {courseId} = req.query;

        if(!courseId) return res.status(400).json({message: "courseId is required"});

        const whereClause = courseId ? { courseId } : {};

        const modules = await prisma.module.findMany({
            where: whereClause,
            select: {
                id: true,
                title: true,
                position: true,
                updatedAt: true,
                _count: {
                    select: {
                        lessons: true,
                    }
                }
            },
            
            orderBy: [
                { courseId: 'asc' },
                { position: 'asc' }
            ]
        });

        

        res.status(200).json({ 
            modules, 
        });
        
    } catch (error) {
        console.log("Error in getModule controller", error);
        res.status(500).json({ message: "Internal server error" });
    }
}


export const getModule = async (req, res) => {
    try {

        const {id} = req.params;

        if(!id) return res.status(400).json({message: "Module id is required"});

        const module = await prisma.module.findUnique({
            where: {id},
            select: {
                id: true,
                title: true,
                description: true,
                position: true,
                courseId: true,
                updatedAt: true,
                lessons: {
                    select: {
                        id: true,
                        title: true,
                        description: true,
                        type: true,
                        dropboxPath: true,
                        youtubeId: true,
                        position: true,
                        duration: true,
                        thumbnail: true,
                        url: true,
                    },
                    orderBy: { position: 'asc' }
                },
                links: {
                    select: {
                        id: true,
                        title: true,
                        description: true,
                        url: true,
                        position: true,
                        createdAt: true,
                        updatedAt: true,
                    },
                    orderBy: { position: 'asc' }
                },
                quiz: {
                    select: {
                        id: true,
                        title: true,
                        description: true,
                        timeLimit: true,
                        questions: true,
                    }
                }
            },
        })
        if(!module) return res.status(404).json({message: "Module not found"});

        res.status(200).json({module});
        
    } catch (error) {
        console.log("Error in getModule controller", error);
        res.status(500).json({ message: "Internal server error" });
    }
}


export const updateModule = async (req, res) => {
    try {

        const {id} = req.params;
        const updateData = req.body;

        if(!id) return res.status(400).json({message: "Module id is required"});

        const existingModule = await prisma.module.findUnique({
            where: {id},
            include: {
                course: {
                    select: {
                        createdById: true,
                        facultyId: true
                    }
                }
            }
        });

        if(!existingModule) return res.status(404).json({message: "Module not found"});

        const auth = req.auth();
        const userId = auth.userId;

        const user = await prisma.user.findUnique({
            where: { clerkId: userId },
            select: { id: true, role: true }
        });

        if (user.role !== 'ADMIN' && 
            existingModule.course.facultyId !== user.id) {
            return res.status(403).json({ message: "Not authorized to update this module" });
        }

        // Filter out undefined/null values
        const filteredData = Object.fromEntries(
            Object.entries(updateData).filter(([_, value]) => 
                value !== undefined && value !== null && value !== ""
            )
        );

        const updatedModule = await prisma.module.update({
            where: {id},
            data: filteredData,
            include: {
                course: { select: { id: true, title: true } },
                _count: { select: { lessons: true } },
            }
        });

        res.status(200).json({
            message: "Module updated successfully",
            module: updatedModule
        });

        
    } catch (error) {
        console.log("Error in updateModule controller", error);
        res.status(500).json({ message: "Internal server error" });
    }
}


export const deleteModule = async (req, res) => {
    try {
        const {id} = req.params;

        if(!id) return res.status(400).json({message: "Module id is required"});

        const existingModule = await prisma.module.findUnique({
            where: {id},
            include: {
                course: {
                    select: {
                        id: true,
                        createdById: true,
                        facultyId: true
                    }
                }
            }
        });

        if(!existingModule) return res.status(404).json({message: "Module not found"});

        const auth = req.auth();
        const userId = auth.userId;

        const user = await prisma.user.findUnique({
            where: { clerkId: userId },
            select: { id: true, role: true }
        });

        if (user.role !== 'ADMIN' && 
            existingModule.course.facultyId !== user.id) {
            return res.status(403).json({ message: "Not authorized to delete this module" });
        }

        const modulePosition = existingModule.position;
        const courseId = existingModule.courseId;

        // Use transaction to delete module and adjust positions
        await prisma.$transaction(async (tx) => {
            // 1. Delete the module
            await tx.module.delete({
                where: { id }
            });

            // 2. Shift all modules with higher positions down by 1
            await tx.module.updateMany({
                where: {
                    courseId: courseId,
                    position: {
                        gt: modulePosition
                    }
                },
                data: {
                    position: {
                        decrement: 1
                    }
                }
            });
        });

        res.status(200).json({
            message: "Module deleted successfully",
            deletedModuleId: id,
            deletedPosition: modulePosition
        });
        
    } catch (error) {
        console.log("Error in deleteModule controller", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

// New: bulk reorder modules
export const reorderModules = async (req, res) => {
  try {
    const { orderedModules } = req.body; // expected: [{ id, position }, ...]

    if (!Array.isArray(orderedModules) || orderedModules.length === 0) {
      return res.status(400).json({ message: "orderedModules (non-empty array) is required" });
    }

    const ids = orderedModules.map(m => m.id);
    if (ids.some(id => !id)) {
      return res.status(400).json({ message: "Each ordered module must include an id" });
    }

    // fetch modules & their course info
    const modules = await prisma.module.findMany({
      where: { id: { in: ids } },
      include: {
        course: {
          select: {
            id: true,
            createdById: true,
            facultyId: true
          }
        }
      }
    });

    if (modules.length !== ids.length) {
      return res.status(404).json({ message: "One or more modules not found" });
    }

    // ensure all modules belong to the same course
    const courseIds = new Set(modules.map(m => m.course.id));
    if (courseIds.size !== 1) {
      return res.status(400).json({ message: "Modules must belong to the same course" });
    }
    const course = modules[0].course;
    const courseId = course.id;

    // auth & authorization
    const auth = req.auth();
    const userId = auth.userId;
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { id: true, role: true }
    });

    if (user.role !== 'ADMIN' && course.facultyId !== user.id) {
      return res.status(403).json({ message: "Not authorized to reorder modules for this course" });
    }

    // Normalize positions: ensure unique, sequential positions based on provided order
    // Use the order of orderedModules to assign final positions (1-based)
    const ordered = orderedModules.map((m, idx) => ({ id: m.id, position: idx + 1 }));

    // To avoid unique constraint conflicts, first assign temporary positions that cannot collide
    // Use a large negative offset to ensure uniqueness
    const NEG_OFFSET = 1000000;
    const tempUpdates = ordered.map(u => ({ id: u.id, tempPosition: -(u.position + NEG_OFFSET) }));

    // Build transaction:
    // 1) set temp positions for all affected modules
    // 2) set final positions for all affected modules and return the updated rows
    const tx = [
      // set temporary positions
      ...tempUpdates.map(tu =>
        prisma.module.update({
          where: { id: tu.id },
          data: { position: tu.tempPosition }
        })
      ),
      // set final positions and include counts
      ...ordered.map(u =>
        prisma.module.update({
          where: { id: u.id },
          data: { position: u.position },
          include: {
            _count: { select: { lessons: true } },
          }
        })
      )
    ];

    const results = await prisma.$transaction(tx);

    // last `ordered.length` entries are the final updated modules
    const updated = results.slice(tempUpdates.length);

    res.status(200).json({
      message: "Modules reordered successfully",
      modules: updated,
      courseId
    });
  } catch (error) {
    console.log("Error in reorderModules controller", error);
    res.status(500).json({ message: "Internal server error" });
  }
};