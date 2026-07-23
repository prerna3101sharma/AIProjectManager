import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import type { ReactNode } from "react";
import Home from "./pages/home";
import Dashboard from "./pages/Dashboard";
import Milestones from "./pages/Milestones";
import TeamSetup from "./pages/TeamSetup";
import Allocation from "./pages/Allocation";
import Login from "./pages/Login";
import Register from "./pages/Register";
import CreateProject from "./pages/CreateProject";
import Projects from "./pages/Projects";

// Simple protected route wrapper
const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const token = localStorage.getItem("token");
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Protected Routes */}
        <Route path="/projects" element={<ProtectedRoute><Projects /></ProtectedRoute>} />
        <Route path="/create-project" element={<ProtectedRoute><CreateProject /></ProtectedRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/milestones" element={<ProtectedRoute><Milestones /></ProtectedRoute>} />
        <Route path="/team-setup" element={<ProtectedRoute><TeamSetup /></ProtectedRoute>} />
        <Route path="/allocation" element={<ProtectedRoute><Allocation /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;