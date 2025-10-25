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

        // Fetch module details with lessons, links, and quiz
        const module = await prisma.module.findUnique({
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

        if (!module) return res.status(404).json({ message: "Module not found" });

        // Verify the module belongs to the course
        if (module.courseId !== courseId) {
            return res.status(400).json({ message: "Module does not belong to this course" });
        }

        res.status(200).json({ data: module });

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