import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient();

export const getAdminInfo = async (req, res) => {

   try {
   
      const auth = req.auth();
      const userId = auth?.userId;

    const response = await prisma.user.findUnique({
      where: {
         clerkId: userId
      }
    });
    res.json({message: "Success", response});
    console.log(response);
    
   } catch (error) {
    console.log("Error in getInfo", error);
    res.status(500).json({message: 'Internal server error'})
   } 
}

