import prisma from '../lib/prisma.js';
import ProgressService from '../services/progress.service.js';

export const getCourseCategories = async (req, res) => {
    try {

        const categories = await prisma.course.findMany({
            select: {
                college: true
            },
            distinct: ['college'],
            where: {
                status: 'PUBLISHED'
            }
        });

        const categoryList = categories.map(course => course.college).filter(Boolean);

        res.status(200).json({ data: categoryList });

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
        // Get all published courses
        const allCourses = await prisma.course.findMany({
            where: {
                status: 'PUBLISHED'
            },
            include: {
                managedBy: {
                    select: {
                        fullName: true,
                        imageUrl: true
                    }
                },
                createdBy: {
                    select: {
                        fullName: true,
                        imageUrl: true
                    }
                }
            }
        });

        // Shuffle array and take 10 random courses
        const shuffled = allCourses.sort(() => 0.5 - Math.random());
        const featuredCourses = shuffled.slice(0, 10);

        // Process the response to include only necessary fields and use createdBy as fallback
        const processedCourses = featuredCourses.map(course => {
            const instructor = course.managedBy || course.createdBy;
            return {
                id: course.id,
                title: course.title,
                thumbnail: course.thumbnail,
                college: course.college,
                managedBy: instructor
            };
        });

        res.status(200).json({ data: processedCourses });
    } catch (error) {
        console.error('Error fetching featured courses:', error);
        res.status(500).json({
            message: 'Failed to fetch featured courses',
            error: error.message
        });
    }
}

export const getPopularCourses = async (req, res) => {
    try {
        // Get top 10 courses with highest enrollment count
        const popularCourses = await prisma.course.findMany({
            where: {
                status: 'PUBLISHED'
            },
            include: {
                managedBy: {
                    select: {
                        fullName: true,
                        imageUrl: true
                    }
                },
                createdBy: {
                    select: {
                        fullName: true,
                        imageUrl: true
                    }
                },
                _count: {
                    select: {
                        enrollments: true
                    }
                }
            },
            orderBy: {
                enrollments: {
                    _count: 'desc'
                }
            },
            take: 10
        });

        // Process the response
        const processedCourses = popularCourses.map(course => {
            const instructor = course.managedBy || course.createdBy;
            return {
                id: course.id,
                title: course.title,
                thumbnail: course.thumbnail,
                college: course.college,
                managedBy: instructor,
                enrollmentCount: course._count.enrollments
            };
        });

        res.status(200).json({ data: processedCourses });
    } catch (error) {
        console.error('Error fetching popular courses:', error);
        res.status(500).json({
            message: 'Failed to fetch popular courses',
            error: error.message
        });
    }
}

export const getRecommendedCourses = async (req, res) => {
    try {
        // Get all published courses
        const allCourses = await prisma.course.findMany({
            where: {
                status: 'PUBLISHED'
            },
            include: {
                managedBy: {
                    select: {
                        fullName: true,
                        imageUrl: true
                    }
                },
                createdBy: {
                    select: {
                        fullName: true,
                        imageUrl: true
                    }
                }
            }
        });

        // Shuffle array and take 10 random courses (different from featured)
        const shuffled = allCourses.sort(() => 0.5 - Math.random());
        const recommendedCourses = shuffled.slice(0, 10);

        // Process the response
        const processedCourses = recommendedCourses.map(course => {
            const instructor = course.managedBy || course.createdBy;
            return {
                id: course.id,
                title: course.title,
                thumbnail: course.thumbnail,
                college: course.college,
                managedBy: instructor
            };
        });

        res.status(200).json({ data: processedCourses });
    } catch (error) {
        console.error('Error fetching recommended courses:', error);
        res.status(500).json({
            message: 'Failed to fetch recommended courses',
            error: error.message
        });
    }
}

export const getSelectedCourse = async (req, res) => {
    try {

        const { id } = req.params;

        if (!id) return res.status(404).json({ message: "Invalid Course ID" });

        const course = await prisma.course.findUnique({
            where: {
                id
            },
            select: {
                title: true,
                description: true,
                thumbnail: true,
                college: true,
                certificateEnabled: true,
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

        if (!course) return res.status(404).json({ message: "Course Not Found" });

        // Calculate total lessons from all modules
        const totalLessons = course.modules?.reduce((total, module) => total + (module._count?.lessons || 0), 0) || 0;

        // Remove modules from response and add totalLessons
        const { modules, ...courseData } = course;
        const responseData = {
            ...courseData,
            totalLessons
        };

        res.status(200).json({ data: responseData });

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

        const { courseId, courseCode } = req.body;
        const userId = req.auth().userId;

        if (!courseId) return res.status(400).json({ message: "Course ID is required" });
        if (!courseCode) return res.status(400).json({ message: "Course code is required" });
        if (!userId) return res.status(401).json({ message: "User not authenticated" });

        const course = await prisma.course.findUnique({
            where: { id: courseId, status: 'PUBLISHED' }
        });

        const user = await prisma.user.findUnique({
            where: {
                clerkId: userId
            },
            select: {
                id: true
            }
        })

        if (!user) return res.status(404).json({ message: "User not found in database" });

        if (!course) return res.status(404).json({ message: "Course not found or not published" });

        // Verify course code
        if (!course.code) {
            return res.status(400).json({ message: "This course does not have an enrollment code" });
        }

        if (course.code !== courseCode.trim()) {
            return res.status(403).json({ message: "Invalid course code. Please check and try again." });
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

        if (existingEnrollment) {
            return res.status(409).json({ message: "You are already enrolled in this course" });
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

        const { courseId } = req.params;
        const userId = req.auth().userId;

        if (!userId) return res.status(401).json({ message: "User not authenticated" });

        const user = await prisma.user.findUnique({
            where: {
                clerkId: userId
            },
            select: {
                id: true
            }
        })

        if (!user) return res.status(404).json({ message: "User not found in database" });

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

        const { courseId } = req.body;
        const userId = req.auth().userId;

        if (!courseId) return res.status(400).json({ message: "Course ID is required" });
        if (!userId) return res.status(401).json({ message: "User not authenticated" });

        const user = await prisma.user.findUnique({
            where: {
                clerkId: userId
            },
            select: {
                id: true
            }
        })

        if (!user) return res.status(404).json({ message: "User not found in database" });

        const studentId = user.id;

        const existingEnrollment = await prisma.enrollment.findUnique({
            where: {
                studentId_courseId: {
                    studentId,
                    courseId
                }
            }
        });

        if (!existingEnrollment) {
            return res.status(404).json({ message: "Enrollment not found" });
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

        const { courseId } = req.params;
        const userId = req.auth().userId;

        if (!courseId) return res.status(400).json({ message: "Course ID is required" });
        if (!userId) return res.status(401).json({ message: "User not authenticated" });

        const user = await prisma.user.findUnique({
            where: {
                clerkId: userId
            },
            select: {
                id: true
            }
        })

        if (!user) return res.status(404).json({ message: "User not found in database" });

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

        if (!enrollment) {
            return res.status(403).json({ message: "You are not enrolled in this course" });
        }

        // Fetch modules with lesson count and progress
        const modules = await prisma.module.findMany({
            where: {
                courseId
            },
            select: {
                id: true,
                title: true,
                updatedAt: true,
                position: true,
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

        // Get module progress for locking logic
        const moduleProgressList = await prisma.moduleProgress.findMany({
            where: {
                studentId,
                module: {
                    courseId
                }
            },
            select: {
                moduleId: true,
                isCompleted: true,
                progressPercentage: true,
                lessonsCompleted: true
            }
        });

        // Create a map of module progress data
        const moduleProgressMap = new Map();
        moduleProgressList.forEach(progress => {
            moduleProgressMap.set(progress.moduleId, {
                isCompleted: progress.isCompleted,
                progressPercentage: progress.progressPercentage,
                lessonsCompleted: progress.lessonsCompleted
            });
        });

        // Apply locking logic: strict sequential progression - lock incomplete modules after the first incomplete one
        // Completed modules are always unlocked (can revisit completed content)
        // Find the first incomplete module by position
        let firstIncompletePosition = Infinity;
        modules.forEach(module => {
            const progress = moduleProgressMap.get(module.id);
            const isCompleted = progress?.isCompleted || false;
            if (!isCompleted && module.position < firstIncompletePosition) {
                firstIncompletePosition = module.position;
            }
        });

        const formattedModules = modules.map((module) => {
            const moduleProgress = moduleProgressMap.get(module.id) || {
                isCompleted: false,
                progressPercentage: 0,
                lessonsCompleted: 0
            };

            // Module is locked if:
            // 1. It comes after the first incomplete module AND
            // 2. It is not completed itself
            const isLocked = module.position > firstIncompletePosition && !moduleProgress.isCompleted;

            return {
                id: module.id,
                title: module.title,
                updatedAt: module.updatedAt,
                position: module.position,
                totalLessons: module._count.lessons,
                isLocked,
                isCompleted: moduleProgress.isCompleted,
                progressPercentage: moduleProgress.progressPercentage,
                lessonsCompleted: moduleProgress.lessonsCompleted
            };
        });

        res.status(200).json({ data: formattedModules });

    } catch (error) {
        console.error('Error fetching course modules:', error);
        res.status(500).json({
            message: 'Failed to fetch course modules',
            error: error.message
        });
    }
}

// Get module details including lessons, links, and quiz for enrolled students
export const getModuleDetailsForStudent = async (req, res) => {
    try {
        const { courseId, moduleId } = req.params;
        const userId = req.auth().userId;

        if (!courseId) return res.status(400).json({ message: "Course ID is required" });
        if (!moduleId) return res.status(400).json({ message: "Module ID is required" });
        if (!userId) return res.status(401).json({ message: "User not authenticated" });

        // Get user ID from clerkId
        const user = await prisma.user.findUnique({
            where: { clerkId: userId },
            select: { id: true }
        });

        if (!user) return res.status(404).json({ message: "User not found in database" });

        // Check if student is enrolled in the course
        const enrollment = await prisma.enrollment.findUnique({
            where: {
                studentId_courseId: {
                    studentId: user.id,
                    courseId
                }
            }
        });

        if (!enrollment) {
            return res.status(403).json({ message: "You are not enrolled in this course" });
        }

        // Check if module is locked (sequential progression)
        const module = await prisma.module.findUnique({
            where: { id: moduleId },
            select: {
                id: true,
                position: true,
                courseId: true
            }
        });

        if (!module) {
            return res.status(404).json({ message: "Module not found" });
        }

        // Check if module access is allowed (consistent with module locking logic)
        // Get all modules in the course to determine locking rules
        const allModules = await prisma.module.findMany({
            where: { courseId: module.courseId },
            select: { id: true, position: true },
            orderBy: { position: 'asc' }
        });

        // Get progress for all modules
        const allModuleProgress = await prisma.moduleProgress.findMany({
            where: {
                studentId: user.id,
                module: { courseId: module.courseId }
            },
            select: {
                moduleId: true,
                isCompleted: true
            }
        });

        // Create progress map
        const progressMap = new Map();
        allModuleProgress.forEach(progress => {
            progressMap.set(progress.moduleId, progress.isCompleted);
        });

        // Find the first incomplete module by position
        let firstIncompletePosition = Infinity;
        allModules.forEach(moduleItem => {
            const isCompleted = progressMap.get(moduleItem.id) || false;
            if (!isCompleted && moduleItem.position < firstIncompletePosition) {
                firstIncompletePosition = moduleItem.position;
            }
        });

        // Check if current module access is allowed
        const currentModuleProgress = progressMap.get(moduleId) || false;
        const isAccessAllowed = module.position <= firstIncompletePosition || currentModuleProgress;

        if (!isAccessAllowed) {
            return res.status(403).json({
                message: "Complete earlier modules before accessing this module",
                isLocked: true
            });
        }

        // Fetch module details with lessons, links, and quiz
        const moduleDetails = await prisma.module.findUnique({
            where: { id: moduleId },
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
                        lessonProgress: {
                            where: {
                                studentId: user.id
                            },
                            select: {
                                isCompleted: true,
                                completedAt: true,
                                viewCount: true
                            }
                        }
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
                        isPublished: true,
                        timeLimit: true,
                        attemptLimit: true,
                        _count: {
                            select: {
                                questions: true
                            }
                        },
                        createdAt: true,
                        updatedAt: true,
                    }
                }
            }
        });

        if (!moduleDetails) return res.status(404).json({ message: "Module not found" });

        // Verify the module belongs to the course
        if (moduleDetails.courseId !== courseId) {
            return res.status(400).json({ message: "Module does not belong to this course" });
        }

        res.status(200).json({ data: moduleDetails });

    } catch (error) {
        console.error('Error fetching module details for student:', error);
        res.status(500).json({
            message: 'Failed to fetch module details',
            error: error.message
        });
    }
}

// Mark a lesson as completed by a student
export const markLessonComplete = async (req, res) => {
    try {
        const { lessonId } = req.body;
        const userId = req.auth().userId;

        if (!lessonId) return res.status(400).json({ message: "Lesson ID is required" });
        if (!userId) return res.status(401).json({ message: "User not authenticated" });

        const user = await prisma.user.findUnique({
            where: { clerkId: userId },
            select: { id: true }
        });

        if (!user) return res.status(404).json({ message: "User not found" });

        // Use the progress service to mark lesson complete
        const lessonProgress = await ProgressService.markLessonCompleted(user.id, lessonId);

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

        if (!courseId) return res.status(400).json({ message: "Course ID is required" });
        if (!userId) return res.status(401).json({ message: "User not authenticated" });

        const user = await prisma.user.findUnique({
            where: { clerkId: userId },
            select: { id: true }
        });

        if (!user) return res.status(404).json({ message: "User not found" });

        // Check enrollment
        const enrollment = await prisma.enrollment.findUnique({
            where: {
                studentId_courseId: {
                    studentId: user.id,
                    courseId
                }
            }
        });

        if (!enrollment) {
            return res.status(403).json({ message: "You are not enrolled in this course" });
        }

        // Use the progress service to get comprehensive course progress
        const courseProgress = await ProgressService.getCourseProgress(user.id, courseId);

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

        if (!courseId) return res.status(400).json({ message: "Course ID is required" });
        if (!userId) return res.status(401).json({ message: "User not authenticated" });

        const user = await prisma.user.findUnique({
            where: { clerkId: userId },
            select: { id: true }
        });

        if (!user) return res.status(404).json({ message: "User not found" });

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

// Helper to hide correct answers for students
const sanitizeQuestionsForStudent = (questions) => {
    return questions.map((q) => ({
        id: q.id,
        question: q.question,
        type: q.type,
        options: q.options,
        points: q.points,
        position: q.position,
    }));
};

// Start a quiz for a student
export const startStudentQuiz = async (req, res) => {
    try {
        const { quizId } = req.body;
        const { courseId, moduleId } = req.params;

        if (!quizId) {
            return res.status(400).json({ message: 'Quiz ID is required' });
        }

        const auth = req.auth();
        const userId = auth.userId;
        const user = await prisma.user.findUnique({
            where: { clerkId: userId },
            select: { id: true }
        });

        if (!user) {
            return res.status(401).json({ message: 'User not found' });
        }

        // Verify student is enrolled in the course
        const enrollment = await prisma.enrollment.findFirst({
            where: {
                studentId: user.id,
                courseId: courseId
            }
        });

        if (!enrollment) {
            return res.status(403).json({ message: 'Not enrolled in this course' });
        }

        // Get quiz with questions
        const quiz = await prisma.quiz.findUnique({
            where: { id: quizId },
            include: {
                questions: {
                    orderBy: { position: 'asc' }
                },
                module: {
                    select: {
                        id: true,
                        courseId: true
                    }
                }
            }
        });

        if (!quiz) {
            return res.status(404).json({ message: 'Quiz not found' });
        }

        // Verify quiz belongs to the module
        if (quiz.moduleId !== moduleId) {
            return res.status(400).json({ message: 'Quiz does not belong to this module' });
        }

        // Check if quiz is published
        if (!quiz.isPublished) {
            return res.status(403).json({ message: 'Quiz is not yet published' });
        }

        // Check attempt limit
        if (typeof quiz.attemptLimit === 'number' && quiz.attemptLimit > 0) {
            const attempts = await prisma.quizSubmission.count({
                where: { quizId, studentId: user.id }
            });
            if (attempts >= quiz.attemptLimit) {
                return res.status(403).json({ message: 'Attempt limit reached' });
            }
        }

        // Return quiz without creating submission yet
        // Submission will be created only when student submits answers
        const sanitizedQuiz = {
            ...quiz,
            questions: sanitizeQuestionsForStudent(quiz.questions)
        };

        res.status(200).json({
            quiz: sanitizedQuiz,
            startedAt: new Date()
        });

    } catch (error) {
        console.error('Error starting student quiz:', error);
        res.status(500).json({
            message: 'Failed to start quiz',
            error: error.message
        });
    }
};

// Submit quiz answers for a student
export const submitStudentQuiz = async (req, res) => {
    try {
        const { submissionId, answers, quizId, startedAt } = req.body;
        const { courseId, moduleId } = req.params;

        if (!quizId || !Array.isArray(answers)) {
            return res.status(400).json({ message: 'Quiz ID and answers array are required' });
        }

        const auth = req.auth();
        const userId = auth.userId;
        const user = await prisma.user.findUnique({
            where: { clerkId: userId },
            select: { id: true }
        });

        if (!user) {
            return res.status(401).json({ message: 'User not found' });
        }

        // Verify student is enrolled in the course
        const enrollment = await prisma.enrollment.findFirst({
            where: {
                studentId: user.id,
                courseId: courseId
            }
        });

        if (!enrollment) {
            return res.status(403).json({ message: 'Not enrolled in this course' });
        }

        // Get quiz with questions
        const quiz = await prisma.quiz.findUnique({
            where: { id: quizId },
            include: {
                questions: true
            }
        });

        if (!quiz) {
            return res.status(404).json({ message: 'Quiz not found' });
        }

        // Verify quiz belongs to the module
        if (quiz.moduleId !== moduleId) {
            return res.status(400).json({ message: 'Quiz does not belong to this module' });
        }

        // Check attempt limit before creating submission
        if (typeof quiz.attemptLimit === 'number' && quiz.attemptLimit > 0) {
            const attempts = await prisma.quizSubmission.count({
                where: { quizId, studentId: user.id }
            });
            if (attempts >= quiz.attemptLimit) {
                return res.status(403).json({ message: 'Attempt limit reached' });
            }
        }

        // Calculate score
        let totalScore = 0;
        const maxScore = quiz.questions.reduce((sum, q) => sum + (q.points || 0), 0);

        const answerRecords = answers.map(answer => {
            const question = quiz.questions.find(q => q.id === answer.questionId);
            if (!question) return null;

            const isCorrect = (() => {
                if (question.type === 'MULTIPLE_CHOICE' || question.type === 'ENUMERATION' || question.type === 'TRUE_FALSE') {
                    // Compare as strings with trimming
                    return String(answer.answer).trim() === String(question.correctAnswer).trim();
                }
                return false;
            })();

            if (isCorrect) {
                totalScore += question.points || 0;
            }

            return {
                questionId: answer.questionId,
                answer: answer.answer,
                isCorrect
            };
        }).filter(Boolean);

        // Create submission with all data in one transaction
        const submissionData = {
            quizId,
            studentId: user.id,
            score: totalScore,
            endedAt: new Date(),
            answers: {
                createMany: {
                    data: answerRecords
                }
            }
        };

        // Only set startedAt if provided
        if (startedAt) {
            submissionData.startedAt = new Date(startedAt);
        }

        const submission = await prisma.quizSubmission.create({
            data: submissionData,
            include: {
                answers: true
            }
        });

        // Update progress after quiz submission
        await ProgressService.updateQuizProgress(user.id, quizId, totalScore);

        res.status(201).json({
            message: 'Quiz submitted successfully',
            submissionId: submission.id,
            score: totalScore,
            maxScore,
            percentage: maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0
        });

    } catch (error) {
        console.error('Error submitting student quiz:', error);
        res.status(500).json({
            message: 'Failed to submit quiz',
            error: error.message
        });
    }
};

// Get all quiz submissions/attempts for a student in a quiz
export const getStudentQuizSubmissions = async (req, res) => {
    try {
        const { quizId } = req.params;

        if (!quizId) {
            return res.status(400).json({ message: 'Quiz ID is required' });
        }

        const auth = req.auth();
        const userId = auth.userId;
        const user = await prisma.user.findUnique({
            where: { clerkId: userId },
            select: { id: true }
        });

        if (!user) {
            return res.status(401).json({ message: 'User not found' });
        }

        // Get all submissions for this quiz by the student
        // Get the quiz first to get max points
        const quiz = await prisma.quiz.findUnique({
            where: { id: quizId },
            include: { questions: true }
        });

        if (!quiz) {
            return res.status(404).json({ message: 'Quiz not found' });
        }

        const maxScore = quiz.questions.reduce((sum, q) => sum + (q.points || 0), 0);

        const submissions = await prisma.quizSubmission.findMany({
            where: {
                quizId: quizId,
                studentId: user.id
            },
            include: {
                answers: {
                    include: {
                        question: {
                            select: {
                                id: true,
                                question: true,
                                type: true,
                                correctAnswer: true
                            }
                        }
                    }
                }
            },
            orderBy: {
                startedAt: 'desc'
            }
        });

        // Calculate scores for each submission using current question points
        const submissionsWithScores = submissions.map(submission => {
            let totalScore = 0;

            submission.answers.forEach(answer => {
                if (answer.isCorrect) {
                    // Find the current points for this question from the quiz
                    const questionId = answer.question?.id || answer.questionId;
                    const currentQuestionPoints = quiz.questions.find(q => q.id === questionId)?.points || 0;
                    totalScore += currentQuestionPoints;
                }
            });

            return {
                id: submission.id,
                score: totalScore, // Always use recalculated score
                maxScore: maxScore,
                percentage: maxScore > 0 ? Math.round(totalScore / maxScore * 100) : 0,
                startedAt: submission.startedAt,
                endedAt: submission.endedAt,
                answers: submission.answers
            };
        });

        res.status(200).json({
            data: submissionsWithScores,
            totalAttempts: submissionsWithScores.length
        });

    } catch (error) {
        console.error('Error fetching student quiz submissions:', error);
        res.status(500).json({
            message: 'Failed to fetch quiz submissions',
            error: error.message
        });
    }
};

// Track lesson access - automatically marks as completed
export const trackLessonAccess = async (req, res) => {
    try {
        const { lessonId } = req.body;
        const userId = req.auth().userId;

        if (!lessonId) return res.status(400).json({ message: "Lesson ID is required" });
        if (!userId) return res.status(401).json({ message: "User not authenticated" });

        const user = await prisma.user.findUnique({
            where: { clerkId: userId },
            select: { id: true }
        });

        if (!user) return res.status(404).json({ message: "User not found" });

        // Check if the lesson's module is locked
        const lesson = await prisma.lesson.findUnique({
            where: { id: lessonId },
            select: {
                module: {
                    select: {
                        id: true,
                        position: true,
                        courseId: true
                    }
                }
            }
        });

        if (!lesson) return res.status(404).json({ message: "Lesson not found" });

        const moduleData = lesson.module;

        // Check if module access is allowed (consistent with module locking logic)
        // Get all modules in the course to determine locking rules
        const allModules = await prisma.module.findMany({
            where: { courseId: moduleData.courseId },
            select: { id: true, position: true },
            orderBy: { position: 'asc' }
        });

        // Get progress for all modules
        const allModuleProgress = await prisma.moduleProgress.findMany({
            where: {
                studentId: user.id,
                module: { courseId: moduleData.courseId }
            },
            select: {
                moduleId: true,
                isCompleted: true
            }
        });

        // Create progress map
        const progressMap = new Map();
        allModuleProgress.forEach(progress => {
            progressMap.set(progress.moduleId, progress.isCompleted);
        });

        // Find the first incomplete module by position
        let firstIncompletePosition = Infinity;
        allModules.forEach(module => {
            const isCompleted = progressMap.get(module.id) || false;
            if (!isCompleted && module.position < firstIncompletePosition) {
                firstIncompletePosition = module.position;
            }
        });

        // Check if current module access is allowed
        const currentModuleProgress = progressMap.get(moduleData.id) || false;
        const isAccessAllowed = moduleData.position <= firstIncompletePosition || currentModuleProgress;

        if (!isAccessAllowed) {
            return res.status(403).json({
                message: "Complete earlier modules before accessing lessons in this module",
                isLocked: true
            });
        }

        // Use the progress service to track lesson access
        const lessonProgress = await ProgressService.trackLessonAccess(user.id, lessonId);

        res.status(200).json({
            message: "Lesson access tracked",
            data: lessonProgress
        });

    } catch (error) {
        console.error('Error tracking lesson access:', error);
        res.status(500).json({
            message: 'Failed to track lesson access',
            error: error.message
        });
    }
};

// Get student's module progress
export const getStudentModuleProgress = async (req, res) => {
    try {
        const { moduleId } = req.params;
        const userId = req.auth().userId;

        if (!moduleId) return res.status(400).json({ message: "Module ID is required" });
        if (!userId) return res.status(401).json({ message: "User not authenticated" });

        const user = await prisma.user.findUnique({
            where: { clerkId: userId },
            select: { id: true }
        });

        if (!user) return res.status(404).json({ message: "User not found" });

        // Get module progress with detailed lesson and quiz information
        const moduleProgress = await prisma.moduleProgress.findUnique({
            where: {
                studentId_moduleId: {
                    studentId: user.id,
                    moduleId
                }
            },
            include: {
                module: {
                    include: {
                        lessons: {
                            include: {
                                lessonProgress: {
                                    where: { studentId: user.id }
                                }
                            },
                            orderBy: { position: 'asc' }
                        },
                        quiz: {
                            include: {
                                submissions: {
                                    where: { studentId: user.id },
                                    orderBy: { score: 'desc' },
                                    take: 1
                                }
                            }
                        }
                    }
                }
            }
        });

        if (!moduleProgress) {
            return res.status(404).json({ message: "Module progress not found" });
        }

        res.status(200).json({ data: moduleProgress });

    } catch (error) {
        console.error('Error fetching module progress:', error);
        res.status(500).json({
            message: 'Failed to fetch module progress',
            error: error.message
        });
    }
};

// Get student's progress summary for all enrolled courses
export const getStudentProgressSummary = async (req, res) => {
    try {
        const userId = req.auth().userId;

        if (!userId) return res.status(401).json({ message: "User not authenticated" });

        const user = await prisma.user.findUnique({
            where: { clerkId: userId },
            select: { id: true }
        });

        if (!user) return res.status(404).json({ message: "User not found" });

        // Get all enrolled courses with progress
        const enrollments = await prisma.enrollment.findMany({
            where: { studentId: user.id },
            include: {
                course: {
                    include: {
                        courseProgress: {
                            where: { studentId: user.id }
                        }
                    }
                }
            }
        });

        const progressSummary = enrollments.map(enrollment => ({
            courseId: enrollment.course.id,
            courseTitle: enrollment.course.title,
            progress: enrollment.course.courseProgress[0] || {
                progressPercentage: 0,
                lessonsCompleted: 0,
                quizzesCompleted: 0
            }
        }));

        res.status(200).json({ data: progressSummary });

    } catch (error) {
        console.error('Error fetching progress summary:', error);
        res.status(500).json({
            message: 'Failed to fetch progress summary',
            error: error.message
        });
    }
};

export const getEnrolledCourses = async (req, res) => {
    try {
        const userId = req.auth().userId;

        if (!userId) {
            return res.status(401).json({ message: "User not authenticated" });
        }

        // Get user from database
        const user = await prisma.user.findUnique({
            where: { clerkId: userId },
            select: { id: true }
        });

        if (!user) {
            return res.status(404).json({ message: "User not found in database" });
        }

        // Optimized query: Get enrollments with course data and progress in a single query
        const enrollments = await prisma.enrollment.findMany({
            where: {
                studentId: user.id,
                course: {
                    status: 'PUBLISHED'
                }
            },
            select: {
                enrolledAt: true,
                course: {
                    select: {
                        id: true,
                        title: true,
                        description: true,
                        thumbnail: true,
                        college: true,
                        updatedAt: true,
                        status: true,
                        managedBy: {
                            select: {
                                fullName: true,
                                imageUrl: true
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
                        },
                        courseProgress: {
                            where: { studentId: user.id },
                            select: {
                                progressPercentage: true,
                                lessonsCompleted: true,
                                quizzesCompleted: true,
                                lastAccessedAt: true
                            }
                        }
                    }
                }
            },
            orderBy: {
                enrolledAt: 'desc' // Most recently enrolled first
            }
        });

        // Format the response data
        const enrolledCourses = enrollments.map(enrollment => {
            const course = enrollment.course;

            // Calculate total lessons from all modules
            const totalLessons = course.modules?.reduce((total, module) =>
                total + (module._count?.lessons || 0), 0) || 0;

            // Get progress data (default to 0 if not exists)
            const progress = course.courseProgress?.[0] || {
                progressPercentage: 0,
                lessonsCompleted: 0,
                quizzesCompleted: 0,
                lastAccessedAt: null
            };

            return {
                id: course.id,
                title: course.title,
                description: course.description,
                thumbnail: course.thumbnail,
                college: course.college,
                updatedAt: course.updatedAt,
                status: course.status,
                managedBy: course.managedBy,
                totalEnrollments: course._count.enrollments,
                totalModules: course._count.modules,
                totalLessons,
                enrolledAt: enrollment.enrolledAt,
                progress: {
                    percentage: progress.progressPercentage,
                    lessonsCompleted: progress.lessonsCompleted,
                    quizzesCompleted: progress.quizzesCompleted,
                    lastAccessedAt: progress.lastAccessedAt
                }
            };
        });

        res.status(200).json({
            data: enrolledCourses,
            total: enrolledCourses.length
        });

    } catch (error) {
        console.error('Error fetching enrolled courses:', error);
        res.status(500).json({
            message: 'Failed to fetch enrolled courses',
            error: error.message
        });
    }
};

/**
 * Get course completion and certificate for a student
 * Returns the completion record and certificate if the course is completed
 * Returns 404 if course is not completed
 */
export const getCourseCompletion = async (req, res) => {
    try {
        const { courseId } = req.params;
        const userId = req.auth().userId;

        if (!courseId) return res.status(400).json({ message: "Course ID is required" });
        if (!userId) return res.status(401).json({ message: "User not authenticated" });

        // Get user from database
        const user = await prisma.user.findUnique({
            where: { clerkId: userId },
            select: { id: true }
        });

        if (!user) return res.status(404).json({ message: "User not found in database" });

        // Check if student is enrolled in the course
        const enrollment = await prisma.enrollment.findUnique({
            where: {
                studentId_courseId: {
                    studentId: user.id,
                    courseId
                }
            }
        });

        if (!enrollment) {
            return res.status(403).json({ message: "You are not enrolled in this course" });
        }

        // Get course completion and certificate
        const completion = await prisma.courseCompletion.findUnique({
            where: {
                userId_courseId: {
                    userId: user.id,
                    courseId
                }
            },
            include: {
                certificate: {
                    select: {
                        id: true,
                        certificateNumber: true,
                        certificateUrl: true,
                        issueDate: true
                    }
                }
            }
        });

        // If no completion record, return 200 with null data (not completed)
        if (!completion) {
            return res.status(200).json({
                data: null,
                message: "Course not completed",
                isCompleted: false
            });
        }

        // Calculate time spent with proper formatting using the enrollment data we already have
        let timeSpent = {};
        if (enrollment && completion.completedAt) {
            const timeSpentMs = new Date(completion.completedAt) - new Date(enrollment.enrolledAt);
            const totalSeconds = Math.floor(timeSpentMs / 1000);

            if (totalSeconds < 60) {
                timeSpent = { value: totalSeconds, unit: 'second', display: `${totalSeconds}s` };
            } else if (totalSeconds < 3600) {
                const minutes = Math.floor(totalSeconds / 60);
                timeSpent = { value: minutes, unit: 'minute', display: `${minutes}m` };
            } else if (totalSeconds < 86400) {
                const hours = Math.round((totalSeconds / 3600) * 10) / 10;
                timeSpent = { value: hours, unit: 'hour', display: `${hours}h` };
            } else {
                const days = Math.round((totalSeconds / 86400) * 10) / 10;
                timeSpent = { value: days, unit: 'day', display: `${days}d` };
            }
        }

        // Return completion with certificate
        res.status(200).json({
            data: {
                completedAt: completion.completedAt,
                timeSpent: timeSpent,
                enrolledAt: enrollment?.enrolledAt || null,
                certificate: completion.certificate
            }
        });

    } catch (error) {
        console.error('Error fetching course completion:', error);
        res.status(500).json({
            message: 'Failed to fetch course completion',
            error: error.message
        });
    }
};

/**
 * Get all enrolled students in a course with their progress and active status
 * Returns: student name, course progress percentage, lessons completed, quizzes completed, last active time
 */
export const getCourseEnrolledStudents = async (req, res) => {
    try {
        const { courseId } = req.params;
        const userId = req.auth().userId;

        if (!courseId) return res.status(400).json({ message: "Course ID is required" });
        if (!userId) return res.status(401).json({ message: "User not authenticated" });

        // Get current user from database
        const currentUser = await prisma.user.findUnique({
            where: { clerkId: userId },
            select: { id: true }
        });

        if (!currentUser) return res.status(404).json({ message: "User not found in database" });

        // Check if current user is enrolled in the course (to allow access)
        const enrollment = await prisma.enrollment.findUnique({
            where: {
                studentId_courseId: {
                    studentId: currentUser.id,
                    courseId
                }
            }
        });

        if (!enrollment) {
            return res.status(403).json({ message: "You are not enrolled in this course" });
        }

        // Get all enrolled students with their progress
        const enrolledStudents = await prisma.enrollment.findMany({
            where: { courseId },
            select: {
                student: {
                    select: {
                        id: true,
                        fullName: true,
                        imageUrl: true,
                        emailAddress: true,
                        lastActiveAt: true
                    }
                },
                enrolledAt: true,
                course: {
                    select: {
                        courseProgress: {
                            where: { courseId },
                            select: {
                                studentId: true,
                                progressPercentage: true,
                                lessonsCompleted: true,
                                quizzesCompleted: true,
                                lastAccessedAt: true
                            }
                        }
                    }
                }
            },
            orderBy: {
                student: {
                    fullName: 'asc'
                }
            }
        });

        // Format the response data
        const students = enrolledStudents.map(enrollment => {
            const student = enrollment.student;
            const progress = enrollment.course.courseProgress.find(p => p.studentId === student.id) || {
                progressPercentage: 0,
                lessonsCompleted: 0,
                quizzesCompleted: 0,
                lastAccessedAt: null
            };

            // Determine active status based on last access time
            let activeStatus = 'inactive';
            let lastActiveTime = null;

            if (student.lastActiveAt) {
                const lastAccess = new Date(student.lastActiveAt);
                const now = new Date();
                const hoursAgo = (now - lastAccess) / (1000 * 60 * 60);

                if (hoursAgo < 1) {
                    activeStatus = 'active';
                    lastActiveTime = 'just now';
                } else if (hoursAgo < 24) {
                    activeStatus = 'active';
                    lastActiveTime = `${Math.floor(hoursAgo)}h ago`;
                } else if (hoursAgo < 168) { // 7 days
                    activeStatus = 'inactive';
                    lastActiveTime = `${Math.floor(hoursAgo / 24)}d ago`;
                } else {
                    activeStatus = 'inactive';
                    lastActiveTime = `${Math.floor(hoursAgo / 168)}w ago`;
                }
            }

            return {
                id: student.id,
                fullName: student.fullName,
                imageUrl: student.imageUrl,
                emailAddress: student.emailAddress,
                enrolledAt: enrollment.enrolledAt,
                progress: {
                    percentage: progress.progressPercentage,
                    lessonsCompleted: progress.lessonsCompleted,
                    quizzesCompleted: progress.quizzesCompleted
                },
                activeStatus,
                lastActiveTime,
                lastAccessedAt: student.lastActiveAt
            };
        });

        res.status(200).json({
            data: students,
            total: students.length
        });

    } catch (error) {
        console.error('Error fetching enrolled students:', error);
        res.status(500).json({
            message: 'Failed to fetch enrolled students',
            error: error.message
        });
    }
};

export const getStudentCertificates = async (req, res) => {
    try {
        const userId = req.auth().userId;

        if (!userId) return res.status(401).json({ message: "User not authenticated" });

        // Get current user from database
        const currentUser = await prisma.user.findUnique({
            where: { clerkId: userId },
            select: { id: true }
        });

        if (!currentUser) return res.status(404).json({ message: "User not found in database" });

        // Get all certificates for the student
        const certificates = await prisma.courseCompletion.findMany({
            where: {
                userId: currentUser.id,
                certificate: {
                    isNot: null
                }
            },
            select: {
                id: true,
                course: {
                    select: {
                        id: true,
                        title: true,
                        thumbnail: true,
                        college: true,
                        facultyId: true,
                    }
                },
                certificate: {
                    select: {
                        certificateNumber: true,
                        certificateUrl: true,
                        issueDate: true
                    }
                },
                completedAt: true
            },
            orderBy: {
                completedAt: 'desc'
            }
        });

        // Fetch faculty info for each certificate
        const facultyIds = [...new Set(certificates.map(cert => cert.course.facultyId).filter(Boolean))];
        const faculty = await prisma.user.findMany({
            where: { id: { in: facultyIds } },
            select: { id: true, fullName: true, imageUrl: true }
        });

        const facultyMap = {};
        faculty.forEach(f => {
            facultyMap[f.id] = f;
        });

        // Format the response
        const formattedCertificates = certificates.map(cert => {
            const instructor = facultyMap[cert.course.facultyId];
            return {
                id: cert.id,
                courseId: cert.course.id,
                courseTitle: cert.course.title,
                courseThumbnail: cert.course.thumbnail,
                college: cert.course.college,
                instructor: instructor?.fullName || 'Unknown Faculty',
                instructorImage: instructor?.imageUrl,
                certificateNumber: cert.certificate.certificateNumber,
                certificateUrl: cert.certificate.certificateUrl,
                issuedAt: cert.certificate.issueDate,
                completedAt: cert.completedAt
            };
        });

        res.status(200).json({
            data: formattedCertificates,
            total: formattedCertificates.length
        });

    } catch (error) {
        console.error('Error fetching student certificates:', error);
        res.status(500).json({
            message: 'Failed to fetch student certificates',
            error: error.message
        });
    }
};

export const getArchivedCourses = async (req, res) => {
    try {
        const userId = req.auth().userId;

        if (!userId) {
            return res.status(401).json({ message: "User not authenticated" });
        }

        // Get user from database
        const user = await prisma.user.findUnique({
            where: { clerkId: userId },
            select: { id: true }
        });

        if (!user) {
            return res.status(404).json({ message: "User not found in database" });
        }

        // Get enrollments for archived courses
        const archivedEnrollments = await prisma.enrollment.findMany({
            where: {
                studentId: user.id,
                course: {
                    status: 'ARCHIVED'
                }
            },
            select: {
                enrolledAt: true,
                course: {
                    select: {
                        id: true,
                        title: true,
                        description: true,
                        thumbnail: true,
                        college: true,
                        updatedAt: true,
                        status: true,
                        managedBy: {
                            select: {
                                fullName: true,
                                imageUrl: true
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
                        },
                        courseProgress: {
                            where: { studentId: user.id },
                            select: {
                                progressPercentage: true,
                                lessonsCompleted: true,
                                quizzesCompleted: true,
                                lastAccessedAt: true
                            }
                        }
                    }
                }
            },
            orderBy: {
                enrolledAt: 'desc'
            }
        });

        // Format the response data
        const archivedCourses = archivedEnrollments.map(enrollment => {
            const course = enrollment.course;

            // Calculate total lessons from all modules
            const totalLessons = course.modules?.reduce((total, module) =>
                total + (module._count?.lessons || 0), 0) || 0;

            // Get progress data (default to 0 if not exists)
            const progress = course.courseProgress?.[0] || {
                progressPercentage: 0,
                lessonsCompleted: 0,
                quizzesCompleted: 0,
                lastAccessedAt: null
            };

            return {
                id: course.id,
                title: course.title,
                description: course.description,
                thumbnail: course.thumbnail,
                college: course.college,
                updatedAt: course.updatedAt,
                status: course.status,
                managedBy: course.managedBy,
                totalEnrollments: course._count.enrollments,
                totalModules: course._count.modules,
                totalLessons,
                enrolledAt: enrollment.enrolledAt,
                progress: {
                    percentage: progress.progressPercentage,
                    lessonsCompleted: progress.lessonsCompleted,
                    quizzesCompleted: progress.quizzesCompleted,
                    lastAccessedAt: progress.lastAccessedAt
                }
            };
        });

        res.status(200).json({
            data: archivedCourses,
            total: archivedCourses.length
        });

    } catch (error) {
        console.error('Error fetching archived courses:', error);
        res.status(500).json({
            message: 'Failed to fetch archived courses',
            error: error.message
        });
    }
};

export const studentSearch = async (req, res) => {
    try {
        const query = req.query.q || "";
        const college = req.query.college || "";
        const limit = parseInt(req.query.limit) || 10;

        // If college filter is provided, filter by college only
        if (college && college.trim() !== "") {
            const courses = await prisma.course.findMany({
                where: {
                    status: 'PUBLISHED',
                    college: college
                },
                select: {
                    id: true,
                    title: true,
                    thumbnail: true,
                    college: true,
                    status: true,
                    code: true,
                    managedBy: {
                        select: {
                            fullName: true,
                            imageUrl: true
                        }
                    },
                    createdBy: {
                        select: {
                            fullName: true,
                            imageUrl: true
                        }
                    },
                    _count: {
                        select: {
                            enrollments: true
                        }
                    }
                },
                take: limit
            });

            const processedCourses = courses.map(course => ({
                ...course,
                managedBy: course.managedBy || course.createdBy,
                createdBy: undefined,
                type: 'course'
            }));

            return res.status(200).json({
                courses: processedCourses,
                totalResults: processedCourses.length,
                query: college
            });
        }

        // If no query provided, return empty results
        if (!query || query.trim() === "") {
            return res.status(200).json({
                courses: [],
                totalResults: 0
            });
        }

        // Search for published courses only
        const courses = await prisma.course.findMany({
            where: {
                status: 'PUBLISHED',
                OR: [
                    {
                        title: {
                            contains: query,
                            mode: "insensitive"
                        }
                    },
                    {
                        description: {
                            contains: query,
                            mode: "insensitive"
                        }
                    },
                    {
                        college: {
                            contains: query,
                            mode: "insensitive"
                        }
                    },
                    {
                        code: {
                            contains: query,
                            mode: "insensitive"
                        }
                    }
                ]
            },
            select: {
                id: true,
                title: true,
                thumbnail: true,
                college: true,
                status: true,
                code: true,
                managedBy: {
                    select: {
                        fullName: true,
                        imageUrl: true
                    }
                },
                createdBy: {
                    select: {
                        fullName: true,
                        imageUrl: true
                    }
                },
                _count: {
                    select: {
                        enrollments: true
                    }
                }
            },
            take: limit
        });

        // Process courses to use createdBy as fallback for managedBy
        const processedCourses = courses.map(course => ({
            ...course,
            managedBy: course.managedBy || course.createdBy,
            createdBy: undefined,
            type: 'course'
        }));

        res.status(200).json({
            courses: processedCourses,
            totalResults: processedCourses.length,
            query: query
        });

    } catch (error) {
        console.error('Error in student search:', error);
        res.status(500).json({
            message: 'Failed to search courses',
            error: error.message
        });
    }
};
