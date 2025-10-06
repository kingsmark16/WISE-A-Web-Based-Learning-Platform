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
        } else if(sortBy === "totalCreatedCourses") {
         orderBy = {
            createdCourses: {_count: sortOrder}
         };
        } else if(sortBy === "lastActiveAt") {
         orderBy = {
            lastActiveAt: sortOrder
         };
        } else {
         orderBy = { [sortBy]: sortOrder };
        }

        const faculty = await prisma.user.findMany({
            where,
            select: {
                id: true,
                fullName: true,
                emailAddress: true,
                imageUrl: true,
                lastActiveAt:true,
                _count: {
                    select: {
                        managedCourses: true,
                        createdCourses: true
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
            lastActiveAt: f.lastActiveAt,
            totalManagedCourses: f._count.managedCourses,
            totalCreatedCourses: f._count.createdCourses
        }));

        res.status(200).json({
            data: formattedFaculty,
            page,
            limit,
            totalFaculty,
            totalPages: Math.ceil(totalFaculty / limit)
        });

    } catch (error) {
        console.log("Error in getAllFaculty controller", error);
        res.status(500).json({message: "Internal server error"});
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
            createdAt: true,
            createdCourses: {
               select: {
                  id: true,
                  title: true,
                  thumbnail: true,
                  category: true,
                  updatedAt: true,
                  isPublished: true
               }
            },
            managedCourses: {
               select: {
                  id: true,
                  title: true,
                  thumbnail: true,
                  category: true,
                  updatedAt: true,
                  isPublished: true
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

export const getStudents = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const search = req.query.search || "";
        const sortBy = req.query.sortBy || "fullName";
        const sortOrder = req.query.sortOrder === "desc" ? "desc" : "asc";

        const where = {
            role: 'STUDENT',
            ...(search && {
                OR: [
                    {
                        fullName: { contains: search, mode: "insensitive" }
                    },
                    {
                        emailAddress: { contains: search, mode: "insensitive" }
                    }
                ]
            })
        };

        const totalStudents = await prisma.user.count({ where });

        let orderBy;

        if (sortBy === "totalEnrolledCourses") {
            orderBy = {
                enrollments: { _count: sortOrder }
            };
        } else if (sortBy === "lastActiveAt") {
            orderBy = {
                lastActiveAt: sortOrder
            };
        } else {
            orderBy = { [sortBy]: sortOrder };
        }

        const students = await prisma.user.findMany({
            where,
            select: {
                id: true,
                fullName: true,
                emailAddress: true,
                imageUrl: true,
                lastActiveAt: true,
                createdAt: true,
                _count: {
                    select: {
                        enrollments: true,
                        certificates: true
                    }
                }
            },
            skip,
            take: limit,
            orderBy
        });

        const formattedStudents = students.map(s => ({
            id: s.id,
            fullName: s.fullName,
            emailAddress: s.emailAddress,
            imageUrl: s.imageUrl,
            lastActiveAt: s.lastActiveAt,
            createdAt: s.createdAt,
            totalEnrolledCourses: s._count.enrollments,
            totalCertificates: s._count.certificates
        }));

        res.status(200).json({
            data: formattedStudents,
            page,
            limit,
            totalStudents,
            totalPages: Math.ceil(totalStudents / limit)
        });

    } catch (error) {
        console.log("Error in getStudents controller", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const getSingleStudent = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) return res.status(404).json({ message: "Student not found" });

        const student = await prisma.user.findUnique({
            where: {
                id
            },
            select: {
                id: true,
                fullName: true,
                emailAddress: true,
                imageUrl: true,
                lastActiveAt: true,
                createdAt: true,
                enrollments: {
                    select: {
                        id: true,
                        enrolledAt: true,
                        course: {
                            select: {
                                id: true,
                                title: true,
                                thumbnail: true,
                                category: true,
                                isPublished: true
                            }
                        }
                    }
                },
                certificates: {
                    select: {
                        id: true,
                        certificateNumber: true,
                        issueDate: true,
                        certificateUrl: true,
                        course: {
                            select: {
                                id: true,
                                title: true
                            }
                        }
                    }
                },
                _count: {
                    select: {
                        enrollments: true,
                        certificates: true
                    }
                }
            }
        });

        if (!student) {
            return res.status(404).json({ message: "Student not found" });
        }

        res.status(200).json({ student });

    } catch (error) {
        console.error("Error in getSingleStudent controller", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
