import LoginForm from "./modules/login/LoginForm";
import RegisterForm from "./modules/login/RegisterForm";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import TasksPage from "./modules/tasks/TasksPage";
import ProtectedRoute from "./modules/ProtectedRoute";

function App () {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="" element={<LoginForm/>}/>
        <Route path="/signup" element={<RegisterForm/>}/>

        {/* Private Routes */}
        <Route element={<ProtectedRoute/>}>
          <Route path="/dashboard" element={<TasksPage/>}/>
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App