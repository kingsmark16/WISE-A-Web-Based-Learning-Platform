import prisma from '../lib/prisma.js';


export const getFacultyCourses = async (req, res) => {
  try {
    const { facultyId } = req.params;

    const courses = await prisma.course.findMany({
      where: { facultyId },
      select: {
        title: true,
        thumbnail: true,
        updatedAt: true,
        college: true,       // mapped to category in response
      },
      orderBy: { updatedAt: 'desc' }
    });

    const data = courses.map(c => ({
      title: c.title,
      thumbnail: c.thumbnail,
      updatedAt: c.updatedAt,
      category: c.college,  // align with requested name
    }));

    return res.json({ facultyId, count: data.length, courses: data });
  } catch (err) {
    console.error('getFacultyCourses error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const getTotalCourses = async (req, res) => {
  try {
    const { facultyId } = req.params;

    const total = await prisma.course.count({
      where: { facultyId }
    });

    return res.json({ facultyId, totalCourses: total });
  } catch (err) {
    console.error('getTotalCourses error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};


export const getTotalPublishedCourses = async (req, res) => {
  try {
    const { facultyId } = req.params;

    const total = await prisma.course.count({
      where: {
        facultyId,
        status: 'PUBLISHED'
      }
    });

    return res.json({ facultyId, totalPublished: total });
  } catch (err) {
    console.error('getTotalPublishedCourses error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};


export const getTotalDraftCourses = async (req, res) => {
  try {
    const { facultyId } = req.params;

    const total = await prisma.course.count({
      where: {
        facultyId,
        status: 'DRAFT'
      }
    });

    return res.json({ facultyId, totalDraft: total });
  } catch (err) {
    console.error('getTotalDraftCourses error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const getTotalEnrolled = async (req, res) => {
  try {
    const { facultyId } = req.params;
    const { courseId } = req.query;

    if (courseId) {
      // Ensure the course belongs to the faculty
      const belongs = await prisma.course.findFirst({
        where: { id: courseId, facultyId },
        select: { id: true }
      });

      if (!belongs) {
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