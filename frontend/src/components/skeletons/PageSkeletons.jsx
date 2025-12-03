import { Skeleton } from "@/components/ui/skeleton"

// Homepage/CoursesCarousel Skeleton
export const CourseCardSkeleton = () => (
  <div className="border rounded-lg overflow-hidden">
    <Skeleton className="w-full h-40 md:h-48" />
    <div className="p-4 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>
      <Skeleton className="h-3 w-24" />
      <Skeleton className="h-9 w-full" />
    </div>
  </div>
)

// Course Cards Grid Skeleton
export const CourseGridSkeleton = ({ cols = 3 }) => (
  <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-${cols} gap-6`}>
    {[...Array(6)].map((_, i) => (
      <CourseCardSkeleton key={i} />
    ))}
  </div>
)

// Carousel Header Skeleton
export const CarouselHeaderSkeleton = () => (
  <div className="mb-6">
    <Skeleton className="h-7 md:h-8 w-48 mb-2" />
    <Skeleton className="h-4 w-96" />
  </div>
)

// Course Detail Page Skeleton
export const CourseDetailSkeleton = () => (
  <div className="min-h-screen">
    <div className="max-w-6xl mx-auto shadow-xl border-none rounded-2xl bg-muted/40 p-4 md:p-8 space-y-6">
      <div className="flex flex-col md:flex-row gap-6 md:gap-8">
        <Skeleton className="h-48 md:h-80 w-full md:w-1/2 rounded-2xl flex-shrink-0" />
        <div className="flex-1 space-y-4 md:space-y-6">
          <Skeleton className="h-8 md:h-10 w-2/3" />
          <Skeleton className="h-4 md:h-6 w-1/3" />
          <Skeleton className="h-4 md:h-5 w-full" />
          <Skeleton className="h-4 md:h-5 w-4/5" />
          <div className="pt-4 space-y-2">
            <Skeleton className="h-10 w-32" />
          </div>
        </div>
      </div>
    </div>
  </div>
)

// Search Results Skeleton
export const SearchResultsSkeleton = () => (
  <div className="space-y-4 sm:space-y-6 px-0">
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div className="flex-1 w-full">
        <Skeleton className="h-6 sm:h-8 w-32 sm:w-40 mb-2" />
        <Skeleton className="h-4 w-48 sm:w-64" />
      </div>
    </div>
    
    <div className="p-4 sm:p-6">
      <div className="space-y-2 sm:space-y-4">
        {[1, 2, 3].map((j) => (
          <div key={j} className="flex items-center justify-between p-2 sm:p-4 border rounded-lg">
            <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
              <Skeleton className="h-8 w-8 sm:h-12 sm:w-12 rounded-lg flex-shrink-0" />
              <div className="flex-1 min-w-0 space-y-1 sm:space-y-2">
                <Skeleton className="h-3 sm:h-5 w-3/4" />
                <Skeleton className="h-2.5 sm:h-3 w-1/2" />
              </div>
            </div>
            <Skeleton className="h-6 w-6 sm:h-10 sm:w-10 rounded" />
          </div>
        ))}
      </div>
    </div>
  </div>
)

// Categories Skeleton
export const CategoriesSkeleton = () => (
  <div className="flex flex-wrap gap-4 justify-baseline">
    {[...Array(6)].map((_, idx) => (
      <Skeleton key={idx} className="h-10 w-32 rounded-full" />
    ))}
  </div>
)

// Table Skeleton (for management pages)
export const TableSkeleton = ({ rows = 10 }) => (
  <div className="space-y-2">
    {[...Array(rows)].map((_, i) => (
      <Skeleton key={i} className="h-16 w-full" />
    ))}
  </div>
)

// Header/Title Skeleton
export const PageHeaderSkeleton = () => (
  <div className="space-y-2 mb-6">
    <Skeleton className="h-8 w-48 mb-2" />
    <Skeleton className="h-4 w-72" />
  </div>
)

// Filter/Search Bar Skeleton
export const FilterBarSkeleton = () => (
  <div className="p-4 sm:p-6">
    <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
      <Skeleton className="h-10 w-full sm:flex-1 max-w-sm" />
      <Skeleton className="h-10 w-full sm:w-[200px]" />
    </div>
  </div>
)

// Stats Cards Skeleton
export const StatsCardsSkeleton = ({ count = 4 }) => (
  <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-${count} gap-4`}>
    {[...Array(count)].map((_, i) => (
      <div key={i} className="p-6 border rounded-lg space-y-3">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-lg" />
          <Skeleton className="h-4 w-20" />
        </div>
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-3 w-24" />
      </div>
    ))}
  </div>
)

// Chart Skeleton
export const ChartSkeleton = () => (
  <div className="p-4 sm:p-6 border rounded-lg space-y-4">
    <Skeleton className="h-6 w-32" />
    <Skeleton className="h-64 w-full" />
  </div>
)

// Modal/Dialog Skeleton
export const ModalSkeleton = () => (
  <div className="space-y-4 p-4 sm:p-6">
    <Skeleton className="h-8 w-48" />
    <Skeleton className="h-32 w-full" />
    <div className="flex gap-2 justify-end pt-4">
      <Skeleton className="h-10 w-20" />
      <Skeleton className="h-10 w-20" />
    </div>
  </div>
)

// User Info Card Skeleton
export const UserInfoCardSkeleton = () => (
  <div className="flex items-start gap-4 p-4 sm:p-6 border rounded-lg">
    <Skeleton className="h-12 w-12 sm:h-16 sm:w-16 rounded-full flex-shrink-0" />
    <div className="flex-1 space-y-2">
      <Skeleton className="h-5 w-32" />
      <Skeleton className="h-3 w-48" />
      <Skeleton className="h-3 w-40" />
    </div>
  </div>
)

// Form Skeleton
export const FormSkeleton = () => (
  <div className="space-y-6 p-4 sm:p-6 border rounded-lg">
    {/* Form header */}
    <Skeleton className="h-8 w-48" />
    
    {/* Form fields */}
    {[...Array(4)].map((_, i) => (
      <div key={i} className="space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-10 w-full" />
      </div>
    ))}
    
    {/* Form actions */}
    <div className="flex gap-2 justify-end pt-4 border-t">
      <Skeleton className="h-10 w-20" />
      <Skeleton className="h-10 w-24" />
    </div>
  </div>
)

// Breadcrumb Skeleton
export const BreadcrumbSkeleton = () => (
  <div className="flex gap-2 mb-4">
    {[...Array(3)].map((_, i) => (
      <div key={i} className="flex gap-2 items-center">
        {i > 0 && <Skeleton className="h-4 w-4" />}
        <Skeleton className="h-4 w-24" />
      </div>
    ))}
  </div>
)

// Tabs Skeleton
export const TabsSkeleton = () => (
  <div className="flex gap-4 border-b pb-2 mb-6">
    {[1, 2, 3, 4].map((i) => (
      <Skeleton key={i} className="h-10 w-32" />
    ))}
  </div>
)

// List Item Skeleton (for detailed lists)
export const ListItemSkeleton = ({ count = 5 }) => (
  <div className="space-y-3">
    {[...Array(count)].map((_, i) => (
      <div key={i} className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-4 w-16" />
        </div>
      </div>
    ))}
  </div>
)

// Comments/Reviews Skeleton
export const CommentsSkeleton = ({ count = 3 }) => (
  <div className="space-y-4">
    {[...Array(count)].map((_, i) => (
      <div key={i} className="p-4 border rounded-lg space-y-3">
        <div className="flex items-center gap-3">
          <Skeleton className="h-8 w-8 rounded-full" />
          <div className="flex-1 space-y-1">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>
        <Skeleton className="h-16 w-full" />
      </div>
    ))}
  </div>
)

// Avatar Skeleton
export const AvatarSkeleton = ({ size = 'md' }) => {
  const sizeMap = {
    sm: 'h-8 w-8',
    md: 'h-12 w-12',
    lg: 'h-16 w-16',
    xl: 'h-20 w-20'
  }
  return <Skeleton className={`${sizeMap[size]} rounded-full`} />
}

// Badge Skeleton
export const BadgeSkeleton = () => (
  <Skeleton className="h-5 w-20 rounded-full" />
)

// Button Skeleton
export const ButtonSkeleton = ({ width = 'w-24' }) => (
  <Skeleton className={`h-10 ${width} rounded-md`} />
)

// My Courses Card Skeleton - Student Version with Progress Bar
export const MyCourseCardSkeleton = () => (
  <div className="flex flex-col h-full overflow-hidden rounded-xl border bg-card shadow-sm">
    {/* Thumbnail */}
    <Skeleton className="aspect-video w-full" />
    
    <div className="flex flex-1 flex-col p-4">
      {/* Title */}
      <div className="mb-1 space-y-1">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-6 w-1/2" />
      </div>

      {/* College Badge */}
      <div className="mb-3 mt-1">
        <Skeleton className="h-5 w-24 rounded-md" />
      </div>

      {/* Instructor Info */}
      <div className="mb-4 flex items-center gap-3">
        <Skeleton className="h-8 w-8 rounded-full shrink-0" />
        <div className="space-y-1.5">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-auto space-y-2">
        <div className="flex justify-between items-center">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-3 w-8" />
        </div>
        <Skeleton className="h-1.5 w-full rounded-full" />
      </div>
    </div>
  </div>
)

// Archived/Faculty Course Card Skeleton - with action buttons
export const ArchivedCourseCardSkeleton = () => (
  <div className="h-96 flex flex-col border rounded-lg overflow-hidden p-0">
    {/* Thumbnail */}
    <Skeleton className="w-full h-48 flex-shrink-0" />
    <div className="pb-1 sm:pb-2 flex-shrink-0 space-y-2 p-3 sm:p-4">
      <div className="text-center">
        <Skeleton className="h-5 w-3/4 mx-auto mb-2" />
      </div>
      <div className="flex justify-center">
        <Skeleton className="h-5 w-24 rounded-full" />
      </div>
    </div>
    {/* Content section with faculty and progress */}
    <div className="flex flex-col space-y-1 p-3 sm:p-4 pb-3 sm:pb-4 flex-shrink-0">
      <div className="flex items-center gap-2 pb-1 sm:pb-2 border-b">
        <Skeleton className="h-6 w-6 rounded-full flex-shrink-0" />
        <div className="flex-1 min-w-0 space-y-1">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-2 w-16" />
        </div>
      </div>
      <div className="space-y-0.5">
        <div className="flex justify-between items-center">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-3 w-8" />
        </div>
        <Skeleton className="h-1 w-full" />
      </div>
    </div>
  </div>
)

// Grid Skeleton for My Courses Page
export const MyCourseGridSkeleton = ({ count = 8 }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
    {[...Array(count)].map((_, i) => (
      <MyCourseCardSkeleton key={i} />
    ))}
  </div>
)

// Grid Skeleton for Archived Courses Page
export const ArchivedCourseGridSkeleton = ({ count = 6 }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {[...Array(count)].map((_, i) => (
      <ArchivedCourseCardSkeleton key={i} />
    ))}
  </div>
)
