import prisma from '../lib/prisma.js';
import { generateCourseCode } from "../utils/generateCourseCode.js";
import cloudinary from "../lib/cloudinary.js";

export const createCourse = async (req, res) => {
   try {
      const {title, description, college, facultyId, thumbnail} = req.body;
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
      
      // Determine facultyId based on user role
      let assignedFacultyId = null;
      
      if (user.role === 'FACULTY') {
         // Faculty creating course: automatically assign themselves as instructor
         assignedFacultyId = user.id;
      } else if (user.role === 'ADMIN') {
         // Admin can either assign themselves or assign another faculty
         if (facultyId) {
            // Admin is explicitly assigning a specific faculty
            assignedFacultyId = facultyId;
         } else {
            // Admin is assigning themselves as instructor
            assignedFacultyId = user.id;
         }
      }

      const newCourse = await prisma.course.create({
         data: {
            title,
            description,
            thumbnail,
            college,
            code,
            status: 'DRAFT',
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
                facultyId: true,
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
            },
            select: {
                id: true,
                title: true,
                createdById: true,
                facultyId: true
            }
        });

        if(!course){
            return res.status(404).json({message: "Course not found"});
        }

        // Authorization: only course creator, assigned faculty, or admin can archive
        const auth = req.auth();
        const userId = auth.userId;

        const user = await prisma.user.findUnique({
            where: { clerkId: userId },
            select: { id: true, role: true }
        });

        // Authorization: If faculty is assigned, only they can archive
        // If no faculty is assigned, only creator can archive
        const isAuthorized = (course.facultyId && user.id === course.facultyId) || 
                            (!course.facultyId && user.id === course.createdById);
        
        if (!isAuthorized) {
            return res.status(403).json({ message: 'Not authorized to archive this course' });
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
        const { title, description, college, thumbnail, facultyId, assignSelfAsInstructor, certificateEnabled } = req.body;

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

        // Check course exists and get createdById for authorization
        const course = await prisma.course.findUnique({
            where: { id },
            select: { createdById: true, facultyId: true }
        });

        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        // Authorization: If faculty is assigned, only they can update
        // If no faculty is assigned, only creator can update
        const isAuthorized = (course.facultyId && user.id === course.facultyId) || 
                            (!course.facultyId && user.id === course.createdById);
        
        if (!isAuthorized) {
            return res.status(403).json({ message: 'Not authorized to update this course' });
        }

        // Prepare update data
        const updateData = {
            title,
            description,
            college,
            thumbnail
        };

        // Add certificateEnabled if provided
        if (certificateEnabled !== undefined) {
            updateData.certificateEnabled = certificateEnabled;
        }

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
                certificateEnabled: true,
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
                status: true,
                createdById: true,
                facultyId: true
            }
        });

        if(!course) {
            return res.status(404).json({message: "Course not found"});
        }

        // Authorization: Check if user is course creator, assigned faculty, or admin
        const auth = req.auth();
        const userId = auth.userId;

        const user = await prisma.user.findUnique({
            where: { clerkId: userId },
            select: { id: true, role: true }
        });

        // Authorization: If faculty is assigned, only they can publish
        // If no faculty is assigned, only creator can publish
        const isAuthorized = (course.facultyId && user.id === course.facultyId) || 
                            (!course.facultyId && user.id === course.createdById);
        
        if (!isAuthorized) {
            return res.status(403).json({ message: "Not authorized to update course status" });
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


