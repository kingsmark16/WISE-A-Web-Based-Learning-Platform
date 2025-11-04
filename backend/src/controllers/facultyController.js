import prisma from '../lib/prisma.js';

/**
 * Get all faculty course statistics in a single optimized query
 * Returns: courses, published, draft, archived, modules, lessons, quizzes, enrolled
 * 
 * The facultyId parameter can be either:
 * - Database user ID (from param) - for internal use
 * - Clerk ID - will be resolved to database user ID
 */
export const getFacultyStats = async (req, res) => {
  try {
    let { facultyId } = req.params;

    // Try to resolve Clerk ID to database user ID if needed
    // First check if facultyId looks like a database ID or Clerk ID
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { id: facultyId },           // Try as database ID
          { clerkId: facultyId }        // Try as Clerk ID
        ]
      },
      select: { id: true }
    });

    if (!user) {
      return res.status(404).json({ message: 'Faculty user not found' });
    }

    // Use the database user ID for all queries
    const dbFacultyId = user.id;

    // Get all counts in parallel for better performance
    const [totalCount, publishedCount, draftCount, archivedCount, modulesCount, lessonsCount, quizzesCount, enrollmentCount] = await Promise.all([
      prisma.course.count({
        where: { facultyId: dbFacultyId }
      }),
      prisma.course.count({
        where: { facultyId: dbFacultyId, status: 'PUBLISHED' }
      }),
      prisma.course.count({
        where: { facultyId: dbFacultyId, status: 'DRAFT' }
      }),
      prisma.course.count({
        where: { facultyId: dbFacultyId, status: 'ARCHIVED' }
      }),
      prisma.module.count({
        where: { course: { facultyId: dbFacultyId } }
      }),
      prisma.lesson.count({
        where: { module: { course: { facultyId: dbFacultyId } } }
      }),
      prisma.quiz.count({
        where: { module: { course: { facultyId: dbFacultyId } } }
      }),
      prisma.enrollment.count({
        where: { course: { facultyId: dbFacultyId } }
      })
    ]);

    return res.json({
      facultyId: dbFacultyId,
      stats: {
        totalCourses: totalCount,
        publishedCourses: publishedCount,
        draftCourses: draftCount,
        archivedCourses: archivedCount,
        totalModules: modulesCount,
        totalLessons: lessonsCount,
        totalQuizzes: quizzesCount,
        totalEnrolled: enrollmentCount
      }
    });
  } catch (err) {
    console.error('getFacultyStats error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const getFacultyCourses = async (req, res) => {
  try {
    const { facultyId } = req.params;

    const courses = await prisma.course.findMany({
      where: { facultyId },
      select: {
        id: true,
        title: true,
        thumbnail: true,
        updatedAt: true,
        college: true,
        status: true,
        _count: {
          select: {
            modules: true,
            enrollments: true
          }
        }
      },
      orderBy: { updatedAt: 'desc' }
    });

    const data = courses.map(c => ({
      id: c.id,
      title: c.title,
      thumbnail: c.thumbnail,
      updatedAt: c.updatedAt,
      category: c.college,
      status: c.status,
      moduleCount: c._count.modules,
      enrollmentCount: c._count.enrollments
    }));

    return res.json({ facultyId, count: data.length, courses: data });
  } catch (err) {
    console.error('getFacultyCourses error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
export const getTotalEnrolled = async (req, res) => {
  try {
    const { facultyId } = req.params;
    const { courseId } = req.query;

    if (courseId) {
      // Ensure the course belongs to the faculty
      const belongs = await prisma.course.findUnique({
        where: { id: courseId },
        select: { facultyId: true }
      });

      if (!belongs || belongs.facultyId !== facultyId) {
        return res.status(404).json({ message: 'Course not found for this faculty' });
      }

      const totalForCourse = await prisma.enrollment.count({
        where: { courseId }
      });

      return res.json({
        facultyId,
        courseId,
        totalEnrolled: totalForCourse
      });
    }

    const totalAll = await prisma.enrollment.count({
      where: {
        course: { facultyId }
      }
    });

    return res.json({
      facultyId,
      totalEnrolledAllCourses: totalAll
    });
  } catch (err) {
    console.error('getTotalEnrolled error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Get detailed analytics for a specific course
 * Returns: course info, modules, lessons, quizzes, enrollments
 */
export const getCourseAnalytics = async (req, res) => {
  try {
    let { facultyId, courseId } = req.params;

    // Resolve Clerk ID to database user ID if needed
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { id: facultyId },           // Try as database ID
          { clerkId: facultyId }        // Try as Clerk ID
        ]
      },
      select: { id: true }
    });

    if (!user) {
      return res.status(404).json({ message: 'Faculty user not found' });
    }

    const dbFacultyId = user.id;

    // Verify the course belongs to the faculty
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        modules: {
          include: {
            lessons: {
              include: {
                lessonProgress: {
                  select: { 
                    studentId: true, 
                    viewCount: true,
                    student: {
                      select: { fullName: true }
                    }
                  }
                }
              }
            },
            quiz: {
              include: {
                submissions: {
                  select: { 
                    studentId: true,
                    student: {
                      select: { fullName: true }
                    }
                  }
                }
              }
            }
          }
        },
        enrollments: {
          select: { 
            id: true, 
            studentId: true,
            student: {
              select: { fullName: true }
            }
          }
        },
        forumPosts: {
          select: { id: true }
        },
        certificates: {
          select: { id: true }
        },
        completions: {
          select: {
            id: true,
            userId: true,
            completedAt: true,
            user: {
              select: { fullName: true }
            }
          }
        }
      }
    });

    if (!course || course.facultyId !== dbFacultyId) {
      return res.status(404).json({ message: 'Course not found for this faculty' });
    }

    // Get forum replies count for this course
    const forumReplies = await prisma.forumReply.findMany({
      where: {
        post: {
          courseId: courseId
        }
      },
      select: { id: true }
    });

    console.log('=== Course Analytics Debug ===');
    console.log('Course data:', {
      courseId: course.id,
      modulesCount: course.modules?.length || 0,
      enrollmentsCount: course.enrollments?.length || 0,
      totalLessons: course.modules.reduce((sum, m) => sum + m.lessons.length, 0)
    });

    // Calculate engagement metrics
    const enrolledStudentIds = course.enrollments.map(e => e.studentId);
    
    // Count unique lesson accesses
    const allLessonProgress = course.modules.flatMap(m => 
      m.lessons.flatMap(l => l.lessonProgress)
    );
    const uniqueLessonAccess = allLessonProgress.length;
    
    // Calculate total lesson views (sum of all viewCounts including repeats)
    const totalLessonViews = allLessonProgress.reduce((sum, lp) => sum + (lp.viewCount || 0), 0);
    
    // Count unique quiz attempts
    const allQuizSubmissions = course.modules.flatMap(m =>
      m.quiz ? m.quiz.submissions : []
    );
    const uniqueQuizAttempts = allQuizSubmissions.length;

    // Count total lessons and quizzes
    const totalLessons = course.modules.reduce((sum, m) => sum + m.lessons.length, 0);
    const totalQuizzes = course.modules.filter(m => m.quiz).length;

    console.log('Engagement data:', {
      uniqueLessonAccess,
      totalLessonViews,
      uniqueQuizAttempts,
      totalLessons,
      totalQuizzes
    });

    // Calculate engagement percentage
    let engagementPercentage = 0;
    if ((totalLessons > 0 || totalQuizzes > 0) && enrolledStudentIds.length > 0) {
      const maxLessonAccess = totalLessons * enrolledStudentIds.length;
      const maxQuizAttempts = totalQuizzes * enrolledStudentIds.length;
      
      const lessonCoverage = maxLessonAccess > 0 ? (uniqueLessonAccess / maxLessonAccess) : 0;
      const quizCoverage = maxQuizAttempts > 0 ? (uniqueQuizAttempts / maxQuizAttempts) : 0;
      
      if (totalLessons > 0 && totalQuizzes > 0) {
        engagementPercentage = (0.6 * lessonCoverage) + (0.4 * quizCoverage);
      } else if (totalLessons > 0) {
        engagementPercentage = lessonCoverage;
      } else if (totalQuizzes > 0) {
        engagementPercentage = quizCoverage;
      }
      
      engagementPercentage = Math.min(Math.round(engagementPercentage * 100), 100);
    }

    // Calculate module completion rates
    const moduleMetrics = (course.modules || []).map(module => {
      const lessonsInModule = module.lessons.length;
      const studentsWhoCompletedLessons = new Set();
      
      module.lessons.forEach(lesson => {
        lesson.lessonProgress.forEach(lp => {
          if (lp.viewCount > 0) {
            studentsWhoCompletedLessons.add(lp.studentId);
          }
        });
      });
      
      const avgCompletionRate = enrolledStudentIds.length > 0 
        ? Math.round((studentsWhoCompletedLessons.size / enrolledStudentIds.length) * 100)
        : 0;
      
      console.log(`Module: ${module.title}, Lessons: ${lessonsInModule}, Completed: ${studentsWhoCompletedLessons.size}`);
      
      return {
        id: module.id,
        title: module.title,
        lessonCount: lessonsInModule,
        completedStudents: studentsWhoCompletedLessons.size,
        averageCompletionRate: avgCompletionRate
      };
    });

    // Calculate lesson metrics
    const lessonMetrics = (course.modules || []).flatMap(module =>
      module.lessons.map(lesson => {
        const totalViews = lesson.lessonProgress.reduce((sum, lp) => sum + (lp.viewCount || 0), 0);
        return {
          id: lesson.id,
          title: lesson.title,
          moduleId: module.id,
          moduleName: module.title,
          totalViews,
          uniqueStudents: new Set(lesson.lessonProgress.map(lp => lp.studentId)).size
        };
      })
    );

    // Calculate top 5 performing students based on total engagement
    const studentMetrics = new Map();
    (course.modules || []).forEach(module => {
      module.lessons.forEach(lesson => {
        lesson.lessonProgress.forEach(lp => {
          if (!studentMetrics.has(lp.studentId)) {
            studentMetrics.set(lp.studentId, { 
              lessonViews: 0, 
              lessonsViewed: new Set(),
              studentName: lp.student?.fullName || 'Unknown Student'
            });
          }
          const metrics = studentMetrics.get(lp.studentId);
          metrics.lessonViews += lp.viewCount || 0;
          metrics.lessonsViewed.add(lesson.id);
        });
      });

      // Add quiz attempts to student metrics
      if (module.quiz) {
        module.quiz.submissions.forEach(submission => {
          if (!studentMetrics.has(submission.studentId)) {
            studentMetrics.set(submission.studentId, { 
              lessonViews: 0, 
              lessonsViewed: new Set(),
              studentName: submission.student?.fullName || 'Unknown Student'
            });
          }
          const metrics = studentMetrics.get(submission.studentId);
          metrics.quizzesAttempted = (metrics.quizzesAttempted || 0) + 1;
        });
      }
    });

    const topStudents = Array.from(studentMetrics.entries())
      .map(([studentId, metrics]) => ({
        studentId,
        studentName: metrics.studentName,
        lessonViews: metrics.lessonViews,
        lessonsViewed: metrics.lessonsViewed.size,
        quizzesAttempted: metrics.quizzesAttempted || 0,
        engagementScore: (metrics.lessonViews * 0.5) + (metrics.lessonsViewed.size * 10) + (metrics.quizzesAttempted || 0) * 5
      }))
      .sort((a, b) => b.engagementScore - a.engagementScore)
      .slice(0, 5);

    console.log('Analytics response:', {
      modulesCount: moduleMetrics.length,
      lessonsCount: lessonMetrics.length,
      topStudentsCount: topStudents.length
    });

    // Calculate course completion metrics per student
    const courseCompletionMetrics = (course.enrollments || []).map(enrollment => {
      const completion = course.completions.find(c => c.userId === enrollment.studentId);
      
      // Calculate student progress percentage
      let studentProgress = 0;
      const studentMetricsEntry = studentMetrics.get(enrollment.studentId);
      if (studentMetricsEntry) {
        const lessonsViewed = studentMetricsEntry.lessonsViewed.size;
        const quizzesAttempted = studentMetricsEntry.quizzesAttempted || 0;
        const totalAssessments = totalLessons + totalQuizzes;
        if (totalAssessments > 0) {
          studentProgress = Math.round(((lessonsViewed + quizzesAttempted) / totalAssessments) * 100);
        }
      }

      return {
        studentId: enrollment.studentId,
        studentName: enrollment.student?.fullName || 'Unknown Student',
        progress: studentProgress,
        isCompleted: !!completion,
        completedAt: completion?.completedAt || null
      };
    });

    return res.json({
      courseId,
      course: {
        title: course.title,
        description: course.description,
        status: course.status,
        thumbnail: course.thumbnail,
        enrollments: course.enrollments
      },
      engagement: {
        uniqueLessonAccess,
        totalLessonViews,
        uniqueQuizAttempts,
        totalLessons,
        totalQuizzes,
        score: engagementPercentage
      },
      community: {
        forumPosts: course.forumPosts?.length || 0,
        forumReplies: forumReplies.length || 0
      },
      certificates: course.certificates?.length || 0,
      courseCompletion: courseCompletionMetrics,
      lessons: lessonMetrics,
      topStudents
    });
  } catch (err) {
    console.error('getCourseAnalytics error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Get top courses by engagement for a faculty
 * Supports time range filtering (1 week, 1 month)
 * Shows both enrollments and engagement metrics (quiz attempts, lesson views)
 */
export const getTopCoursesByEngagement = async (req, res) => {
  try {
    let { facultyId } = req.params;
    const { timeRange = '1m' } = req.query; // '1d', '1w', '1m', or 'all'

    // Resolve Clerk ID to database user ID if needed
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { id: facultyId },
          { clerkId: facultyId }
        ]
      },
      select: { id: true }
    });

    if (!user) {
      return res.status(404).json({ message: 'Faculty user not found' });
    }

    const dbFacultyId = user.id;

    // Calculate date range
    const now = new Date();
    let startDate = null;
    
    if (timeRange === 'all') {
      // No date filter - get all data
      startDate = null;
    } else if (timeRange === '1d') {
      startDate = new Date();
      startDate.setDate(now.getDate() - 1);
    } else if (timeRange === '1w') {
      startDate = new Date();
      startDate.setDate(now.getDate() - 7);
    } else {
      // Default to 1m
      startDate = new Date();
      startDate.setMonth(now.getMonth() - 1);
    }

    // Get all courses for faculty
    const courses = await prisma.course.findMany({
      where: {
        facultyId: dbFacultyId
      },
      select: {
        id: true,
        title: true,
        thumbnail: true,
        status: true,
        modules: {
          select: {
            id: true,
            quiz: {
              select: {
                id: true
              }
            },
            lessons: {
              select: {
                id: true
              }
            }
          }
        },
        enrollments: {
          select: {
            id: true,
            studentId: true,
            enrolledAt: true
          }
        }
      }
    });

    // Calculate engagement metrics for each course
    const topCourses = await Promise.all(
      courses.map(async (course) => {
        // Count recent enrollments (based on time range)
        const recentEnrollments = startDate 
          ? course.enrollments.filter(e => e.enrolledAt >= startDate).length
          : course.enrollments.length; // All time = total enrollments
        const totalEnrollments = course.enrollments.length;

        // Get all enrolled student IDs for this course
        const enrolledStudentIds = course.enrollments.map(e => e.studentId);

        // Count quiz attempts for all enrolled students in this course (within time range)
        let quizAttempts = 0;
        if (course.modules.length > 0 && enrolledStudentIds.length > 0) {
          // Get all quiz IDs in this course
          const quizIds = course.modules
            .filter(m => m.quiz)
            .map(m => m.quiz.id);

          if (quizIds.length > 0) {
            // Count all quiz attempts by enrolled students
            const quizSubmissionCount = await prisma.quizSubmission.count({
              where: {
                quizId: { in: quizIds },
                studentId: { in: enrolledStudentIds },
                ...(startDate && { startedAt: { gte: startDate } })
              }
            });
            quizAttempts = quizSubmissionCount;
          }
        }

        // Count unique student-lesson pairs (content coverage) for enrolled students (within time range)
        let uniqueLessonAccess = 0;
        let totalLessons = 0;
        if (course.modules.length > 0 && enrolledStudentIds.length > 0) {
          // Get all lesson IDs in this course
          const lessonIds = course.modules
            .flatMap(m => m.lessons)
            .map(l => l.id);

          totalLessons = lessonIds.length;

          if (lessonIds.length > 0) {
            // Count unique student-lesson pairs (distinct records)
            uniqueLessonAccess = await prisma.lessonProgress.count({
              where: {
                lessonId: { in: lessonIds },
                studentId: { in: enrolledStudentIds },
                ...(startDate && { lastAccessedAt: { gte: startDate } })
              }
            });
          }
        }

        // Count unique student-quiz pairs (quiz attempts by enrolled students)
        let uniqueQuizAttempts = 0;
        if (course.modules.length > 0 && enrolledStudentIds.length > 0) {
          // Get all quiz IDs in this course
          const quizIds = course.modules
            .filter(m => m.quiz)
            .map(m => m.quiz.id);

          if (quizIds.length > 0) {
            // Count unique student-quiz pairs using groupBy to get distinct combinations
            const uniqueAttempts = await prisma.quizSubmission.groupBy({
              by: ['studentId', 'quizId'],
              where: {
                quizId: { in: quizIds },
                studentId: { in: enrolledStudentIds },
                ...(startDate && { startedAt: { gte: startDate } })
              }
            });
            uniqueQuizAttempts = uniqueAttempts.length;
          }
        }

        // Count total quizzes in the course
        const totalQuizzes = course.modules.filter(m => m.quiz).length;

        // Calculate engagement percentage based on content coverage:
        // Engagement % = 0.6 × (Unique Lessons Accessed / (Total Lessons × Enrolled Students)) + 
        //                0.4 × (Unique Quiz Attempts / (Total Quizzes × Enrolled Students))
        // This measures what % of content has been accessed by students (100% = everyone accessed everything at least once)
        let engagementPercentage = 0;
        
        if ((totalLessons > 0 || totalQuizzes > 0) && enrolledStudentIds.length > 0) {
          const maxLessonAccess = totalLessons * enrolledStudentIds.length;
          const maxQuizAttempts = totalQuizzes * enrolledStudentIds.length;
          
          const lessonCoverage = maxLessonAccess > 0 ? (uniqueLessonAccess / maxLessonAccess) : 0;
          const quizCoverage = maxQuizAttempts > 0 ? (uniqueQuizAttempts / maxQuizAttempts) : 0;
          
          // Apply weights: 60% lessons, 40% quizzes
          if (totalLessons > 0 && totalQuizzes > 0) {
            engagementPercentage = (0.6 * lessonCoverage) + (0.4 * quizCoverage);
          } else if (totalLessons > 0) {
            // Only lessons exist, use 100% weight for lessons
            engagementPercentage = lessonCoverage;
          } else if (totalQuizzes > 0) {
            // Only quizzes exist, use 100% weight for quizzes
            engagementPercentage = quizCoverage;
          }
          
          // Convert to percentage (0-100) and cap at 100
          engagementPercentage = Math.min(Math.round(engagementPercentage * 100), 100);
        }

        const engagementScore = engagementPercentage;

        return {
          id: course.id,
          title: course.title,
          thumbnail: course.thumbnail,
          status: course.status,
          enrollments: {
            total: totalEnrollments,
            recent: recentEnrollments
          },
          engagement: {
            uniqueQuizAttempts,
            uniqueLessonAccess,
            totalQuizzes,
            totalLessons,
            score: engagementScore, // Percentage (0-100)
            percentage: engagementScore // Alias for clarity
          },
          moduleCount: course.modules.length
        };
      })
    );

    // Sort by engagement score (content coverage percentage, descending)
    const sortedCourses = topCourses
      .sort((a, b) => b.engagement.score - a.engagement.score);
    
    // Return all courses sorted by engagement (frontend will display top 5 in chart)
    return res.json({
      facultyId: dbFacultyId,
      timeRange,
      topCourses: sortedCourses,
      chartCourses: sortedCourses.slice(0, 5) // Top 5 for chart visualization
    });
  } catch (err) {
    console.error('getTopCoursesByEngagement error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};