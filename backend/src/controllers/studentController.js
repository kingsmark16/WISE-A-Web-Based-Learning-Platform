import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient();

export const getStudentInfo = async (req, res) => {
    try {
        const auth = req.auth();
        const userId = auth?.userId

        const response = await prisma.user.findUnique({
            where: {
                clerkId: userId
            }
        })

        res.status(200).json({response});
        console.log(response);
        

    } catch (error) {
        console.log('Error in getStudentInfo controller', error);
        res.status(500).json({message: "Internal server error"});
    }
}