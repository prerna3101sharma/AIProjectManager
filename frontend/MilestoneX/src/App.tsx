import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/home";
import Dashboard from "./pages/Dashboard";
import TeamSetup from "./pages/TeamSetup";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/team-setup" element={<TeamSetup />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;