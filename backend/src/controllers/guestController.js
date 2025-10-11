import prisma from '../lib/prisma.js';

export const intro = (req, res) => {
    try {
        res.status(200).json({message: 'Hello'})
    } catch (error) {
        console.log("Error in Intro", error);
        
    }
}

export const getRandomCoursesByCategories = async (_, res) => {
    try {
        const categories = [
            "Technology",
            "Business", 
            "Education",
            "Engineering",
            "Mathematics"
        ];

        // Define colors for each category
        const categoryColors = {
            "Technology": { borderColor: "#4F46E5", gradient: "linear-gradient(145deg,#4F46E5,#000)" },
            "Business": { borderColor: "#10B981", gradient: "linear-gradient(210deg,#10B981,#000)" },
            "Education": { borderColor: "#F59E0B", gradient: "linear-gradient(165deg,#F59E0B,#000)" },
            "Engineering": { borderColor: "#EF4444", gradient: "linear-gradient(195deg,#EF4444,#000)" },
            "Mathematics": { borderColor: "#8B5CF6", gradient: "linear-gradient(225deg,#8B5CF6,#000)" }
        };

        const results = await Promise.all(
            categories.map(category =>
                prisma.$queryRaw`
                    SELECT * FROM "Course"
                    WHERE category = ${category}
                    ORDER BY RANDOM()
                    LIMIT 4
                `
            )
        );

        const response = {};
        for (let i = 0; i < categories.length; i++) {
            const coursesWithManager = await Promise.all(
                results[i].map(async (course) => {
                    let instructor = null;
                    if (course.facultyId) {
                        instructor = await prisma.user.findUnique({
                            where: { id: course.facultyId },
                            select: { id: true, fullName: true, emailAddress: true, imageUrl: true }
                        });
                    }
                    
                    // Add borderColor and gradient based on category
                    const colors = categoryColors[course.category] || { borderColor: "#6B7280", gradient: "linear-gradient(145deg,#6B7280,#000)" };
                    
                    return { 
                        ...course, 
                        instructor,
                        borderColor: colors.borderColor,
                        gradient: colors.gradient
                    };
                })
            );
            response[categories[i]] = coursesWithManager;
        }

        res.status(200).json({response});

    } catch (error) {
        console.log("Error in getRandomCoursesByCategories", error);
        res.status(500).json({ message: "Internal server error" });
    }
}


export const getSingleCourse = async (req, res) => {
    try {
        const {id} = req.params;

        const course = await prisma.course.findUnique({
            where: {
                id: id
            }
        });

        res.status(200).json({course});
    } catch (error) {
        console.log("Error in getSingleCourse", error);
        res.status(500).json({ message: "Internal server error" });
    }
}