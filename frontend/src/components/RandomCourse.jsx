import { useState, useRef, useEffect } from "react";
import { useGetCoursesByCategory } from "../hooks/useGuest";
import ChromaGrid from "./ChromaGrid";
import { ChevronLeft, ChevronRight, Loader2, AlertCircle } from "lucide-react";

const RandomCourse = () => {
  const [menu, setMenu] = useState("Technology");
  const [showLeftIndicator, setShowLeftIndicator] = useState(false);
  const [showRightIndicator, setShowRightIndicator] = useState(false);
  const scrollRef = useRef(null);
  
  const {data, isLoading, error} = useGetCoursesByCategory();

  const categories = Object.keys(data?.response || {});
  const courses = menu ? data?.response?.[menu] : [];

  // Check scroll indicators
  const checkScrollIndicators = () => {
    const element = scrollRef.current;
    if (element) {
      setShowLeftIndicator(element.scrollLeft > 0);
      setShowRightIndicator(
        element.scrollLeft < element.scrollWidth - element.clientWidth
      );
    }
  };

  useEffect(() => {
    checkScrollIndicators();
    const element = scrollRef.current;
    if (element) {
      element.addEventListener('scroll', checkScrollIndicators);
      window.addEventListener('resize', checkScrollIndicators);
      return () => {
        element.removeEventListener('scroll', checkScrollIndicators);
        window.removeEventListener('resize', checkScrollIndicators);
      };
    }
  }, [data]);

  const scrollLeft = () => {
    scrollRef.current?.scrollBy({ left: -200, behavior: 'smooth' });
  };

  const scrollRight = () => {
    scrollRef.current?.scrollBy({ left: 200, behavior: 'smooth' });
  };

  // Professional Loading State
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 space-y-4">
        <div className="relative">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <div className="absolute inset-0 w-8 h-8 border-2 border-primary/20 rounded-full animate-pulse"></div>
        </div>
        <div className="text-center space-y-2">
          <p className="text-lg font-medium text-foreground">Loading Courses</p>
          <p className="text-sm text-muted-foreground">Discovering amazing learning opportunities...</p>
        </div>
        {/* Loading skeleton for menu */}
        <div className="flex gap-2 mt-8">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-10 w-20 bg-muted/50 rounded-full animate-pulse"
              style={{ animationDelay: `${i * 0.1}s` }}
            ></div>
          ))}
        </div>
      </div>
    );
  }

  // Professional Error State
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16 space-y-6">
        <div className="relative">
          <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-destructive" />
          </div>
          <div className="absolute -inset-2 bg-destructive/5 rounded-full animate-pulse"></div>
        </div>
        <div className="text-center space-y-3 max-w-md">
          <h3 className="text-xl font-semibold text-foreground">Unable to Load Courses</h3>
          <p className="text-muted-foreground leading-relaxed">
            We're having trouble connecting to our course database. Please check your internet connection and try again.
          </p>
        </div>
        <button 
          onClick={() => window.location.reload()}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors duration-200 font-medium"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Try Again
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="w-full px-4 sm:py-4">
        <div className="relative">
          {/* Left scroll indicator */}
          {showLeftIndicator && (
            <button
              onClick={scrollLeft}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-background/80 backdrop-blur-sm border border-border rounded-full p-1 shadow-lg hover:bg-background/90 transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}
          
          {/* Right scroll indicator */}
          {showRightIndicator && (
            <button
              onClick={scrollRight}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-background/80 backdrop-blur-sm border border-border rounded-full p-1 shadow-lg hover:bg-background/90 transition-all"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          )}

          <div 
            ref={scrollRef}
            className="max-w-full overflow-x-auto scrollbar-hide scroll-smooth"
          >
            <div className="flex gap-1 sm:gap-2 bg-muted/50 backdrop-blur-sm rounded-full p-1 sm:p-1.5 border border-border/50 w-fit mx-auto min-w-min">
              {categories.map((item) => (
                <button
                  key={item}
                  onClick={() => setMenu(item)}
                  className={`
                    relative px-2 xs:px-3 sm:px-4 md:px-6 py-1.5 xs:py-2 sm:py-2.5 rounded-full font-medium text-xs sm:text-sm transition-all duration-300 ease-in-out
                    whitespace-nowrap flex-shrink-0
                    ${menu === item 
                      ? 'text-foreground bg-primary shadow-lg shadow-primary/25 scale-105' 
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/80 hover:scale-102'
                    }
                    transform hover:shadow-md active:scale-95
                  `}
                >
                  <span className="relative z-10">{item}</span>
                  {menu === item && (
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-primary/20 rounded-full animate-pulse" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Gradient fade indicators (alternative visual cue) */}
          {showLeftIndicator && (
            <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-background to-transparent pointer-events-none z-[5]" />
          )}
          {showRightIndicator && (
            <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-background to-transparent pointer-events-none z-[5]" />
          )}
        </div>
      </div>
      
      <div className="mt-3">
        <ChromaGrid
          courses={courses}
          radius={300}
          damping={0.45}
          fadeOut={0.6}
          ease="power3.out"
        />
      </div>
        
    </>
  )
}

export default RandomCourse