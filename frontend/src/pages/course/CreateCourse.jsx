import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGetFacultyId } from "../../hooks/analytics/adminAnalytics/useGetFaculty";
import { useCreateCourse } from "../../hooks/courses/useCourses";
import { useUploadImage } from "../../hooks/courseThumbnails/useUploadImage";
import { useDeleteImage } from "../../hooks/courseThumbnails/useDeleteImage";
import { X, Check, Search, User, Image as ImageIcon, Loader2, ArrowLeft } from "lucide-react";
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
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";
import { useUser } from "@clerk/clerk-react";

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
  const { user } = useUser();

  const [title, setTitle] = useState("");
  const [college, setCollege] = useState("");
  const [description, setDescription] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [faculty, setFaculty] = useState("");

  const [thumbnailPublicId, setThumbnailPublicId] = useState("");
  const [thumbnailPreview, setThumbnailPreview] = useState("");

  const [facultySearch, setFacultySearch] = useState("");
  const [showInstructorList, setShowInstructorList] = useState(false);

  const [errors, setErrors] = useState({ title: "", college: "" });
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
    <div className="min-h-screen bg-muted/40 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center gap-4">
            <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => navigate('/admin/courses')}
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

                {/* Right Column: Thumbnail & Instructor */}
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

                  {/* Instructor Selection */}
                  <div className="space-y-4">
                    <Label className="text-base">
                        Instructor <span className="text-sm font-normal text-muted-foreground"></span>
                    </Label>
                    
                    <div className="space-y-3">
                        {/* Self-Assign Checkbox */}
                        <div className="flex items-center space-x-2 p-3 rounded-lg border bg-muted/5">
                            <Checkbox
                                id="assignSelf"
                                checked={assignSelfAsInstructor}
                                onCheckedChange={(checked) => {
                                setAssignSelfAsInstructor(checked);
                                if (checked) {
                                    setFaculty("");
                                }
                                }}
                                className="border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                            />
                            <Label htmlFor="assignSelf" className="text-sm font-medium cursor-pointer">
                                Assign myself as instructor
                            </Label>
                        </div>

                        <div className="flex items-center gap-2">
                            <div className="relative flex-1">
                                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    className="pl-10 h-10 bg-background border-gray-300"
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
                                    variant="outline"
                                    disabled={assignSelfAsInstructor}
                                    className="h-10 px-4"
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
                                
                                <div className="space-y-4 pt-4">
                                    <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search instructors..."
                                        value={facultySearch}
                                        onChange={e => setFacultySearch(e.target.value)}
                                        className="pl-10"
                                    />
                                    </div>

                                    <div className="max-h-[300px] overflow-y-auto space-y-1 pr-1">
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
                                        <div className="text-destructive text-center py-8 text-sm">
                                            Error loading faculty
                                        </div>
                                    ) : filteredFaculty.length === 0 ? (
                                        <div className="text-muted-foreground text-center py-8 text-sm">
                                            No matching instructors found
                                        </div>
                                    ) : (
                                        filteredFaculty.map(fac => (
                                        <div
                                            key={fac.id}
                                            className={`cursor-pointer px-3 py-3 rounded-lg hover:bg-accent transition-colors flex items-center gap-3 ${
                                            faculty === fac.id ? "bg-accent/80 border border-primary/20" : ""
                                            }`}
                                            onClick={() => handleInstructorSelect(fac.id)}
                                        >
                                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-medium">
                                                {fac.fullName.charAt(0)}
                                            </div>
                                            <div className="font-medium text-sm text-foreground">{fac.fullName}</div>
                                            {faculty === fac.id && <Check className="h-4 w-4 text-primary ml-auto" />}
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
                    onClick={() => navigate('/admin/courses')}
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