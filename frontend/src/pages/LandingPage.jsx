import { NavLink } from "react-router-dom"
import { Separator } from "@/components/ui/separator"

const LandingPage = () => {


    

  


  return (
    <div className="min-h-screen">
      
      <header className="flex justify-around items-center py-7 bg-foreground/5 backdrop-blur-md fixed top-0 left-0 right-0 z-50">

          <div className="flex justify-center items-center gap-3">
              
            <h2 className="text-3xl font-semibold tracking-widest">WISE</h2>
          </div>
            
          <div className="flex justify-center items-center gap-5">
              <NavLink className={({isActive}) => `tracking-widest px-3.5 py-1.5 rounded-md hover:bg-secondary hover:underline transition duration-300 ${isActive}`} to='/sign-in'>Login</NavLink>
              <NavLink className={({isActive}) => `tracking-widest bg-primary px-3.5 py-1.5 rounded-md hover:bg-primary-foreground transition duration-300  ${isActive}`} to='/sign-up'>Sign up</NavLink>
          </div>
      </header>
     
      <div className="flex justify-center items-center flex-col gap-5 text-center pt-40 pb-10">
        <h1 className="text-5xl font-bold"><span className="text-primary">Learning</span> Without Limits</h1>
        <div className="w-[60%] flex justify-center items-center flex-col mt-5 gap-4">
          <h3 className="text-2xl font-semibold">Welcome to WISE</h3>
          <p className="text-lg leading-10 mt-3">Designed exclusively for Partido State University. WISE offers a modern, accessible platform where students can explore and enroll in micro-credential courses across various fields.
          </p>
        </div>
        <div className="mt-3">
          <button className="text-2xl bg-primary px-8 py-2 rounded-sm">Get Started</button>
        </div>
      </div>
      
      
      <Separator className="my-8 h-1 w-full mx-auto" />
      
    
      <div className=" my-15 flex justify-center items-center flex-col w-[65%] mx-auto">
        <h2 className="text-2xl font-bold">Learn the WISE Way</h2>
        <div className="flex w-full gap-10 mt-5">
          <div className="flex-1 flex justify-center items-center flex-col bg-secondary py-7 px-3 gap-5 hover:bg-secondary/80">
            <h3 className="font-semibold text-lg">Free Courses</h3>
            <p className="text-center font-light">Join best courses without paying anything and lifetime access.</p>
          </div>
          <div className="flex-1 flex justify-center items-center flex-col bg-secondary py-7 px-3 gap-3.5 hover:bg-secondary/80">
            <h3 className="font-semibold text-lg">Expert Instructor</h3>
            <p className="text-center font-light">Learn from industry leaders and experienced educators.</p>
          </div>
          <div className=" flex-1 flex justify-center items-center flex-col bg-secondary py-7 px-3 gap-3.5 hover:bg-secondary/80">
            <h3 className="font-semibold text-lg">Flexible Learning</h3>
            <p className="text-center font-light">Access courses anytime, anywhere, on any device.</p>
          </div>
        </div>
      </div>


      <Separator className="my-8 h-1 w-full mx-auto" />
        
    </div>
  )
}

export default LandingPage