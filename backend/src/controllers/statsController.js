import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getTotalCourses = async (req, res) => {
    try {
        const totalCourses = await prisma.course.count();
        res.status(200).json({totalCourses});
    } catch (error) {
        console.log("Error in getTotalCourses controller", error);
        res.status(500).json({message: "Internal sever error"});
    }
}