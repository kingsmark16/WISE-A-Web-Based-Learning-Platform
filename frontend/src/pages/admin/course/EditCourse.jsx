import { useEffect, useState } from "react";
import { useGetCourse, useUpdateCourse } from "../../../hooks/useCourses"
import { useNavigate, useParams } from "react-router-dom";


const categories = [
  "Technology Programming",
  "Business Entrepreneurship",
  "Creative Art & Design",
  "Health and Wellness",
  "Education Teaching",
  "Personal Development",
  "Science Engineering",
  "Mathematics",
  "Social Sciences Humanities",
  "Career Professional Development",
  "Finance Economics",
  "Law Politics Society"
];

const EditCourse = () => {

    const {id} = useParams();
    const navigate = useNavigate();
    const {data, isLoading, error} = useGetCourse(id);
    const {mutate: updateCourse, isPending} = useUpdateCourse();

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        category: "",
        thumbnail: "",
        isPublished: false
    })

    useEffect(() => {
        if(data?.course) {
            setFormData({
                title: data.course.title || "",
                description: data.course.description || "",
                category: data.course.category || "",
                thumbnail: data.course.thumbnail || "",
                isPublished: data.course.isPublished || false
            })
        }
    }, [data]);


    const handleSubmit = (e) => {
        e.preventDefault();

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
                    type="url" 
                    className=""
                    value={formData.thumbnail}
                    onChange={(e) => setFormData({...formData, thumbnail: e.target.value})}
                />
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
                        disabled={isPending}
                    >
                        {isPending ? "Updating..." : "Update Course"}
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