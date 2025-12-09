import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import { 
  Home, 
  ArrowLeft, 
  BookOpen, 
  GraduationCap, 
  Search,
  BookMarked,
  Award
} from "lucide-react";

const NotFoundPage = () => {
  const navigate = useNavigate();
  const { isSignedIn, user } = useUser();
  const [isHovering, setIsHovering] = useState(false);

  // Generate stable random positions for floating elements
  const floatingBooks = useMemo(() => 
    [...Array(12)].map((_, i) => ({
      id: i,
      size: Math.floor(Math.random() * 12 + 16),
      left: Math.floor(Math.random() * 100),
      top: Math.floor(Math.random() * 100),
      delay: (Math.random() * 4).toFixed(1),
      duration: (Math.random() * 3 + 4).toFixed(1),
    })), []
  );

  // Determine home route based on user role
  const getHomeRoute = () => {
    if (!isSignedIn) return "/";
    const role = user?.publicMetadata?.role;
    if (role === "ADMIN") return "/admin";
    if (role === "FACULTY") return "/faculty";
    return "/student";
  };

  const getHomeLabel = () => {
    if (!isSignedIn) return "Home";
    const role = user?.publicMetadata?.role;
    if (role === "ADMIN") return "Dashboard";
    if (role === "FACULTY") return "My Courses";
    return "My Learning";
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Subtle pattern overlay */}
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      {/* Floating book icons */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {floatingBooks.map((book) => (
          <div
            key={book.id}
            className="absolute text-indigo-200/40"
            style={{
              left: `${book.left}%`,
              top: `${book.top}%`,
              animation: `float ${book.duration}s ease-in-out infinite`,
              animationDelay: `${book.delay}s`,
            }}
          >
            <BookOpen style={{ width: book.size, height: book.size }} />
          </div>
        ))}
      </div>

      {/* Gradient orbs */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200/30 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-indigo-200/30 rounded-full blur-3xl" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-100/20 rounded-full blur-3xl" />

      {/* Main content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-xl w-full text-center">
          
          {/* Icon with animation */}
          <div className="flex justify-center mb-6">
            <div 
              className="relative"
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={() => setIsHovering(false)}
            >
              <div className={`absolute inset-0 bg-indigo-400/20 rounded-full blur-2xl transition-all duration-500 ${isHovering ? 'scale-125' : 'scale-100'}`} />
              <div className={`relative bg-gradient-to-br from-indigo-500 to-blue-600 p-5 rounded-2xl shadow-lg shadow-indigo-500/25 transition-all duration-500 ${isHovering ? 'scale-110 rotate-3' : ''}`}>
                <GraduationCap className="w-12 h-12 text-white" />
              </div>
            </div>
          </div>

          {/* 404 text */}
          <h1 className="text-7xl sm:text-8xl lg:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-700 leading-none mb-4 select-none">
            404
          </h1>

          {/* Card */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border border-white/50 shadow-xl shadow-indigo-100/50">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-800 mb-2">
              Page Not Found
            </h2>
            
            <p className="text-slate-600 text-sm sm:text-base mb-6 max-w-sm mx-auto">
              This lesson seems to be missing from our curriculum. 
              Let's navigate you back to your learning journey.
            </p>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => navigate(-1)}
                className="group flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-all duration-200 hover:scale-[1.02]"
              >
                <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                Go Back
              </button>

              <button
                onClick={() => navigate(getHomeRoute())}
                className="group flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-blue-600 text-white font-medium hover:from-indigo-600 hover:to-blue-700 transition-all duration-200 hover:scale-[1.02] shadow-md shadow-indigo-500/25 hover:shadow-lg hover:shadow-indigo-500/30"
              >
                <Home className="w-4 h-4" />
                {getHomeLabel()}
              </button>
            </div>
          </div>

          {/* Quick links */}
          <div className="mt-6 flex flex-wrap justify-center gap-4 text-sm">
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-1.5 text-slate-500 hover:text-indigo-600 transition-colors"
            >
              <Search className="w-4 h-4" />
              <span>Browse Courses</span>
            </button>
            <button
              onClick={() => navigate("/sign-in")}
              className="flex items-center gap-1.5 text-slate-500 hover:text-indigo-600 transition-colors"
            >
              <BookMarked className="w-4 h-4" />
              <span>Sign In</span>
            </button>
            <button
              onClick={() => navigate("/verify")}
              className="flex items-center gap-1.5 text-slate-500 hover:text-indigo-600 transition-colors"
            >
              <Award className="w-4 h-4" />
              <span>Verify Certificate</span>
            </button>
          </div>

          {/* Decorative line */}
          <div className="mt-8 flex justify-center">
            <div className="w-24 h-1 bg-gradient-to-r from-transparent via-indigo-300 to-transparent rounded-full" />
          </div>
        </div>
      </div>

      {/* CSS for floating animation */}
      <style>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0) rotate(0deg);
            opacity: 0.3;
          }
          50% {
            transform: translateY(-20px) rotate(5deg);
            opacity: 0.5;
          }
        }
      `}</style>
    </div>
  );
};

export default NotFoundPage;
