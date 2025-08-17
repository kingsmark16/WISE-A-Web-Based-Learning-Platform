import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

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
            "Technology Programming",
            "Business Entrepreneurship",
            "Education Teaching",
            "Science Engineering",
            "Mathematics"
            
        ];

        const results = await Promise.all(
            categories.map(category =>
                prisma.$queryRaw`
                    SELECT * FROM "Course"
                    WHERE category = ${category}
                    ORDER BY RANDOM()
                    LIMIT 8
                `
            )
        );

        const response = {};

        categories.forEach((cat, index) => {
            response[cat] = results[index];
        });

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