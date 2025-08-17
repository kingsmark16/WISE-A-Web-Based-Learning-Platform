import { Route, Routes } from "react-router-dom"
import SignIn from "./pages/SignIn"
import LandingPage from "./pages/LandingPage"
import SignUp from "./pages/SignUp"
import AuthCallbackPage from "./pages/AuthCallbackPage"
import Admin from "./pages/admin/Admin"
import SSOCallbackPage from "./pages/SSOCallbackPage"
import ProtectedRoute from "./components/ProtectedRoute"
import RedirectIfSignedIn from "./components/RedirectIfSignedIn"
import Student from "./pages/student/Student"

import Courses from "./pages/admin/course/Courses"
import Analytics from "./pages/admin/Analytics"
import CreateCourse from "./pages/admin/course/CreateCourse"
import CourseDetail from "./components/CourseDetail"
import EditCourse from "./pages/admin/course/EditCourse"



const App = () => {
  return (
    <div>

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

        <Route path="/sign-up" element={
          <RedirectIfSignedIn>
            <SignUp/>
          </RedirectIfSignedIn>
        }/>

        <Route path="/sso-callback" element={<SSOCallbackPage/>}/>
        <Route path="/auth-callback" element={<AuthCallbackPage/>}/>

        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <Admin />
            </ProtectedRoute>
          }
        >
          <Route path="analytics" element={<Analytics/>}/>
          <Route path="courses" element={<Courses/>}/>
          <Route path="courses/create" element={<CreateCourse/>}/>
          <Route path= "courses/view/:id" element={<CourseDetail/>}/>
          <Route path="courses/edit/:id" element={<EditCourse/>}/>

        </Route>

        <Route 
          path="/student"
          element={
            <ProtectedRoute>
              <Student/>
            </ProtectedRoute>
          }
        />
      </Routes>
      
    </div>
  )
}

export default App