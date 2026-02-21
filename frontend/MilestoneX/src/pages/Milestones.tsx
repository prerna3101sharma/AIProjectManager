import { useLocation } from "react-router-dom";
import { Calendar } from "lucide-react";

interface Milestone {
  name: string;
  description: string;
  timeline_days: number;
}

export default function Milestones() {
  const location = useLocation();
  const milestones: Milestone[] = location.state?.milestones || [];

  return (
    <div className="min-h-screen bg-slate-950 text-white px-6 py-10">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">
          Project Milestones
        </h1>

        {milestones.map((milestone, index) => (
          <div
            key={index}
            className="bg-slate-900 border border-slate-800 rounded-xl p-6 mb-6"
          >
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-lg font-semibold">
                  {milestone.name}
                </h2>
                <p className="text-gray-400 text-sm mt-2">
                  {milestone.description}
                </p>
              </div>

              <div className="flex items-center gap-2 text-purple-400 text-sm">
                <Calendar size={16} />
                {milestone.timeline_days} days
              </div>
            </div>

            {/* Timeline Bar */}
            <div className="mt-4 h-2 bg-slate-800 rounded-full">
              <div
                className="h-2 bg-purple-500 rounded-full"
                style={{
                  width: `${Math.min(
                    milestone.timeline_days / 365 * 100,
                    100
                  )}%`,
                }}
              />
            </div>
          </div>
        ))}

        {milestones.length === 0 && (
          <div className="text-gray-500 text-center py-20">
            No milestones available.
          </div>
        )}
      </div>
    </div>
  );
}