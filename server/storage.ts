import { users, tasks, achievements, type User, type InsertUser, type Task, type InsertTask, type Achievement, type InsertAchievement } from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<User>): Promise<User | undefined>;

  // Task methods
  getTasks(userId: number, date?: string): Promise<Task[]>;
  getTask(id: number): Promise<Task | undefined>;
  createTask(task: InsertTask & { userId: number }): Promise<Task>;
  updateTask(id: number, updates: Partial<Task>): Promise<Task | undefined>;
  deleteTask(id: number): Promise<boolean>;
  completeTask(id: number): Promise<Task | undefined>;

  // Achievement methods
  getAchievements(userId: number): Promise<Achievement[]>;
  createAchievement(achievement: InsertAchievement & { userId: number }): Promise<Achievement>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User> = new Map();
  private tasks: Map<number, Task> = new Map();
  private achievements: Map<number, Achievement> = new Map();
  private currentUserId = 1;
  private currentTaskId = 1;
  private currentAchievementId = 1;

  constructor() {
    // Create a default user for demo purposes
    this.createUser({ username: "Alex", password: "password" });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = {
      ...insertUser,
      id,
      level: 1,
      xp: 0,
      streak: 7, // Default streak for demo
      lastActiveDate: new Date().toISOString().split('T')[0],
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...updates };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Task methods
  async getTasks(userId: number, date?: string): Promise<Task[]> {
    const allTasks = Array.from(this.tasks.values()).filter(task => task.userId === userId);
    if (date) {
      return allTasks.filter(task => task.date === date);
    }
    return allTasks;
  }

  async getTask(id: number): Promise<Task | undefined> {
    return this.tasks.get(id);
  }

  async createTask(taskData: InsertTask & { userId: number }): Promise<Task> {
    const id = this.currentTaskId++;
    const task: Task = {
      ...taskData,
      id,
      completed: false,
      completedAt: null,
      createdAt: new Date(),
    };
    this.tasks.set(id, task);
    return task;
  }

  async updateTask(id: number, updates: Partial<Task>): Promise<Task | undefined> {
    const task = this.tasks.get(id);
    if (!task) return undefined;
    
    const updatedTask = { ...task, ...updates };
    this.tasks.set(id, updatedTask);
    return updatedTask;
  }

  async deleteTask(id: number): Promise<boolean> {
    return this.tasks.delete(id);
  }

  async completeTask(id: number): Promise<Task | undefined> {
    const task = this.tasks.get(id);
    if (!task) return undefined;
    
    const completedTask = {
      ...task,
      completed: true,
      completedAt: new Date(),
    };
    this.tasks.set(id, completedTask);
    
    // Update user XP and check for level up
    const user = await this.getUser(task.userId);
    if (user) {
      const newXp = user.xp + task.xpReward;
      const newLevel = Math.floor(newXp / 100) + 1; // Level up every 100 XP
      await this.updateUser(user.id, { xp: newXp, level: newLevel });
    }
    
    return completedTask;
  }

  // Achievement methods
  async getAchievements(userId: number): Promise<Achievement[]> {
    return Array.from(this.achievements.values()).filter(achievement => achievement.userId === userId);
  }

  async createAchievement(achievementData: InsertAchievement & { userId: number }): Promise<Achievement> {
    const id = this.currentAchievementId++;
    const achievement: Achievement = {
      ...achievementData,
      id,
      earnedAt: new Date(),
    };
    this.achievements.set(id, achievement);
    return achievement;
  }
}

export const storage = new MemStorage();
