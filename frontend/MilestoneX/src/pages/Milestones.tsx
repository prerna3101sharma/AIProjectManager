import { useLocation, useNavigate } from "react-router-dom";
import { Calendar, ArrowLeft } from "lucide-react";

interface Task {
  task_name: string;
  timeline_days: number;
}

interface Epic {
  epic_name: string;
  description: string;
  tasks: Task[];
}

interface Milestone {
  name: string;
  description: string;
  timeline_days?: number;
  tasks?: string[];
}

export default function Milestones() {
  const location = useLocation();
  const navigate = useNavigate();
  const milestones: Milestone[] = location.state?.milestones || [];
  const epics: Epic[] = location.state?.epics || [];
  const taskStatuses: Record<string, string> = location.state?.taskStatuses || {};

  // Helper to calculate days for a milestone
  const calculateProgress = (milestone: Milestone) => {
    let totalDays = 0;
    let completedDays = 0;

    if (!milestone.tasks || !Array.isArray(milestone.tasks)) {
      return { totalDays, completedDays, percentage: 0 };
    }

    epics.forEach((epic, epicIndex) => {
      epic.tasks?.forEach((task, taskIndex) => {
        if (milestone.tasks?.includes(task.task_name)) {
          totalDays += task.timeline_days || 0;
          
          const taskId = `${epicIndex}-${taskIndex}`;
          if (taskStatuses[taskId] === "completed") {
            completedDays += task.timeline_days || 0;
          }
        }
      });
    });

    const percentage = totalDays > 0 ? Math.round((completedDays / totalDays) * 100) : 0;

    return { totalDays, completedDays, percentage };
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white px-6 py-10 font-sans">
      <div className="max-w-5xl mx-auto">
        
        <button 
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 mb-8 font-medium transition-colors"
        >
          <ArrowLeft size={16} />
          Back to Dashboard
        </button>
        
        <h1 className="text-4xl font-extrabold mb-8 tracking-tight">
          Project Milestones
        </h1>

        {milestones.map((milestone, index) => {
          const { totalDays, completedDays, percentage } = calculateProgress(milestone);
          
          return (
            <div
              key={index}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 mb-6 hover:border-slate-700 transition-colors shadow-lg shadow-black/20"
            >
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-white">
                    {milestone.name}
                  </h2>
                  <p className="text-slate-400 text-base mt-2 leading-relaxed">
                    {milestone.description}
                  </p>
                </div>

                <div className="flex items-center gap-2 text-purple-300 font-semibold bg-purple-500/10 border border-purple-500/20 px-4 py-2.5 rounded-xl whitespace-nowrap shadow-inner">
                  <Calendar size={18} />
                  {totalDays} days total
                </div>
              </div>

              {/* Timeline Bar */}
              <div className="mt-8">
                <div className="flex justify-between text-sm mb-3 font-semibold">
                  <span className="text-slate-300">Progress</span>
                  <span className="text-cyan-400">{percentage}% ({completedDays}/{totalDays} days)</span>
                </div>
                <div className="h-3.5 bg-slate-800 rounded-full overflow-hidden shadow-inner">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 rounded-full transition-all duration-1000 ease-out relative"
                    style={{
                      width: `${percentage}%`,
                    }}
                  >
                     <div className="absolute top-0 right-0 bottom-0 left-0 bg-white/10 animate-pulse"></div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {milestones.length === 0 && (
          <div className="text-slate-500 text-center py-24 bg-slate-900/50 rounded-3xl border-2 border-slate-800 border-dashed">
            <div className="text-4xl mb-4">🎯</div>
            <p className="text-lg font-medium">No milestones available for this project.</p>
          </div>
        )}
      </div>
    </div>
  );
}