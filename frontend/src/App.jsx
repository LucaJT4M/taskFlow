import LandingPage from "./modules/landing/LandingPage";
import LoginForm from "./modules/login/LoginForm";
import RegisterForm from "./modules/login/RegisterForm";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import TasksPage from "./modules/tasks/TasksPage";
import ProtectedRoute from "./modules/extraRoutes/ProtectedRoute";
import AdminRoute from "./modules/extraRoutes/AdminRoute";
import AdminSite from "./modules/admin/AdminSite";
import "./modules/admin/AdminSite.css";

function App () {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage/>}/>
        <Route path="/login" element={<LoginForm/>}/>
        <Route path="/signup" element={<RegisterForm/>}/>

        {/* Private Routes */}
        <Route element={<ProtectedRoute/>}>
          <Route path="/dashboard" element={<TasksPage/>}/>
        </Route>

        {/* Admin Routes */}
        <Route element={<AdminRoute/>}>
          <Route path="/admin" element={<AdminSite/>}/>
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App