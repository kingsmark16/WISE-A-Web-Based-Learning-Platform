import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGetFacultyId } from "../../../hooks/analytics/adminAnalytics/useGetFaculty";
import { useCreateCourse } from "../../../hooks/courses/useCourses";
import { useUploadImage } from "../../../hooks/uploads/useUploadImage";
import { useDeleteImage } from "../../../hooks/uploads/useDeleteImage";
import { X, Check, Search, User, Image as ImageIcon } from "lucide-react";
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

const CreateCourse = () => {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [faculty, setFaculty] = useState("");

  const [thumbnailPublicId, setThumbnailPublicId] = useState("");
  const [thumbnailPreview, setThumbnailPreview] = useState("");

  const [facultySearch, setFacultySearch] = useState("");
  const [showInstructorList, setShowInstructorList] = useState(false);

  const { data: facultyList = [], isLoading, error } = useGetFacultyId();
  const {mutate: createCourse, isPending: isCreating, error: createCourseError} = useCreateCourse();
  const {mutate: uploadImage, isPending: isUploading, error: uploadError} = useUploadImage();
  const {mutate: deleteImage, isPending: isDeleting} = useDeleteImage();

  const filteredFaculty = (facultyList.faculty || []).filter(f =>
    f.fullName.toLowerCase().includes(facultySearch.toLowerCase())
  );

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if(file){
      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnailPreview(reader.result);
      };
      reader.readAsDataURL(file);

      uploadImage({
        file, 
        previousPublicId: thumbnailPublicId
      },{
        onSuccess: (data) => {
          setThumbnailUrl(data.imageUrl);
          setThumbnailPublicId(data.publicId);
          console.log('Image uploaded successfully');
        },
        onError: (error) => {
          console.error('Upload failed', error);
          setThumbnailPreview("");
        }
      });
    }
  };

  const handleImageDelete = () => {
    if (thumbnailPublicId) {
      deleteImage({ publicId: thumbnailPublicId }, {
        onSuccess: () => {
          setThumbnailPreview("");
          setThumbnailUrl("");
          setThumbnailPublicId("");
          console.log('Image deleted successfully');
        },
        onError: (error) => {
          console.error('Delete failed', error);
          setThumbnailPreview("");
          setThumbnailUrl("");
          setThumbnailPublicId("");
        }
      });
    } else {
      setThumbnailPreview("");
      setThumbnailUrl("");
      setThumbnailPublicId("");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if(!thumbnailUrl){
      console.log('Please wait for image upload to complete or select an image');
      return;
    }

    createCourse({
      title,
      category,
      description,
      thumbnail: thumbnailUrl,
      facultyId: faculty
    }, {
      onSuccess: () => {
        navigate('/admin/courses');
      }
    });
  }

  const handleInstructorSelect = (instructorId) => {
    setFaculty(instructorId);
    setShowInstructorList(false);
    setFacultySearch("");
  };

  return (
    <div className="bg-background mt-8 px-2">
     
        {/* Header */}
        <div className="mb-5">
          <h1 className="text-xl font-bold text-foreground">Create New Course</h1>
          <p className="text-foreground/80 mt-2">Fill in the details below to create a new course</p>
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
                    className="w-full px-4 py-3 bg-accent border rounded-lg focus:ring-2 focus:ring-input focus:border-transparent focus:outline-none text-foreground"
                    placeholder="Enter course title"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    required
                  />
                </div>

                {/* Category */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-foreground">
                    Category *
                  </label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    required
                    className="w-full px-4 py-3 text-foreground bg-accent rounded-lg border focus:ring-2 focus:ring-input focus:border-transparent focus:outline-none"
                  >
                    <option value="">Select a category</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-foreground">
                    Description * <span className="italic font-light">(Optional)</span>
                  </label>
                  <textarea
                    className="w-full px-4 py-3 bg-accent border rounded-lg focus:ring-2 focus:ring-input focus:border-transparent focus:outline-none transition-all duration-200 text-foreground resize-none"
                    placeholder="Enter course description"
                    rows={6}
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                {/* Thumbnail Upload */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-foreground">
                    Course Thumbnail * <span className="italic font-light">(Optional)</span>
                  </label>
                  <div className="relative">
                    {!thumbnailPreview ? (
                      <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-border border-dashed rounded-lg cursor-pointer bg-accent transition-colors">
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
                          className="absolute top-2 right-2 p-1 bg-red-500 text-foreground rounded-full hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isDeleting ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-border"></div>
                          ) : (
                            <X className="h-4 w-4" />
                          )}
                        </button>
                        {thumbnailUrl && !isDeleting && (
                          <div className="absolute bottom-2 left-2">
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-500 text-foreground text-xs rounded-full">
                              <Check className="h-3 w-3" />
                              Uploaded
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
                    Instructor
                  </label>
                  <div className="relative">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-foreground" />
                        <input
                          type="text"
                          className="w-full pl-10 pr-4 py-3 border border-border rounded-lg bg-accent text-foreground focus:ring-2 focus:ring-input focus:border-transparent focus:outline-none transition-all duration-200"
                          value={faculty ? filteredFaculty.find(f => f.id === faculty)?.fullName || "" : ""}
                          readOnly
                          placeholder="No instructor selected"
                        />
                      </div>
                      
                      <Dialog open={showInstructorList} onOpenChange={setShowInstructorList}>
                        <DialogTrigger asChild>
                          <button
                            type="button"
                            className="px-5 py-2 bg-primary text-foreground rounded-lg hover:bg-primary/70 transition-colors font-medium"
                          >
                            Select
                          </button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md">
                          <DialogHeader>
                            <DialogTitle>Select Instructor</DialogTitle>
                            <DialogDescription>
                              Choose an instructor to assign to this course
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
                              {isLoading ? (
                                <div className="text-center py-8">
                                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
                                  <p className="text-sm text-muted-foreground mt-2">Loading instructors...</p>
                                </div>
                              ) : error ? (
                                <div className="text-destructive text-center py-8">
                                  <p>Error loading faculty</p>
                                </div>
                              ) : filteredFaculty.length === 0 ? (
                                <div className="text-muted-foreground text-center py-8">
                                  <p>No matching instructors found</p>
                                </div>
                              ) : (
                                filteredFaculty.map(fac => (
                                  <div
                                    key={fac.id}
                                    className={`cursor-pointer px-3 py-3 rounded-lg hover:bg-accent transition-colors ${
                                      faculty === fac.id ? "bg-accent border border-primary" : ""
                                    }`}
                                    onClick={() => handleInstructorSelect(fac.id)}
                                  >
                                    <div className="font-medium text-foreground">{fac.fullName}</div>
                                  </div>
                                ))
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

            {/* Error Display */}
            {createCourseError && (
              <div className="mt-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                <p className="text-destructive text-sm">{createCourseError.message}</p>
              </div>
            )}

            {/* Form Actions */}
            <div className="flex items-center justify-end gap-4 pt-6">
              <button
                type="button"
                onClick={() => navigate('/admin/courses')}
                className="px-6 py-2 border border-border text-foreground rounded-lg hover:bg-accent transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-primary text-foreground rounded-lg hover:bg-primary/70 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center gap-2"
                disabled={isCreating || isUploading || isDeleting}
              >
                {isCreating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground"></div>
                    Creating...
                  </>
                ) : (
                  "Create Course"
                )}
              </button>
            </div>
          </form>
        </div>
    </div>
  );
};

export default CreateCourse;