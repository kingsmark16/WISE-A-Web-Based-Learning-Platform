import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCreateCourse } from "../../hooks/courses/useCourses";
import { useUploadImage } from "../../hooks/courseThumbnails/useUploadImage";
import { useDeleteImage } from "../../hooks/courseThumbnails/useDeleteImage";
import { X, Check, Image as ImageIcon } from "lucide-react";
import { toast } from "react-toastify";
import { useQueryClient } from "@tanstack/react-query";
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

const categories = [
  "College of Education",
  "College of Business and Management",
  "College of Engineering and Computational Sciences",
  "College of Arts and Humanities",
  "College of Science",
  "College of Sustainable Communities and Ecosystems",
  "College of Public Safety and Community Health",
  "College of Fisheries and Marine Science",
  "College of Agribusiness and Community Development",
  "College of Hospitality and Tourism Management",
  "College of Environmental Science and Design"
];

const CreateCourse = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [title, setTitle] = useState("");
  const [college, setCollege] = useState("");
  const [description, setDescription] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");

  const [thumbnailPublicId, setThumbnailPublicId] = useState("");
  const [thumbnailPreview, setThumbnailPreview] = useState("");

  const [errors, setErrors] = useState({ title: "", college: "" });
  const [isDragOver, setIsDragOver] = useState(false);

  const {mutate: createCourse, isPending: isCreating, error: createCourseError} = useCreateCourse();
  const {mutate: uploadImage, isPending: isUploading, error: uploadError} = useUploadImage();
  const {mutate: deleteImage, isPending: isDeleting} = useDeleteImage();

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
          toast.success('Thumbnail uploaded successfully');
          console.log('Image uploaded successfully');
        },
        onError: (error) => {
          console.error('Upload failed', error);
          toast.error('Failed to upload thumbnail');
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
    setErrors({ title: "", college: "" });

    // Validation based on backend: title and college are required
    if (!title.trim()) {
      setErrors(prev => ({ ...prev, title: "Please provide a title" }));
      return;
    }
    if (!college) {
      setErrors(prev => ({ ...prev, college: "Please provide a college" }));
      return;
    }

    createCourse({
      title,
      college,
      description,
      thumbnail: thumbnailUrl,
      assignAsInstructor: true
    }, {
      onSuccess: () => {
        // Clear draft courses cache completely
        queryClient.removeQueries({
          queryKey: ['draftCourses']
        });
        // Navigate to draft courses - fresh data will be fetched on mount
        navigate('/faculty/courses/draft');
      }
    });
  }

  return (
    <div className="space-y-4 sm:space-y-6 px-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6">
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
      <div className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column */}
            <div className="space-y-6 lg:col-span-2">
              {/* Course Title */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-foreground">
                  Course Title *
                </label>
                {errors.title && <p className="text-destructive text-sm">{errors.title}</p>}
                <Input
                  type="text"
                  className="px-4 py-3 bg-accent border rounded-lg focus:ring-2 focus:ring-input focus:border-transparent focus:outline-none transition-all duration-200 text-foreground"
                  placeholder="Enter course title"
                  value={title}
                  onChange={e => {
                    setTitle(e.target.value);
                    setErrors(prev => ({ ...prev, title: "" }));
                  }}
                />
              </div>

              {/* College */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-foreground">
                  College *
                </label>
                {errors.college && <p className="text-destructive text-sm">{errors.college}</p>}
                <Select 
                  value={college} 
                  onValueChange={(value) => {
                    setCollege(value);
                    setErrors(prev => ({ ...prev, college: "" }));
                  }}
                >
                  <SelectTrigger className="w-full px-4 py-3 text-foreground bg-accent rounded-lg border focus:ring-2 focus:ring-input focus:border-transparent focus:outline-none">
                    <SelectValue placeholder="Select a college" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(col => (
                      <SelectItem key={col} value={col}>{col}</SelectItem>
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
          </div>

          {/* Thumbnail Upload - Full Width */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-foreground">
              Course Thumbnail <span className="italic font-light">(Optional)</span>
            </label>
            <div className="w-64">
                  {!thumbnailPreview ? (
                    <label 
                      className={`flex flex-col items-center justify-center w-full h-auto border-2 border-dashed rounded-lg cursor-pointer bg-accent hover:bg-accent/70 transition-colors aspect-video ${
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
                      <div className="flex flex-col items-center justify-center">
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
                        className="w-full h-auto object-cover rounded-lg border border-border"
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
                    </div>
                  )}
                </div>
                {(isUploading || isDeleting) && (
                  <p className="text-sm text-muted-foreground">{isUploading ? 'Uploading...' : 'Deleting...'}</p>
                )}
                {uploadError && <p className="text-destructive text-sm">{uploadError.message}</p>}
            </div>

          {/* Error Message */}
          {createCourseError && (
            <div className="mt-6 p-4 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-destructive text-sm">{createCourseError.message}</p>
            </div>
          )}

          {/* Submit Button */}
          <div className="mt-8 flex gap-4 justify-end">
            <Button
              variant="outline"
              onClick={() => navigate(-1)}
              type="button"
            >
              Cancel
            </Button>
            <Button
              disabled={isCreating || isUploading || isDeleting}
              className="gap-2"
            >
              {isCreating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-background"></div>
                  Creating...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  Create Course
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateCourse;
