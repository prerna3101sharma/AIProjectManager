import { useState } from "react";
import { useLocation } from "react-router-dom";
import {
  ChevronDown,
  CheckCircle,
  Circle,
  AlertCircle,
  Calendar,
} from "lucide-react";

interface Task {
  task_name: string;
  timeline_days: number;
}

interface Epic {
  epic_name: string;
  description: string;
  tasks: Task[];
}

interface DashboardData {
  message: string;
  epics: Epic[];
}

export default function Dashboard() {
  const location = useLocation();

  const data: DashboardData = {
    message: location.state?.message || "File processed successfully",
    epics: Array.isArray(location.state?.epics)
      ? location.state.epics
      : [],
  };

  const [expandedEpics, setExpandedEpics] = useState<Set<number>>(
    new Set([0])
  );

  const [taskStatuses, setTaskStatuses] = useState<
    Record<string, "todo" | "in-progress" | "completed">
  >({});

  const toggleEpic = (index: number) => {
    const updated = new Set(expandedEpics);
if (updated.has(index)) {
  updated.delete(index);
} else {
  updated.add(index);
}    setExpandedEpics(updated);
  };

  const cycleTaskStatus = (taskId: string) => {
    const current = taskStatuses[taskId] || "todo";
    const order = ["todo", "in-progress", "completed"] as const;
    const next = order[(order.indexOf(current) + 1) % order.length];
    setTaskStatuses({ ...taskStatuses, [taskId]: next });
  };

  const getStatusColor = (status: string) => {
    if (status === "completed") return "text-green-400";
    if (status === "in-progress") return "text-blue-400";
    return "text-gray-400";
  };

  const completedTasks = Object.values(taskStatuses).filter(
    (s) => s === "completed"
  ).length;

  const totalTasks = data.epics.reduce(
    (sum, epic) => sum + (epic.tasks?.length || 0),
    0
  );

  const totalDays = data.epics.reduce(
    (sum, epic) =>
      sum +
      (epic.tasks || []).reduce(
        (taskSum, task) => taskSum + (task.timeline_days || 0),
        0
      ),
    0
  );

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <div className="border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-6 py-6 flex flex-col sm:flex-row sm:justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold text-white">
              Project Dashboard
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              Manage epics and track task progress
            </p>
          </div>

          <div className="flex gap-4 flex-wrap">
            <div className="bg-slate-800 rounded-lg px-5 py-3 text-sm">
              <div className="text-gray-400">Tasks</div>
              <div className="text-xl font-bold text-cyan-400">
                {completedTasks}/{totalTasks}
              </div>
            </div>

            <div className="bg-slate-800 rounded-lg px-5 py-3 text-sm">
              <div className="text-gray-400">Total Duration</div>
              <div className="text-xl font-bold text-purple-400">
                {totalDays} days
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-6 py-8 space-y-6">
        {/* Success Message */}
        <div className="bg-green-500/10 border border-green-500/40 text-green-300 px-4 py-3 rounded-lg text-sm">
          {data.message}
        </div>

        {/* Epics */}
        {data.epics.map((epic, epicIndex) => {
          const epicTasks = epic.tasks || [];

          return (
            <div
              key={epicIndex}
              className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden"
            >
              {/* Epic Header */}
              <button
                onClick={() => toggleEpic(epicIndex)}
                className="w-full flex items-center justify-between px-6 py-5 hover:bg-slate-800 transition"
              >
                <div className="text-left">
                  <h2 className="text-lg font-semibold">
                    {epic.epic_name}
                  </h2>
                  <p className="text-sm text-gray-400 mt-1">
                    {epic.description}
                  </p>
                </div>

                <ChevronDown
                  className={`w-5 h-5 transition ${
                    expandedEpics.has(epicIndex) ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* Tasks */}
              {expandedEpics.has(epicIndex) && (
                <div className="border-t border-slate-800 px-6 py-4 space-y-3">
                  {epicTasks.map((task, taskIndex) => {
                    const taskId = `${epicIndex}-${taskIndex}`;
                    const status = taskStatuses[taskId] || "todo";

                    return (
                      <button
                        key={taskId}
                        onClick={() => cycleTaskStatus(taskId)}
                        className="w-full bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg p-4 flex items-start gap-4 transition"
                      >
                        <div
                          className={`mt-1 ${getStatusColor(status)}`}
                        >
                          {status === "completed" ? (
                            <CheckCircle size={18} />
                          ) : status === "in-progress" ? (
                            <AlertCircle size={18} />
                          ) : (
                            <Circle size={18} />
                          )}
                        </div>

                        <div className="flex-1 text-left">
                          <div
                            className={`text-sm font-medium ${
                              status === "completed"
                                ? "line-through text-gray-500"
                                : "text-gray-200"
                            }`}
                          >
                            {task.task_name}
                          </div>

                          {/* Timeline Bottom Left */}
                          <div className="flex items-center gap-1 text-xs text-gray-400 mt-2">
                            <Calendar size={14} />
                            {task.timeline_days} day
                            {task.timeline_days > 1 ? "s" : ""}
                          </div>
                        </div>

                        <div
                          className={`text-xs px-3 py-1 rounded-full ${
                            status === "completed"
                              ? "bg-green-500/20 text-green-300"
                              : status === "in-progress"
                              ? "bg-blue-500/20 text-blue-300"
                              : "bg-gray-500/20 text-gray-300"
                          }`}
                        >
                          {status === "in-progress"
                            ? "In Progress"
                            : status === "completed"
                            ? "Completed"
                            : "To Do"}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}

        {data.epics.length === 0 && (
          <div className="text-center text-gray-500 py-12">
            No epics generated yet.
          </div>
        )}
      </div>
    </div>
  );
}