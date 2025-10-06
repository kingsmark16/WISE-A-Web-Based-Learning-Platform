import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGetFacultyId } from "../../../hooks/analytics/adminAnalytics/useGetFaculty";
import { useCreateCourse } from "../../../hooks/courses/useCourses";
import { useUploadImage } from "../../../hooks/courseThumbnails/useUploadImage";
import { useDeleteImage } from "../../../hooks/courseThumbnails/useDeleteImage";
import { X, Check, Search, User, Image as ImageIcon } from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
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

const CreateCourse = () => {
  const navigate = useNavigate();
  const { user } = useUser();

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [faculty, setFaculty] = useState("");

  const [thumbnailPublicId, setThumbnailPublicId] = useState("");
  const [thumbnailPreview, setThumbnailPreview] = useState("");

  const [facultySearch, setFacultySearch] = useState("");
  const [showInstructorList, setShowInstructorList] = useState(false);

  const [errors, setErrors] = useState({ title: "", category: "" });
  const [assignSelfAsInstructor, setAssignSelfAsInstructor] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

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

    // Clear previous errors
    setErrors({ title: "", category: "" });

    // Validation based on backend: title and category are required
    if (!title.trim()) {
      setErrors(prev => ({ ...prev, title: "Please provide a title" }));
      return;
    }
    if (!category) {
      setErrors(prev => ({ ...prev, category: "Please provide a category" }));
      return;
    }

    createCourse({
      title,
      category,
      description,
      thumbnail: thumbnailUrl,
      ...(faculty && { facultyId: faculty }),
      assignSelfAsInstructor
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
    <div className="space-y-4 sm:space-y-6 px-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Create New Course
          </h1>
          <p className="text-muted-foreground mt-1">
            Fill in the details below to create a new course
          </p>
        </div>
      </div>

      {/* Form Container */}
      <div>
        <form onSubmit={handleSubmit} className="p-4 sm:p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Course Title */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-foreground">
                  Course Title *
                </label>
                {errors.title && <p className="text-destructive text-sm">{errors.title}</p>}
                <Input
                  type="text"
                  className="px-4 py-3 bg-accent border rounded-lg focus:ring-2 focus:ring-input focus:border-transparent focus:outline-none text-foreground"
                  placeholder="Enter course title"
                  value={title}
                  onChange={e => {
                    setTitle(e.target.value);
                    setErrors(prev => ({ ...prev, title: "" }));
                  }}
                />
              </div>

              {/* Category */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-foreground">
                  Category *
                </label>
                {errors.category && <p className="text-destructive text-sm">{errors.category}</p>}
                <Select 
                  value={category} 
                  onValueChange={(value) => {
                    setCategory(value);
                    setErrors(prev => ({ ...prev, category: "" }));
                  }}
                >
                  <SelectTrigger className="w-full px-4 py-3 text-foreground bg-accent rounded-lg border focus:ring-2 focus:ring-input focus:border-transparent focus:outline-none">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-foreground">
                  Description <span className="italic font-light">(Optional)</span>
                </label>
                <Textarea
                  className="px-4 py-3 h-32 bg-accent border rounded-lg focus:ring-2 focus:ring-input focus:border-transparent focus:outline-none transition-all duration-200 text-foreground resize-none"
                  placeholder="Enter course description"
                  rows={6}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  
                />
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Thumbnail Upload */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-foreground">
                  Course Thumbnail <span className="italic font-light">(Optional)</span>
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
                  Instructor <span className="italic font-light">(Optional)</span>
                </label>
                
                {/* Self-Assign Checkbox */}
                <div className="flex items-center space-x-2 mb-3">
                  <Checkbox
                    id="assignSelf"
                    checked={assignSelfAsInstructor}
                    onCheckedChange={(checked) => {
                      setAssignSelfAsInstructor(checked);
                      if (checked) {
                        setFaculty("");
                      }
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
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-foreground" />
                      <Input
                        className="pl-10 pr-4 py-3 border border-border rounded-lg bg-accent text-foreground focus:ring-2 focus:ring-input focus:border-transparent focus:outline-none transition-all duration-200"
                        value={
                          assignSelfAsInstructor 
                            ? user?.fullName || "You (Admin)" 
                            : faculty 
                              ? filteredFaculty.find(f => f.id === faculty)?.fullName || "" 
                              : ""
                        }
                        readOnly
                        placeholder="No instructor selected"
                        disabled={assignSelfAsInstructor}
                      />
                    </div>
                    
                    <Dialog open={showInstructorList} onOpenChange={setShowInstructorList}>
                      <DialogTrigger asChild>
                        <Button 
                          className="flex items-center gap-2 shadow-lg hover:shadow-xl transition-shadow"
                          disabled={assignSelfAsInstructor}
                        >
                          Select
                        </Button>
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
                            <Input
                              placeholder="Search instructors..."
                              value={facultySearch}
                              onChange={e => setFacultySearch(e.target.value)}
                              className="pl-10 pr-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-input focus:border-transparent focus:outline-none bg-background text-foreground"
                            />
                          </div>

                          <div className="max-h-64 overflow-y-auto space-y-1">
                            {isLoading ? (
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
            <Button 
              type="button"
              variant="outline" 
              onClick={() => navigate('/admin/courses')}
              className="border-2 hover:bg-destructive/10 hover:text-destructive hover:border-destructive transition-colors"
            >
              <X className="mr-2 h-4 w-4" />
              Cancel
            </Button>
            <Button 
              type="submit"
              className="flex items-center gap-2 shadow-lg hover:shadow-xl transition-shadow"
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
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateCourse;