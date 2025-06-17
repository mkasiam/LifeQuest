import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertTaskSchema, insertGoalSchema, insertPomodoroSessionSchema, type Goal, type InsertTask } from "@shared/schema";
import { z } from "zod";
import { authenticateToken, type AuthenticatedRequest } from "./auth-middleware";

// Timeline generation utility
function generateGoalTimeline(goal: Goal): (InsertTask & { date: string })[] {
  const timeline: (InsertTask & { date: string })[] = [];
  const startDate = new Date();
  const endDate = new Date(goal.deadline);
  const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  
  if (totalDays <= 0) return timeline;
  
  // Generate milestone tasks based on goal type
  if (goal.type === 'short-term') {
    // Short-term goals: distribute tasks evenly
    const taskCount = Math.min(totalDays, 7); // Max 7 tasks for short-term
    for (let i = 0; i < taskCount; i++) {
      const taskDate = new Date(startDate);
      taskDate.setDate(startDate.getDate() + Math.floor((totalDays / taskCount) * i));
      
      timeline.push({
        title: `${goal.title} - Milestone ${i + 1}`,
        category: 'personal',
        priority: i === taskCount - 1 ? 'high' : 'medium',
        estimatedTime: 60, // 1 hour default
        externalLinks: null,
        xpReward: 30,
        gemReward: 2,
        dueTime: '18:00', // 6 PM default
        date: taskDate.toISOString().split('T')[0],
      });
    }
  } else {
    // Long-term goals: weekly milestones
    const weekCount = Math.ceil(totalDays / 7);
    for (let week = 0; week < weekCount; week++) {
      const taskDate = new Date(startDate);
      taskDate.setDate(startDate.getDate() + (week * 7));
      
      if (taskDate <= endDate) {
        timeline.push({
          title: `${goal.title} - Week ${week + 1} Progress`,
          category: 'personal',
          priority: week === weekCount - 1 ? 'high' : 'medium',
          estimatedTime: 120, // 2 hours for weekly milestones
          externalLinks: null,
          xpReward: 50,
          gemReward: 3,
          dueTime: '18:00',
          date: taskDate.toISOString().split('T')[0],
        });
      }
    }
  }
  
  return timeline;
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Get current authenticated user
  app.get("/api/user", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      res.json(req.user);
    } catch (error) {
      res.status(500).json({ message: "Failed to get user" });
    }
  });

  // Get tasks for a specific date
  app.get("/api/tasks", async (req, res) => {
    try {
      const date = req.query.date as string;
      const tasks = await storage.getTasks(1, date); // Default user for demo
      res.json(tasks);
    } catch (error) {
      res.status(500).json({ message: "Failed to get tasks" });
    }
  });

  // Create a new task
  app.post("/api/tasks", async (req, res) => {
    try {
      const validatedData = insertTaskSchema.parse(req.body);
      const task = await storage.createTask({ ...validatedData, userId: 1 });
      res.status(201).json(task);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid task data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create task" });
    }
  });

  // Update a task
  app.patch("/api/tasks/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      const task = await storage.updateTask(id, updates);
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
      res.json(task);
    } catch (error) {
      res.status(500).json({ message: "Failed to update task" });
    }
  });

  // Complete a task
  app.post("/api/tasks/:id/complete", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const task = await storage.completeTask(id);
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
      res.json(task);
    } catch (error) {
      res.status(500).json({ message: "Failed to complete task" });
    }
  });

  // Delete a task
  app.delete("/api/tasks/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteTask(id);
      if (!deleted) {
        return res.status(404).json({ message: "Task not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete task" });
    }
  });

  // Get achievements
  app.get("/api/achievements", async (req, res) => {
    try {
      const achievements = await storage.getAchievements(1); // Default user for demo
      res.json(achievements);
    } catch (error) {
      res.status(500).json({ message: "Failed to get achievements" });
    }
  });

  // Goals endpoints
  app.get("/api/goals", async (req, res) => {
    try {
      const goals = await storage.getGoals(1);
      res.json(goals);
    } catch (error) {
      res.status(500).json({ message: "Failed to get goals" });
    }
  });

  app.post("/api/goals", async (req, res) => {
    try {
      const validatedData = insertGoalSchema.parse(req.body);
      const goal = await storage.createGoal({ ...validatedData, userId: 1 });
      
      // Generate timeline tasks for the goal
      const timeline = generateGoalTimeline(goal);
      for (const taskData of timeline) {
        await storage.createTask({ ...taskData, userId: 1, goalId: goal.id });
      }
      
      res.status(201).json(goal);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid goal data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create goal" });
    }
  });

  app.patch("/api/goals/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      const goal = await storage.updateGoal(id, updates);
      if (!goal) {
        return res.status(404).json({ message: "Goal not found" });
      }
      res.json(goal);
    } catch (error) {
      res.status(500).json({ message: "Failed to update goal" });
    }
  });

  app.post("/api/goals/:id/complete", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const goal = await storage.completeGoal(id);
      if (!goal) {
        return res.status(404).json({ message: "Goal not found" });
      }
      res.json(goal);
    } catch (error) {
      res.status(500).json({ message: "Failed to complete goal" });
    }
  });

  app.delete("/api/goals/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteGoal(id);
      if (!deleted) {
        return res.status(404).json({ message: "Goal not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete goal" });
    }
  });

  // Pomodoro endpoints
  app.get("/api/pomodoro", async (req, res) => {
    try {
      const sessions = await storage.getPomodoroSessions(1);
      res.json(sessions);
    } catch (error) {
      res.status(500).json({ message: "Failed to get pomodoro sessions" });
    }
  });

  app.post("/api/pomodoro", async (req, res) => {
    try {
      const validatedData = insertPomodoroSessionSchema.parse(req.body);
      const session = await storage.createPomodoroSession({ ...validatedData, userId: 1 });
      res.status(201).json(session);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid session data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create pomodoro session" });
    }
  });

  app.post("/api/pomodoro/:id/complete", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const session = await storage.completePomodoroSession(id);
      if (!session) {
        return res.status(404).json({ message: "Session not found" });
      }
      res.json(session);
    } catch (error) {
      res.status(500).json({ message: "Failed to complete session" });
    }
  });

  // Get dashboard stats
  app.get("/api/dashboard", async (req, res) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const user = await storage.getUser(1);
      const todayTasks = await storage.getTasks(1, today);
      const goals = await storage.getGoals(1);
      const achievements = await storage.getAchievements(1);
      
      const completedTasks = todayTasks.filter(task => task.completed);
      const totalTasks = todayTasks.length;
      const progressPercentage = totalTasks > 0 ? Math.round((completedTasks.length / totalTasks) * 100) : 0;
      const earnedXP = completedTasks.reduce((sum, task) => sum + task.xpReward, 0);
      const earnedGems = completedTasks.filter(task => task.completedOnTime).reduce((sum, task) => sum + task.gemReward, 0);
      
      res.json({
        user,
        todayTasks,
        goals: goals.slice(0, 3), // Show top 3 active goals
        achievements: achievements.slice(-2), // Latest 2 achievements
        stats: {
          progressPercentage,
          completedTasks: completedTasks.length,
          totalTasks,
          earnedXP,
          earnedGems,
        }
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to get dashboard data" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
