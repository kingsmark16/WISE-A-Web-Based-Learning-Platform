import React, { useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useGetSingleStudent } from "../../../hooks/userManagement/useStudents";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/ui/error-state";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ArrowLeft, Mail, BookOpen, Award, Calendar, Users, ChevronUp, ChevronDown } from "lucide-react";

// Mobile-optimized skeleton loader for courses list
const CourseSkeletonLoader = () => (
  <div className="space-y-2 py-3 px-3 sm:px-4">
    {[1, 2].map((i) => (
      <div key={i} className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-md">
        <Skeleton className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex-shrink-0" />
        <div className="flex-1 min-w-0 space-y-1 sm:space-y-2">
          <Skeleton className="h-3 sm:h-4 w-full max-w-xs" />
          <div className="flex gap-1 sm:gap-2">
            <Skeleton className="h-4 w-16 sm:w-20" />
            <Skeleton className="h-4 w-20 sm:w-24" />
          </div>
        </div>
      </div>
    ))}
  </div>
);

// Mobile-optimized header skeleton loader
const HeaderSkeletonLoader = () => (
  <Card className="overflow-hidden border-0">
    <CardContent className="p-4 sm:p-5 lg:p-6">
      <div className="flex flex-col gap-3 sm:gap-4">
        <div className="flex gap-3 sm:gap-4">
          <Skeleton className="w-16 h-16 sm:w-20 sm:h-20 rounded-full flex-shrink-0" />
          <div className="flex-1 space-y-2 sm:space-y-2.5">
            <Skeleton className="h-6 sm:h-7 w-full max-w-xs" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
);

const StudentInfo = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, isLoading, error } = useGetSingleStudent(id);
  const student = useMemo(() => data?.student, [data]);

  // Sort state
  const [coursesSortOrder, setCoursesSortOrder] = useState("asc");
  const [certificatesSortOrder, setCertificatesSortOrder] = useState("asc");

  // Sort toggle functions
  const toggleCoursesSort = () => {
    setCoursesSortOrder(coursesSortOrder === "asc" ? "desc" : "asc");
  };

  const toggleCertificatesSort = () => {
    setCertificatesSortOrder(certificatesSortOrder === "asc" ? "desc" : "asc");
  };

  // Sorted data
  const sortedEnrollments = useMemo(() => {
    if (!student?.enrollments) return [];
    return [...student.enrollments].sort((a, b) => {
      const titleA = a.course.title.toLowerCase();
      const titleB = b.course.title.toLowerCase();
      if (coursesSortOrder === "asc") {
        return titleA.localeCompare(titleB);
      } else {
        return titleB.localeCompare(titleA);
      }
    });
  }, [student?.enrollments, coursesSortOrder]);

  const sortedCertificates = useMemo(() => {
    if (!student?.certificates) return [];
    return [...student.certificates].sort((a, b) => {
      const titleA = a.course.title.toLowerCase();
      const titleB = b.course.title.toLowerCase();
      if (certificatesSortOrder === "asc") {
        return titleA.localeCompare(titleB);
      } else {
        return titleB.localeCompare(titleA);
      }
    });
  }, [student?.certificates, certificatesSortOrder]);

  // Skeleton loading state
  if (isLoading) {
    return (
      <div className="w-full space-y-3 sm:space-y-4 px-3 sm:px-4 py-3 sm:py-4">
        <Skeleton className="h-9 w-20" />
        <HeaderSkeletonLoader />
        <div className="space-y-3 sm:space-y-4">
          <Card className="border-0 overflow-hidden">
            <CardHeader className="px-3 sm:px-4 py-3 border-b bg-muted/40">
              <Skeleton className="h-5 w-32" />
            </CardHeader>
            <CourseSkeletonLoader />
          </Card>
          <Card className="border-0 overflow-hidden">
            <CardHeader className="px-3 sm:px-4 py-3 border-b bg-muted/40">
              <Skeleton className="h-5 w-24" />
            </CardHeader>
            <CourseSkeletonLoader />
          </Card>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="w-full space-y-3 sm:space-y-4 px-3 sm:px-4 py-4 sm:py-6">
        <Button 
          onClick={() => navigate(-1)} 
          variant="ghost" 
          className="h-9 px-2 sm:px-3 text-sm hover:bg-accent"
        >
          <ArrowLeft className="h-4 w-4 mr-1.5 sm:mr-2" />
          <span>Back</span>
        </Button>
        <ErrorState
          variant="inline"
          title="Error Loading Student"
          message={`Error loading student information. ${error?.message || ''}`}
          onRetry={() => window.location.reload()}
          showHome
          homeRoute="/admin/student-management"
        />
      </div>
    );
  }

  // Not found state
  if (!student) {
    return (
      <div className="w-full space-y-3 sm:space-y-4 px-3 sm:px-4 py-4 sm:py-6">
        <Button 
          onClick={() => navigate(-1)} 
          variant="ghost" 
          className="h-9 px-2 sm:px-3 text-sm hover:bg-accent"
        >
          <ArrowLeft className="h-4 w-4 mr-1.5 sm:mr-2" />
          <span>Back</span>
        </Button>
        <Alert className="text-sm">
          <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <AlertDescription className="ml-2 text-xs sm:text-sm">
            Student not found. The student you're looking for doesn't exist.
          </AlertDescription>
        </Alert>
        <Button onClick={() => navigate(-1)} variant="outline" className="w-full h-9">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Return to Student List
        </Button>
      </div>
    );
  }

  // Course card component - mobile optimized
  const CourseCard = ({ course, enrollmentDate }) => (
    <Card 
      key={course.id} 
      className="group hover:shadow-sm sm:hover:shadow-md transition-all duration-200 cursor-pointer overflow-hidden border-0 bg-muted/20 hover:bg-muted/40 active:bg-muted/50"
      onClick={() => navigate(`/admin/courses/${course.id}`)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          navigate(`/admin/courses/${course.id}`);
        }
      }}
    >
      <CardContent className="p-2 sm:p-3">
        <div className="flex items-start gap-2 sm:gap-3">
          {course.thumbnail ? (
            <img
              src={course.thumbnail}
              alt={course.title}
              className="w-12 h-12 sm:w-14 sm:h-14 rounded-md object-cover flex-shrink-0 group-hover:scale-105 transition-transform duration-200"
              loading="lazy"
            />
          ) : (
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-md bg-muted flex items-center justify-center flex-shrink-0 group-hover:bg-muted/80 transition-colors">
              <BookOpen className="h-6 w-6 text-muted-foreground" />
            </div>
          )}
          
          <div className="flex-1 min-w-0 space-y-1.5">
            <div>
              <h3 className="font-semibold text-sm leading-tight break-words line-clamp-2 group-hover:text-primary transition-colors duration-200">
                {course.title}
              </h3>
            </div>
            <div className="flex flex-col gap-1.5 sm:flex-row sm:flex-wrap sm:items-center sm:gap-2">
              {course.college && (
                <div className="inline-flex">
                  <Badge 
                    variant="secondary" 
                    className="text-xs h-5 px-2 inline-block w-auto max-w-full"
                  >
                    {course.college}
                  </Badge>
                </div>
              )}
              <div className="flex flex-wrap items-center gap-1 sm:gap-2">
                <Badge variant="outline" className="text-xs h-5 px-2 flex-shrink-0">
                  Enrolled {formatDate(enrollmentDate)}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  // Certificate card component - mobile optimized
  const CertificateCard = ({ certificate }) => (
    <Card 
      key={certificate.id} 
      className="group hover:shadow-sm sm:hover:shadow-md transition-all duration-200 cursor-pointer overflow-hidden border-0 bg-muted/20 hover:bg-muted/40 active:bg-muted/50"
      onClick={() => window.open(certificate.certificateUrl, '_blank')}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          window.open(certificate.certificateUrl, '_blank');
        }
      }}
    >
      <CardContent className="p-2 sm:p-3">
        <div className="flex items-start gap-2 sm:gap-3">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-md bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform duration-200">
            <Award className="h-6 w-6 text-white" />
          </div>
          
          <div className="flex-1 min-w-0 space-y-1.5">
            <div>
              <h3 className="font-semibold text-sm leading-tight break-words line-clamp-2 group-hover:text-primary transition-colors duration-200">
                {certificate.course.title}
              </h3>
            </div>
            <div className="flex flex-wrap items-center gap-1 sm:gap-2">
              <Badge variant="outline" className="text-xs h-5 px-2 flex-shrink-0">
                #{certificate.certificateNumber}
              </Badge>
              <Badge variant="secondary" className="text-xs h-5 px-2 flex-shrink-0">
                Issued {formatDate(certificate.issueDate)}
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const getInitials = (name) => {
    return name?.split(" ").map((n) => n[0]).join("").toUpperCase() || "?";
  };

  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Empty state component - mobile optimized
  const EmptyState = ({ icon: Icon, title, description }) => (
    <div className="flex flex-col items-center justify-center py-6 sm:py-8 px-3 sm:px-4">
      <div className="p-2 sm:p-3 rounded-full bg-muted/40 mb-2 sm:mb-3">
        <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-muted-foreground" />
      </div>
      <p className="text-sm text-muted-foreground font-medium text-center">{title}</p>
      {description && <p className="text-xs text-muted-foreground mt-1 text-center">{description}</p>}
    </div>
  );

  return (
    <div className="space-y-4 sm:space-y-6 px-4 sm:px-6 max-w-7xl sm:mx-auto">
      {/* Back Button */}
      <Button 
        onClick={() => navigate(-1)} 
        variant="ghost" 
        className="mb-2 hover:bg-accent"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>

      {/* Header Card - Mobile Optimized */}
      <Card className="overflow-hidden border-0">
        <CardContent className="p-0">
          <div className="px-3 sm:px-8">
            <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-6 py-4 sm:py-6">
              <Avatar className="h-16 w-16 sm:h-24 sm:w-24 border-4 border-background shadow-lg flex-shrink-0">
                <AvatarImage src={student.imageUrl} alt={student.fullName} />
                <AvatarFallback className="text-lg sm:text-xl font-bold bg-gradient-to-br from-primary to-primary/60 text-white">
                  {getInitials(student.fullName)}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 text-center sm:text-left space-y-2 sm:space-y-3">
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold tracking-tight break-words leading-tight">
                    {student.fullName}
                  </h1>
                </div>
                
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-muted-foreground">
                  <div className="flex items-center gap-2 justify-center sm:justify-start">
                    <Mail className="h-4 w-4 flex-shrink-0" />
                    <span className="text-sm break-all">{student.emailAddress}</span>
                  </div>
                  <div className="flex items-center gap-2 justify-center sm:justify-start">
                    <Calendar className="h-4 w-4 flex-shrink-0" />
                    <span className="text-sm">Joined {formatDate(student.createdAt)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Courses and Certificates Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Enrolled Courses */}
        <Card className="border-0 overflow-hidden">
          <CardContent className="p-0">
            <div className="px-3 sm:px-6 border-b">
              <div className="flex items-center justify-between py-3 sm:py-4">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="p-1.5 sm:p-2 rounded-lg bg-muted/50">
                    <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
                  </div>
                  <h2 className="text-base sm:text-lg font-semibold">Enrolled Courses</h2>
                </div>
                {student?.enrollments?.length > 1 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleCoursesSort}
                    className="h-8 px-2 text-xs hover:bg-muted"
                  >
                    A-Z {coursesSortOrder === "asc" ? <ChevronUp className="h-3 w-3 ml-1" /> : <ChevronDown className="h-3 w-3 ml-1" />}
                  </Button>
                )}
              </div>
            </div>
            
            <div className="px-2 sm:px-4">
              {student.enrollments?.length > 0 ? (
                <div className="space-y-1 py-2">
                  {sortedEnrollments.map((enrollment) => (
                    <CourseCard 
                      key={enrollment.id} 
                      course={enrollment.course} 
                      enrollmentDate={enrollment.enrolledAt}
                    />
                  ))}
                </div>
              ) : (
                <EmptyState 
                  icon={BookOpen} 
                  title="No enrolled courses yet" 
                  description="This student hasn't enrolled in any courses"
                />
              )}
            </div>
          </CardContent>
        </Card>

        {/* Certificates */}
        <Card className="border-0 overflow-hidden">
          <CardContent className="p-0">
            <div className="px-3 sm:px-6 border-b">
              <div className="flex items-center justify-between py-3 sm:py-4">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="p-1.5 sm:p-2 rounded-lg bg-muted/50">
                    <Award className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
                  </div>
                  <h2 className="text-base sm:text-lg font-semibold">Certificates</h2>
                </div>
                {student?.certificates?.length > 1 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleCertificatesSort}
                    className="h-8 px-2 text-xs hover:bg-muted"
                  >
                    A-Z {certificatesSortOrder === "asc" ? <ChevronUp className="h-3 w-3 ml-1" /> : <ChevronDown className="h-3 w-3 ml-1" />}
                  </Button>
                )}
              </div>
            </div>
            
            <div className="px-2 sm:px-4">
              {student.certificates?.length > 0 ? (
                <div className="space-y-1 py-2">
                  {sortedCertificates.map((certificate) => (
                    <CertificateCard key={certificate.id} certificate={certificate} />
                  ))}
                </div>
              ) : (
                <EmptyState 
                  icon={Award} 
                  title="No certificates earned yet" 
                  description="This student hasn't earned any certificates"
                />
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StudentInfo;