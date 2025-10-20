import prisma from '../lib/prisma.js';

export const getCourseCategories = async (req, res) => {
    try {

        const categories = await prisma.course.findMany({
            select: {
                category: true
            },
            distinct: ['category'],
            where: {
                isPublished: true
            }
        });

        const categoryList = categories.map(course => course.category).filter(Boolean);
        
        res.status(200).json({data: categoryList});

    } catch (error) {
        console.error('Error fetching course categories:', error);
        res.status(500).json({
            message: 'Failed to fetch course categories',
            error: error.message
        });
    }
}




export const getFeaturedCourses = async (req, res) => {
    try {
        const featuredCourses = await prisma.$queryRaw`
            SELECT 
                c.id, 
                c.title, 
                c.thumbnail, 
                c.category, 
                u."fullName" AS managedBy
            FROM "Course" c
            LEFT JOIN "User" u ON c."facultyId" = u.id
            WHERE c."isPublished" = true
            ORDER BY RANDOM()
            LIMIT 10
        `;

        res.status(200).json({ data: featuredCourses });
    } catch (error) {
        console.error('Error fetching featured courses:', error);
        res.status(500).json({
            message: 'Failed to fetch featured courses',
            error: error.message
        });
    }
}

export const getSelectedCourse = async (req, res) => {
    try {
        
        const {id} = req.params;

        if(!id) return res.status(404).json({message: "Invalid Course ID"});

        const course = await prisma.course.findUnique({
            where: {
                id
            },
            select: {
                title: true,
                description: true,
                thumbnail: true,
                category: true,
                updatedAt: true,
                managedBy: {
                    select: {
                        fullName: true,
                        imageUrl: true,
                    }
                },
                _count: {
                    select: {
                        enrollments: true,
                        modules: true
                    }
                },
                modules: {
                    select: {
                        _count: {
                            select: {
                                lessons: true
                            }
                        }
                    }
                }
            }
        });

        if(!course) return res.status(404).json({message: "Course Not Found"});

        // Calculate total lessons from all modules
        const totalLessons = course.modules?.reduce((total, module) => total + (module._count?.lessons || 0), 0) || 0;

        // Remove modules from response and add totalLessons
        const { modules, ...courseData } = course;
        const responseData = {
            ...courseData,
            totalLessons
        };

        res.status(200).json({data: responseData});

    } catch (error) {
        console.error('Error fetching course details:', error);
        res.status(500).json({
            message: 'Failed to fetch course details',
            error: error.message
        });
    }
}


export const enrollInCourse = async (req, res) => {
    try {

        const {courseId, courseCode} = req.body;
        const userId = req.auth().userId;

        if(!courseId) return res.status(400).json({message: "Course ID is required"});
        if(!courseCode) return res.status(400).json({message: "Course code is required"});
        if(!userId) return res.status(401).json({message: "User not authenticated"});

        const course = await prisma.course.findUnique({
            where: {id: courseId, isPublished: true}
        });

        const user = await prisma.user.findUnique({
            where: {
                clerkId: userId
            },
            select: {
                id: true
            }
        })

        if(!user) return res.status(404).json({message: "User not found in database"});

        if(!course) return res.status(404).json({message: "Course not found"});
        if (!course.isPublished) {
            return res.status(400).json({ message: "Course is not available for enrollment" });
        }

        // Verify course code
        if(!course.code) {
            return res.status(400).json({message: "This course does not have an enrollment code"});
        }

        if(course.code !== courseCode.trim()) {
            return res.status(403).json({message: "Invalid course code. Please check and try again."});
        }

        const studentId = user.id;

        const existingEnrollment = await prisma.enrollment.findUnique({
            where: {
                studentId_courseId: {
                    studentId,
                    courseId
                }
            }
        });

        if(existingEnrollment) {
            return res.status(409).json({message: "You are already enrolled in this course"});
        }

        // Enroll the student in the course
        const enrollment = await prisma.enrollment.create({
            data: {
                studentId,
                courseId
            },
            include: {
                course: {
                    select: {
                        id: true,
                        title: true,
                        thumbnail: true
                    }
                }
            }
        });

        res.status(200).json({
            message: "Successfully enrolled in course",
            data: enrollment
        });

    } catch (error) {
        console.error('Error enrolling in course:', error);
        res.status(500).json({
            message: 'Failed to enroll in course',
            error: error.message
        });
    }
}

export const checkEnrollmentStatus = async (req, res) => {
    try {

        const {courseId} = req.params;
        const userId = req.auth().userId;

        if(!userId) return res.status(401).json({message: "User not authenticated"});

        const user = await prisma.user.findUnique({
            where: {
                clerkId: userId
            },
            select: {
                id: true
            }
        })

        if(!user) return res.status(404).json({message: "User not found in database"});

        const studentId = user.id;
        

        const enrollment = await prisma.enrollment.findUnique({
            where: {
                studentId_courseId: {
                    studentId,
                    courseId
                }
            }
        });

        res.status(200).json({
            isEnrolled: !!enrollment,
            enrollmentDate: enrollment?.enrolledAt || null
        });

        
    } catch (error) {
        console.error('Error checking enrollment status:', error);
        res.status(500).json({
            message: 'Failed to check enrollment status',
            error: error.message
        });
    }
}

export const unenrollInCourse = async (req, res) => {
    try {

        const {courseId} = req.body;
        const userId = req.auth().userId;

        if(!courseId) return res.status(400).json({message: "Course ID is required"});
        if(!userId) return res.status(401).json({message: "User not authenticated"});

        const user = await prisma.user.findUnique({
            where: {
                clerkId: userId
            },
            select: {
                id: true
            }
        })

        if(!user) return res.status(404).json({message: "User not found in database"});

        const studentId = user.id;

        const existingEnrollment = await prisma.enrollment.findUnique({
            where: {
                studentId_courseId: {
                    studentId,
                    courseId
                }
            }
        });

        if(!existingEnrollment) {
            return res.status(404).json({message: "Enrollment not found"});
        }

        // Delete the enrollment
        await prisma.enrollment.delete({
            where: {
                studentId_courseId: {
                    studentId,
                    courseId
                }
            }
        });

        res.status(200).json({
            message: "Successfully unenrolled from course"
        });

    } catch (error) {
        console.error('Error unenrolling from course:', error);
        res.status(500).json({
            message: 'Failed to unenroll from course',
            error: error.message
        });
    }
}