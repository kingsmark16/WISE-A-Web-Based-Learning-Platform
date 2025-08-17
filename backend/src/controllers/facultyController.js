import { PrismaClient } from "@prisma/client"


const prisma = new PrismaClient();

export const getAllFacultyByName = async (req, res) => {
    try {
        const faculty = await prisma.user.findMany({
            where: {
                role: 'FACULTY'
            },
            select: {
                id: true,
                fullName: true
            }
        });

        res.status(200).json({message: "Success", faculty});
    } catch (error) {
        console.log("Error in getAllFacultyByName controller");
        res.status(500).json({message: "Internal server error"});
    }
}