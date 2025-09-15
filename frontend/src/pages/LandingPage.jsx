import { NavLink } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import RandomCourse from "../components/RandomCourse"
import { useRef } from "react"
import { ArrowRight, GraduationCap, Sparkles, Users, BookOpen, Award, Target, Zap, Globe, Youtube, Facebook } from "lucide-react"

const LandingPage = () => {
  const heroRef = useRef(null);
  const floatingElementsRef = useRef(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 overflow-x-hidden transition-colors duration-700">
      {/* Floating Background Elements */}
      <div ref={floatingElementsRef} className="fixed inset-0 pointer-events-none z-0">
        {/* BookOpen - Top Left */}
        <div className="floating-element absolute top-26 left-4 sm:top-29 sm:left-10 lg:top-35 lg:left-16 opacity-20 sm:opacity-25 lg:opacity-30 transition-all duration-700">
          <BookOpen className="h-8 w-8 sm:h-12 sm:w-12 md:h-14 md:w-14 lg:h-16 lg:w-16 text-primary" />
        </div>
        {/* Award - Top Right */}
        <div className="floating-element absolute top-24 right-4 sm:top-32 sm:right-12 md:top-40 md:right-16 lg:top-40 lg:right-20 opacity-15 sm:opacity-20 lg:opacity-25 transition-all duration-700">
          <Award className="h-6 w-6 sm:h-8 sm:w-8 md:h-10 md:w-10 lg:h-12 lg:w-12 text-primary" />
        </div>
        {/* Target - Bottom Left */}
        <div className="floating-element absolute bottom-32 left-4 sm:bottom-36 sm:left-8 md:bottom-40 md:left-12 lg:bottom-40 lg:left-20 opacity-20 sm:opacity-25 lg:opacity-30 transition-all duration-700">
          <Target className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 lg:h-14 lg:w-14 text-primary" />
        </div>
        {/* Zap - Bottom Right */}
        <div className="floating-element absolute bottom-16 right-4 sm:bottom-20 sm:right-8 md:bottom-24 md:right-12 lg:bottom-20 lg:right-10 opacity-15 sm:opacity-20 lg:opacity-25 transition-all duration-700">
          <Zap className="h-6 w-6 sm:h-8 sm:w-8 md:h-9 md:w-9 lg:h-10 lg:w-10 text-primary" />
        </div>
        {/* Globe - Center Left (Hidden on mobile) */}
        <div className="floating-element absolute top-1/2 left-1/6 hidden sm:block md:left-1/5 lg:left-1/4 opacity-10 sm:opacity-15 lg:opacity-20 transition-all duration-700">
          <Globe className="h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16 lg:h-20 lg:w-20 text-primary" />
        </div>
        {/* Users - Center Right (Hidden on mobile) */}
        <div className="floating-element absolute top-1/3 right-1/6 hidden sm:block md:right-1/5 lg:right-1/4 opacity-10 sm:opacity-15 lg:opacity-20 transition-all duration-700">
          <Users className="h-10 w-10 sm:h-12 sm:w-12 md:h-14 md:w-14 lg:h-16 lg:w-16 xl:h-18 xl:w-18 text-primary" />
        </div>
        {/* Additional elements for larger screens */}
        <div className="floating-element absolute top-3/4 left-1/3 hidden lg:block opacity-10 transition-all duration-700">
          <Sparkles className="h-8 w-8 lg:h-10 lg:w-10 text-primary" />
        </div>
        <div className="floating-element absolute top-1/6 right-1/3 hidden lg:block opacity-10 transition-all duration-700">
          <GraduationCap className="h-10 w-10 lg:h-12 lg:w-12 text-primary" />
        </div>
        {/* Small decorative elements for mobile */}
        <div className="floating-element absolute top-1/4 left-1/2 block sm:hidden opacity-15 transition-all duration-700">
          <div className="h-2 w-2 rounded-full bg-primary"></div>
        </div>
        <div className="floating-element absolute bottom-1/4 right-1/3 block sm:hidden opacity-15 transition-all duration-700">
          <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
        </div>
        <div className="floating-element absolute top-2/3 left-1/4 block sm:hidden opacity-10 transition-all duration-700">
          <div className="h-1 w-1 rounded-full bg-primary"></div>
        </div>
        {/* More figures for mobile */}
        <div className="floating-element absolute top-8 right-8 block sm:hidden opacity-20 transition-all duration-700">
          <Award className="h-6 w-6 text-primary" />
        </div>
        <div className="floating-element absolute bottom-8 left-8 block sm:hidden opacity-20 transition-all duration-700">
          <BookOpen className="h-6 w-6 text-primary" />
        </div>
        <div className="floating-element absolute top-1/2 right-6 block sm:hidden opacity-15 transition-all duration-700">
          <Zap className="h-5 w-5 text-primary" />
        </div>
        <div className="floating-element absolute bottom-1/2 left-6 block sm:hidden opacity-15 transition-all duration-700">
          <Target className="h-5 w-5 text-primary" />
        </div>
        <div className="floating-element absolute top-1/3 left-10 block sm:hidden opacity-10 transition-all duration-700">
          <Sparkles className="h-4 w-4 text-primary" />
        </div>
        <div className="floating-element absolute bottom-1/3 right-10 block sm:hidden opacity-10 transition-all duration-700">
          <GraduationCap className="h-4 w-4 text-primary" />
        </div>
      </div>

      {/* Header */}
      <header className="fixed top-0 left-0 w-full z-50 border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-all duration-700">
        <div className="container mx-auto flex h-20 items-center justify-between px-4 sm:px-8 lg:px-24">
          {/* Brand as Logo */}
          <NavLink to="/" className="group select-none">
            <span
              className="text-2xl sm:text-3xl md:text-4xl lg:text-4xl font-extrabold tracking-tight uppercase transition-transform group-hover:scale-105
                bg-gradient-to-r from-primary via-blue-600 to-foreground bg-clip-text text-transparent drop-shadow-lg"
              style={{
                letterSpacing: '0.08em',
                fontFamily: 'Montserrat, Inter, Arial, sans-serif'
              }}
            >
              WISE
            </span>
          </NavLink>
          {/* Navigation */}
          <nav className="flex items-center">
            <Button
              variant="outline"
              size="sm"
              asChild
              className="relative overflow-hidden font-semibold transition-all duration-200
                border-primary rounded-full px-6 py-2 text-sm
                bg-gradient-to-r from-background via-muted to-background
                hover:bg-primary hover:text-primary
                focus:bg-primary focus:text-primary
                active:bg-primary active:text-primary
                focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2
                shadow-sm hover:shadow-lg active:shadow-lg group w-full sm:w-auto"
            >
              <NavLink
                to="/sign-in"
                className="flex items-center justify-center w-full h-full transition-colors duration-200 group-hover:text-primary-foreground group-focus:text-primary-foreground group-active:text-primary-foreground"
              >
                <span className="relative z-10">Login</span>
                {/* Animated background effect */}
                <span className="absolute inset-0 bg-gradient-to-r from-primary/10 to-primary/30 opacity-0 group-hover:opacity-100 group-focus:opacity-100 group-active:opacity-100 transition-opacity duration-300 pointer-events-none rounded-full" />
              </NavLink>
            </Button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section
        className="w-full flex items-center justify-center"
        style={{ minHeight: 'calc(100vh - 1rem)' }}
      >
        <div
          ref={heroRef}
          className="flex flex-col items-center justify-center w-full max-w-2xl mx-auto space-y-4 sm:space-y-6 text-center px-4 sm:px-8"
        >
          <Badge variant="secondary" className="psu-platform-badge mb-2 sm:mb-3 text-xs sm:text-sm transition-all duration-700">
            <Sparkles className="mr-1 sm:mr-2 h-3 w-3" />
            Partido State University Platform
          </Badge>
          
          <div className="space-y-2 sm:space-y-3 transition-all duration-700">
            <h1 className="text-xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight leading-tight">
              <span className="bg-gradient-to-br from-foreground via-foreground to-foreground/40 bg-clip-text text-transparent">
                Learning
              </span>{" "}
              <span className="bg-gradient-to-br from-primary to-primary/60 bg-clip-text text-transparent">
                Without Limits
              </span>
            </h1>
          </div>

          {/* Adjusted space below the heading */}
          <div className="mt-2 sm:mt-4 transition-all duration-700">
            <p className="mx-auto max-w-[300px] sm:max-w-[500px] lg:max-w-[600px] text-xs sm:text-base lg:text-lg text-muted-foreground leading-relaxed">
              WISE is Partido State University's dedicated platform for accessible, modern, and skill-focused education. 
              Explore, enroll, and excel in micro-credential courses designed for today's dynamic world.
            </p>
          </div>

          {/* School Logo - Bigger and no card */}
          <div className="flex items-center justify-center my-6">
            <img 
              src="PSU_LOGO.png" 
              alt="PSU Logo" 
              className="h-32 w-32 sm:h-40 sm:w-40 lg:h-48 lg:w-48 object-contain" 
            />
          </div>

          <div className="flex flex-col gap-2 sm:gap-3 sm:flex-row w-full sm:w-auto">
            <Button
              variant="outline"
              size="sm"
              className="relative overflow-hidden font-semibold transition-all duration-200
                border-primary rounded-full px-10 py-5 text-base
                bg-gradient-to-r from-background via-muted to-background
                hover:bg-primary hover:text-primary
                focus:bg-primary focus:text-primary
                active:bg-primary active:text-primary
                focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2
                shadow-sm hover:shadow-lg active:shadow-lg group sm:w-auto"
            >
              <span className="relative z-10">Get Started</span>
              <span className="absolute inset-0 bg-gradient-to-r from-primary/10 to-primary/30 opacity-0 group-hover:opacity-100 group-focus:opacity-100 group-active:opacity-100 transition-opacity duration-300 pointer-events-none rounded-full" />
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="w-full flex items-center justify-center py-12 sm:py-16 px-4 sm:px-6 transition-all duration-700">
        <div className="w-full max-w-4xl mx-auto space-y-6 sm:space-y-8 text-center">
          <div className="text-center space-y-3 sm:space-y-4">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">
              Unlock Your Potential with WISE
            </h2>
            <p className="mx-auto max-w-[300px] sm:max-w-[500px] lg:max-w-[600px] text-sm sm:text-base text-muted-foreground">
              Discover the features that make WISE the perfect platform for your learning journey
            </p>
          </div>
          <div className="mt-12 sm:mt-16 flex justify-center w-full">
            {/* Responsive Feature Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full items-center justify-center transition-all duration-700">
              <div className="bg-background/80 rounded-2xl border border-border p-6 flex flex-col items-center transition-all duration-700">
                <h3 className="text-lg sm:text-xl font-bold text-primary mb-2">Free Courses</h3>
                <p className="text-sm sm:text-base text-foreground text-center">
                  Join best courses without paying anything and lifetime access
                </p>
              </div>
              <div className="bg-background/80 rounded-2xl border border-border p-6 flex flex-col items-center transition-all duration-700">
                <h3 className="text-lg sm:text-xl font-bold text-primary mb-2">Expert Instructor</h3>
                <p className="text-sm sm:text-base text-foreground text-center">
                  Learn from industry leaders and experienced educators.
                </p>
              </div>
              <div className="bg-background/80 rounded-2xl border border-border p-6 flex flex-col items-center transition-all duration-700">
                <h3 className="text-lg sm:text-xl font-bold text-primary mb-2">Flexible Learning</h3>
                <p className="text-sm sm:text-base text-foreground text-center">
                  Access courses anytime, anywhere, on any device
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Courses Section */}
      <section className="w-full flex items-center justify-center py-12 sm:py-16 px-4 sm:px-6 transition-all duration-700">
        <div className="w-full max-w-4xl mx-auto space-y-6 sm:space-y-8 text-center">
          <div className="text-center space-y-3 sm:space-y-4">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">
              Discover Courses
            </h2>
            <p className="mx-auto max-w-[300px] sm:max-w-[500px] lg:max-w-[600px] text-sm sm:text-base text-muted-foreground">
              Explore our curated selection of courses designed to advance your skills
            </p>
          </div>
          <div className="mt-12 sm:mt-16 transition-all duration-700">
            <RandomCourse />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-muted/50 relative z-10 transition-all duration-700">
        <div className="container px-4 sm:px-6 py-12 sm:py-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
            {/* Brand Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <GraduationCap className="h-5 w-5" />
                </div>
                <h3 className="text-xl font-bold">WISE</h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Partido State University's dedicated platform for accessible, modern, and skill-focused education.
              </p>
            </div>

            {/* Social Media Section */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold">Follow Us</h4>
              <div className="flex gap-4">
                <Button variant="outline" size="icon" asChild className="hover:bg-red-500 hover:text-white hover:border-red-500 transition-colors">
                  <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" aria-label="YouTube">
                    <Youtube className="h-5 w-5" />
                  </a>
                </Button>
                <Button variant="outline" size="icon" asChild className="hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-colors">
                  <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                    <Facebook className="h-5 w-5" />
                  </a>
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Stay updated with our latest courses and educational content
              </p>
            </div>

            {/* CTA Section */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold">Ready to Start Learning?</h4>
              <p className="text-sm text-muted-foreground">
                Join thousands of students already advancing their careers
              </p>
              <Button className="w-full sm:w-auto">
                Get Started Today
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="mt-12 pt-8 border-t border-border/40">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <p className="text-xs text-muted-foreground">
                © 2024 Partido State University. All rights reserved.
              </p>
              <div className="flex gap-6 text-xs text-muted-foreground">
                <a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a>
                <a href="#" className="hover:text-foreground transition-colors">Terms of Service</a>
                <a href="#" className="hover:text-foreground transition-colors">Contact</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage