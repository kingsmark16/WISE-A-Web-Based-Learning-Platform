import { Route, Routes, useLocation } from "react-router-dom"
import { useEffect } from "react"
import SignIn from "./pages/SignIn"
import LandingPage from "./pages/LandingPage"
import AuthCallbackPage from "./pages/AuthCallbackPage"
import SSOCallbackPage from "./pages/SSOCallbackPage"
import ProtectedRoute from "./components/ProtectedRoute"
import RedirectIfSignedIn from "./components/RedirectIfSignedIn"
import Courses from "./pages/admin/course/Courses"
import CreateCourse from "./pages/admin/course/CreateCourse"
import CourseDetail from "./components/CourseDetail"
import EditCourse from "./pages/admin/course/EditCourse"
import Analytics from "./pages/admin/analytics/Analytics"
import FacultyManagement from "./pages/admin/userManagement/FacultyManagement"
import FacultyInfo from "./pages/admin/userManagement/FacultyInfo"
import MainLayout from "./pages/MainLayout"
import HomePage from "./pages/student/HomePage"
import CoursePage from "./pages/student/CoursePage"
import FacultyHomePage from "./pages/faculty/FacultyHomePage"
import StudentInfo from "./pages/admin/userManagement/StudentInfo"
import StudentManagement from "./pages/admin/userManagement/StudentManagement"

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

        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Analytics/>}/>
          <Route path="analytics" element={<Analytics/>}/>
          <Route path="courses" element={<Courses/>}/>
          <Route path="courses/create" element={<CreateCourse/>}/>
          <Route path= "courses/view/:id" element={<CourseDetail/>}/>
          <Route path="courses/edit/:id" element={<EditCourse/>}/>
          <Route path="faculty-management" element={<FacultyManagement/>}/>
          <Route path="faculty-management/view/:id" element={<FacultyInfo/>}/>
          <Route path="student-management" element={<StudentManagement/>}/>
          <Route path="student-management/view/:id" element={<StudentInfo/>}/>

        </Route>

        <Route 
          path="/student"
          element={
            <ProtectedRoute>
              <MainLayout/>
            </ProtectedRoute>
          }
        >
          <Route index element={<HomePage/>}/>
          <Route path="homepage" element={<HomePage/>}/>
          <Route path="homepage/:id/selected-course" element={<CoursePage/>}/>


        </Route>
        <Route 
          path="/faculty"
          element={
            <ProtectedRoute>
              <MainLayout/>
            </ProtectedRoute>
          }
        >
          <Route index element={<FacultyHomePage/>}/>
          <Route path="homepage" element={<FacultyHomePage/>}/>

        </Route>
        

      </Routes>
      
    </div>
  )
}

export default App