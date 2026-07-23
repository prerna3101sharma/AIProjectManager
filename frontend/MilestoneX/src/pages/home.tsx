import { useState, useEffect } from "react";
import axios from "axios";
import logo from "../assets/logo.svg";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { Sun, Moon, LogOut, LayoutDashboard } from "lucide-react";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [username, setUsername] = useState<string | null>(null);
  const [isDark, setIsDark] = useState<boolean>(true); // default to dark
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Check system preference or localStorage for theme
    const storedTheme = localStorage.getItem("theme");
    if (storedTheme === "light") {
      setIsDark(false);
      document.documentElement.classList.remove("dark");
    } else {
      setIsDark(true);
      document.documentElement.classList.add("dark");
    }
  }, []);

  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
      setIsDark(false);
    } else {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
      setIsDark(true);
    }
  };

  useEffect(() => {
    const fetchUserAndProject = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/auth/me`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (res.data && res.data.email) {
            setUsername(res.data.email.split("@")[0]);
            if (!location.state?.projectName) {
              navigate("/projects");
            }
          }
        } catch (err) {
          console.error("Failed to fetch user", err);
        }
      }
    };
    fetchUserAndProject();
  }, [navigate, location.state]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUsername(null);
    navigate("/");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!file) {
      setError("Please upload an SRS file.");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      setError("Please login or register first to generate a project plan.");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("project_name", location.state?.projectName || "My Project");

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/analyze-project`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            "Authorization": `Bearer ${token}`
          },
        }
      );

      setSuccess(true);
      setFile(null);
      if(response.data.epics.length === 0){
        setError("No epics found in the SRS. Please check your document and try again.");
        setSuccess(false);
        return;
      }
      navigate("/dashboard", {
        state: response.data,
      });
      setTimeout(() => setSuccess(false), 5000);
    } catch (err: unknown) {
      console.error(err);
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 403) {
          setError(err.response.data.detail || "You have reached your project limit. Please upgrade.");
        } else if (err.response?.status === 401) {
          setError("Your session has expired. Please login again.");
        } else {
          setError("Upload failed. Try again.");
        }
      } else {
        setError("Upload failed. Try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const features = [
    { icon: "📊", title: "Smart Analysis", desc: "Intelligent SRS Document Analysis" },
    { icon: "🏗️", title: "Auto Structure", desc: "Automatic Project Structure Generation" },
    { icon: "📋", title: "Task Board", desc: "Kanban Task Board Creation" },
    { icon: "👥", title: "Team Setup", desc: "Team Assignment & Workload Distribution" },
  ];

  const steps = [
    { num: "1", title: "Upload", desc: "Upload your SRS document" },
    { num: "2", title: "Analyze", desc: "AI analyzes requirements" },
    { num: "3", title: "Generate", desc: "Generate project plans" },
    { num: "4", title: "Export", desc: "Share with your team" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white transition-colors duration-300 font-sans">
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-400 dark:bg-blue-600 rounded-full blur-[120px] opacity-20 dark:opacity-10"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-400 dark:bg-purple-600 rounded-full blur-[120px] opacity-20 dark:opacity-10"></div>
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/70 dark:bg-slate-950/70 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-800/50 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl p-[2px] shadow-lg shadow-blue-500/20">
              <img src={logo} alt="Logo" className="w-full h-full object-contain rounded-[10px] bg-white dark:bg-slate-950" />
            </div>
            <span className="font-extrabold text-xl hidden sm:block bg-gradient-to-r from-blue-700 to-purple-700 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
              AI Project Architect
            </span>
          </div>

          <div className="flex items-center gap-4 sm:gap-6">
            <button 
              onClick={toggleTheme}
              className="p-2.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-gray-300 transition-colors"
              aria-label="Toggle Theme"
            >
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {username ? (
              <div className="flex items-center gap-4">
                <Link to="/projects" className="hidden sm:flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-white transition-colors">
                  <LayoutDashboard size={18} />
                  Dashboard
                </Link>
                <div className="flex items-center gap-3 pl-4 border-l border-slate-300 dark:border-slate-700">
                  <div className="flex items-center gap-3 bg-slate-100 dark:bg-slate-800/50 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-700/50">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold text-xs shadow-md">
                      {username.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-semibold text-sm hidden sm:block text-slate-700 dark:text-slate-200 pr-1">{username}</span>
                  </div>
                  <button 
                    onClick={handleLogout}
                    className="p-2 rounded-full hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10 dark:text-gray-400 dark:hover:text-red-400 transition-colors"
                    title="Logout"
                  >
                    <LogOut size={18} />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link 
                  to="/login"
                  className="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-700 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Log in
                </Link>
                <Link
                  to="/register"
                  className="px-6 py-2.5 rounded-xl text-sm font-semibold bg-slate-900 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-500 text-white transition-all shadow-lg hover:shadow-blue-500/25 hover:-translate-y-0.5"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative z-10 pt-36 pb-20 px-4 flex flex-col items-center justify-center min-h-screen">
        <div className="max-w-4xl mx-auto w-full text-center">
          {/* Title */}
          {location.state?.projectName ? (
            <h1 className="text-5xl sm:text-7xl font-extrabold mb-6 text-balance tracking-tight">
              <span className="bg-gradient-to-r from-green-600 via-teal-500 to-blue-600 dark:from-green-400 dark:via-teal-300 dark:to-blue-400 bg-clip-text text-transparent">Upload SRS for</span>
              <br />
              <span className="text-slate-900 dark:text-white">{location.state.projectName}</span>
            </h1>
          ) : (
            <h1 className="text-5xl sm:text-7xl font-extrabold mb-8 text-balance tracking-tight">
              <span className="text-slate-900 dark:text-white">From Requirements to </span>
              <span className="bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600 dark:from-blue-400 dark:via-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">Reality.</span>
            </h1>
          )}

          {/* Subtitle */}
          <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 mb-12 max-w-2xl mx-auto leading-relaxed font-medium">
            {location.state?.projectName
              ? "You're almost there! Upload your Software Requirements Specification (SRS) document to generate your project structure, tasks, and milestones instantly."
              : "Upload your Software Requirements Specification (SRS) and let our AI generate a comprehensive project structure, task board, and team allocation instantly."}
          </p>

          {/* Form */}
          <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto mb-16">
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`relative p-10 sm:p-14 rounded-3xl border-2 border-dashed transition-all duration-300 cursor-pointer group shadow-sm bg-white/60 dark:bg-slate-900/40 backdrop-blur-xl ${
                dragActive
                  ? "border-blue-500 bg-blue-50/80 dark:bg-blue-500/10 scale-[1.02] shadow-blue-500/20"
                  : "border-slate-300 dark:border-slate-700 hover:border-blue-400 hover:shadow-md hover:bg-white/80 dark:hover:bg-slate-800/60"
              }`}
            >
              <input
                type="file"
                accept=".pdf,.doc,.docx,.txt,.md"
                onChange={handleFileChange}
                className="absolute inset-0 opacity-0 cursor-pointer rounded-3xl z-10"
                required
              />

              {file ? (
                <div className="space-y-4 relative z-0">
                  <div className="w-20 h-20 mx-auto bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center text-4xl text-green-600 dark:text-green-400">
                    ✓
                  </div>
                  <p className="font-bold text-2xl text-slate-900 dark:text-white">{file.name}</p>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Ready to transform your project</p>
                </div>
              ) : (
                <div className="space-y-5 relative z-0">
                  <div className="w-24 h-24 mx-auto bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-5xl group-hover:scale-110 group-hover:bg-blue-100 dark:group-hover:bg-slate-700 transition-all duration-300 text-slate-400 dark:text-slate-500 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                    📄
                  </div>
                  <h3 className="font-bold text-2xl text-slate-900 dark:text-white">Upload Your SRS Document</h3>
                  <p className="text-base text-slate-500 dark:text-slate-400">Drag and drop or click to browse</p>
                  <p className="text-xs font-bold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800/80 inline-block px-4 py-1.5 rounded-full uppercase tracking-wider">PDF, DOC, DOCX, TXT, MD</p>
                </div>
              )}
            </div>

            {error && (
              <div className="mt-6 p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 rounded-2xl text-red-600 dark:text-red-400 text-sm font-semibold animate-pulse">
                {error}
              </div>
            )}

            {success && (
              <div className="mt-6 p-4 bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/30 rounded-2xl text-green-600 dark:text-green-400 text-sm font-semibold flex items-center justify-center gap-2">
                <span className="text-xl">✨</span> File uploaded successfully! Architecting your plan...
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !file}
              className="mt-8 w-full bg-slate-900 hover:bg-blue-600 dark:bg-gradient-to-r dark:from-blue-600 dark:to-purple-600 dark:hover:from-blue-500 dark:hover:to-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-lg py-5 px-8 rounded-2xl transition-all duration-300 shadow-xl shadow-slate-200 dark:shadow-blue-900/20 hover:shadow-blue-500/25 hover:-translate-y-1"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-3">
                  <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Architecting your project...
                </span>
              ) : (
                "Generate Project Plan"
              )}
            </button>
          </form>
        </div>
      </div>

      {/* About Section */}
      <div className="relative z-10 py-32 px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-slate-900/30 border-t border-slate-200/80 dark:border-slate-800">
        <div className="max-w-7xl mx-auto">
          {/* Section Title */}
          <div className="text-center mb-20">
            <h2 className="text-3xl sm:text-5xl font-extrabold mb-6 text-slate-900 dark:text-white tracking-tight">
              How It Works
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-xl max-w-2xl mx-auto font-medium">
              Four simple steps to transform your requirements into an actionable, trackable project plan.
            </p>
          </div>

          {/* Timeline Steps */}
          <div className="grid md:grid-cols-4 gap-8 mb-32">
            {steps.map((step, i) => (
              <div key={i} className="relative group">
                {/* Connection line */}
                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute top-10 left-[60%] right-[-120%] h-[2px] bg-gradient-to-r from-slate-200 to-transparent dark:from-slate-700"></div>
                )}

                {/* Card */}
                <div className="bg-white dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/50 rounded-3xl p-8 text-center transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/5 dark:hover:shadow-blue-500/10 hover:-translate-y-2 h-full z-10 relative">
                  <div className="w-20 h-20 rounded-2xl bg-slate-50 dark:bg-slate-800 text-blue-600 dark:text-blue-400 flex items-center justify-center font-black text-3xl mb-8 mx-auto shadow-sm border border-slate-100 dark:border-slate-700 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                    {step.num}
                  </div>
                  <h3 className="font-bold text-2xl mb-4 text-slate-900 dark:text-white">{step.title}</h3>
                  <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-lg">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Features Grid */}
          <div>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-center mb-16 text-slate-900 dark:text-white tracking-tight">
              Key Features
            </h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature, i) => (
                <div
                  key={i}
                  className="group bg-white dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/50 rounded-3xl p-8 transition-all duration-300 hover:shadow-xl hover:border-blue-300 dark:hover:border-blue-500/50 hover:-translate-y-1"
                >
                  <div className="text-4xl mb-6 p-5 bg-slate-50 dark:bg-slate-900/50 rounded-2xl inline-block group-hover:scale-110 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/30 transition-all duration-300">
                    {feature.icon}
                  </div>
                  <h4 className="font-bold text-xl text-slate-900 dark:text-white mb-3">{feature.title}</h4>
                  <p className="text-slate-500 dark:text-slate-400 leading-relaxed font-medium">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}