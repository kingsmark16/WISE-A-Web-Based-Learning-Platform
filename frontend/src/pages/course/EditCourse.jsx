import { useEffect, useState } from "react";
import { useGetCourse, useUpdateCourse } from "../../hooks/courses/useCourses"
import { useNavigate, useParams } from "react-router-dom";
import { useUploadImage } from "../../hooks/courseThumbnails/useUploadImage";
import { useDeleteImage } from "../../hooks/courseThumbnails/useDeleteImage";
import { X, Check, Image as ImageIcon, Loader2, ArrowLeft } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useUser } from "@clerk/clerk-react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";

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

const EditCourse = () => {
    const {id} = useParams();
    const navigate = useNavigate();
    const {data, isLoading, error} = useGetCourse(id);
    const {mutate: updateCourse, isPending: isUpdating} = useUpdateCourse();
    const {mutate: uploadImage, isPending: isUploading, error: uploadError} = useUploadImage();
    const {mutate: deleteImage, isPending: isDeleting} = useDeleteImage();
    const { user } = useUser();

    // Get user role from Clerk metadata or localStorage
    const userRole = user?.publicMetadata?.role || localStorage.getItem('userRole') || 'STUDENT';
    const isFaculty = userRole === 'FACULTY';

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        college: "",
        thumbnail: "",
        certificateEnabled: false
    });

    const [thumbnailPreview, setThumbnailPreview] = useState("");
    const [thumbnailPublicId, setThumbnailPublicId] = useState("");
    const [newImageSelected, setNewImageSelected] = useState(false);
    const [isDragOver, setIsDragOver] = useState(false);

    useEffect(() => {
        if(data?.course) {
            setFormData({
                title: data.course.title || "",
                description: data.course.description || "",
                college: data.course.college || "",
                thumbnail: data.course.thumbnail || "",
                certificateEnabled: data.course.certificateEnabled ?? false
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
            certificateEnabled: formData.certificateEnabled
        };

        updateCourse({id, courseData: updateData}, {
            onSuccess: () => {
                // Navigate to course details page based on user role
                const detailsRoute = isFaculty 
                    ? `/faculty/courses/${id}/manage` 
                    : `/admin/courses/${id}`;
                navigate(detailsRoute);
            }
        });
    };

    if(isLoading) return (
        <div className="min-h-screen bg-muted/40 p-4 sm:p-6 lg:p-8 flex items-center justify-center">
             <Card className="w-full max-w-5xl border-none shadow-none bg-transparent">
                <CardHeader className="space-y-2 px-0">
                    <Skeleton className="h-8 w-1/3" />
                    <Skeleton className="h-4 w-1/4" />
                </CardHeader>
                <CardContent className="grid gap-8 md:grid-cols-2 px-0">
                    <div className="space-y-6">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-32 w-full" />
                    </div>
                    <div className="space-y-6">
                        <Skeleton className="h-48 w-full rounded-lg" />
                    </div>
                </CardContent>
             </Card>
        </div>
    );
    
    if(error) return (
        <div className="min-h-screen bg-muted/40 flex items-center justify-center p-4">
            <div className="text-center space-y-4">
                <div className="text-destructive font-semibold text-lg">Error loading course</div>
                <p className="text-muted-foreground">{error.message}</p>
                <Button onClick={() => navigate(-1)} variant="outline">Go Back</Button>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-muted/40 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto space-y-6">
                
                {/* Back Button & Header */}
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
                        <h1 className="text-2xl font-bold tracking-tight text-foreground">Edit Course</h1>
                        <p className="text-muted-foreground text-sm">Update the course details and settings.</p>
                    </div>
                </div>

                <Card className="border-none shadow-md bg-card">
                    <form onSubmit={handleSubmit}>
                        <CardContent className="p-6 sm:p-8">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
                                
                                {/* Left Column: Main Info */}
                                <div className="lg:col-span-2 space-y-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="title" className="text-base">Course Title</Label>
                                        <Input
                                            id="title"
                                            placeholder="e.g. Introduction to Computer Science"
                                            value={formData.title}
                                            onChange={(e) => setFormData({...formData, title: e.target.value})}
                                            required
                                            className="h-12 text-base"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="college" className="text-base">College / Department</Label>
                                        <Select
                                            key={formData.college}
                                            value={formData.college}
                                            onValueChange={(value) => setFormData({...formData, college: value})}
                                        >
                                            <SelectTrigger id="college" className="h-12 text-base w-full min-w-0 [&>span]:truncate [&>span]:block">
                                                <SelectValue placeholder="Select a college" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {categories.map((cat) => (
                                                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="description" className="text-base">Description</Label>
                                        <Textarea
                                            id="description"
                                            placeholder="Provide a detailed description of the course..."
                                            rows={8}
                                            value={formData.description}
                                            onChange={(e) => setFormData({...formData, description: e.target.value})}
                                            className="resize-none text-base leading-relaxed"
                                        />
                                    </div>

                                    <div className="flex items-start space-x-3 p-4 rounded-lg border-2 border-primary/20 bg-muted/10 hover:bg-muted/20 transition-colors">
                                        <Checkbox
                                            id="certificateEnabled"
                                            checked={formData.certificateEnabled}
                                            onCheckedChange={(checked) => setFormData({...formData, certificateEnabled: checked})}
                                            className="mt-1 h-5 w-5 border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                                        />
                                        <div className="space-y-1">
                                            <Label 
                                                htmlFor="certificateEnabled"
                                                className="text-base font-medium cursor-pointer"
                                            >
                                                Enable Certificate Generation
                                            </Label>
                                            <p className="text-sm text-muted-foreground">
                                                Allow students to automatically generate and download a certificate upon course completion.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Right Column: Thumbnail & Media */}
                                <div className="space-y-6">
                                    <div className="space-y-4">
                                        <Label className="text-base">Course Thumbnail</Label>
                                        
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
                                                    
                                                    {/* Status Badges */}
                                                    <div className="absolute top-3 left-3 flex gap-2">
                                                        {formData.thumbnail && !newImageSelected && !isUploading && (
                                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/90 text-white text-xs font-medium rounded-full backdrop-blur-sm shadow-sm">
                                                                <Check className="h-3 w-3" />
                                                                Current
                                                            </span>
                                                        )}
                                                        {formData.thumbnail && !isDeleting && newImageSelected && (
                                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-500/90 text-white text-xs font-medium rounded-full backdrop-blur-sm shadow-sm">
                                                                <Check className="h-3 w-3" />
                                                                New
                                                            </span>
                                                        )}
                                                    </div>
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
                                disabled={isUpdating || isUploading || isDeleting}
                                className="h-11 px-8 min-w-[140px]"
                            >
                                {isUpdating ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Updating...
                                    </>
                                ) : (
                                    <>
                                        Save Changes
                                    </>
                                )}
                            </Button>
                        </CardFooter>
                    </form>
                </Card>
            </div>
        </div>
    )
}

export default EditCourse