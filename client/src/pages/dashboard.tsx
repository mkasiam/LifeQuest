import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useState } from "react";
import { getCurrentDate, formatDate } from "@/lib/utils";
import Sidebar from "@/components/sidebar";
import TaskModal from "@/components/task-modal";
import GoalModal from "@/components/goal-modal";
import TaskItem from "@/components/task-item";
import ProgressRing from "@/components/progress-ring";
import PomodoroTimer from "@/components/pomodoro-timer";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Task, User, Achievement, Goal } from "@shared/schema";

interface DashboardData {
  user: User;
  todayTasks: Task[];
  goals: Goal[];
  achievements: Achievement[];
  stats: {
    progressPercentage: number;
    completedTasks: number;
    totalTasks: number;
    earnedXP: number;
    earnedGems: number;
  };
}

export default function Dashboard() {
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [taskFilter, setTaskFilter] = useState("all");
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const today = getCurrentDate();

  const { data: dashboardData, isLoading } = useQuery<DashboardData>({
    queryKey: ["/api/dashboard"],
  });

  const { data: todayTasks = [], refetch: refetchTasks } = useQuery<Task[]>({
    queryKey: ["/api/tasks", today],
    enabled: !!today,
  });

  const completeTaskMutation = useMutation({
    mutationFn: async (taskId: number) => {
      const response = await apiRequest("POST", `/api/tasks/${taskId}/complete`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: async (taskId: number) => {
      await apiRequest("DELETE", `/api/tasks/${taskId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your quest...</p>
        </div>
      </div>
    );
  }

  const filteredTasks = todayTasks.filter(task => {
    if (taskFilter === "completed") return task.completed;
    if (taskFilter === "pending") return !task.completed;
    return true;
  });

  const stats = dashboardData?.stats || {
    progressPercentage: 0,
    completedTasks: 0,
    totalTasks: 0,
    earnedXP: 0,
    earnedGems: 0,
  };

  const user = dashboardData?.user;
  const goals = dashboardData?.goals || [];
  const achievements = dashboardData?.achievements || [];

  return (
    <div className="min-h-screen flex bg-gray-50">
      <Sidebar user={user} achievements={achievements} />
      
      <main className="flex-1 ml-64 p-8">
        {/* Header */}
        <header className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">
              Good morning, {user?.displayName || user?.email || "Player"}!
            </h2>
            <p className="text-gray-600 mt-1">Ready to level up today? Let's crush those milestones!</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 bg-yellow-50 px-4 py-2 rounded-lg">
              <i className="fas fa-fire text-yellow-500"></i>
              <span className="font-semibold text-yellow-700">{user?.streak || 0} day streak</span>
            </div>
            <Button onClick={() => setIsGoalModalOpen(true)} variant="outline" className="border-primary text-primary hover:bg-primary/10">
              <i className="fas fa-bullseye mr-2"></i>
              New Goal
            </Button>
            <Button onClick={() => setIsTaskModalOpen(true)} className="bg-primary hover:bg-primary/90">
              <i className="fas fa-plus mr-2"></i>
              New Task
            </Button>
          </div>
        </header>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Today's Progress */}
          <div className="lg:col-span-2">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Today's Milestone</h3>
                <span className="text-sm text-gray-500">{formatDate(new Date())}</span>
              </div>
              
              <div className="flex items-center justify-center mb-6">
                <ProgressRing progress={stats.progressPercentage} size={128} />
              </div>

              <div className="text-center mb-6">
                <p className="text-gray-600">
                  <span className="font-semibold text-primary">{stats.completedTasks}</span> of{" "}
                  <span>{stats.totalTasks}</span> tasks completed
                </p>
                <div className="flex items-center justify-center space-x-4 mt-2 text-sm">
                  <span className="text-gray-500">
                    +<span>{stats.earnedXP}</span> XP earned today
                  </span>
                  {stats.earnedGems > 0 && (
                    <span className="text-amber-600 font-medium">
                      <i className="fas fa-gem mr-1"></i>
                      +{stats.earnedGems} Gem{stats.earnedGems !== 1 ? 's' : ''}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex space-x-3">
                <Button className="flex-1 bg-primary hover:bg-primary/90">
                  View All Tasks
                </Button>
                <Button variant="outline" className="flex-1">
                  Review Day
                </Button>
              </div>
            </Card>
          </div>

          {/* Stats Cards */}
          <div className="space-y-6">
            {/* Active Goals */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-gray-900">Active Goals</h4>
                <i className="fas fa-bullseye text-gray-400"></i>
              </div>
              <div className="space-y-3">
                {goals.length > 0 ? (
                  goals.map((goal) => {
                    const daysLeft = Math.ceil((new Date(goal.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                    return (
                      <div key={goal.id} className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          goal.type === 'short-term' ? 'bg-blue-100' : 'bg-purple-100'
                        }`}>
                          <i className={`fas fa-target ${
                            goal.type === 'short-term' ? 'text-blue-600' : 'text-purple-600'
                          } text-sm`}></i>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{goal.title}</p>
                          <p className="text-xs text-gray-500">
                            {daysLeft > 0 ? `${daysLeft} days left` : 'Due today'}
                          </p>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-4">
                    <p className="text-sm text-gray-500 mb-3">No active goals yet</p>
                    <Button 
                      onClick={() => setIsGoalModalOpen(true)} 
                      variant="outline" 
                      size="sm"
                      className="border-dashed"
                    >
                      <i className="fas fa-plus mr-2"></i>
                      Create Goal
                    </Button>
                  </div>
                )}
              </div>
            </Card>

            {/* Pomodoro Timer */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-gray-900">Focus Timer</h4>
                <i className="fas fa-clock text-gray-400"></i>
              </div>
              <div className="space-y-4">
                {selectedTask && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-sm text-blue-700 font-medium">Selected Task:</p>
                    <p className="text-sm text-blue-600">{selectedTask.title}</p>
                  </div>
                )}
                <PomodoroTimer 
                  task={selectedTask || undefined} 
                  onSessionComplete={() => {
                    queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
                  }}
                />
              </div>
            </Card>

            {/* Recent Achievements */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-gray-900">Recent Achievements</h4>
                <i className="fas fa-trophy text-gray-400"></i>
              </div>
              <div className="space-y-3">
                {achievements.length > 0 ? (
                  achievements.map((achievement) => (
                    <div key={achievement.id} className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                        <i className="fas fa-medal text-yellow-600 text-sm"></i>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{achievement.title}</p>
                        <p className="text-xs text-gray-500">{achievement.description}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">No achievements yet. Complete tasks to earn your first achievement!</p>
                )}
              </div>
            </Card>
          </div>
        </div>

        {/* Tasks List */}
        <Card>
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Today's Tasks</h3>
              <div className="flex items-center space-x-3">
                <Select value={taskFilter} onValueChange={setTaskFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Tasks</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="space-y-4">
              {filteredTasks.length > 0 ? (
                filteredTasks.map((task) => (
                  <div key={task.id} className="relative">
                    <TaskItem
                      task={task}
                      onComplete={() => completeTaskMutation.mutate(task.id)}
                      onDelete={() => deleteTaskMutation.mutate(task.id)}
                      isCompletingTask={completeTaskMutation.isPending}
                      isDeletingTask={deleteTaskMutation.isPending}
                    />
                    {!task.completed && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute top-4 right-20 text-blue-500 hover:text-blue-700"
                        onClick={() => setSelectedTask(task)}
                        title="Start Pomodoro session for this task"
                      >
                        <i className="fas fa-clock"></i>
                      </Button>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <i className="fas fa-tasks text-gray-300 text-4xl mb-4"></i>
                  <p className="text-gray-500">
                    {taskFilter === "all" 
                      ? "No tasks for today. Create your first task to get started!"
                      : `No ${taskFilter} tasks for today.`
                    }
                  </p>
                </div>
              )}
            </div>

            {/* Add Task Button */}
            <div className="mt-6 pt-4 border-t border-gray-200">
              <Button
                variant="outline"
                className="w-full border-dashed border-2 hover:border-primary hover:text-primary"
                onClick={() => setIsTaskModalOpen(true)}
              >
                <i className="fas fa-plus mr-2"></i>
                Add new task
              </Button>
            </div>
          </div>
        </Card>
      </main>

      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onTaskCreated={() => {
          queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
          queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
        }}
      />

      <GoalModal
        isOpen={isGoalModalOpen}
        onClose={() => setIsGoalModalOpen(false)}
        onGoalCreated={() => {
          queryClient.invalidateQueries({ queryKey: ["/api/goals"] });
          queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
        }}
      />
    </div>
  );
}
