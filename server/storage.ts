import { 
  users, tasks, achievements, goals, pomodoroSessions,
  type User, type InsertUser, 
  type Task, type InsertTask, 
  type Achievement, type InsertAchievement,
  type Goal, type InsertGoal,
  type PomodoroSession, type InsertPomodoroSession
} from "@shared/schema";
import { db } from "./db";
import { eq, and } from "drizzle-orm";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<User>): Promise<User | undefined>;

  // Goal methods
  getGoals(userId: number): Promise<Goal[]>;
  getGoal(id: number): Promise<Goal | undefined>;
  createGoal(goal: InsertGoal & { userId: number }): Promise<Goal>;
  updateGoal(id: number, updates: Partial<Goal>): Promise<Goal | undefined>;
  deleteGoal(id: number): Promise<boolean>;
  completeGoal(id: number): Promise<Goal | undefined>;

  // Task methods
  getTasks(userId: number, date?: string, goalId?: number): Promise<Task[]>;
  getTask(id: number): Promise<Task | undefined>;
  createTask(task: InsertTask & { userId: number }): Promise<Task>;
  updateTask(id: number, updates: Partial<Task>): Promise<Task | undefined>;
  deleteTask(id: number): Promise<boolean>;
  completeTask(id: number): Promise<Task | undefined>;

  // Pomodoro methods
  getPomodoroSessions(userId: number): Promise<PomodoroSession[]>;
  createPomodoroSession(session: InsertPomodoroSession & { userId: number }): Promise<PomodoroSession>;
  completePomodoroSession(id: number): Promise<PomodoroSession | undefined>;

  // Achievement methods
  getAchievements(userId: number): Promise<Achievement[]>;
  createAchievement(achievement: InsertAchievement & { userId: number }): Promise<Achievement>;
}

export class DatabaseStorage implements IStorage {
  constructor() {
    this.initializeDefaultUser();
  }

  private async initializeDefaultUser() {
    try {
      const existingUser = await this.getUserByUsername("Alex");
      if (!existingUser) {
        await this.createUser({ username: "Alex", password: "password" });
      }
    } catch (error) {
      console.error("Error initializing default user:", error);
    }
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values({
        ...insertUser,
        level: 1,
        xp: 0,
        streak: 7,
        gems: 0,
        lastActiveDate: new Date().toISOString().split('T')[0],
      })
      .returning();
    return user;
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set(updates)
      .where(eq(users.id, id))
      .returning();
    return user || undefined;
  }

  // Goal methods
  async getGoals(userId: number): Promise<Goal[]> {
    return await db.select().from(goals).where(eq(goals.userId, userId));
  }

  async getGoal(id: number): Promise<Goal | undefined> {
    const [goal] = await db.select().from(goals).where(eq(goals.id, id));
    return goal || undefined;
  }

  async createGoal(goalData: InsertGoal & { userId: number }): Promise<Goal> {
    const [goal] = await db
      .insert(goals)
      .values({
        ...goalData,
        description: goalData.description || null,
        completed: false,
        completedAt: null,
        createdAt: new Date(),
      })
      .returning();
    return goal;
  }

  async updateGoal(id: number, updates: Partial<Goal>): Promise<Goal | undefined> {
    const [goal] = await db
      .update(goals)
      .set(updates)
      .where(eq(goals.id, id))
      .returning();
    return goal || undefined;
  }

  async deleteGoal(id: number): Promise<boolean> {
    const result = await db.delete(goals).where(eq(goals.id, id));
    return result.rowCount > 0;
  }

  async completeGoal(id: number): Promise<Goal | undefined> {
    const [goal] = await db
      .update(goals)
      .set({
        completed: true,
        completedAt: new Date(),
      })
      .where(eq(goals.id, id))
      .returning();
    return goal || undefined;
  }

  // Task methods
  async getTasks(userId: number, date?: string, goalId?: number): Promise<Task[]> {
    let query = db.select().from(tasks).where(eq(tasks.userId, userId));
    
    if (date && goalId) {
      return await db.select().from(tasks)
        .where(eq(tasks.userId, userId))
        .where(eq(tasks.date, date))
        .where(eq(tasks.goalId, goalId));
    } else if (date) {
      return await db.select().from(tasks)
        .where(eq(tasks.userId, userId))
        .where(eq(tasks.date, date));
    } else if (goalId) {
      return await db.select().from(tasks)
        .where(eq(tasks.userId, userId))
        .where(eq(tasks.goalId, goalId));
    }
    
    return await db.select().from(tasks).where(eq(tasks.userId, userId));
  }

  async getTask(id: number): Promise<Task | undefined> {
    const [task] = await db.select().from(tasks).where(eq(tasks.id, id));
    return task || undefined;
  }

  async createTask(taskData: InsertTask & { userId: number }): Promise<Task> {
    const [task] = await db
      .insert(tasks)
      .values({
        ...taskData,
        goalId: taskData.goalId || null,
        estimatedTime: taskData.estimatedTime || null,
        externalLinks: taskData.externalLinks || null,
        xpReward: taskData.xpReward || 20,
        gemReward: taskData.gemReward || 1,
        dueTime: taskData.dueTime || null,
        completed: false,
        completedAt: null,
        completedOnTime: false,
        createdAt: new Date(),
      })
      .returning();
    return task;
  }

  async updateTask(id: number, updates: Partial<Task>): Promise<Task | undefined> {
    const [task] = await db
      .update(tasks)
      .set(updates)
      .where(eq(tasks.id, id))
      .returning();
    return task || undefined;
  }

  async deleteTask(id: number): Promise<boolean> {
    const result = await db.delete(tasks).where(eq(tasks.id, id));
    return result.rowCount > 0;
  }

  async completeTask(id: number): Promise<Task | undefined> {
    const task = await this.getTask(id);
    if (!task) return undefined;
    
    const completedAt = new Date();
    const dueDate = task.dueTime ? new Date(`${task.date}T${task.dueTime}`) : null;
    const completedOnTime = dueDate ? completedAt <= dueDate : true;
    
    const [completedTask] = await db
      .update(tasks)
      .set({
        completed: true,
        completedAt,
        completedOnTime,
      })
      .where(eq(tasks.id, id))
      .returning();
    
    // Update user XP and gems
    const user = await this.getUser(task.userId);
    if (user) {
      const newXp = user.xp + task.xpReward;
      const newGems = user.gems + (completedOnTime ? task.gemReward : 0);
      const newLevel = Math.floor(newXp / 100) + 1; // Level up every 100 XP
      await this.updateUser(user.id, { xp: newXp, gems: newGems, level: newLevel });
    }
    
    return completedTask;
  }

  // Pomodoro methods
  async getPomodoroSessions(userId: number): Promise<PomodoroSession[]> {
    return await db.select().from(pomodoroSessions).where(eq(pomodoroSessions.userId, userId));
  }

  async createPomodoroSession(sessionData: InsertPomodoroSession & { userId: number }): Promise<PomodoroSession> {
    const [session] = await db
      .insert(pomodoroSessions)
      .values({
        ...sessionData,
        taskId: sessionData.taskId || null,
        completed: false,
        startedAt: new Date(),
        completedAt: null,
      })
      .returning();
    return session;
  }

  async completePomodoroSession(id: number): Promise<PomodoroSession | undefined> {
    const [session] = await db.select().from(pomodoroSessions).where(eq(pomodoroSessions.id, id));
    if (!session) return undefined;
    
    const [completedSession] = await db
      .update(pomodoroSessions)
      .set({
        completed: true,
        completedAt: new Date(),
      })
      .where(eq(pomodoroSessions.id, id))
      .returning();
    
    // Award bonus XP for completed pomodoro
    const user = await this.getUser(session.userId);
    if (user) {
      const bonusXp = Math.floor(session.duration / 5); // 1 XP per 5 minutes
      await this.updateUser(user.id, { xp: user.xp + bonusXp });
    }
    
    return completedSession;
  }

  // Achievement methods
  async getAchievements(userId: number): Promise<Achievement[]> {
    return await db.select().from(achievements).where(eq(achievements.userId, userId));
  }

  async createAchievement(achievementData: InsertAchievement & { userId: number }): Promise<Achievement> {
    const [achievement] = await db
      .insert(achievements)
      .values({
        ...achievementData,
        earnedAt: new Date(),
      })
      .returning();
    return achievement;
  }
}

export const storage = new DatabaseStorage();
