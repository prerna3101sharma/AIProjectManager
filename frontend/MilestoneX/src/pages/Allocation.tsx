import { useLocation } from "react-router-dom";
import { Calendar, User } from "lucide-react";
import { useState } from "react";

interface TaskAssignment {
  task_name: string;
  assigned_to: string;
  timeline_days: number;
  epic_name: string;
}

interface AllocationResponse {
  project_id: number;
  allocation: {
    task_assignments: TaskAssignment[];
  };
}

export default function Allocation() {
  const location = useLocation();
  console.log("👍 Allocation data:", location.state);

  const data: AllocationResponse =
    location.state || {
      project_id: 0,
      allocation: { task_assignments: [] },
    };

  const taskAssignments = Array.isArray(data.allocation)
    ? data.allocation
    : data.allocation?.task_assignments || [];

  // Track task completion
  const [taskStatus, setTaskStatus] = useState<
    Record<string, boolean>
  >({});

  const toggleTaskStatus = (taskId: string) => {
    setTaskStatus((prev) => ({
      ...prev,
      [taskId]: !prev[taskId],
    }));
  };

  // Group tasks by member
  const groupedByMember = taskAssignments.reduce(
    (acc: Record<string, TaskAssignment[]>, task) => {
      const memberName = task.assigned_to.trim();

      if (!acc[memberName]) {
        acc[memberName] = [];
      }

      acc[memberName].push(task);
      return acc;
    },
    {}
  );

  const totalMembers = Object.keys(groupedByMember).length;

  const totalAssignedDays = taskAssignments.reduce(
    (sum, task) => sum + task.timeline_days,
    0
  );

  // Overall completion
  const totalCompleted = Object.entries(groupedByMember).reduce(
    (sum, [memberName, tasks]) =>
      sum +
      tasks.filter((task, index) =>
        taskStatus[`${memberName}-${index}`]
      ).length,
    0
  );

  const overallPercentage = taskAssignments.length
    ? (totalCompleted / taskAssignments.length) * 100
    : 0;

  return (
    <div className="min-h-screen bg-slate-950 text-white px-6 py-10">
      <div className="max-w-6xl mx-auto space-y-10">

        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-purple-400">
            Project Allocation Overview
          </h1>
        </div>

        {/* Summary Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex justify-between items-center">
          <div>
            <div className="text-gray-400 text-sm">
              Total Members Assigned
            </div>
            <div className="text-2xl font-bold text-cyan-400">
              {totalMembers}
            </div>
          </div>

          <div>
            <div className="text-gray-400 text-sm">
              Total Assigned Work
            </div>
            <div className="text-2xl font-bold text-purple-400">
              {totalAssignedDays} days
            </div>
          </div>
        </div>

        {/* Overall Progress */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-3">
          <div className="text-sm text-gray-400">
            Overall Project Progress
          </div>

          <div className="text-lg font-semibold text-green-400">
            {totalCompleted} / {taskAssignments.length} completed
          </div>

          <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500 transition-all duration-500"
              style={{ width: `${overallPercentage}%` }}
            />
          </div>
        </div>

        {/* Allocation Per Member */}
        <div className="space-y-8">
          {Object.entries(groupedByMember).length === 0 && (
            <div className="text-center text-gray-500 py-12">
              No allocation data available.
            </div>
          )}

          {Object.entries(groupedByMember).map(
            ([memberName, tasks]) => {
              const memberTotalDays = tasks.reduce(
                (sum, task) => sum + task.timeline_days,
                0
              );

              const completedTasks = tasks.filter(
                (task, index) =>
                  taskStatus[`${memberName}-${index}`]
              ).length;

              const completionPercentage = tasks.length
                ? (completedTasks / tasks.length) * 100
                : 0;

              return (
                <div
                  key={memberName}
                  className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-5 hover:shadow-lg hover:shadow-purple-500/20 transition"
                >
                  {/* Member Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <User className="text-cyan-400" />
                      <div>
                        <div className="font-semibold text-lg">
                          {memberName}
                        </div>
                        <div className="text-sm text-gray-400">
                          {tasks.length} tasks assigned
                        </div>
                      </div>
                    </div>

                    <div className="text-purple-400 font-semibold">
                      {memberTotalDays} days
                    </div>
                  </div>

                  {/* Member Progress */}
                  <div className="text-sm text-gray-400">
                    {completedTasks} completed •{" "}
                    {tasks.length - completedTasks} remaining
                  </div>

                  <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500 transition-all duration-500"
                      style={{
                        width: `${completionPercentage}%`,
                      }}
                    />
                  </div>

                  {/* Tasks List */}
                  <div className="space-y-3">
                    {tasks.map((task, index) => {
                      const taskId = `${memberName}-${index}`;
                      const isCompleted =
                        taskStatus[taskId];

                      return (
                        <div
                          key={index}
                          onClick={() =>
                            toggleTaskStatus(taskId)
                          }
                          className={`bg-slate-800 p-4 rounded-lg flex justify-between items-center cursor-pointer transition
                            ${
                              isCompleted
                                ? "opacity-50 line-through"
                                : "hover:bg-slate-700"
                            }`}
                        >
                          <div>
                            <div className="font-medium">
                              {task.task_name}
                            </div>
                            <div className="text-xs text-gray-400">
                              {task.epic_name}
                            </div>
                          </div>

                          <div className="text-sm text-cyan-400 flex items-center gap-1">
                            <Calendar size={14} />
                            {task.timeline_days} days
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            }
          )}
        </div>
      </div>
    </div>
  );
}