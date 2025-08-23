import { PrismaClient } from "@prisma/client";
import { generateCourseCode } from "../utils/generateCourseCode.js";
import cloudinary from "../lib/cloudinary.js";


const prisma = new PrismaClient();


export const createCourse = async (req, res) => {
   
   try {
      const {title, description, category, facultyId} = req.body;
      const code = generateCourseCode();

      if(!title || !category){
         return res.status(400).json({message: "Please provide title and category"});
      }

      const auth = req.auth();
      const userId = auth.userId;

      const {id: createdById} = await prisma.user.findUnique({
         where: {
            clerkId: userId
         },
         select: {
            id: true,
         }
      })

      let thumbnailUrl = null;
      if(req.file){
        try {
            const uploadResult = await new Promise((resolve, reject) => {
                const uploadStream = cloudinary.uploader.upload_stream(
                    {
                        folder: 'course-thumbnails',
                        resource_type: 'image',
                    },
                    (error, result) => {
                        if(error) reject(error);
                        else resolve(result);
                    }
                );
                uploadStream.end(req.file.buffer);
            });

            thumbnailUrl = uploadResult.secure_url;
        } catch (uploadError) {
            console.log("Error uploading to Cloudinary:", uploadError);
            return res.status(500).json({message: "Error uploading thumbnail"});
        }
      }


      const newCourse = await prisma.course.create({
         data: {
            title,
            description,
            thumbnail: thumbnailUrl,
            category,
            code,
            createdById,
            facultyId
         }
      })

      res.status(201).json({message: 'Course created successfully', newCourse})

   } catch (error) {
      console.log("Error in createCourse controller", error);
      res.status(500).json({message: "Internal server error"});
   }
}

export const getCourses = async (req, res) => {

    try {

        // const page = parseInt(req.query.page) || 1;
        // const limit = parseInt(req.query.limit) || 10;
        // const skip = (page - 1) * limit;

        const courses = await prisma.course.findMany({
            // skip,
            // take: limit,
            select: {
                id: true,
                title: true,
                category: true,
                isPublished: true,
                code: true,
                updatedAt: true,
                createdBy: {
                    select: {
                        fullName: true,
                        clerkId: true,
                    }
                },
                managedBy: {
                    select: {
                        fullName: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        res.status(200).json({ courses});

    } catch (error) {
        console.log("Error in getCourses controller", error);
        res.status(500).json({ message: "Internal server error" });
    }
}


export const getCourse = async (req, res) => {
    try {
        const {id} = req.params;

        if(!id) return res.status(404).json({message: "Course not found"});

        const course = await prisma.course.findUnique({
            where: {
                id
            },
            select: {
                title: true,
                description: true,
                thumbnail: true,
                category: true,
                isPublished: true,
                code: true,
                updatedAt: true,
                createdBy: {
                    select: {
                        fullName: true,
                    }
                },
                managedBy: {
                    select: {
                        fullName: true
                    }
                }
            }
        })

        res.status(200).json({course});

    } catch (error) {
        console.log("Error in getCourse controller");
        res.status(500).json({message: "Internal Server Error"});
    }
}


export const deleteCourse = async (req, res) => {
    try {
        const {id} = req.params;

        const course = await prisma.course.findUnique({
            where: {
                id
            }
        });

        if(!course){
            return res.status(404).json({message: "Course not found"});
        }

        await prisma.course.delete({
            where: {
                id
            }
        })

        res.status(200).json({message: "Course deleted successfully"});
    } catch (error) {
        console.log("Error in deleteCourse controller");
        res.status(500).json({message: "Internal Server Error"});
    }
}



export const updateCourse = async (req, res) => {
    try {
        const {id} = req.params;
        const updateData = req.body;

        if(!id) return res.status(404).json({message: "Invalid courseId"});
        

        const filteredData = Object.fromEntries(
            Object.entries(updateData).filter(([_, value]) => value !== undefined && value !== null)
        );

        const course = await prisma.course.update({
            where: {id},
            data: filteredData,
            select: {
                id: true,
                title: true,
                description: true,
                category: true,
                isPublished: true,
                code: true,
                updatedAt: true,
                createdBy: {
                    select: {
                        fullName: true,
                        clerkId: true,
                    }
                },
                managedBy: {
                    select: {
                        fullName: true
                    }
                }
            }

        });

        res.status(200).json({message: "Course updated successfully", course});

    } catch (error) {
        console.log("Error in updateCourse controller", error);
        res.status(500).json({message: "Internal Server Error"});
    }
}



