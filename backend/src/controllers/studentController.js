import prisma from '../lib/prisma.js';
import ProgressService from '../services/progress.service.js';

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

        res.status(200).json({data: formattedModules});

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

        if(!lessonId) return res.status(400).json({message: "Lesson ID is required"});
        if(!userId) return res.status(401).json({message: "User not authenticated"});

        const user = await prisma.user.findUnique({
            where: { clerkId: userId },
            select: { id: true }
        });

        if(!user) return res.status(404).json({message: "User not found"});

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

        if(!lessonId) return res.status(400).json({message: "Lesson ID is required"});
        if(!userId) return res.status(401).json({message: "User not authenticated"});

        const user = await prisma.user.findUnique({
            where: { clerkId: userId },
            select: { id: true }
        });

        if(!user) return res.status(404).json({message: "User not found"});

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

        if (!lesson) return res.status(404).json({message: "Lesson not found"});

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

        if(!moduleId) return res.status(400).json({message: "Module ID is required"});
        if(!userId) return res.status(401).json({message: "User not authenticated"});

        const user = await prisma.user.findUnique({
            where: { clerkId: userId },
            select: { id: true }
        });

        if(!user) return res.status(404).json({message: "User not found"});

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
            return res.status(404).json({message: "Module progress not found"});
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

        if(!userId) return res.status(401).json({message: "User not authenticated"});

        const user = await prisma.user.findUnique({
            where: { clerkId: userId },
            select: { id: true }
        });

        if(!user) return res.status(404).json({message: "User not found"});

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
                studentId: user.id
            },
            select: {
                enrolledAt: true,
                course: {
                    select: {
                        id: true,
                        title: true,
                        description: true,
                        thumbnail: true,
                        category: true,
                        updatedAt: true,
                        isPublished: true,
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
                category: course.category,
                updatedAt: course.updatedAt,
                isPublished: course.isPublished,
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

        // Return completion with certificate
        res.status(200).json({
            data: {
                completedAt: completion.completedAt,
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
