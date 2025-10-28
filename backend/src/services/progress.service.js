import prisma from '../lib/prisma.js';

class ProgressService {
    /**
     * Track lesson access - automatically marks as completed when accessed
     */
    static async trackLessonAccess(studentId, lessonId) {
        // Get current progress
        const currentProgress = await prisma.lessonProgress.findUnique({
            where: {
                studentId_lessonId: { studentId, lessonId }
            }
        });

        const updateData = {
            viewCount: (currentProgress?.viewCount || 0) + 1,
            lastAccessedAt: new Date(),
            updatedAt: new Date()
        };

        // If this is the first access, mark as started
        if (!currentProgress) {
            updateData.startedAt = new Date();
        }

        // Automatically mark as completed when accessed (simplified approach)
        if (!currentProgress?.isCompleted) {
            updateData.isCompleted = true;
            updateData.progress = 100;
            updateData.completedAt = new Date();
        }

        const lessonProgress = await prisma.lessonProgress.upsert({
            where: {
                studentId_lessonId: { studentId, lessonId }
            },
            update: updateData,
            create: {
                studentId,
                lessonId,
                ...updateData,
                isCompleted: true,
                progress: 100,
                completedAt: new Date()
            }
        });

        // Update module and course progress
        await this.updateModuleProgress(studentId, lessonId);
        await this.updateCourseProgress(studentId, lessonId);

        return lessonProgress;
    }

    /**
     * Update module progress based on lessons and quiz completion
     */
    static async updateModuleProgress(studentId, lessonId) {
        // Get the module for this lesson
        const lesson = await prisma.lesson.findUnique({
            where: { id: lessonId },
            select: {
                moduleId: true,
                module: {
                    select: {
                        id: true,
                        lessons: { select: { id: true } },
                        quiz: { select: { id: true } }
                    }
                }
            }
        });

        if (!lesson) return;

        const moduleId = lesson.moduleId;
        const totalLessons = lesson.module.lessons.length;
        const hasQuiz = !!lesson.module.quiz;

        // Count completed lessons in this module
        const completedLessons = await prisma.lessonProgress.count({
            where: {
                studentId,
                lessonId: { in: lesson.module.lessons.map(l => l.id) },
                isCompleted: true
            }
        });

        // Check quiz completion
        let quizCompleted = false;
        let quizScore = null;

        if (hasQuiz) {
            const quizSubmission = await prisma.quizSubmission.findFirst({
                where: {
                    studentId,
                    quizId: lesson.module.quiz.id
                },
                orderBy: { score: 'desc' },
                select: { score: true }
            });

            if (quizSubmission && quizSubmission.score !== null) {
                quizCompleted = true;
                quizScore = quizSubmission.score;
            }
        }

        // Calculate module progress
        const lessonProgressPercent = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;
        const quizProgressPercent = hasQuiz ? (quizCompleted ? 100 : 0) : 0;

        // Calculate overall progress based on available components
        let overallProgress = 0;
        let componentCount = 0;

        if (totalLessons > 0) {
            overallProgress += lessonProgressPercent;
            componentCount++;
        }

        if (hasQuiz) {
            overallProgress += quizProgressPercent;
            componentCount++;
        }

        // If no components, progress is 0
        overallProgress = componentCount > 0 ? overallProgress / componentCount : 0;

        const isCompleted = overallProgress >= 100;

        // Update module progress
        const moduleProgress = await prisma.moduleProgress.upsert({
            where: {
                studentId_moduleId: { studentId, moduleId }
            },
            update: {
                progressPercentage: Math.round(overallProgress),
                lessonsCompleted: completedLessons,
                quizCompleted,
                quizScore,
                isCompleted,
                completedAt: isCompleted ? new Date() : null,
                lastAccessedAt: new Date(),
                updatedAt: new Date()
            },
            create: {
                studentId,
                moduleId,
                progressPercentage: Math.round(overallProgress),
                lessonsCompleted: completedLessons,
                quizCompleted,
                quizScore,
                isCompleted,
                lastAccessedAt: new Date()
            }
        });

        return moduleProgress;
    }

    /**
     * Update course progress based on module completion
     */
    static async updateCourseProgress(studentId, lessonId) {
        // Get the course for this lesson
        const lesson = await prisma.lesson.findUnique({
            where: { id: lessonId },
            select: {
                module: {
                    select: {
                        courseId: true,
                        course: {
                            select: {
                                id: true,
                                modules: {
                                    select: {
                                        id: true,
                                        lessons: { select: { id: true } },
                                        quiz: { select: { id: true } }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });

        if (!lesson) return;

        const courseId = lesson.module.courseId;
        const course = lesson.module.course;

        // Calculate course-wide statistics
        const totalLessons = course.modules.reduce((sum, module) => sum + module.lessons.length, 0);
        const totalQuizzes = course.modules.filter(module => module.quiz).length;

        // Count completed lessons and quizzes
        const completedLessons = await prisma.lessonProgress.count({
            where: {
                studentId,
                lesson: {
                    module: {
                        courseId
                    }
                },
                isCompleted: true
            }
        });

        const completedQuizzes = await prisma.quizSubmission.count({
            where: {
                studentId,
                quiz: {
                    module: {
                        courseId
                    }
                },
                score: { not: null }
            }
        });

        // Calculate average quiz score
        const quizSubmissions = await prisma.quizSubmission.findMany({
            where: {
                studentId,
                quiz: {
                    module: {
                        courseId
                    }
                },
                score: { not: null }
            },
            select: { score: true }
        });

        const averageQuizScore = quizSubmissions.length > 0
            ? quizSubmissions.reduce((sum, sub) => sum + sub.score, 0) / quizSubmissions.length
            : null;

        // Calculate overall progress percentage
        const lessonProgressPercent = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;
        const quizProgressPercent = totalQuizzes > 0 ? (completedQuizzes / totalQuizzes) * 100 : 0;

        // Calculate overall progress based on available components
        let overallProgress = 0;
        let componentCount = 0;

        if (totalLessons > 0) {
            overallProgress += lessonProgressPercent;
            componentCount++;
        }

        if (totalQuizzes > 0) {
            overallProgress += quizProgressPercent;
            componentCount++;
        }

        // If no components, progress is 0
        overallProgress = componentCount > 0 ? overallProgress / componentCount : 0;

        // Get current module (the one with most recent activity)
        const currentModule = await prisma.moduleProgress.findFirst({
            where: { studentId },
            orderBy: { lastAccessedAt: 'desc' },
            select: { moduleId: true }
        });

        // Update course progress
        const courseProgress = await prisma.courseProgress.upsert({
            where: {
                studentId_courseId: { studentId, courseId }
            },
            update: {
                progressPercentage: Math.round(overallProgress),
                lessonsCompleted: completedLessons,
                quizzesCompleted: completedQuizzes,
                averageQuizScore,
                currentModuleId: currentModule?.moduleId,
                lastAccessedAt: new Date(),
                updatedAt: new Date()
            },
            create: {
                studentId,
                courseId,
                progressPercentage: Math.round(overallProgress),
                lessonsCompleted: completedLessons,
                quizzesCompleted: completedQuizzes,
                averageQuizScore,
                currentModuleId: currentModule?.moduleId,
                lastAccessedAt: new Date()
            }
        });

        return courseProgress;
    }

    /**
     * Get comprehensive progress for a course
     */
    static async getCourseProgress(studentId, courseId) {
        const courseProgress = await prisma.courseProgress.findUnique({
            where: {
                studentId_courseId: { studentId, courseId }
            },
            include: {
                course: {
                    include: {
                        modules: {
                            include: {
                                lessons: {
                                    include: {
                                        lessonProgress: {
                                            where: { studentId }
                                        }
                                    }
                                },
                                quiz: {
                                    include: {
                                        submissions: {
                                            where: { studentId },
                                            orderBy: { score: 'desc' },
                                            take: 1
                                        }
                                    }
                                },
                                moduleProgress: {
                                    where: { studentId }
                                }
                            },
                            orderBy: { position: 'asc' }
                        }
                    }
                }
            }
        });

        if (!courseProgress) {
            // Initialize progress if it doesn't exist
            return await this.initializeCourseProgress(studentId, courseId);
        }

        return courseProgress;
    }

    /**
     * Initialize progress tracking for a newly enrolled course
     */
    static async initializeCourseProgress(studentId, courseId) {
        const course = await prisma.course.findUnique({
            where: { id: courseId },
            include: {
                modules: {
                    include: {
                        lessons: true,
                        quiz: true
                    },
                    orderBy: { position: 'asc' }
                }
            }
        });

        if (!course) throw new Error('Course not found');

        // Create course progress
        const courseProgress = await prisma.courseProgress.create({
            data: {
                studentId,
                courseId,
                progressPercentage: 0,
                lessonsCompleted: 0,
                quizzesCompleted: 0
            }
        });

        // Initialize module progress for each module
        for (const module of course.modules) {
            await prisma.moduleProgress.create({
                data: {
                    studentId,
                    moduleId: module.id,
                    progressPercentage: 0,
                    lessonsCompleted: 0,
                    quizCompleted: false
                }
            });
        }

        return courseProgress;
    }

    /**
     * Mark lesson as completed (convenience method)
     */
    static async markLessonCompleted(studentId, lessonId) {
        return this.trackLessonAccess(studentId, lessonId);
    }

    /**
     * Mark module as incomplete when new content is added
     * This ensures students must complete the new content to maintain completion status
     */
    static async markModuleIncompleteIfCompleted(moduleId) {
        // Get all students enrolled in the course that contains this module
        const enrollments = await prisma.enrollment.findMany({
            where: {
                course: {
                    modules: {
                        some: { id: moduleId }
                    }
                }
            },
            select: {
                studentId: true
            }
        });

        // For each enrolled student, recalculate module progress since content has changed
        for (const enrollment of enrollments) {
            const studentId = enrollment.studentId;

            // Get current module data to recalculate progress
            const module = await prisma.module.findUnique({
                where: { id: moduleId },
                select: {
                    lessons: { select: { id: true } },
                    quiz: { select: { id: true } }
                }
            });

            if (!module) continue;

            const totalLessons = module.lessons.length;
            const hasQuiz = !!module.quiz;

            // Count completed lessons in this module
            const completedLessons = await prisma.lessonProgress.count({
                where: {
                    studentId,
                    lessonId: { in: module.lessons.map(l => l.id) },
                    isCompleted: true
                }
            });

            // Check quiz completion
            let quizCompleted = false;
            let quizScore = null;

            if (hasQuiz) {
                const quizSubmission = await prisma.quizSubmission.findFirst({
                    where: {
                        studentId,
                        quizId: module.quiz.id
                    },
                    orderBy: { score: 'desc' },
                    select: { score: true }
                });

                if (quizSubmission && quizSubmission.score !== null) {
                    quizCompleted = true;
                    quizScore = quizSubmission.score;
                }
            }

            // Calculate new progress percentage
            const lessonProgressPercent = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;
            const quizProgressPercent = hasQuiz ? (quizCompleted ? 100 : 0) : 0;

            let overallProgress = 0;
            let componentCount = 0;

            if (totalLessons > 0) {
                overallProgress += lessonProgressPercent;
                componentCount++;
            }

            if (hasQuiz) {
                overallProgress += quizProgressPercent;
                componentCount++;
            }

            overallProgress = componentCount > 0 ? overallProgress / componentCount : 0;
            const isCompleted = overallProgress >= 100;

            // Update or create module progress
            await prisma.moduleProgress.upsert({
                where: {
                    studentId_moduleId: { studentId, moduleId }
                },
                update: {
                    progressPercentage: Math.round(overallProgress),
                    lessonsCompleted: completedLessons,
                    quizCompleted,
                    quizScore,
                    isCompleted,
                    completedAt: isCompleted ? new Date() : null,
                    updatedAt: new Date()
                },
                create: {
                    studentId,
                    moduleId,
                    progressPercentage: Math.round(overallProgress),
                    lessonsCompleted: completedLessons,
                    quizCompleted,
                    isCompleted,
                    lastAccessedAt: new Date()
                }
            });

            // Update course progress for this student
            await this.updateCourseProgressForStudent(studentId, moduleId);
        }
    }

    /**
     * Update course progress for a specific student and module
     */
    static async updateCourseProgressForStudent(studentId, moduleId) {
        // Get the course for this module
        const module = await prisma.module.findUnique({
            where: { id: moduleId },
            select: {
                courseId: true,
                course: {
                    select: {
                        id: true,
                        modules: {
                            select: {
                                id: true,
                                lessons: { select: { id: true } },
                                quiz: { select: { id: true } }
                            }
                        }
                    }
                }
            }
        });

        if (!module) return;

        const courseId = module.courseId;
        const course = module.course;

        // Calculate course-wide statistics
        const totalLessons = course.modules.reduce((sum, module) => sum + module.lessons.length, 0);
        const totalQuizzes = course.modules.filter(module => module.quiz).length;

        // Count completed lessons and quizzes
        const completedLessons = await prisma.lessonProgress.count({
            where: {
                studentId,
                lesson: {
                    module: {
                        courseId
                    }
                },
                isCompleted: true
            }
        });

        const completedQuizzes = await prisma.quizSubmission.count({
            where: {
                studentId,
                quiz: {
                    module: {
                        courseId
                    }
                },
                score: { not: null }
            }
        });

        // Calculate average quiz score
        const quizSubmissions = await prisma.quizSubmission.findMany({
            where: {
                studentId,
                quiz: {
                    module: {
                        courseId
                    }
                },
                score: { not: null }
            },
            select: { score: true }
        });

        const averageQuizScore = quizSubmissions.length > 0
            ? quizSubmissions.reduce((sum, sub) => sum + sub.score, 0) / quizSubmissions.length
            : null;

        // Calculate overall progress percentage
        const lessonProgressPercent = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;
        const quizProgressPercent = totalQuizzes > 0 ? (completedQuizzes / totalQuizzes) * 100 : 0;

        let overallProgress = 0;
        let componentCount = 0;

        if (totalLessons > 0) {
            overallProgress += lessonProgressPercent;
            componentCount++;
        }

        if (totalQuizzes > 0) {
            overallProgress += quizProgressPercent;
            componentCount++;
        }

        overallProgress = componentCount > 0 ? overallProgress / componentCount : 0;

        // Get current module (the one with most recent activity)
        const currentModule = await prisma.moduleProgress.findFirst({
            where: { studentId },
            orderBy: { lastAccessedAt: 'desc' },
            select: { moduleId: true }
        });

        // Update course progress
        await prisma.courseProgress.upsert({
            where: {
                studentId_courseId: { studentId, courseId }
            },
            update: {
                progressPercentage: Math.round(overallProgress),
                lessonsCompleted: completedLessons,
                quizzesCompleted: completedQuizzes,
                averageQuizScore,
                currentModuleId: currentModule?.moduleId,
                lastAccessedAt: new Date(),
                updatedAt: new Date()
            },
            create: {
                studentId,
                courseId,
                progressPercentage: Math.round(overallProgress),
                lessonsCompleted: completedLessons,
                quizzesCompleted: completedQuizzes,
                averageQuizScore,
                currentModuleId: currentModule?.moduleId,
                lastAccessedAt: new Date()
            }
        });
    }

    /**
     * Update quiz progress after submission
     */
    static async updateQuizProgress(studentId, quizId, score) {
        // Find the module for this quiz
        const quiz = await prisma.quiz.findUnique({
            where: { id: quizId },
            select: {
                moduleId: true,
                module: {
                    select: {
                        lessons: { select: { id: true } }
                    }
                }
            }
        });

        if (!quiz) return;

        // Update module progress (which will cascade to course progress)
        await this.updateModuleProgress(studentId, quiz.module.lessons[0]?.id);
    }
}

export default ProgressService;