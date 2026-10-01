import KanbanBoard from "./modules/tasks/KanbanBoard";
import LoginForm from "./modules/login/LoginForm";
import RegisterForm from "./modules/login/RegisterForm";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ProtectedRoute from "./modules/ProtectedRoute";

function App () {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="" element={<LoginForm/>}/>
        <Route path="/signup" element={<RegisterForm/>}/>

        {/* Private routest ;) */}
        <Route element={<ProtectedRoute/>}>
          <Route path="/board" element={<KanbanBoard/>}/>
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App