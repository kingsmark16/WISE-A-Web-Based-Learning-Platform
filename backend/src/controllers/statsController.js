import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getTotalCourses = async (req, res) => {
    try {
        const totalCourses = await prisma.course.count();
        const totalUsers = await prisma.user.count();
        const totalStudents = await prisma.user.count({
            where: {
                role: 'STUDENT'
            } 
        })
        const totalFaculty = await prisma.user.count({
            where: {
                role: 'FACULTY'
            }
        });
        const totalAdmins = await prisma.user.count({
            where: {
                role: 'ADMIN'
            }
        });

        const coursesPerCategory = await prisma.course.groupBy({
            by: ['category'],
            _count: {
                category: true
            }
        })

        const formattedCategories = coursesPerCategory.map(item => ({
            category: item.category,
            count: item._count.category
        }))

        res.status(200).json({totalCourses, coursesPerCategory: formattedCategories, totalUsers, totalStudents, totalFaculty, totalAdmins});
    } catch (error) {
        console.log("Error in getTotalCourses controller", error);
        res.status(500).json({message: "Internal sever error"});
    }
}
