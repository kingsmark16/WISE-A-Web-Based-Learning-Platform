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

export const getCourseModules = async (req, res) => {
    try {

        const {courseId} = req.params;
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

        // Check if student is enrolled in the course
        const enrollment = await prisma.enrollment.findUnique({
            where: {
                studentId_courseId: {
                    studentId,
                    courseId
                }
            }
        });

        if(!enrollment) {
            return res.status(403).json({message: "You are not enrolled in this course"});
        }

        // Fetch modules with lesson count
        const modules = await prisma.module.findMany({
            where: {
                courseId
            },
            select: {
                id: true,
                title: true,
                updatedAt: true,
                _count: {
                    select: {
                        lessons: true
                    }
                }
            },
            orderBy: {
                position: 'asc'
            }
        });

        // Format response
        const formattedModules = modules.map(module => ({
            id: module.id,
            title: module.title,
            updatedAt: module.updatedAt,
            totalLessons: module._count.lessons
        }));

        res.status(200).json({data: formattedModules});

    } catch (error) {
        console.error('Error fetching course modules:', error);
        res.status(500).json({
            message: 'Failed to fetch course modules',
            error: error.message
        });
    }
}

// Mark a lesson as completed by a student
export const markLessonComplete = async (req, res) => {
    try {
        const { lessonId } = req.body;
        const userId = req.auth().userId;

        if(!lessonId) return res.status(400).json({message: "Lesson ID is required"});
        if(!userId) return res.status(401).json({message: "User not authenticated"});

        const user = await prisma.user.findUnique({
            where: { clerkId: userId },
            select: { id: true }
        });

        if(!user) return res.status(404).json({message: "User not found"});

        // Create or update lesson progress
        const lessonProgress = await prisma.lessonProgress.upsert({
            where: {
                studentId_lessonId: {
                    studentId: user.id,
                    lessonId
                }
            },
            update: {
                isCompleted: true,
                progress: 100,
                completedAt: new Date(),
                updatedAt: new Date()
            },
            create: {
                studentId: user.id,
                lessonId,
                isCompleted: true,
                progress: 100,
                completedAt: new Date()
            }
        });

        res.status(200).json({
            message: "Lesson marked as completed",
            data: lessonProgress
        });

    } catch (error) {
        console.error('Error marking lesson complete:', error);
        res.status(500).json({
            message: 'Failed to mark lesson as completed',
            error: error.message
        });
    }
}

// Get student's course progress
export const getStudentCourseProgress = async (req, res) => {
    try {
        const { courseId } = req.params;
        const userId = req.auth().userId;

        if(!courseId) return res.status(400).json({message: "Course ID is required"});
        if(!userId) return res.status(401).json({message: "User not authenticated"});

        const user = await prisma.user.findUnique({
            where: { clerkId: userId },
            select: { id: true }
        });

        if(!user) return res.status(404).json({message: "User not found"});

        // Check enrollment
        const enrollment = await prisma.enrollment.findUnique({
            where: {
                studentId_courseId: {
                    studentId: user.id,
                    courseId
                }
            }
        });

        if(!enrollment) {
            return res.status(403).json({message: "You are not enrolled in this course"});
        }

        // Get course progress
        const courseProgress = await prisma.courseProgress.findUnique({
            where: {
                studentId_courseId: {
                    studentId: user.id,
                    courseId
                }
            }
        });

        // If no progress record exists, create default one
        if (!courseProgress) {
            // Calculate total lessons and quizzes in course
            const course = await prisma.course.findUnique({
                where: { id: courseId },
                select: {
                    modules: {
                        select: {
                            _count: {
                                select: { lessons: true }
                            },
                            quiz: {
                                select: { id: true }
                            }
                        }
                    }
                }
            });

            const totalLessons = course.modules.reduce((sum, m) => sum + m._count.lessons, 0);
            const totalQuizzes = course.modules.filter(m => m.quiz).length;

            const newProgress = await prisma.courseProgress.create({
                data: {
                    studentId: user.id,
                    courseId,
                    totalLessons,
                    totalQuizzes,
                    progressPercentage: 0
                }
            });

            return res.status(200).json({ data: newProgress });
        }

        res.status(200).json({ data: courseProgress });

    } catch (error) {
        console.error('Error fetching course progress:', error);
        res.status(500).json({
            message: 'Failed to fetch course progress',
            error: error.message
        });
    }
}

// Get student's lesson progress
export const getStudentLessonProgress = async (req, res) => {
    try {
        const { courseId } = req.params;
        const userId = req.auth().userId;

        if(!courseId) return res.status(400).json({message: "Course ID is required"});
        if(!userId) return res.status(401).json({message: "User not authenticated"});

        const user = await prisma.user.findUnique({
            where: { clerkId: userId },
            select: { id: true }
        });

        if(!user) return res.status(404).json({message: "User not found"});

        // Get all lessons progress for the course
        const lessonProgressList = await prisma.lessonProgress.findMany({
            where: {
                studentId: user.id,
                lesson: {
                    module: {
                        courseId
                    }
                }
            },
            include: {
                lesson: {
                    select: {
                        id: true,
                        title: true,
                        position: true,
                        module: {
                            select: {
                                id: true,
                                title: true
                            }
                        }
                    }
                }
            }
        });

        res.status(200).json({ data: lessonProgressList });

    } catch (error) {
        console.error('Error fetching lesson progress:', error);
        res.status(500).json({
            message: 'Failed to fetch lesson progress',
            error: error.message
        });
    }
}