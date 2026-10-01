import KanbanBoard from "./modules/tasks/KanbanBoard";
import LoginForm from "./modules/login/LoginForm";
import RegisterForm from "./modules/login/RegisterForm";
import { BrowserRouter, Routes, Route } from "react-router-dom";

function App () {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="" element={<LoginForm/>}/>
        <Route path="/signup" element={<RegisterForm/>}/>
      </Routes>
    </BrowserRouter>
  )
}

export default App