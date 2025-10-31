import prisma from '../lib/prisma.js';
import { generateCourseCode } from "../utils/generateCourseCode.js";
import cloudinary from "../lib/cloudinary.js";

export const createCourse = async (req, res) => {
   try {
      const {title, description, college, facultyId, thumbnail, assignSelfAsInstructor} = req.body;
      const code = generateCourseCode();

      if(!title || !college){
         return res.status(400).json({message: "Please provide title and college"});
      }

      const auth = req.auth();
      const userId = auth.userId;

      const user = await prisma.user.findUnique({
         where: {
            clerkId: userId
         },
         select: {
            id: true,
            role: true
         }
      })

      const createdById = user.id;
      
      // Determine facultyId: if assignSelfAsInstructor is true and user is ADMIN, use their ID
      let assignedFacultyId = facultyId;
      if (assignSelfAsInstructor && user.role === 'ADMIN') {
         assignedFacultyId = user.id;
      }

      const newCourse = await prisma.course.create({
         data: {
            title,
            description,
            thumbnail,
            college,
            code,
            createdById,
            facultyId: assignedFacultyId
         }
      })

      res.status(201).json({message: 'Course created successfully', newCourse})

   } catch (error) {
      console.log("Error in createCourse controller", error);
      res.status(500).json({message: "Internal server error"});
   }
}

export const getCourses = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 12;
        const skip = (page - 1) * limit;
        const search = req.query.search || '';
        const status = req.query.status || 'all';
        const college = req.query.college || 'all';

        // Build where clause for filtering
        const whereClause = {};

        // Search filter
        if (search) {
            whereClause.title = {
                contains: search,
                mode: 'insensitive'
            };
        }

        // Status filter
        if (status !== 'all') {
            whereClause.status = status.toUpperCase();
        }

        // College filter
        if (college !== 'all') {
            whereClause.college = college;
        }

        // Get total count for pagination
        const totalCourses = await prisma.course.count({
            where: whereClause
        });

        const courses = await prisma.course.findMany({
            where: whereClause,
            skip,
            take: limit,
            select: {
                id: true,
                title: true,
                thumbnail: true,
                college: true,
                status: true,
                code: true,
                createdAt: true,
                updatedAt: true,
                createdBy: {
                    select: {
                        fullName: true,
                        clerkId: true,
                        imageUrl: true, // Added imageUrl
                    }
                },
                managedBy: {
                    select: {
                        fullName: true,
                        imageUrl: true, // Added imageUrl
                    }
                },
                _count: {
                    select: {
                        enrollments: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        const totalPages = Math.ceil(totalCourses / limit);

        res.status(200).json({ 
            courses,
            pagination: {
                currentPage: page,
                totalPages,
                totalCourses,
                limit,
                hasNextPage: page < totalPages,
                hasPreviousPage: page > 1
            }
        });

    } catch (error) {
        console.log("Error in getCourses controller", error);
        res.status(500).json({ message: "Internal server error" });
    }
}


export const getCourse = async (req, res) => {
    try {
        const {id} = req.params;

        if(!id) return res.status(404).json({message: "Course not found"});

        const course = await prisma.course.findUnique({
            where: {
                id
            },
            select: {
                id: true,
                title: true,
                description: true,
                thumbnail: true,
                college: true,
                status: true,
                code: true,
                updatedAt: true,
                createdBy: {
                    select: {
                        fullName: true,
                        imageUrl: true
                    }
                },
                managedBy: {
                    select: {
                        fullName: true,
                        imageUrl: true
                    }
                },
                enrollments: {
                    select: {
                        id: true,
                        enrolledAt: true,
                        student: {
                            select: {
                                fullName: true,
                                imageUrl: true,
                                lastActiveAt: true
                            }
                        }
                    },
                    orderBy: {
                        enrolledAt: 'desc'
                    }
                },
                _count: {
                    select: {
                        enrollments: true
                    }
                }

            }
        })

        if(!course) {
            return res.status(404).json({message: "Course not found"});
        }

        res.status(200).json({course});

    } catch (error) {
        console.log("Error in getCourse controller");
        res.status(500).json({message: "Internal Server Error"});
    }
}


export const archiveCourse = async (req, res) => {
    try {
        const {id} = req.params;

        const course = await prisma.course.findUnique({
            where: {
                id
            }
        });

        if(!course){
            return res.status(404).json({message: "Course not found"});
        }

        // Update course status to ARCHIVED
        await prisma.course.update({
            where: {
                id
            },
            data: {
                status: 'ARCHIVED'
            }
        })

        res.status(200).json({
            message: "Course archived successfully",
            data: {
                id: course.id,
                title: course.title,
                status: 'ARCHIVED'
            }
        });
    } catch (error) {
        console.error("Error in archiveCourse controller:", error);
        res.status(500).json({message: "Failed to archive course"});
    }
}



export const updateCourse = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, college, thumbnail, facultyId, assignSelfAsInstructor } = req.body;

        const auth = req.auth();
        const userId = auth.userId;

        const user = await prisma.user.findUnique({
            where: {
                clerkId: userId
            },
            select: {
                id: true,
                role: true
            }
        });

        // Prepare update data
        const updateData = {
            title,
            description,
            college,
            thumbnail
        };

        // Only update facultyId if it's explicitly provided or assignSelfAsInstructor is true
        if (assignSelfAsInstructor && user.role === 'ADMIN') {
            updateData.facultyId = user.id;
        } else if (facultyId !== undefined) {
            // If facultyId is explicitly provided (even if empty string to remove instructor)
            if (facultyId && facultyId.trim() !== "") {
                // Validate that the facultyId exists
                const facultyExists = await prisma.user.findUnique({
                    where: { id: facultyId },
                    select: { id: true }
                });
                if (facultyExists) {
                    updateData.facultyId = facultyId;
                }
            } else if (facultyId === "") {
                // Explicitly set to null to remove instructor
                updateData.facultyId = null;
            }
            // If facultyId is undefined, don't update it (keep existing value)
        }

        const updatedCourse = await prisma.course.update({
            where: { id },
            data: updateData,
            select: {
                id: true,
                title: true,
                description: true,
                college: true,
                thumbnail: true,
                facultyId: true,
                updatedAt: true
            }
        });

        res.status(200).json({ message: 'Course updated successfully', updatedCourse });
    } catch (error) {
        console.log("Error in updateCourse controller", error);
        res.status(500).json({ message: "Internal server error" });
    }
};


export const publishCourse = async (req, res) => {
    try {
        
        const {id} = req.params;
        const {status} = req.body;

        // Validate status is one of the allowed values
        const validStatuses = ['DRAFT', 'PUBLISHED', 'ARCHIVED'];
        if(!id || !validStatuses.includes(status)) {
            return res.status(400).json({message: "Invalid request. Status must be DRAFT, PUBLISHED, or ARCHIVED"});
        }

        // Check if course is archived
        const course = await prisma.course.findUnique({
            where: {id},
            select: {
                id: true,
                status: true
            }
        });

        if(!course) {
            return res.status(404).json({message: "Course not found"});
        }

        // Prevent publishing archived courses
        if(course.status === 'ARCHIVED' && status === 'PUBLISHED') {
            return res.status(403).json({message: "Archived courses cannot be published. Please restore the course first."});
        }

        const updatedCourse = await prisma.course.update({
            where: {id},
            data: {status},
            select: {
                id: true,
                title: true,
                status: true,
                updatedAt: true
            }
        });

        res.status(200).json({message: "Course status updated", course: updatedCourse});

    } catch (error) {
        console.log("Error in publishCourse controller", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}


