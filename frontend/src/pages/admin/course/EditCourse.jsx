import { useEffect, useState } from "react";
import { useGetCourse, useUpdateCourse } from "../../../hooks/courses/useCourses"
import { useNavigate, useParams } from "react-router-dom";
import { useUploadImage } from "../../../hooks/uploads/useUploadImage";
import { useDeleteImage } from "../../../hooks/uploads/useDeleteImage";
import { useGetFacultyId } from "../../../hooks/analytics/adminAnalytics/useGetFaculty";
import { ArrowLeft, Upload, X, Check, Search, User, Image as ImageIcon, Edit } from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";

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
    const {mutate: deleteImage, isPending: isDeleting} = useDeleteImage();
    const { data: facultyList = [], isLoading: facultyLoading, error: facultyError } = useGetFacultyId();

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        category: "",
        thumbnail: "",
        isPublished: false,
        facultyId: ""
    });

    const [thumbnailPreview, setThumbnailPreview] = useState("");
    const [thumbnailPublicId, setThumbnailPublicId] = useState("");
    const [newImageSelected, setNewImageSelected] = useState(false);
    const [facultySearch, setFacultySearch] = useState("");
    const [showInstructorList, setShowInstructorList] = useState(false);

    useEffect(() => {
        if(data?.course) {
            setFormData({
                title: data.course.title || "",
                description: data.course.description || "",
                category: data.course.category || "",
                thumbnail: data.course.thumbnail || "",
                isPublished: data.course.isPublished || false,
                facultyId: data.course.managedBy?.id || ""
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

    const filteredFaculty = (facultyList.faculty || []).filter(f =>
        f.fullName.toLowerCase().includes(facultySearch.toLowerCase())
    );

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

    const handleImageDelete = () => {
        if (thumbnailPublicId) {
            deleteImage({ publicId: thumbnailPublicId }, {
                onSuccess: () => {
                    setThumbnailPreview("");
                    setFormData(prev => ({...prev, thumbnail: ""}));
                    setThumbnailPublicId("");
                    console.log('Image deleted successfully');
                },
                onError: (error) => {
                    console.error('Delete failed', error);
                    setThumbnailPreview("");
                    setFormData(prev => ({...prev, thumbnail: ""}));
                    setThumbnailPublicId("");
                }
            });
        } else {
            setThumbnailPreview("");
            setFormData(prev => ({...prev, thumbnail: ""}));
            setThumbnailPublicId("");
        }
    };

    const handleInstructorSelect = (instructorId) => {
        setFormData(prev => ({...prev, facultyId: instructorId}));
        setShowInstructorList(false);
        setFacultySearch("");
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if(isUploading) {
            console.log('Please wait for image upload to complete');
            return;
        }

        updateCourse({id, courseData: formData}, {
            onSuccess: () => {
                navigate('/admin/courses');
            }
        });
    }

    if(isLoading) return (
        <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-border"></div>
        </div>
    );
    
    if(error) return (
        <div className="text-red-600 text-center p-4 bg-destructive rounded-lg">
            Error loading course: {error.message}
        </div>
    );

    return (
        <div className="bg-background mt-8 px-2">
            {/* Header */}
            <div className="mb-5">
                <div className="flex items-center gap-3 mb-2">
                    <button 
                        onClick={() => navigate('/admin/courses')}
                        className="p-2 text-foreground/60 hover:text-foreground hover:bg-accent rounded-lg transition-colors"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </button>
                    <h1 className="text-xl font-bold text-foreground">Edit Course</h1>
                </div>
                <p className="text-foreground/80 ml-12">Update course information and settings</p>
            </div>

            {/* Form Container */}
            <div className="bg-foreground/5 rounded-xl shadow-lg border overflow-hidden">
                <form onSubmit={handleSubmit} className="p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Left Column */}
                        <div className="space-y-6">
                            {/* Course Title */}
                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-foreground">
                                    Course Title *
                                </label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-3 bg-accent border rounded-lg focus:ring-2 focus:ring-input focus:border-transparent focus:outline-none text-foreground transition-all duration-200"
                                    placeholder="Enter course title"
                                    value={formData.title}
                                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                                    required
                                />
                            </div>

                            {/* Category */}
                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-foreground">
                                    Category *
                                </label>
                                <select
                                    className="w-full px-4 py-3 text-foreground bg-accent rounded-lg border focus:ring-2 focus:ring-input focus:border-transparent focus:outline-none transition-all duration-200"
                                    value={formData.category}
                                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                                    required
                                >
                                    <option value="">Select a category</option>
                                    {categories.map((cat) => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Description */}
                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-foreground">
                                    Description
                                </label>
                                <textarea
                                    className="w-full px-4 py-3 bg-accent border rounded-lg focus:ring-2 focus:ring-input focus:border-transparent focus:outline-none transition-all duration-200 text-foreground resize-none"
                                    placeholder="Enter course description"
                                    rows={6}
                                    value={formData.description}
                                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                                />
                            </div>

                            {/* Published Status */}
                            <div className="space-y-3">
                                <label className="block text-sm font-semibold text-foreground">
                                    Course Status
                                </label>
                                <div className="flex items-center space-x-3 p-3 bg-accent rounded-lg border">
                                    <input
                                        type="checkbox"
                                        id="isPublished"
                                        className="h-4 w-4 text-primary focus:ring-primary border-border rounded"
                                        checked={formData.isPublished}
                                        onChange={(e) => setFormData({...formData, isPublished: e.target.checked})}
                                    />
                                    <label htmlFor="isPublished" className="text-sm font-medium text-foreground cursor-pointer">
                                        Publish this course
                                    </label>
                                </div>
                                <p className="text-xs text-foreground/60">
                                    {formData.isPublished ? "This course is visible to students" : "This course is hidden from students"}
                                </p>
                            </div>
                        </div>

                        {/* Right Column */}
                        <div className="space-y-6">
                            {/* Thumbnail Upload */}
                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-foreground">
                                    Course Thumbnail
                                </label>
                                <div className="relative">
                                    {!thumbnailPreview ? (
                                        <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-border border-dashed rounded-lg cursor-pointer bg-accent hover:bg-accent/70 transition-colors">
                                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                <ImageIcon className="w-8 h-8 mb-4 text-foreground/70" />
                                                <p className="mb-2 text-sm text-foreground/50">
                                                    <span className="font-semibold">Click to upload</span> or drag and drop
                                                </p>
                                                <p className="text-xs text-foreground/50">PNG, JPG or JPEG (MAX. 5MB)</p>
                                            </div>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                onChange={handleImageUpload}
                                                disabled={isUploading}
                                            />
                                        </label>
                                    ) : (
                                        <div className="relative">
                                            <img 
                                                src={thumbnailPreview}
                                                alt="Thumbnail preview"
                                                className="w-full h-48 object-cover rounded-lg border border-border"
                                            />
                                            <button
                                                type="button"
                                                onClick={handleImageDelete}
                                                disabled={isDeleting}
                                                className="absolute top-2 right-2 p-1 bg-destructive text-foreground rounded-full hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {isDeleting ? (
                                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-border"></div>
                                                ) : (
                                                    <X className="h-4 w-4" />
                                                )}
                                            </button>
                                            {formData.thumbnail && !newImageSelected && !isUploading && (
                                                <div className="absolute bottom-2 left-2">
                                                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-500 text-foreground text-xs rounded-full">
                                                        <Check className="h-3 w-3" />
                                                        Current
                                                    </span>
                                                </div>
                                            )}
                                            {formData.thumbnail && !isDeleting && newImageSelected && (
                                                <div className="absolute bottom-2 left-2">
                                                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary text-foreground text-xs rounded-full">
                                                        <Check className="h-3 w-3" />
                                                        Updated
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                                {isUploading && (
                                    <div className="flex items-center gap-2 text-primary">
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                                        <span className="text-sm">Uploading image...</span>
                                    </div>
                                )}
                                {isDeleting && (
                                    <div className="flex items-center gap-2 text-destructive">
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-destructive"></div>
                                        <span className="text-sm">Removing image...</span>
                                    </div>
                                )}
                                {uploadError && (
                                    <p className="text-destructive text-sm">Upload failed: {uploadError.message}</p>
                                )}
                            </div>

                            {/* Instructor Selection */}
                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-foreground">
                                    Course Instructor
                                </label>
                                <div className="relative">
                                    <div className="flex items-center gap-2">
                                        <div className="flex-1 relative">
                                            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-foreground/60" />
                                            <input
                                                type="text"
                                                className="w-full pl-10 pr-4 py-3 border border-border rounded-lg bg-accent text-foreground focus:ring-2 focus:ring-input focus:border-transparent focus:outline-none transition-all duration-200"
                                                value={formData.facultyId ? filteredFaculty.find(f => f.id === formData.facultyId)?.fullName : data?.course?.managedBy?.fullName}
                                                readOnly
                                                placeholder="No instructor assigned"
                                            />
                                        </div>
                                        
                                        <Dialog open={showInstructorList} onOpenChange={setShowInstructorList}>
                                            <DialogTrigger asChild>
                                                <button
                                                    type="button"
                                                    className="px-4 py-2 bg-primary text-foreground rounded-lg hover:bg-primary/60 transition-colors font-medium flex items-center gap-2"
                                                >
                                                    <Edit className="h-4 w-4" />
                                                    {formData.facultyId ? "Change" : "Assign"}
                                                </button>
                                            </DialogTrigger>
                                            <DialogContent className="max-w-md">
                                                <DialogHeader>
                                                    <DialogTitle>
                                                        {formData.facultyId ? "Change Instructor" : "Assign Instructor"}
                                                    </DialogTitle>
                                                    <DialogDescription>
                                                        Select an instructor to assign to this course
                                                    </DialogDescription>
                                                </DialogHeader>
                                                
                                                <div className="space-y-4">
                                                    <div className="relative">
                                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                        <input
                                                            type="text"
                                                            placeholder="Search instructors..."
                                                            value={facultySearch}
                                                            onChange={e => setFacultySearch(e.target.value)}
                                                            className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-input focus:border-transparent focus:outline-none bg-background text-foreground"
                                                        />
                                                    </div>

                                                    <div className="max-h-64 overflow-y-auto space-y-1">
                                                        {facultyLoading ? (
                                                            <div className="text-center py-8">
                                                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
                                                                <p className="text-sm text-muted-foreground mt-2">Loading instructors...</p>
                                                            </div>
                                                        ) : facultyError ? (
                                                            <div className="text-destructive text-center py-8">
                                                                <p>Error loading faculty</p>
                                                            </div>
                                                        ) : filteredFaculty.length === 0 ? (
                                                            <div className="text-muted-foreground text-center py-8">
                                                                <p>No matching instructors found</p>
                                                            </div>
                                                        ) : (
                                                            <>
                                                                {formData.facultyId && (
                                                                    <div
                                                                        className="cursor-pointer px-3 py-3 rounded-lg hover:bg-accent transition-colors border"
                                                                        onClick={() => handleInstructorSelect("")}
                                                                    >
                                                                        <div className="font-medium text-red-600">Remove current instructor</div>
                                                                    </div>
                                                                )}
                                                                {filteredFaculty.map(fac => (
                                                                    <div
                                                                        key={fac.id}
                                                                        className={`cursor-pointer px-3 py-3 rounded-lg hover:bg-accent transition-colors ${
                                                                            formData.facultyId === fac.id ? "bg-accent border border-primary" : ""
                                                                        }`}
                                                                        onClick={() => handleInstructorSelect(fac.id)}
                                                                    >
                                                                        <div className="font-medium text-foreground">{fac.fullName}</div>
                                                                        {formData.facultyId === fac.id && (
                                                                            <div className="text-xs text-primary mt-1">Currently assigned</div>
                                                                        )}
                                                                    </div>
                                                                ))}
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            </DialogContent>
                                        </Dialog>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Form Actions */}
                    <div className="flex items-center justify-end gap-4 pt-8 border-t border-border mt-8">
                        <button
                            type="button"
                            onClick={() => navigate('/admin/courses')}
                            className="px-6 py-2 border border-border text-foreground rounded-lg hover:bg-accent transition-colors font-medium"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-2 bg-primary text-foreground rounded-lg hover:bg-primary/60 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center gap-2"
                            disabled={isUpdating || isUploading || isDeleting}
                        >
                            {isUpdating ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground"></div>
                                    Updating...
                                </>
                            ) : (
                                <>
                                    Update Course
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default EditCourse