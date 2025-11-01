import { useEffect, useState } from "react";
import { useGetCourse, useUpdateCourse } from "../../hooks/courses/useCourses"
import { useNavigate, useParams } from "react-router-dom";
import { useUploadImage } from "../../hooks/courseThumbnails/useUploadImage";
import { useDeleteImage } from "../../hooks/courseThumbnails/useDeleteImage";
import { useGetFacultyId } from "../../hooks/analytics/adminAnalytics/useGetFaculty";
import { ArrowLeft, Upload, X, Check, Search, User, Image as ImageIcon, Edit } from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useUser } from "@clerk/clerk-react";

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
    const { user } = useUser();

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        college: "",
        thumbnail: "",
        facultyId: "",
        assignSelfAsInstructor: false
    });

    const [thumbnailPreview, setThumbnailPreview] = useState("");
    const [thumbnailPublicId, setThumbnailPublicId] = useState("");
    const [newImageSelected, setNewImageSelected] = useState(false);
    const [facultySearch, setFacultySearch] = useState("");
    const [showInstructorList, setShowInstructorList] = useState(false);
    const [isDragOver, setIsDragOver] = useState(false);
    const [instructorChanged, setInstructorChanged] = useState(false); // Add this state to track changes

    useEffect(() => {
        if(data?.course) {
            setFormData({
                title: data.course.title || "",
                description: data.course.description || "",
                college: data.course.college || "",
                thumbnail: data.course.thumbnail || "",
                facultyId: data.course.managedBy?.id || "",
                assignSelfAsInstructor: false
            });

            setThumbnailPreview(data.course.thumbnail || "");

            if(data.course.thumbnail){
                const publicId = extractPublicIdFromUrl(data.course.thumbnail);
                setThumbnailPublicId(publicId);
            }
            
            // Reset instructor changed flag when loading course data
            setInstructorChanged(false);
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
        setInstructorChanged(true); // Mark that instructor was changed
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if(isUploading) {
            console.log('Please wait for image upload to complete');
            return;
        }

        // Build update data
        const updateData = {
            title: formData.title,
            description: formData.description,
            college: formData.college,
            thumbnail: formData.thumbnail,
        };

        // Only include facultyId if instructor was changed or self-assignment was toggled
        if (formData.assignSelfAsInstructor) {
            updateData.assignSelfAsInstructor = true;
            updateData.facultyId = ""; // Backend will use current user's ID
        } else if (instructorChanged) {
            updateData.facultyId = formData.facultyId;
        }
        // If instructor wasn't changed, don't include facultyId in update

        updateCourse({id, courseData: updateData}, {
            onSuccess: () => {
                navigate('/admin/courses');
            }
        });
    };

    // Include the current category in the options if not already present

    if(isLoading) return (
        <div className="space-y-4 sm:space-y-6 p-4 sm:p-6">
            {/* Header Skeleton */}
            <div className="flex items-center gap-3 mb-2">
                <Skeleton className="h-10 w-10 rounded-lg" />
                <Skeleton className="h-6 w-32" />
            </div>
            <Skeleton className="h-4 w-64" />

            {/* Form Container Skeleton */}
            <div className="space-y-4 sm:space-y-6 p-4 sm:p-6">
                <div className="p-4 sm:p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Left Column Skeleton */}
                        <div className="space-y-6">
                            {/* Course Title Skeleton */}
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-20" />
                                <Skeleton className="h-10 w-full" />
                            </div>

                            {/* Category Skeleton */}
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-16" />
                                <Skeleton className="h-10 w-full" />
                            </div>

                            {/* Description Skeleton */}
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-32 w-full" />
                            </div>
                        </div>

                        {/* Right Column Skeleton */}
                        <div className="space-y-6">
                            {/* Thumbnail Skeleton */}
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-28" />
                                <Skeleton className="h-36 w-full rounded-lg" />
                            </div>

                            {/* Instructor Selection Skeleton */}
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-32" />
                                <div className="space-y-3">
                                    <Skeleton className="h-4 w-48" />
                                    <Skeleton className="h-10 w-full" />
                                    <Skeleton className="h-10 w-24" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Form Actions Skeleton */}
                    <div className="flex items-center justify-end gap-4 pt-8 border-t border-border mt-8">
                        <Skeleton className="h-10 w-20" />
                        <Skeleton className="h-10 w-28" />
                    </div>
                </div>
            </div>
        </div>
    );
    
    if(error) return (
        <div className="text-red-600 text-center p-4 bg-destructive rounded-lg">
            Error loading course: {error.message}
        </div>
    );

    return (
        <div className="space-y-4 sm:space-y-6 px-0">
            {/* Header */}
            <div className="flex items-center gap-3 mb-2">
                <button 
                    onClick={() => navigate('/admin/courses')}
                    className="p-2 text-foreground/60 hover:text-foreground hover:bg-accent rounded-lg transition-colors"
                >
                    <ArrowLeft className="h-5 w-5" />
                </button>
                <h1 className="text-xl font-bold text-foreground">Edit Course</h1>
            </div>
            <p className="text-foreground/80">Update course information and settings</p>

            {/* Form Container */}
            <div className="space-y-4 sm:space-y-6 px-0 sm:px-6">
                <form onSubmit={handleSubmit} className="p-4 sm:p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Left Column */}
                        <div className="space-y-6">
                            {/* Course Title */}
                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-foreground">
                                    Course Title *
                                </label>
                                <Input
                                    placeholder="Enter course title"
                                    value={formData.title}
                                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                                    required
                                />
                            </div>

                            {/* College */}
                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-foreground">
                                    College *
                                </label>
                                <Select
                                    key={formData.college} // Add key to force re-render
                                    value={formData.college}
                                    onValueChange={(value) => setFormData({...formData, college: value})}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a college" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {categories.map((cat) => (
                                            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Description */}
                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-foreground">
                                    Description
                                </label>
                                <Textarea
                                    placeholder="Enter course description"
                                    rows={6}
                                    value={formData.description}
                                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                                    className="resize-none h-32"
                                />
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
                                        <label 
                                            className={`flex flex-col items-center justify-center w-full h-36 border-2 border-dashed rounded-lg cursor-pointer bg-accent hover:bg-accent/70 transition-colors ${
                                                isDragOver ? "border-primary bg-primary/5" : "border-border"
                                            }`}
                                            onDragOver={(e) => {
                                                e.preventDefault();
                                                setIsDragOver(true);
                                            }}
                                            onDragLeave={(e) => {
                                                e.preventDefault();
                                                setIsDragOver(false);
                                            }}
                                            onDrop={(e) => {
                                                e.preventDefault();
                                                setIsDragOver(false);
                                                const file = e.dataTransfer.files[0];
                                                if (file) {
                                                    handleImageUpload({ target: { files: [file] } });
                                                }
                                            }}
                                        >
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
                                                className="w-full h-36 object-contain rounded-lg border border-border"
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
                                
                                {/* Self-Assign Checkbox */}
                                <div className="flex items-center space-x-2 mb-3">
                                    <Checkbox
                                        id="assignSelf"
                                        checked={formData.assignSelfAsInstructor}
                                        onCheckedChange={(checked) => {
                                            setFormData(prev => ({
                                                ...prev,
                                                assignSelfAsInstructor: checked,
                                                facultyId: checked ? "" : prev.facultyId
                                            }));
                                        }}
                                        className="border-2"
                                    />
                                    <label htmlFor="assignSelf" className="text-sm text-foreground cursor-pointer">
                                        Assign myself as instructor
                                    </label>
                                </div>

                                <div className="relative">
                                    <div className="flex items-center gap-2">
                                        <div className="flex-1 relative">
                                            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-foreground/60" />
                                            <Input
                                                className="pl-10 pr-4 py-3 border border-border rounded-lg bg-accent text-foreground focus:ring-2 focus:ring-input focus:border-transparent focus:outline-none transition-all duration-200"
                                                value={
                                                    formData.assignSelfAsInstructor 
                                                        ? user?.fullName || "You (Admin)" 
                                                        : (filteredFaculty.find(f => f.id === formData.facultyId)?.fullName || data?.course?.managedBy?.fullName || "")
                                                }
                                                readOnly
                                                placeholder="No instructor assigned"
                                                disabled={formData.assignSelfAsInstructor}
                                            />
                                        </div>
                                        
                                        <Dialog open={showInstructorList} onOpenChange={setShowInstructorList}>
                                            <DialogTrigger asChild>
                                                <Button
                                                    type="button"
                                                    className="flex items-center gap-2"
                                                    disabled={formData.assignSelfAsInstructor}
                                                >
                                                    <Edit className="h-4 w-4" />
                                                    {formData.facultyId ? "Change" : "Assign"}
                                                </Button>
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
                                                            <div className="space-y-2 py-2">
                                                                {[...Array(5)].map((_, index) => (
                                                                    <div key={index} className="flex items-center gap-3 px-3 py-3">
                                                                        <Skeleton className="h-10 w-10 rounded-full" />
                                                                        <div className="flex-1 space-y-2">
                                                                            <Skeleton className="h-4 w-[60%]" />
                                                                            <Skeleton className="h-3 w-[40%]" />
                                                                        </div>
                                                                    </div>
                                                                ))}

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
                    <div className="flex items-center justify-end gap-4 border-t border-border mt-8">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => navigate('/admin/courses')}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
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
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default EditCourse