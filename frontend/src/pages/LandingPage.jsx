import { NavLink } from "react-router-dom"
import { Separator } from "@/components/ui/separator"
import Feature from "../components/Feature"
import RandomCourse from "../components/RandomCourse"
import { useEffect, useRef } from "react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger);

const LandingPage = () => {
  const separator1Ref = useRef(null);
  const separator2Ref = useRef(null);

  useEffect(() => {
    
    if (separator1Ref.current) {
      const flowElement = separator1Ref.current.querySelector('.flow-element');
      
      gsap.set(flowElement, { x: "-100%", opacity: 0 });
      
      gsap.to(flowElement, {
        x: "600%",
        opacity: 1,
        duration: 3,
        ease: "power2.inOut",
        repeat: -1,
        repeatDelay: 1,
        keyframes: [
          { opacity: 0, duration: 0 },
          { opacity: 1, duration: 0.5 },
          { opacity: 1, duration: 2 },
          { opacity: 0, duration: 0.5 }
        ]
      });
    }

    
    if (separator2Ref.current) {
      const flowElement = separator2Ref.current.querySelector('.flow-element');
      
      gsap.set(flowElement, { x: "-100%", opacity: 0 });
      
      gsap.to(flowElement, {
        x: "600%",
        opacity: 1,
        duration: 3,
        ease: "power2.inOut",
        repeat: -1,
        repeatDelay: 1,
        keyframes: [
          { opacity: 0, duration: 0 },
          { opacity: 1, duration: 0.5 },
          { opacity: 1, duration: 2 },
          { opacity: 0, duration: 0.5 }
        ]
      });
    }

  }, []);

  return (
    <div className="min-h-screen">
      
      <header className="flex justify-between items-center py-3 px-5 sm:py-6 sm:px-28 bg-foreground/5 backdrop-blur-md fixed top-0 left-0 right-0 z-50">

          <div className="flex justify-center items-center gap-3">
              
            <h2 className="text-md md:text-2xl sm:text-2xl font-semibold tracking-widest">WISE</h2>
          </div>
            
          <div className="flex justify-center items-center gap-1 sm:gap-5">
              <NavLink className={({isActive}) => `text-sm sm:tracking-widest px-3.5 py-1.5 rounded-md hover:bg-secondary hover:underline transition duration-300 ${isActive}`} to='/sign-in'>Login</NavLink>
          </div>
      </header>
     
      <div className="flex justify-center items-center flex-col gap-5 text-center pt-25 sm:pt-30 md:pt-45 md:pb-10 mx-auto">
        <h1 className="text-2xl px-2 leading-10 tracking-wide md:px-0 md:text-4xl lg:text-5xl md:tracking-normal font-bold md:mb-5"><span className="text-primary">Learning</span> Without Limits</h1>
        <div className="w-[90%] xl:w-[60%] flex justify-center items-center flex-col mt-5 gap-6">
          <div>
            <img src="PSU_LOGO.png" alt="" className="w-40 h-40" />
          </div>
          <p className="text-sm md:text-base lg:text-lg font-light leading-6 md:leading-7 mt-3">WISE is Partido State University’s dedicated platform for accessible, modern, and skill-focused education. Explore, enroll, and excel in micro-credential courses designed to prepare you for today’s dynamic world.
          </p>
        </div>
        <div className="mt-6 md:mt-8">
          <button className="group relative inline-flex items-center justify-center px-6 py-3 text-base md:text-lg font-medium text-white bg-gradient-to-r from-primary to-primary/80 rounded-lg shadow-lg hover:shadow-xl hover:shadow-primary/25 transition-all duration-300 ease-out hover:scale-105 active:scale-95 overflow-hidden">
            <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
            <span className="relative z-10 flex items-center gap-2">
              Get Started
              <svg 
                className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </span>
          </button>
        </div>
      </div>
      
      
   
      <div ref={separator1Ref} className="relative py-16 sm:py-20 overflow-hidden">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full h-px bg-gradient-to-r from-transparent via-muted-foreground/20 to-transparent"></div>
        </div>
        <div className="relative flex justify-center">
          <div className="relative overflow-hidden">
            <div className="bg-gradient-to-r from-primary/20 via-primary/40 to-primary/20 h-px w-32 sm:w-48"></div>
            <div className="flow-element absolute top-0 left-0 h-px w-8 bg-gradient-to-r from-transparent via-primary to-transparent"></div>
          </div>
        </div>
      </div>
      
    
      <div className="flex justify-center items-center flex-col">
        <h2 className="text-xl md:text-2xl font-bold">Unlock Your Potential with WISE</h2>
        <div className="mt-16 flex justify-center items-center flex-wrap gap-10 mx-14">
          <Feature/>
        </div>
      </div>


      <div className="flex justify-center items-center flex-col mt-20 md:mt-28 lg:mt-32">
        <h1 className="font-bold text-2xl mb-8">Discover Courses</h1>
        <RandomCourse/>
      </div>

      
      <div ref={separator2Ref} className="relative py-16 sm:py-20 overflow-hidden">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full h-px bg-gradient-to-r from-transparent via-muted-foreground/20 to-transparent"></div>
        </div>
        <div className="relative flex justify-center">
          <div className="relative overflow-hidden">
            <div className="bg-gradient-to-r from-primary/20 via-primary/40 to-primary/20 h-px w-32 sm:w-48"></div>
            <div className="flow-element absolute top-0 left-0 h-px w-8 bg-gradient-to-r from-transparent via-primary to-transparent"></div>
          </div>
        </div>
      </div>
     
        
    </div>
  )
}

export default LandingPage