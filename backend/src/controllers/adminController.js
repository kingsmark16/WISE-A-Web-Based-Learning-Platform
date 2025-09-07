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

export const getAllFaculty = async (req, res) => {
    try {

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const search = req.query.search || "";
        const sortBy = req.query.sortBy || "fullName";
        const sortOrder = req.query.sortOrder === "desc" ? "desc" : "asc";

        const where = {
         role: 'FACULTY',
         ...(search && {
            OR: [
               {
                  fullName: {contains: search, mode: "insensitive"}
               },
               {
                  emailAddress: {contains: search, mode: "insensitive"}
               }
            ]
         })
        }

        const totalFaculty = await prisma.user.count({where});

        let orderBy;

        if(sortBy === "totalManagedCourses") {
         orderBy = {
            managedCourses: {_count: sortOrder}
         };
        } else{
         orderBy = { [sortBy]: sortOrder };
        }

        const faculty = await prisma.user.findMany({
            where,
            select: {
                id: true,
                fullName: true,
                emailAddress: true,
                imageUrl: true,
                _count: {
                    select: {
                        managedCourses: true
                    }
                }
            },
            skip,
            take: limit,
            orderBy
        });

        const formattedFaculty = faculty.map(f => ({
            id: f.id,
            fullName: f.fullName,
            emailAddress: f.emailAddress,
            imageUrl: f.imageUrl,
            totalManagedCourses: f._count.managedCourses
        }));

        res.status(200).json({
            data: formattedFaculty,
            page,
            limit,
            totalFaculty,
            totalPages: Math.ceil(totalFaculty / limit)
        });

    } catch (error) {
        console.error("Error in getAllFaculty controller", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

export const getSingleFaculty = async (req, res) => {
   try {
      
      const {id} = req.params;

      if(!id) return res.status(404).json({message: "Faculty not found"});

      const faculty = await prisma.user.findUnique({
         where: {
            id
         },
         select: {
            id: true,
            fullName: true,
            emailAddress: true,
            imageUrl: true,
            lastActiveAt: true,
            createdCourses: {
               select: {
                  id: true,
                  title: true,
                  thumbnail: true
               }
            },
            managedCourses: {
               select: {
                  id: true,
                  title: true,
                  thumbnail: true
               }
            }
         }
      });

      res.status(200).json({faculty});

   } catch (error) {
      console.error("Error in getSingleFaculty controller", error);
      res.status(500).json({ message: "Internal server error" });
   }
}
