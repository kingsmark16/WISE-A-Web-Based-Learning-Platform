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
     * Recalculate course progress directly by course ID
     * Used when content is deleted and we need to recalculate from scratch
     * @param {string} studentId - The student ID
     * @param {string} courseId - The course ID
     * @param {string} [excludeModuleId] - Optional module ID to exclude from calculation (when module is being deleted)
     */
    static async recalculateCourseProgressByCourseId(studentId, courseId, excludeModuleId = null) {
        // Get course structure
        const course = await prisma.course.findUnique({
            where: { id: courseId },
            select: {
                id: true,
                modules: {
                    select: {
                        id: true,
                        lessons: { select: { id: true } },
                        quiz: { select: { id: true } }
                    },
                    orderBy: { position: 'asc' }
                }
            }
        });

        if (!course) return null;

        // Filter out the excluded module if specified
        const modulesToCount = excludeModuleId 
            ? course.modules.filter(m => m.id !== excludeModuleId)
            : course.modules;

        console.log(`[progress] Recalculating course ${courseId} for student ${studentId}${excludeModuleId ? ` (excluding module ${excludeModuleId})` : ''}`);
        console.log(`[progress] Course structure: ${course.modules.length} modules total, ${modulesToCount.length} modules to count`);
        modulesToCount.forEach((m, idx) => {
            console.log(`[progress]   Module ${idx}: ${m.lessons.length} lessons, quiz=${!!m.quiz}`);
        });

        // Calculate total lessons and quizzes from modules we're counting
        const totalLessons = modulesToCount.reduce((sum, module) => sum + module.lessons.length, 0);
        const totalQuizzes = modulesToCount.filter(module => module.quiz).length;

        console.log(`[progress] Total: ${totalLessons} lessons, ${totalQuizzes} quizzes`);

        // Count completed lessons - only for lessons that still exist in the course
        const existingLessonIds = modulesToCount.flatMap(m => m.lessons.map(l => l.id));
        console.log(`[progress] Existing lesson IDs (${existingLessonIds.length}): ${existingLessonIds.join(', ')}`);
        
        // DEBUG: Check what lesson progress records exist in database
        const allLessonProgressForStudent = await prisma.lessonProgress.findMany({
            where: { studentId },
            select: { id: true, lessonId: true, isCompleted: true }
        });
        console.log(`[progress] DEBUG: Total lesson progress records in DB for student: ${allLessonProgressForStudent.length}`);
        console.log(`[progress] DEBUG: Lesson progress details: ${JSON.stringify(allLessonProgressForStudent)}`);
        
        const completedLessons = existingLessonIds.length > 0 
            ? await prisma.lessonProgress.count({
                where: {
                    studentId,
                    lessonId: { in: existingLessonIds },
                    isCompleted: true
                }
            })
            : 0;

        // Count completed quizzes - only for quizzes that still exist in the course
        const existingQuizIds = modulesToCount.filter(m => m.quiz).map(m => m.quiz.id);
        console.log(`[progress] Existing quiz IDs (${existingQuizIds.length}): ${existingQuizIds.join(', ')}`);
        
        // DEBUG: Check what quiz submissions exist in database
        const allQuizSubmissionsForStudent = await prisma.quizSubmission.findMany({
            where: { studentId },
            select: { id: true, quizId: true, score: true }
        });
        console.log(`[progress] DEBUG: Total quiz submissions in DB for student: ${allQuizSubmissionsForStudent.length}`);
        console.log(`[progress] DEBUG: Quiz submission details: ${JSON.stringify(allQuizSubmissionsForStudent)}`);
        
        const completedQuizzes = existingQuizIds.length > 0
            ? await prisma.quizSubmission.count({
                where: {
                    studentId,
                    quizId: { in: existingQuizIds },
                    score: { not: null }
                }
            })
            : 0;

        console.log(`[progress] Completed: ${completedLessons}/${totalLessons} lessons, ${completedQuizzes}/${totalQuizzes} quizzes`);

        // Calculate average quiz score - only for existing quizzes
        let averageQuizScore = null;
        if (existingQuizIds.length > 0) {
            const quizSubmissions = await prisma.quizSubmission.findMany({
                where: {
                    studentId,
                    quizId: { in: existingQuizIds },
                    score: { not: null }
                },
                select: { score: true }
            });

            if (quizSubmissions.length > 0) {
                averageQuizScore = quizSubmissions.reduce((sum, sub) => sum + sub.score, 0) / quizSubmissions.length;
            }
        }

        // Calculate overall progress percentage
        const lessonProgressPercent = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;
        const quizProgressPercent = totalQuizzes > 0 ? (completedQuizzes / totalQuizzes) * 100 : 0;

        console.log(`[progress] Percentages: lessons=${lessonProgressPercent}%, quizzes=${quizProgressPercent}%`);

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

        console.log(`[progress] Final: ${componentCount} components, overall progress=${Math.round(overallProgress)}%`);

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
                lastAccessedAt: new Date()
            }
        });

        console.log(`[progress] Course progress updated: ${Math.round(overallProgress)}%`);
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
                        courseId: true,
                        lessons: { select: { id: true } }
                    }
                }
            }
        });

        if (!quiz) return;

        // Update module progress (which calculates based on lessons + quiz)
        await this.updateModuleProgress(studentId, quiz.module.lessons[0]?.id);

        // Also update course progress to reflect quiz completion
        // Use recalculateCourseProgressByCourseId to ensure accurate calculation
        await this.recalculateCourseProgressByCourseId(studentId, quiz.module.courseId);
    }

    /**
     * Handle lesson deletion - cleanup progress and recalculate
     * Called when a lesson is deleted to:
     * 1. Delete orphaned lessonProgress records for that lesson
     * 2. Recalculate module progress for all students
     * 3. Recalculate course progress for all students
     */
    static async handleLessonDeletion(lessonId, moduleId) {
        try {
            console.log(`[progress] Handling deletion of lesson ${lessonId} in module ${moduleId}`);

            // Step 1: Delete orphaned lesson progress records
            const deletedProgressRecords = await prisma.lessonProgress.deleteMany({
                where: {
                    lessonId
                }
            });

            console.log(`[progress] Deleted ${deletedProgressRecords.count} progress records for lesson ${lessonId}`);

            // Step 2: Get all students who had progress in this module
            const moduleProgress = await prisma.moduleProgress.findMany({
                where: {
                    moduleId
                },
                select: {
                    studentId: true
                }
            });

            const studentIds = [...new Set(moduleProgress.map(mp => mp.studentId))];
            console.log(`[progress] Recalculating progress for ${studentIds.length} students in module ${moduleId}`);

            // Step 3: Recalculate progress for each student
            for (const studentId of studentIds) {
                try {
                    // Get any remaining lesson in this module to trigger full recalculation
                    const remainingLesson = await prisma.lesson.findFirst({
                        where: { moduleId },
                        select: { id: true }
                    });

                    if (remainingLesson) {
                        // Recalculate module and course progress using existing lesson
                        await this.updateModuleProgress(studentId, remainingLesson.id);
                        await this.updateCourseProgress(studentId, remainingLesson.id);
                    } else {
                        // Module has no more lessons - set progress to 0
                        console.log(`[progress] Module ${moduleId} has no remaining lessons for student ${studentId}`);
                        
                        const module = await prisma.module.findUnique({
                            where: { id: moduleId },
                            select: { courseId: true, quiz: { select: { id: true } } }
                        });

                        if (module) {
                            // Set module progress to 0 (or check if quiz still exists)
                            const hasQuiz = !!module.quiz;
                            const progressPercent = hasQuiz ? 0 : 0; // Quiz only (0 lessons) = 0%
                            
                            await prisma.moduleProgress.upsert({
                                where: {
                                    studentId_moduleId: { studentId, moduleId }
                                },
                                update: {
                                    progressPercentage: progressPercent,
                                    lessonsCompleted: 0,
                                    isCompleted: false,
                                    completedAt: null,
                                    updatedAt: new Date()
                                },
                                create: {
                                    studentId,
                                    moduleId,
                                    progressPercentage: progressPercent,
                                    lessonsCompleted: 0,
                                    isCompleted: false
                                }
                            });

                            // Also recalculate course progress using course ID directly
                            const courseId = module.courseId;
                            await this.recalculateCourseProgressByCourseId(studentId, courseId);
                        }
                    }
                } catch (error) {
                    console.error(`[progress] Error recalculating progress for student ${studentId}:`, error);
                    // Continue with next student
                }
            }

            console.log(`[progress] Completed lesson deletion cleanup for lesson ${lessonId}`);
            return {
                deletedProgressRecords: deletedProgressRecords.count,
                recalculatedStudents: studentIds.length
            };
        } catch (error) {
            console.error(`[progress] Error in handleLessonDeletion:`, error);
            throw error;
        }
    }

    /**
     * Handle module deletion - cleanup progress and recalculate
     * Called when a module is deleted to:
     * 1. Delete orphaned moduleProgress records for that module
     * 2. Recalculate course progress for all affected students
     */
    static async handleModuleDeletion(moduleId, courseId) {
        try {
            console.log(`[progress] Handling deletion of module ${moduleId} in course ${courseId}`);

            // Step 0: Get module structure BEFORE deleting anything
            const moduleToDelete = await prisma.module.findUnique({
                where: { id: moduleId },
                select: {
                    id: true,
                    lessons: { select: { id: true } },
                    quiz: { select: { id: true } }
                }
            });

            if (!moduleToDelete) {
                console.warn(`[progress] Module ${moduleId} not found`);
                return {
                    deletedModuleProgressRecords: 0,
                    deletedLessonProgressRecords: 0,
                    deletedQuizSubmissions: 0,
                    recalculatedStudents: 0
                };
            }

            console.log(`[progress] Module has ${moduleToDelete.lessons.length} lessons and ${moduleToDelete.quiz ? 1 : 0} quiz`);

            // Step 1: Get all students who had progress in this module
            const moduleProgress = await prisma.moduleProgress.findMany({
                where: {
                    moduleId
                },
                select: {
                    studentId: true
                }
            });

            const studentIds = [...new Set(moduleProgress.map(mp => mp.studentId))];
            console.log(`[progress] Found ${studentIds.length} students in module ${moduleId}`);

            // Step 1b: Delete all orphaned lessonProgress records for lessons in this module
            // Use the lesson IDs we fetched directly to avoid JOIN issues
            const lessonIds = moduleToDelete.lessons.map(l => l.id);
            const deletedLessonProgress = await prisma.lessonProgress.deleteMany({
                where: {
                    lessonId: { in: lessonIds }
                }
            });

            console.log(`[progress] Deleted ${deletedLessonProgress.count} orphaned lesson progress records`);

            // Step 1c: Delete all quiz submissions and answers for the quiz in this module
            let deletedQuizSubmissions = 0;
            let deletedQuizAnswers = 0;
            if (moduleToDelete.quiz) {
                console.log(`[progress] Deleting quiz ${moduleToDelete.quiz.id} submissions`);
                
                // Get all submission IDs first
                const submissions = await prisma.quizSubmission.findMany({
                    where: {
                        quizId: moduleToDelete.quiz.id
                    },
                    select: { id: true }
                });

                const submissionIds = submissions.map(s => s.id);
                console.log(`[progress] Found ${submissionIds.length} quiz submissions`);

                // Delete quiz answers for these submissions
                if (submissionIds.length > 0) {
                    const answersDeleted = await prisma.quizAnswer.deleteMany({
                        where: {
                            submissionId: {
                                in: submissionIds
                            }
                        }
                    });
                    deletedQuizAnswers = answersDeleted.count;
                }

                // Then delete quiz submissions
                const submissionsDeleted = await prisma.quizSubmission.deleteMany({
                    where: {
                        quizId: moduleToDelete.quiz.id
                    }
                });

                deletedQuizSubmissions = submissionsDeleted.count;
                console.log(`[progress] Deleted ${submissionsDeleted.count} quiz submissions and ${deletedQuizAnswers} quiz answers`);
            }

            // Step 2: Delete moduleProgress records for this module
            const deletedModuleProgress = await prisma.moduleProgress.deleteMany({
                where: {
                    moduleId
                }
            });

            console.log(`[progress] Deleted ${deletedModuleProgress.count} module progress records`);

            // Step 3: Recalculate course progress for each student
            console.log(`[progress] Recalculating course progress for ${studentIds.length} students (excluding module ${moduleId})`);

            for (const studentId of studentIds) {
                try {
                    // Recalculate course progress directly by course ID, excluding the module being deleted
                    await this.recalculateCourseProgressByCourseId(studentId, courseId, moduleId);
                } catch (error) {
                    console.error(`[progress] Error recalculating course progress for student ${studentId}:`, error);
                    // Continue with next student
                }
            }

            console.log(`[progress] Completed module deletion cleanup for module ${moduleId}`);
            return {
                deletedModuleProgressRecords: deletedModuleProgress.count,
                deletedLessonProgressRecords: deletedLessonProgress.count,
                deletedQuizSubmissions: deletedQuizSubmissions,
                recalculatedStudents: studentIds.length
            };
        } catch (error) {
            console.error(`[progress] Error in handleModuleDeletion:`, error);
            throw error;
        }
    }

    /**
     * Handle quiz deletion - reset quiz completion status in moduleProgress
     * Called when a quiz is deleted to reset students' quiz completion
     */
    static async handleQuizDeletion(quizId, moduleId) {
        try {
            console.log(`[progress] Handling deletion of quiz ${quizId} in module ${moduleId}`);

            // Step 1: Get all quiz submissions for this quiz to identify affected students
            const submissions = await prisma.quizSubmission.findMany({
                where: {
                    quizId
                },
                select: {
                    studentId: true,
                    id: true
                }
            });

            const studentIds = [...new Set(submissions.map(sub => sub.studentId))];
            console.log(`[progress] Found ${studentIds.length} students who completed this quiz`);

            // Step 2: Delete all quiz answers and submissions FIRST
            // This ensures that when we recalculate, the quiz won't be counted
            for (const submission of submissions) {
                await prisma.quizAnswer.deleteMany({
                    where: { submissionId: submission.id }
                });
            }

            const deletedSubmissions = await prisma.quizSubmission.deleteMany({
                where: {
                    quizId
                }
            });

            console.log(`[progress] Deleted ${deletedSubmissions.count} quiz submissions and their answers`);

            // Step 3: Reset quiz completion in moduleProgress for affected students
            const updatedModuleProgress = await prisma.moduleProgress.updateMany({
                where: {
                    moduleId,
                    studentId: {
                        in: studentIds
                    }
                },
                data: {
                    quizCompleted: false,
                    quizScore: null,
                    updatedAt: new Date()
                }
            });

            console.log(`[progress] Reset quiz completion for ${updatedModuleProgress.count} module progress records`);

            // Step 4: Recalculate module and course progress for each student
            for (const studentId of studentIds) {
                try {
                    // Get any remaining lesson in this module to trigger full recalculation
                    const remainingLesson = await prisma.lesson.findFirst({
                        where: { moduleId },
                        select: { id: true }
                    });

                    if (remainingLesson) {
                        // Recalculate module and course progress
                        await this.updateModuleProgress(studentId, remainingLesson.id);
                        await this.updateCourseProgress(studentId, remainingLesson.id);
                    } else {
                        // Module has no lessons - still update progress to reflect no quiz
                        const module = await prisma.module.findUnique({
                            where: { id: moduleId },
                            select: { courseId: true }
                        });

                        if (module) {
                            // Update module progress to 0 (no lessons, no quiz)
                            await prisma.moduleProgress.upsert({
                                where: {
                                    studentId_moduleId: { studentId, moduleId }
                                },
                                update: {
                                    progressPercentage: 0,
                                    lessonsCompleted: 0,
                                    quizCompleted: false,
                                    quizScore: null,
                                    isCompleted: false,
                                    completedAt: null,
                                    updatedAt: new Date()
                                },
                                create: {
                                    studentId,
                                    moduleId,
                                    progressPercentage: 0,
                                    lessonsCompleted: 0,
                                    quizCompleted: false,
                                    isCompleted: false
                                }
                            });

                            // Recalculate course progress
                            await this.recalculateCourseProgressByCourseId(studentId, module.courseId);
                        }
                    }
                } catch (error) {
                    console.error(`[progress] Error recalculating progress for student ${studentId}:`, error);
                    // Continue with next student
                }
            }

            console.log(`[progress] Completed quiz deletion cleanup for quiz ${quizId}`);
            return {
                affectedStudents: studentIds.length,
                updatedModuleProgressRecords: updatedModuleProgress.count,
                deletedSubmissions: deletedSubmissions.count
            };
        } catch (error) {
            console.error(`[progress] Error in handleQuizDeletion:`, error);
            throw error;
        }
    }
}

export default ProgressService;