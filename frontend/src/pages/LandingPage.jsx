import { NavLink } from "react-router-dom"
import { Separator } from "@/components/ui/separator"
import Feature from "../components/Feature"

const LandingPage = () => {

  return (
    <div className="min-h-screen">
      
      <header className="flex justify-between items-center py-3 px-5 sm:py-6 sm:px-28 bg-foreground/5 backdrop-blur-md fixed top-0 left-0 right-0 z-50">

          <div className="flex justify-center items-center gap-3">
              
            <h2 className="text-md md:text-2xl sm:text-2xl font-semibold tracking-widest">WISE</h2>
          </div>
            
          <div className="flex justify-center items-center gap-1 sm:gap-5">
              <NavLink className={({isActive}) => `text-sm sm:tracking-widest px-3.5 py-1.5 rounded-md hover:bg-secondary hover:underline transition duration-300 ${isActive}`} to='/sign-in'>Login</NavLink>
              <NavLink className={({isActive}) => `text-sm sm:tracking-widest bg-primary px-3.5 py-1.5 rounded-md hover:bg-primary-foreground transition duration-300  ${isActive}`} to='/sign-up'>Sign up</NavLink>
          </div>
      </header>
     
      <div className="flex justify-center items-center flex-col gap-5 text-center pt-25 sm:pt-30 md:pt-45 md:pb-10">
        <h1 className="text-3xl px-2 leading-14 tracking-wide md:px-0 md:leading-0 md:text-6xl md:tracking-normal font-bold md:mb-5"><span className="text-primary">Learning</span> Without Limits</h1>
        <div className="w-[90%] xl:w-[60%] flex justify-center items-center flex-col mt-5 gap-6">
          <h3 className="text-xl md:text-2xl font-medium">Welcome to WISE</h3>
          <p className="text-md md:text-lg font-light leading-8 md:leading-10 mt-3">Designed exclusively for Partido State University. WISE offers a modern, accessible platform where students can explore and enroll in micro-credential courses across various fields.
          </p>
        </div>
        <div className="mt-3 md:mt-5">
          <button className="text-lg md:text-xl bg-primary px-6 py-3 rounded-sm">Get Started</button>
        </div>
      </div>
      
      
      <Separator className="my-8 h-1 w-full mx-auto" />
      
    
      <div className="flex justify-center items-center flex-col">
        <h2 className="text-2xl font-bold">Learn the WISE Way</h2>
        <div className="flex justify-center items-center flex-wrap gap-10 mt-5 mx-14">
          <Feature/>
        </div>
      </div>


      <Separator className="my-8 h-1 w-full mx-auto" />
        
    </div>
  )
}

export default LandingPage