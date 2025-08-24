import { useEffect, useState } from "react";
import { useGetCourse, useUpdateCourse } from "../../../hooks/useCourses"
import { useNavigate, useParams } from "react-router-dom";
import { useUploadImage } from "../../../hooks/uploads/useUploadImage";


const categories = [
  "Technology",
  "Business",
  "Design",
  "Health",
  "Education",
  "Science",
  "Engineering",
  "Mathematics",
  "Humanities",
  "Management",
  "Environment",
  "Law",
  "Research",
  "Communication",
  "Culture"
];

const EditCourse = () => {

    const {id} = useParams();
    const navigate = useNavigate();
    const {data, isLoading, error} = useGetCourse(id);
    const {mutate: updateCourse, isPending: isUpdating} = useUpdateCourse();
    const {mutate: uploadImage, isPending: isUploading, error: uploadError} = useUploadImage();

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        category: "",
        thumbnail: "",
        isPublished: false
    });

    const [thumbnailPreview, setThumbnailPreview] = useState("");
    const [thumbnailPublicId, setThumbnailPublicId] = useState("");
    const [newImageSelected, setNewImageSelected] = useState(false);

    useEffect(() => {
        if(data?.course) {
            setFormData({
                title: data.course.title || "",
                description: data.course.description || "",
                category: data.course.category || "",
                thumbnail: data.course.thumbnail || "",
                isPublished: data.course.isPublished || false
            });

            setThumbnailPreview(data.course.thumbnail || "");

            if(data.course.thumbnail){
                const publicId = extractPublicIdFromUrl(data.course.thumbnail);
                setThumbnailPublicId(publicId);
            }
        }
    }, [data]);


    const extractPublicIdFromUrl = (url) => {
        if(!url) return "";
        try {
            const parts = url.split('/');
            const filename = parts[parts.length - 1];
            const publicId = filename.split('.')[0];

            return `course-thumbnails/${publicId}`;
        } catch (error) {
            console.log("Error extracting public ID:", error);
            return "";
        }
    }

    const handleImageUpload = (e) => {
        const file = e.target.files?.[0];
        if(file){
            const reader = new FileReader();
            reader.onloadend = () => {
                setThumbnailPreview(reader.result);
            };
            reader.readAsDataURL(file);
            setNewImageSelected(true);

            uploadImage({
                file,
                previousPublicId: thumbnailPublicId
            }, {
                onSuccess: (data) => {
                    setFormData(prev => ({...prev, thumbnail: data.imageUrl}));
                    setThumbnailPublicId(data.publicId);
                    setNewImageSelected(false);
                    console.log('Image uploaded successfully');
                },
                onError: (error) => {
                    console.error('Upload failed', error);
                    setThumbnailPreview(formData.thumbnail);
                    setNewImageSelected(false);
                }
            })
        }
    }

    const handleSubmit = (e) => {
        e.preventDefault();

        if(isUploading) {
            console.log('Please wait for image upload to complete');
            return;
        }

        updateCourse({id, courseData: formData});
    }


    if(isLoading) return <div>Loading...</div>
    if(error) return <div>Error loading course: {error.message}</div>

  return (
    <div>
        <h2>Edit Course</h2>
        <form onSubmit={handleSubmit}>
            <div>
                <label htmlFor="">Course Title</label>
                <input 
                    type="text" 
                    className=""
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    required
                />
            </div>
            <div>
                <label htmlFor="">Description</label>
                <textarea
                    className=""
                    rows="4"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                />
            </div>
            <div>
                <label htmlFor="">Category</label>
                <select 
                    className=""
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                >
                    <option value={formData.category}>{formData.category}</option>
                    {categories.filter((cat) => cat !== formData.category).map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                    ))}
                </select>
            </div>
            <div>
                <label htmlFor="">Thumbnail</label>
                <input 
                    type="file"
                    accept="image/*" 
                    className=""
                    onChange={handleImageUpload}
                    disabled={isUploading}
                />

                {isUploading && (
                    <div className="mt-2 flex items-center text-blue-600">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                        Uploading image...
                    </div>
                )}
                {uploadError && (
                    <div className="mt-2 text-red-600 text-sm">
                        Upload Failed: {uploadError.message}
                    </div>
                )}
                {thumbnailPreview && (
                    <div className="mt-2">
                        <img 
                            src={thumbnailPreview}
                            alt="Thumbnail preview"
                            className="w-32 h-20 object-cover rounded border"
                        />
                        {!newImageSelected && !isUploading && formData.thumbnail && (
                            <div className="text-green-600 text-sm mt-1">
                                ✓ Current thumbnail
                            </div>
                        )}
                    </div>
                )}
            </div>
            <div>
                <label htmlFor="">
                    <input 
                        type="checkbox" 
                        checked={formData.isPublished}
                        onChange={(e) => setFormData({...formData, isPublished: e.target.checked})}
                    />
                    <span>Published</span>
                </label>
            </div>
            <div className="flex gap-4">
                    <button 
                        type="submit" 
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                        disabled={isUpdating || isUploading}
                    >
                        {isUpdating ? "Updating..." : "Update Course"}
                    </button>
                    <button 
                        type="button"
                        className="px-4 py-2 border rounded hover:bg-gray-50"
                        onClick={() => navigate("/admin/courses")}
                    >
                        Cancel
                    </button>
            </div>
        </form>
    </div>
  )
}

export default EditCourse