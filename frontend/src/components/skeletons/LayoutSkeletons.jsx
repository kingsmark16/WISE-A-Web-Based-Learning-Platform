import { Skeleton } from "@/components/ui/skeleton"

// Sidebar Skeleton
export const SidebarSkeleton = () => (
  <aside className="fixed top-0 left-0 h-full w-64 bg-card border-r z-50">
    <div className="flex flex-col h-full">
      {/* Logo Section Skeleton */}
      <div className="p-6 space-y-3">
        <Skeleton className="h-16 w-16 mx-auto rounded-lg" />
        <Skeleton className="h-4 w-32 mx-auto" />
      </div>

      {/* Navigation Skeleton */}
      <div className="flex-1 p-4 space-y-2">
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="h-10 w-full rounded-lg" />
        ))}
      </div>

      {/* Footer Skeleton */}
      <div className="p-4 bg-muted/30 space-y-4">
        <Skeleton className="h-4 w-20 mx-auto" />
        <div className="flex gap-2 justify-center">
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
        <div className="space-y-1 text-center">
          <Skeleton className="h-3 w-32 mx-auto" />
          <Skeleton className="h-2 w-40 mx-auto" />
        </div>
      </div>
    </div>
  </aside>
)

// Header Skeleton
export const HeaderSkeleton = () => (
  <header className="fixed top-0 right-0 h-20 flex items-center justify-between py-4 px-6 z-[60] left-64">
    <div className="flex items-center gap-3 flex-1">
      <Skeleton className="h-4 w-4 rounded" />
      <Skeleton className="h-6 w-32" />
    </div>

    {/* Search bar */}
    <div className="hidden md:flex flex-1 max-w-md mx-8">
      <Skeleton className="h-10 w-full rounded-lg" />
    </div>

    {/* User actions */}
    <div className="flex items-center gap-2">
      <Skeleton className="h-10 w-10 rounded-lg" />
      <Skeleton className="h-10 w-10 rounded-full" />
    </div>
  </header>
)

// Main Layout Skeleton (Sidebar + Header)
export const MainLayoutSkeleton = () => (
  <div className="min-h-screen">
    <SidebarSkeleton />
    <HeaderSkeleton />
  </div>
)

// Page Container Skeleton
export const PageContainerSkeleton = () => (
  <div className="min-h-screen bg-background">
    <MainLayoutSkeleton />
    
    {/* Page Content */}
    <main className="ml-64 pt-20 p-6 lg:p-8">
      <div className="space-y-6">
        {/* Page header */}
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-72" />
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-64 rounded-lg" />
          ))}
        </div>
      </div>
    </main>
  </div>
)

// Dashboard Cards Skeleton
export const DashboardCardsSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
    {[...Array(4)].map((_, i) => (
      <div key={i} className="p-6 border rounded-lg space-y-3">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-lg" />
          <Skeleton className="h-4 w-24" />
        </div>
        <Skeleton className="h-8 w-16" />
        <Skeleton className="h-3 w-20" />
      </div>
    ))}
  </div>
)

// Loading Screen (Full page)
export const FullPageLoadingSkeleton = () => (
  <div className="min-h-screen bg-background animate-pulse">
    <SidebarSkeleton />
    
    <div className="ml-64 pt-20">
      <HeaderSkeleton />
      
      <main className="p-6 lg:p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header section */}
          <Skeleton className="h-10 w-48" />

          {/* Content sections */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main content */}
            <div className="lg:col-span-2 space-y-4">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-32 w-full rounded-lg" />
              ))}
            </div>

            {/* Sidebar content */}
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-32 w-full rounded-lg" />
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
)

// Course Page Loading Skeleton
export const CoursePageLoadingSkeleton = () => (
  <div className="min-h-screen">
    <div className="max-w-6xl mx-auto shadow-xl border-none rounded-2xl bg-muted/40 p-4 md:p-8 space-y-6 mt-20">
      {/* Header with thumbnail and info */}
      <div className="flex flex-col md:flex-row gap-6 md:gap-8">
        <Skeleton className="h-48 md:h-80 w-full md:w-1/2 rounded-2xl flex-shrink-0" />
        <div className="flex-1 space-y-4 md:space-y-6">
          <Skeleton className="h-8 md:h-10 w-2/3" />
          <Skeleton className="h-4 md:h-6 w-1/3" />
          <Skeleton className="h-4 md:h-5 w-full" />
          <Skeleton className="h-4 md:h-5 w-4/5" />
          <div className="pt-4">
            <Skeleton className="h-10 w-40" />
          </div>
        </div>
      </div>

      {/* Module navigation */}
      <div className="border-t pt-6 space-y-4">
        <Skeleton className="h-6 w-32" />
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-12 w-full rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  </div>
)

// Grid Layout Skeleton (responsive)
export const GridLoadingSkeleton = ({ cols = 3, rows = 2 }) => (
  <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-${cols} gap-6`}>
    {[...Array(cols * rows)].map((_, i) => (
      <Skeleton key={i} className="h-64 rounded-lg" />
    ))}
  </div>
)
