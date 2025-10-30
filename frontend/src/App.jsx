import { Route, Routes, useLocation } from "react-router-dom"
import { useEffect } from "react"
import SignIn from "./pages/SignIn"
import LandingPage from "./pages/LandingPage"
import AuthCallbackPage from "./pages/AuthCallbackPage"
import SSOCallbackPage from "./pages/SSOCallbackPage"
import ProtectedRoute from "./components/ProtectedRoute"
import RoleProtectedRoute from "./components/RoleProtectedRoute"
import RedirectIfSignedIn from "./components/RedirectIfSignedIn"
import Courses from "./pages/admin/course/Courses"
import CreateCourse from "./pages/admin/course/CreateCourse"
import CourseDetail from "./components/CourseDetail"
import EditCourse from "./pages/admin/course/EditCourse"
import Analytics from "./pages/admin/analytics/Analytics"
import FacultyManagement from "./pages/admin/userManagement/FacultyManagement"
import FacultyInfo from "./pages/admin/userManagement/FacultyInfo"
import SearchResults from "./pages/admin/SearchResults"
import MainLayout from "./pages/MainLayout"
import HomePage from "./pages/student/home/HomePage"
import CoursePage from "./pages/student/home/CoursePage"
import FacultyHomePage from "./pages/faculty/FacultyHomePage"
import StudentInfo from "./pages/admin/userManagement/StudentInfo"
import StudentManagement from "./pages/admin/userManagement/StudentManagement"
import MyCourses from "./pages/student/MyCourses"
import VerifyCertificate from "./pages/VerifyCertificate"

const App = () => {
  const location = useLocation();

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className="overflow-hidden">

      <Routes>
        <Route path="/" element={
          <RedirectIfSignedIn>
            <LandingPage/>
          </RedirectIfSignedIn>
        }/>

        <Route path="/sign-in" element={
          <RedirectIfSignedIn>
            <SignIn/>
          </RedirectIfSignedIn>
        }/>

        <Route path="/sso-callback" element={<SSOCallbackPage/>}/>
        <Route path="/auth-callback" element={<AuthCallbackPage/>}/>
        
        {/* Public certificate verification route - no auth required */}
        <Route path="/verify" element={<VerifyCertificate/>}/>

        {/* Admin Routes - Only accessible by ADMIN */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <RoleProtectedRoute allowedRoles={['ADMIN']}>
                <MainLayout />
              </RoleProtectedRoute>
            </ProtectedRoute>
          }
        >
          <Route index element={<Analytics/>}/>
          <Route path="analytics" element={<Analytics/>}/>
          <Route path="search" element={<SearchResults/>}/>
          <Route path="courses" element={<Courses/>}/>
          <Route path="courses/create" element={<CreateCourse/>}/>
          <Route path="courses/view/:id" element={<CourseDetail/>}/>
          <Route path="courses/edit/:id" element={<EditCourse/>}/>
          <Route path="faculty-management" element={<FacultyManagement/>}/>
          <Route path="faculty-management/view/:id" element={<FacultyInfo/>}/>
          <Route path="student-management" element={<StudentManagement/>}/>
          <Route path="student-management/view/:id" element={<StudentInfo/>}/>
        </Route>

        {/* Student Routes - Only accessible by STUDENT */}
        <Route 
          path="/student"
          element={
            <ProtectedRoute>
              <RoleProtectedRoute allowedRoles={['STUDENT']}>
                <MainLayout/>
              </RoleProtectedRoute>
            </ProtectedRoute>
          }
        >
          <Route index element={<HomePage/>}/>
          <Route path="student-homepage" element={<HomePage/>}/>
          <Route path="homepage/:id/selected-course" element={<CoursePage/>}/>
          <Route path="my-courses" element={<MyCourses/>}/>
        </Route>

        {/* Faculty Routes - Only accessible by FACULTY and ADMIN */}
        <Route 
          path="/faculty"
          element={
            <ProtectedRoute>
              <RoleProtectedRoute allowedRoles={['FACULTY', 'ADMIN']}>
                <MainLayout/>
              </RoleProtectedRoute>
            </ProtectedRoute>
          }
        >
          <Route index element={<FacultyHomePage/>}/>
          <Route path="faculty-homepage" element={<FacultyHomePage/>}/>
        </Route>
      </Routes>
      
    </div>
  )
}

export default App