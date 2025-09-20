import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient();

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

        const { id: currentUserId } = await prisma.user.findUnique({
            where: { clerkId: userId },
            select: { id: true }
        });

        // Check if user is course creator or faculty
        if (course.createdById !== currentUserId && course.facultyId !== currentUserId) {
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
                        videoLessons: true,
                        attachments: true
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
                        videoLessons: true,
                        attachments: true,
                    }
                }
            },
            
            orderBy: [
                { courseId: 'asc' },
                { position: 'asc' }
            ]
        });

        const totalLessons = modules.reduce((sum, mod) => {
          return sum + mod._count.videoLessons + mod._count.attachments;
        }, 0);

        res.status(200).json({ 
            modules, 
            totalLessons
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
                videoLessons: {
                    select: {
                        id: true,
                        title: true,
                        description: true,
                        youtubeId: true,
                        position: true,
                        duration: true,
                        thumbnail: true,
                        url: true,
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

        const { id: currentUserId } = await prisma.user.findUnique({
            where: { clerkId: userId },
            select: { id: true }
        });

        if (existingModule.course.createdById !== currentUserId && 
            existingModule.course.facultyId !== currentUserId) {
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
                _count: { select: { videoLessons: true, attachments: true } },
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
                        createdById: true,
                        facultyId: true
                    }
                }
            }
        });

        if(!existingModule) return res.status(404).json({message: "Module not found"});

        const auth = req.auth();
        const userId = auth.userId;

        const { id: currentUserId } = await prisma.user.findUnique({
            where: { clerkId: userId },
            select: { id: true }
        });

        if (existingModule.course.createdById !== currentUserId && 
            existingModule.course.facultyId !== currentUserId) {
            return res.status(403).json({ message: "Not authorized to delete this module" });
        }

        await prisma.module.delete({where: {id}});

        res.status(200).json({message: "Module deleted successfully"});
        
    } catch (error) {
        console.log("Error in deleteModule controller", error);
        res.status(500).json({ message: "Internal server error" });
    }
}