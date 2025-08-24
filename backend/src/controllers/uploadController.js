import cloudinary from "../lib/cloudinary.js";

export const uploadImage = async (req, res) => {
    try {
        if(!req.file){
            return res.status(400).json({message: "No image uploaded"});
        }

        const {previousPublicId} = req.body;

        if(previousPublicId){
            try {
                await cloudinary.uploader.destroy(previousPublicId);
                console.log(`Previous image deleted: ${previousPublicId}`);
            } catch (deleteError) {
                console.log('Error in deleting previous image', deleteError);
            }
        }


        const uploadResult = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    folder: 'course-thumbnails',
                    resource_type: 'image',
                    transformation: [
                        {
                            width: 500,
                            height: 300,
                            crop: 'fill'
                        }
                    ]
                },
                (error, result) => {
                    if(error) reject(error);
                    else resolve(result);
                }
            );

            uploadStream.end(req.file.buffer);
        });

        res.status(200).json({
            message: "Image uploaded successfully",
            imageUrl: uploadResult.secure_url,
            publicId: uploadResult.public_id
        })

    } catch (error) {
        console.log("Error uploading image:", error);
        res.status(500).json({ message: "Error uploading image" });
    }
}