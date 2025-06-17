import { 
  users, tasks, achievements, goals, pomodoroSessions,
  type User, type InsertUser, 
  type Task, type InsertTask, 
  type Achievement, type InsertAchievement,
  type Goal, type InsertGoal,
  type PomodoroSession, type InsertPomodoroSession
} from "@shared/schema";

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

export class MemStorage implements IStorage {
  private users: Map<number, User> = new Map();
  private goals: Map<number, Goal> = new Map();
  private tasks: Map<number, Task> = new Map();
  private pomodoroSessions: Map<number, PomodoroSession> = new Map();
  private achievements: Map<number, Achievement> = new Map();
  private currentUserId = 1;
  private currentGoalId = 1;
  private currentTaskId = 1;
  private currentPomodoroId = 1;
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
      gems: 0,
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

  // Goal methods
  async getGoals(userId: number): Promise<Goal[]> {
    return Array.from(this.goals.values()).filter(goal => goal.userId === userId);
  }

  async getGoal(id: number): Promise<Goal | undefined> {
    return this.goals.get(id);
  }

  async createGoal(goalData: InsertGoal & { userId: number }): Promise<Goal> {
    const id = this.currentGoalId++;
    const goal: Goal = {
      ...goalData,
      id,
      description: goalData.description || null,
      completed: false,
      completedAt: null,
      createdAt: new Date(),
    };
    this.goals.set(id, goal);
    return goal;
  }

  async updateGoal(id: number, updates: Partial<Goal>): Promise<Goal | undefined> {
    const goal = this.goals.get(id);
    if (!goal) return undefined;
    
    const updatedGoal = { ...goal, ...updates };
    this.goals.set(id, updatedGoal);
    return updatedGoal;
  }

  async deleteGoal(id: number): Promise<boolean> {
    return this.goals.delete(id);
  }

  async completeGoal(id: number): Promise<Goal | undefined> {
    const goal = this.goals.get(id);
    if (!goal) return undefined;
    
    const completedGoal = {
      ...goal,
      completed: true,
      completedAt: new Date(),
    };
    this.goals.set(id, completedGoal);
    return completedGoal;
  }

  // Task methods
  async getTasks(userId: number, date?: string, goalId?: number): Promise<Task[]> {
    let filteredTasks = Array.from(this.tasks.values()).filter(task => task.userId === userId);
    
    if (date) {
      filteredTasks = filteredTasks.filter(task => task.date === date);
    }
    
    if (goalId) {
      filteredTasks = filteredTasks.filter(task => task.goalId === goalId);
    }
    
    return filteredTasks;
  }

  async getTask(id: number): Promise<Task | undefined> {
    return this.tasks.get(id);
  }

  async createTask(taskData: InsertTask & { userId: number }): Promise<Task> {
    const id = this.currentTaskId++;
    const task: Task = {
      ...taskData,
      id,
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
    
    const completedAt = new Date();
    const dueDate = task.dueTime ? new Date(`${task.date}T${task.dueTime}`) : null;
    const completedOnTime = dueDate ? completedAt <= dueDate : true;
    
    const completedTask = {
      ...task,
      completed: true,
      completedAt,
      completedOnTime,
    };
    this.tasks.set(id, completedTask);
    
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
    return Array.from(this.pomodoroSessions.values()).filter(session => session.userId === userId);
  }

  async createPomodoroSession(sessionData: InsertPomodoroSession & { userId: number }): Promise<PomodoroSession> {
    const id = this.currentPomodoroId++;
    const session: PomodoroSession = {
      ...sessionData,
      id,
      taskId: sessionData.taskId || null,
      completed: false,
      startedAt: new Date(),
      completedAt: null,
    };
    this.pomodoroSessions.set(id, session);
    return session;
  }

  async completePomodoroSession(id: number): Promise<PomodoroSession | undefined> {
    const session = this.pomodoroSessions.get(id);
    if (!session) return undefined;
    
    const completedSession = {
      ...session,
      completed: true,
      completedAt: new Date(),
    };
    this.pomodoroSessions.set(id, completedSession);
    
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
