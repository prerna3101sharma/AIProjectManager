import { useState } from "react";
import axios from "axios";
import { useLocation,useNavigate} from "react-router-dom";

interface TeamMember {
  name: string;
  role: string;
  skills: string[];
  availability_days: number;
}
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
    availability_days: 0,
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
      availability_days: 0,
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
      const response = await axios.post(
        `http://127.0.0.1:8000/api/allocate/${data.project_id}`,
        { team }
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
            <input
              type="text"
              name="name"
              placeholder="Name"
              value={form.name}
              onChange={handleChange}
              className="bg-slate-800 p-3 rounded-lg border border-slate-700"
            />

            <select
              name="role"
              value={form.role}
              onChange={handleChange}
              className="bg-slate-800 p-3 rounded-lg border border-slate-700"
            >
              <option value="">Select Role</option>
              <option value="Frontend Developer">
                Frontend Developer
              </option>
              <option value="Backend Developer">
                Backend Developer
              </option>
              <option value="Full Stack Developer">
                Full Stack Developer
              </option>
              <option value="UI/UX Designer">
                UI/UX Designer
              </option>
            </select>

            <input
              type="text"
              name="skills"
              placeholder="Skills (comma separated)"
              value={form.skills}
              onChange={handleChange}
              className="bg-slate-800 p-3 rounded-lg border border-slate-700"
            />

            <input
              type="number"
              name="availability_days"
              placeholder="Availability (days)"
              value={form.availability_days}
              onChange={handleChange}
              className="bg-slate-800 p-3 rounded-lg border border-slate-700"
            />
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