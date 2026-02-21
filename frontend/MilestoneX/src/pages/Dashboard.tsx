import { useState } from "react";
import { useLocation } from "react-router-dom";
import { ChevronDown, CheckCircle, Circle, AlertCircle } from "lucide-react";

interface Epic {
  epic_name: string;
  description: string;
  tasks: string[];
}

interface DashboardData {
  message: string;
  epics: Epic[];
}

export default function Dashboard() {
  const location = useLocation();

  const data: DashboardData = {
    message: location.state?.message || "File processed successfully",
    epics: location.state?.epics || [],
  };

  const [expandedEpics, setExpandedEpics] = useState<Set<number>>(
    new Set([0])
  );
  const [taskStatuses, setTaskStatuses] = useState<Record<string, "todo" | "in-progress" | "completed">>({});

  const toggleEpic = (index: number) => {
    const newExpanded = new Set(expandedEpics);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedEpics(newExpanded);
  };

  const cycleTaskStatus = (taskId: string) => {
    const currentStatus = taskStatuses[taskId] || "todo";
    const statuses: ("todo" | "in-progress" | "completed")[] = [
      "todo",
      "in-progress",
      "completed",
    ];
    const nextStatus =
      statuses[(statuses.indexOf(currentStatus) + 1) % statuses.length];
    setTaskStatuses({ ...taskStatuses, [taskId]: nextStatus });
  };

  const getTaskStatusColor = (
    status: "todo" | "in-progress" | "completed"
  ) => {
    switch (status) {
      case "completed":
        return "text-green-400";
      case "in-progress":
        return "text-blue-400";
      default:
        return "text-gray-400";
    }
  };

  const getEpicColor = (index: number) => {
    const colors = [
      "from-blue-500 to-blue-600",
      "from-purple-500 to-purple-600",
      "from-pink-500 to-pink-600",
      "from-cyan-500 to-cyan-600",
      "from-orange-500 to-orange-600",
    ];
    return colors[index % colors.length];
  };

  const completedTasks = Object.values(taskStatuses).filter(
    (s) => s === "completed"
  ).length;
  const totalTasks = data.epics.reduce((sum, epic) => sum + epic.tasks.length, 0);
  const inProgressTasks = Object.values(taskStatuses).filter(
    (s) => s === "in-progress"
  ).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 text-white">
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500 rounded-full blur-3xl opacity-10"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500 rounded-full blur-3xl opacity-10"></div>
      </div>

      <div className="relative z-10">
        {/* Header */}
        <div className="bg-gradient-to-b from-slate-900/80 to-slate-900/20 border-b border-blue-500/20 backdrop-blur-xl sticky top-0 z-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Project Dashboard
                </h1>
                <p className="text-gray-400 mt-1 text-sm">
                  Manage your project epics and tasks
                </p>
              </div>

              <div className="flex gap-4 flex-wrap">
                <div className="bg-slate-800/50 border border-blue-500/20 rounded-lg p-4 backdrop-blur">
                  <div className="text-xs text-gray-400">Completed</div>
                  <div className="text-2xl font-bold text-green-400">
                    {completedTasks}/{totalTasks}
                  </div>
                </div>
                <div className="bg-slate-800/50 border border-blue-500/20 rounded-lg p-4 backdrop-blur">
                  <div className="text-xs text-gray-400">In Progress</div>
                  <div className="text-2xl font-bold text-blue-400">
                    {inProgressTasks}
                  </div>
                </div>
                <div className="bg-slate-800/50 border border-blue-500/20 rounded-lg p-4 backdrop-blur">
                  <div className="text-xs text-gray-400">Total Tasks</div>
                  <div className="text-2xl font-bold text-purple-400">
                    {totalTasks}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Success Message */}
          <div className="mb-8 p-4 bg-green-500/20 border border-green-500/50 rounded-lg flex gap-3 animate-pulse">
            <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
            <p className="text-green-300 text-sm">{data.message}</p>
          </div>

          {/* Epics Grid */}
          <div className="space-y-4">
            {data.epics.map((epic, epicIndex) => {
              const epicTasks = epic.tasks;
              const epicCompletedTasks = epicTasks.filter(
                (_, taskIndex) =>
                  taskStatuses[`${epicIndex}-${taskIndex}`] === "completed"
              ).length;

              return (
                <div
                  key={epicIndex}
                  className="bg-slate-800/40 border border-blue-500/20 hover:border-blue-500/40 rounded-xl overflow-hidden transition-all duration-300 group"
                >
                  {/* Epic Header */}
                  <button
                    onClick={() => toggleEpic(epicIndex)}
                    className="w-full px-6 py-5 flex items-center justify-between hover:bg-slate-800/20 transition-colors"
                  >
                    <div className="flex items-center gap-4 flex-1 text-left">
                      {/* Epic Color Indicator */}
                      <div
                        className={`w-1 h-8 rounded-full bg-gradient-to-b ${getEpicColor(
                          epicIndex
                        )}`}
                      ></div>

                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-white group-hover:text-blue-300 transition-colors">
                          {epic.epic_name}
                        </h3>
                        <p className="text-sm text-gray-400 mt-1">
                          {epic.description}
                        </p>
                      </div>

                      {/* Progress Bar */}
                      <div className="hidden md:flex flex-col items-end gap-2">
                        <div className="text-xs text-gray-400">
                          {epicCompletedTasks}/{epicTasks.length}
                        </div>
                        <div className="w-32 h-2 bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-green-500 to-blue-500 transition-all duration-500"
                            style={{
                              width: `${
                                epicTasks.length > 0
                                  ? (epicCompletedTasks / epicTasks.length) * 100
                                  : 0
                              }%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>

                    {/* Expand Icon */}
                    <ChevronDown
                      className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${
                        expandedEpics.has(epicIndex) ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {/* Epic Tasks */}
                  {expandedEpics.has(epicIndex) && (
                    <div className="border-t border-blue-500/10 bg-slate-900/30 px-6 py-4 space-y-3">
                      {epicTasks.map((task, taskIndex) => {
                        const taskId = `${epicIndex}-${taskIndex}`;
                        const status = taskStatuses[taskId] || "todo";

                        return (
                          <button
                            key={taskId}
                            onClick={() => cycleTaskStatus(taskId)}
                            className="w-full flex items-center gap-3 p-3 rounded-lg bg-slate-800/30 hover:bg-slate-800/60 border border-blue-500/10 hover:border-blue-500/30 transition-all group/task"
                          >
                            {/* Task Status Icon */}
                            <div
                              className={`flex-shrink-0 ${getTaskStatusColor(
                                status
                              )} transition-all`}
                            >
                              {status === "completed" ? (
                                <CheckCircle className="w-5 h-5" />
                              ) : status === "in-progress" ? (
                                <AlertCircle className="w-5 h-5 animate-pulse" />
                              ) : (
                                <Circle className="w-5 h-5" />
                              )}
                            </div>

                            {/* Task Name */}
                            <span
                              className={`flex-1 text-left text-sm transition-all ${
                                status === "completed"
                                  ? "line-through text-gray-500"
                                  : "text-gray-300 group-hover/task:text-white"
                              }`}
                            >
                              {task}
                            </span>

                            {/* Status Badge */}
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
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
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Empty State */}
          {data.epics.length === 0 && (
            <div className="text-center py-12">
              <AlertCircle className="w-12 h-12 text-gray-500 mx-auto mb-4" />
              <p className="text-gray-400">No epics generated yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}