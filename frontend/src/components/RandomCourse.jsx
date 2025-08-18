import { useState, useRef, useEffect } from "react";
import { useGetCoursesByCategory } from "../hooks/useGuest";
import ChromaGrid from "./ChromaGrid";
import { ChevronLeft, ChevronRight } from "lucide-react"; // or your preferred icon library

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

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading courses</div>;

  return (
    <>
      <div className="w-full px-4 py-2 sm:py-4">
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
                      ? 'text-primary-foreground bg-primary shadow-lg shadow-primary/25 scale-105' 
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
      
      <div className="mt-10">
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