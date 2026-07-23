import { useState } from "react";
import axios from "axios";
import { useLocation,useNavigate} from "react-router-dom";

interface TeamMember {
  name: string;
  role: string;
  skills: string[];
  availability_days: number;
}
const COMMON_ROLES = [
  "Frontend Developer",
  "Backend Developer",
  "Full Stack Developer",
  "Mobile Developer",
  "UI/UX Designer",
  "DevOps Engineer",
  "QA Engineer",
  "Project Manager",
  "Data Scientist",
  "Business Analyst"
];

const COMMON_SKILLS = [
  "React", "Node.js", "Python", "Java", "TypeScript", 
  "AWS", "Docker", "Figma", "SQL", "MongoDB",
  "Vue.js", "Angular", "Go", "C#", "Kubernetes"
];

export default function TeamSetup() {
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
     const data = location.state || {};
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [form, setForm] = useState({
    name: "",
    role: "",
    skills: "",
    availability_days: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const addMember = () => {
    if (!form.name || !form.role || !form.skills) return;

    const newMember: TeamMember = {
      name: form.name,
      role: form.role,
      skills: form.skills.split(",").map((s) => s.trim()),
      availability_days: Number(form.availability_days),
    };

    setTeam([...team, newMember]);

    // Reset form
    setForm({
      name: "",
      role: "",
      skills: "",
      availability_days: "",
    });
  };

  const removeMember = (index: number) => {
    const updated = [...team];
    updated.splice(index, 1);
    setTeam(updated);
  };

  const submitTeam = async () => {
    try {
      setLoading(true);   
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/allocate/${data.project_id}`,
        { team },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log(response.data);

    navigate("/allocation", {
      state: response.data,
    });
      alert("Team submitted successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to submit team.");
    }finally{
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white px-6 py-10">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold text-cyan-400">
          Team Setup
        </h1>

        {/* Add Member Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
          <h2 className="text-lg font-semibold text-white">
            Add Team Member
          </h2>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-400 ml-1">Team Member Name</label>
              <input
                type="text"
                name="name"
                placeholder="e.g. Alice Smith"
                value={form.name}
                onChange={handleChange}
                className="bg-slate-800 p-3 rounded-lg border border-slate-700 text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-400 ml-1">Role</label>
              <select
                name="role"
                value={form.role}
                onChange={handleChange}
                className="bg-slate-800 p-3 rounded-lg border border-slate-700 text-gray-200 focus:outline-none focus:border-cyan-500"
              >
                <option value="">Select Role</option>
                {COMMON_ROLES.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1 sm:col-span-2">
              <label className="text-xs text-gray-400 ml-1">Skills (comma separated)</label>
              <input
                type="text"
                name="skills"
                placeholder="e.g. React, Node.js, Python"
                value={form.skills}
                onChange={handleChange}
                className="bg-slate-800 p-3 rounded-lg border border-slate-700 text-white focus:outline-none focus:border-cyan-500"
              />
              <div className="flex flex-wrap gap-2 mt-2">
                {COMMON_SKILLS.map(skill => (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => {
                      const currentSkills = form.skills ? form.skills.split(',').map(s => s.trim()).filter(Boolean) : [];
                      if (!currentSkills.includes(skill)) {
                        setForm({ ...form, skills: [...currentSkills, skill].join(", ") });
                      }
                    }}
                    className="text-xs bg-slate-800 hover:bg-cyan-900 border border-slate-700 text-cyan-300 px-3 py-1.5 rounded-full transition"
                  >
                    + {skill}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-1 sm:col-span-2">
              <label className="text-xs text-gray-400 ml-1">Availability</label>
              <input
                type="number"
                name="availability_days"
                placeholder="Availability in days (e.g. 5)"
                value={form.availability_days}
                onChange={handleChange}
                min="1"
                className="bg-slate-800 p-3 rounded-lg border border-slate-700 text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <button
            onClick={addMember}
            className="bg-cyan-600 hover:bg-cyan-500 px-6 py-2 rounded-lg font-semibold transition"
          >
            + Add Member
          </button>
        </div>

        {/* Team List */}
        <div className="space-y-4">
          {team.map((member, index) => (
            <div
              key={index}
              className="bg-slate-900 border border-slate-800 rounded-lg p-4 flex justify-between items-center"
            >
              <div>
                <div className="font-semibold text-white">
                  {member.name}
                </div>
                <div className="text-sm text-gray-400">
                  {member.role} • {member.availability_days} days
                </div>
                <div className="flex gap-2 mt-2 flex-wrap">
                  {member.skills.map((skill, i) => (
                    <span
                      key={i}
                      className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded-full"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <button
                onClick={() => removeMember(index)}
                className="text-red-400 hover:text-red-300 text-sm"
              >
                Remove
              </button>
            </div>
          ))}
        </div>

        {/* Submit Button */}
     {team.length > 0 && (
  <button
    onClick={submitTeam}
    disabled={loading}
    className={`w-full py-3 rounded-lg font-bold transition flex items-center justify-center gap-2
      ${loading
        ? "bg-purple-400 cursor-not-allowed"
        : "bg-purple-600 hover:bg-purple-500"}
    `}
  >
    {loading ? (
      <>
        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
        Generating Allocation...
      </>
    ) : (
      "Submit Team & Generate Allocation"
    )}
  </button>
)}
      </div>
    </div>
  );
}