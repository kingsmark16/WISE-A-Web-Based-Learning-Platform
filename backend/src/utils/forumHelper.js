// src/utils/forumHelper.js
import prisma from '../lib/prisma.js';

/**
 * Validation constants
 */
export const FORUM_VALIDATION = {
  POST_TITLE_MIN: 3,
  POST_TITLE_MAX: 200,
  POST_CONTENT_MIN: 5,
  POST_CONTENT_MAX: 10000,
  REPLY_CONTENT_MIN: 1,
  REPLY_CONTENT_MAX: 5000,
  PAGINATION_LIMIT_MIN: 1,
  PAGINATION_LIMIT_MAX: 100,
  PAGINATION_DEFAULT: 10
};

/**
 * Valid forum categories
 */
export const FORUM_CATEGORIES = [
  { name: 'General Discussion', color: '#2563eb' },
  { name: 'Questions & Answers', color: '#059669' },
  { name: 'Announcements', color: '#dc2626' },
  { name: 'Others', color: '#64748b' }
];

/**
 * Get category by name
 */
export const getCategoryByName = (categoryName) => {
  return FORUM_CATEGORIES.find(cat => cat.name === categoryName);
};

/**
 * Clamp pagination limit between min and max
 */
export const clampLimit = (limit, min = FORUM_VALIDATION.PAGINATION_LIMIT_MIN, max = FORUM_VALIDATION.PAGINATION_LIMIT_MAX) => {
  return Math.max(min, Math.min(+limit || FORUM_VALIDATION.PAGINATION_DEFAULT, max));
};

/**
 * Validate post data
 */
export const validatePostData = (title, content, category) => {
  // All validation removed
  return [];
};

/**
 * Validate reply data
 */
export const validateReplyData = (content) => {
  const errors = [];
  // Content validation removed - allow any non-empty content
  return errors;
};

/**
 * Check if user is staff (admin or faculty)
 */
export const isStaff = (role) => role === 'ADMIN' || role === 'FACULTY';

/**
 * Check if user is author or staff
 */
export const isAuthorOrStaff = (user, authorId) => isStaff(user.role) || user.id === authorId;

/**
 * Get database user by Clerk ID
 */
export const getDbUserByCleark = async (clerkUserId) => {
  if (!clerkUserId) return null;
  try {
    return await prisma.user.findUnique({
      where: { clerkId: clerkUserId },
      select: { id: true, clerkId: true, role: true, fullName: true, imageUrl: true }
    });
  } catch (err) {
    console.error('getDbUser error:', err);
    return null;
  }
};

/**
 * Check course enrollment for student
 */
export const checkCourseEnrollment = async (userId, courseId) => {
  try {
    const enrollment = await prisma.enrollment.findUnique({
      where: {
        studentId_courseId: {
          studentId: userId,
          courseId
        }
      },
      select: { id: true }
    });
    return !!enrollment;
  } catch (err) {
    console.error('checkCourseEnrollment error:', err);
    return false;
  }
};

/**
 * Verify user has access to course
 * Students must be enrolled, staff can access any course
 */
export const verifyCourseAccess = async (user, courseId) => {
  if (isStaff(user.role)) return true;
  return checkCourseEnrollment(user.id, courseId);
};

/**
 * Get post with selected fields
 */
export const getPostWithFields = async (postId, includeUser = true) => {
  try {
    return await prisma.forumPost.findUnique({
      where: { id: String(postId) },
      select: {
        id: true,
        title: true,
        content: true,
        category: true,
        likes: true,
        isPinned: true,
        isLocked: true,
        createdAt: true,
        updatedAt: true,
        courseId: true,
        authorId: true,
        ...(includeUser && {
          author: {
            select: { id: true, clerkId: true, fullName: true, imageUrl: true }
          }
        }),
        _count: { select: { replies: true, likedBy: true } }
      }
    });
  } catch (err) {
    console.error('getPostWithFields error:', err);
    return null;
  }
};

/**
 * Verify course exists
 */
export const verifyCourseExists = async (courseId) => {
  try {
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: { id: true }
    });
    return !!course;
  } catch (err) {
    console.error('verifyCourseExists error:', err);
    return false;
  }
};

/**
 * Get forum post counts by category
 */
export const getForumCategoryCounts = async (courseId) => {
  try {
    const counts = await prisma.forumPost.groupBy({
      by: ['category'],
      where: { courseId },
      _count: { category: true }
    });

    const categoryMap = {};
    counts.forEach(item => {
      if (item.category) {
        categoryMap[item.category] = item._count.category;
      }
    });

    return categoryMap;
  } catch (err) {
    console.error('getForumCategoryCounts error:', err);
    return {};
  }
};

/**
 * Build forum category list with counts
 */
export const buildCategoryList = (categoryMap) => {
  return FORUM_CATEGORIES.map(cat => ({
    ...cat,
    count: categoryMap[cat.name] || 0
  }));
};

export default {
  FORUM_VALIDATION,
  FORUM_CATEGORIES,
  getCategoryByName,
  clampLimit,
  validatePostData,
  validateReplyData,
  isStaff,
  isAuthorOrStaff,
  getDbUserByCleark,
  checkCourseEnrollment,
  verifyCourseAccess,
  getPostWithFields,
  verifyCourseExists,
  getForumCategoryCounts,
  buildCategoryList
};
