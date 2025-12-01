import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCreateCourse } from "../../hooks/courses/useCourses";
import { useUploadImage } from "../../hooks/courseThumbnails/useUploadImage";
import { useDeleteImage } from "../../hooks/courseThumbnails/useDeleteImage";
import { X, Check, Image as ImageIcon, Loader2, ArrowLeft } from "lucide-react";
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
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

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
    <div className="min-h-screen bg-muted/40 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center gap-4">
            <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => navigate(-1)}
                className="rounded-full hover:bg-background/80"
            >
                <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-foreground">Create New Course</h1>
                <p className="text-muted-foreground text-sm">Fill in the details below to create a new course.</p>
            </div>
        </div>

        <Card className="border-none shadow-md bg-card">
          <form onSubmit={handleSubmit}>
            <CardContent className="p-6 sm:p-8">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
                
                {/* Left Column: Main Info */}
                <div className="lg:col-span-2 space-y-6">
                  
                  {/* Course Title */}
                  <div className="space-y-2">
                    <Label htmlFor="title" className="text-base">
                        Course Title <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="title"
                      type="text"
                      className="h-12 text-base border-gray-300"
                      value={title}
                      onChange={e => {
                        setTitle(e.target.value);
                        setErrors(prev => ({ ...prev, title: "" }));
                      }}
                    />
                    {errors.title && <p className="text-destructive text-sm">{errors.title}</p>}
                  </div>

                  {/* College */}
                  <div className="space-y-2">
                    <Label htmlFor="college" className="text-base">
                        College / Department <span className="text-destructive">*</span>
                    </Label>
                    <Select 
                      value={college} 
                      onValueChange={(value) => {
                        setCollege(value);
                        setErrors(prev => ({ ...prev, college: "" }));
                      }}
                    >
                      <SelectTrigger id="college" className="h-12 text-base border-gray-300">
                        <SelectValue placeholder="Select a college" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(col => (
                          <SelectItem key={col} value={col}>{col}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.college && <p className="text-destructive text-sm">{errors.college}</p>}
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-base">
                        Description <span className="text-sm font-normal text-muted-foreground">(Optional)</span>
                    </Label>
                    <Textarea
                      id="description"
                      className="resize-none text-base leading-relaxed border-gray-300"
                      rows={8}
                      value={description}
                      onChange={e => setDescription(e.target.value)}
                    />
                  </div>
                </div>

                {/* Right Column: Thumbnail */}
                <div className="space-y-6">
                  
                  {/* Thumbnail Upload */}
                  <div className="space-y-4">
                    <Label className="text-base">
                        Course Thumbnail <span className="text-sm font-normal text-muted-foreground">(Optional)</span>
                    </Label>
                    
                    <div className="w-full">
                      {!thumbnailPreview ? (
                        <label 
                          className={`flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-200 ease-in-out
                            ${isDragOver 
                                ? "border-primary bg-primary/5 scale-[1.02]" 
                                : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/30"
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
                          <div className="flex flex-col items-center justify-center p-6 text-center">
                            <div className="p-4 rounded-full bg-primary/10 mb-4">
                                <ImageIcon className="w-8 h-8 text-primary" />
                            </div>
                            <p className="mb-2 text-sm font-medium text-foreground">
                                Drop your image here, or click to browse
                            </p>
                            <p className="text-xs text-muted-foreground">
                                Supports PNG, JPG, JPEG (Max 5MB)
                            </p>
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
                        <div className="relative group rounded-xl overflow-hidden border bg-muted/10">
                          <img 
                            src={thumbnailPreview}
                            alt="Thumbnail preview"
                            className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              onClick={handleImageDelete}
                              disabled={isDeleting}
                              className="shadow-lg"
                            >
                              {isDeleting ? (
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                              ) : (
                                <X className="h-4 w-4 mr-2" />
                              )}
                              Remove Image
                            </Button>
                          </div>
                          
                          {thumbnailUrl && !isDeleting && (
                            <div className="absolute top-3 left-3">
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/90 text-white text-xs font-medium rounded-full backdrop-blur-sm shadow-sm">
                                <Check className="h-3 w-3" />
                                Uploaded
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {isUploading && (
                        <div className="flex items-center gap-2 text-sm text-primary animate-pulse">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span>Uploading image...</span>
                        </div>
                    )}
                    {uploadError && (
                        <p className="text-destructive text-sm bg-destructive/10 p-2 rounded">
                            Upload failed: {uploadError.message}
                        </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Error Display */}
              {createCourseError && (
                <div className="mt-8 p-4 bg-destructive/10 border border-destructive/20 rounded-lg flex items-center gap-3 text-destructive">
                    <X className="h-5 w-5 flex-shrink-0" />
                    <p className="text-sm font-medium">{createCourseError.message}</p>
                </div>
              )}

            </CardContent>

            <CardFooter className="flex items-center justify-end gap-4 p-6 sm:p-8 border-t bg-muted/5">
                <Button 
                    type="button"
                    variant="outline" 
                    onClick={() => navigate(-1)}
                    className="h-11 px-8"
                >
                    Cancel
                </Button>
                <Button 
                    type="submit"
                    className="h-11 px-8 min-w-[140px]"
                    disabled={isCreating || isUploading || isDeleting}
                >
                    {isCreating ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating...
                    </>
                    ) : (
                        "Create Course"
                    )}
                </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default CreateCourse;
