import { NavLink, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardHeader, CardContent } from "@/components/ui/card"
import RandomCourse from "../components/RandomCourse"
import { useRef } from "react"
import { ArrowRight, GraduationCap, Sparkles, Users, BookOpen, Award, Target, Zap, Globe, Youtube, Facebook, UserCheck, Lightbulb, Clock } from "lucide-react"

const LandingPage = () => {
  const heroRef = useRef(null);
  const floatingElementsRef = useRef(null);
  const navigate = useNavigate();

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
      <header className="fixed top-0 left-0 w-full z-50 border-b border-border/20 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-all duration-700">
        <div className="container mx-auto flex h-16 sm:h-20 items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Brand as Logo */}
          <NavLink to="/" className="group select-none flex-shrink-0">
            <span
              className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight uppercase transition-transform group-hover:scale-105
                bg-gradient-to-r from-primary via-blue-600 to-foreground bg-clip-text text-transparent"
              style={{
                letterSpacing: '0.06em',
                fontFamily: 'Montserrat, Inter, Arial, sans-serif'
              }}
            >
              WISE
            </span>
          </NavLink>
          {/* Navigation */}
          <nav className="flex items-center">
            <Button
              asChild
              className="relative overflow-hidden font-semibold transition-all duration-200 rounded-lg px-4 sm:px-6 py-2 sm:py-2.5 text-sm sm:text-base bg-primary text-primary-foreground hover:bg-primary/90 shadow-md hover:shadow-lg active:scale-95"
            >
              <NavLink to="/sign-in">
                <span className="relative z-10">Login</span>
              </NavLink>
            </Button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section
        className="w-full flex items-center justify-center pt-20 sm:pt-24 pb-12 sm:pb-16 px-4 sm:px-6"
        // style={{ minHeight: 'calc(100vh - 0rem)' }}
      >
        <div
          ref={heroRef}
          className="flex flex-col items-center justify-center w-full max-w-3xl mx-auto space-y-6 sm:space-y-8 text-center"
        >
          <Badge variant="secondary" className="text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2 transition-all duration-700">
            <Sparkles className="mr-1.5 h-3.5 w-3.5" />
            Partido State University Platform
          </Badge>
          
          <div className="space-y-3 sm:space-y-4 transition-all duration-700">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-tight">
              <span className="bg-gradient-to-br from-foreground via-foreground to-foreground/40 bg-clip-text text-transparent">
                Learning
              </span>{" "}
              <span className="bg-gradient-to-br from-primary to-primary/60 bg-clip-text text-transparent">
                Without Limits
              </span>
            </h1>
          </div>

          <p className="mx-auto max-w-2xl text-base sm:text-lg text-muted-foreground leading-relaxed">
            WISE is designed to enhance teaching and learning through digital courses, interactive assessments, and performance tracking. It provides educators with tools to manage content and monitor student progress, while giving learners convenient access to lessons, quizzes, and discussions anytime, anywhere.
          </p>

          {/* School Logo */}
          <div className="flex items-center justify-center my-4 sm:my-8">
            <img 
              src="PSU_LOGO.png" 
              alt="PSU Logo" 
              className="h-24 w-24 sm:h-32 sm:w-32 md:h-40 md:w-40 object-contain" 
            />
          </div>

          <Button
            onClick={() => navigate('/sign-in')}
            className="px-6 sm:px-8 py-2.5 sm:py-3 text-base sm:text-lg font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95"
          >
            Get Started
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section className="w-full px-4 sm:px-6 lg:px-8 py-4 lg:py-32 bg-gradient-to-b from-transparent to-muted/30">
        <div className="container mx-auto max-w-6xl">
          {/* Section Header */}
          <div className="text-center space-y-3 sm:space-y-4 mb-10 sm:mb-14 lg:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight">
              <span className="bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                Unlock Your Potential
              </span>
              <br />
              <span className="bg-gradient-to-r from-primary via-blue-600 to-primary/80 bg-clip-text text-transparent">
                with WISE
              </span>
            </h2>
            <p className="mx-auto max-w-2xl text-sm sm:text-base text-muted-foreground leading-relaxed">
              Discover the features that make WISE the perfect platform for your learning journey
            </p>
          </div>

          {/* Feature Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Community Support Card */}
            <Card className="group relative overflow-hidden border transition-all duration-300 bg-background hover:border-primary/50 hover:shadow-lg">
              <CardHeader className="pb-3 sm:pb-4">
                <div className="flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-blue-500/10 mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Users className="h-6 w-6 sm:h-7 sm:w-7 text-blue-600" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-foreground group-hover:text-primary transition-colors duration-300">
                  Community Support
                </h3>
              </CardHeader>
              <CardContent>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                  Connect with peers, mentors, and instructors for guidance and collaboration.
                </p>
              </CardContent>
            </Card>

            {/* Expert Instructor Card */}
            <Card className="group relative overflow-hidden border transition-all duration-300 bg-background hover:border-primary/50 hover:shadow-lg">
              <CardHeader className="pb-3 sm:pb-4">
                <div className="flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-emerald-500/10 mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300">
                  <UserCheck className="h-6 w-6 sm:h-7 sm:w-7 text-emerald-600" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-foreground group-hover:text-primary transition-colors duration-300">
                  Expert Instructors
                </h3>
              </CardHeader>
              <CardContent>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                  Learn from industry leaders and experienced educators bringing real-world expertise.
                </p>
              </CardContent>
            </Card>

            {/* Flexible Learning Card */}
            <Card className="group relative overflow-hidden border transition-all duration-300 bg-background sm:col-span-2 lg:col-span-1 hover:border-primary/50 hover:shadow-lg">
              <CardHeader className="pb-3 sm:pb-4">
                <div className="flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-purple-500/10 mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Clock className="h-6 w-6 sm:h-7 sm:w-7 text-purple-600" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-foreground group-hover:text-primary transition-colors duration-300">
                  Flexible Learning
                </h3>
              </CardHeader>
              <CardContent>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                  Access courses anytime, anywhere, on any device with our responsive platform.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Courses Section */}
      <section className="w-full px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="container mx-auto max-w-4xl space-y-6 sm:space-y-8 text-center">
          <div className="space-y-2 sm:space-y-3">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight">
              Discover Courses
            </h2>
            <p className="mx-auto text-sm sm:text-base text-muted-foreground">
              Explore our curated selection of courses designed to advance your skills
            </p>
          </div>
          <div className="mt-8 sm:mt-10 transition-all duration-700">
            <RandomCourse />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-muted/30 relative z-10 transition-all duration-700">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
          <div className="max-w-7xl mx-auto">
            {/* Main Footer Content */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-12 mb-8 sm:mb-12">
              {/* Brand Section */}
              <div className="flex flex-col items-center md:items-start text-center md:text-left">
                <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                  <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                    <GraduationCap className="h-5 w-5 sm:h-6 sm:w-6" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold">WISE</h3>
                </div>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                  Partido State University's platform for accessible, modern, and skill-focused education.
                </p>
              </div>

              {/* Social Media Section */}
              <div className="flex flex-col items-center text-center">
                <h4 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-5">Follow Us</h4>
                <div className="flex justify-center gap-3 sm:gap-4 mb-4">
                  <Button variant="outline" size="icon" asChild className="rounded-lg hover:bg-red-500 hover:text-white hover:border-red-500 transition-all hover:scale-110">
                    <a href="https://www.youtube.com/@WiseLearningPlatform" target="_blank" rel="noopener noreferrer" aria-label="YouTube">
                      <Youtube className="h-5 w-5 sm:h-6 sm:w-6" />
                    </a>
                  </Button>
                  <Button variant="outline" size="icon" asChild className="rounded-lg hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all hover:scale-110">
                    <a href="https://www.facebook.com/share/1BTHYYTNtX/" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                      <Facebook className="h-5 w-5 sm:h-6 sm:w-6" />
                    </a>
                  </Button>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Stay updated with our latest courses
                </p>
              </div>

              {/* Quick Links Section */}
              <div className="flex flex-col items-center md:items-end text-center md:text-right">
                <h4 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-5">Quick Links</h4>
                <nav className="flex flex-col gap-2 sm:gap-3">
                  <a href="#" className="text-sm sm:text-base text-muted-foreground hover:text-foreground transition-colors">Privacy Policy</a>
                  <a href="#" className="text-sm sm:text-base text-muted-foreground hover:text-foreground transition-colors">Terms of Service</a>
                  <a href="#" className="text-sm sm:text-base text-muted-foreground hover:text-foreground transition-colors">Contact Us</a>
                </nav>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-border/40 my-6 sm:my-8"></div>

            {/* Copyright Section */}
            <div className="flex flex-col sm:flex-row justify-center sm:justify-between items-center gap-3 sm:gap-4 text-center sm:text-left">
              <p className="text-xs sm:text-sm text-muted-foreground">
                © 2025 Partido State University. All rights reserved.
              </p>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Made with <span className="text-red-500">❤</span> for learners
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage