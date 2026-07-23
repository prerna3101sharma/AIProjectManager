import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Folder, Plus } from "lucide-react";

export default function Projects() {
  const [projects, setProjects] = useState<{ id: number; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/all`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch projects");
        const data = await res.json();
        
        if (data.length === 0) {
          navigate("/create-project");
        } else {
          setProjects(data);
        }
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("An unknown error occurred");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, [navigate]);

  const handleProjectClick = async (projectId: number) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/${projectId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch project data");
      const projectData = await res.json();
      navigate("/dashboard", { state: projectData });
    } catch (err: unknown) {
      if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("An unknown error occurred");
        }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white px-6 py-10">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white">Your Projects</h1>
            <p className="text-gray-400 mt-1">Select a project to view its dashboard</p>
          </div>
          <button
            onClick={() => navigate("/create-project")}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold py-2 px-4 rounded-lg transition-all shadow-lg hover:shadow-blue-500/30"
          >
            <Plus size={18} />
            New Project
          </button>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <div
              key={project.id}
              onClick={() => handleProjectClick(project.id)}
              className="bg-slate-900 border border-slate-800 rounded-xl p-6 hover:bg-slate-800 hover:border-cyan-500/50 transition-all cursor-pointer group"
            >
              <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center text-blue-400 mb-4 group-hover:scale-110 transition-transform">
                <Folder size={24} />
              </div>
              <h2 className="text-xl font-bold text-white group-hover:text-cyan-400 transition-colors">
                {project.name}
              </h2>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
