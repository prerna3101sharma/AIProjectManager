import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/home";
import Dashboard from "./pages/Dashboard";
import Milestones from "./pages/Milestones";
import TeamSetup from "./pages/TeamSetup";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/milestones" element={<Milestones />} />
        <Route path="/team-setup" element={<TeamSetup />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;