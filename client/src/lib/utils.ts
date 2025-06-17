import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

export function getCurrentDate(): string {
  return new Date().toISOString().split('T')[0];
}

export function calculateProgress(completed: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((completed / total) * 100);
}

export function calculateLevel(xp: number): number {
  return Math.floor(xp / 100) + 1;
}

export function calculateXpForNextLevel(xp: number): number {
  const currentLevel = calculateLevel(xp);
  return currentLevel * 100;
}

export function calculateXpProgress(xp: number): number {
  const currentLevelXp = (calculateLevel(xp) - 1) * 100;
  const nextLevelXp = calculateLevel(xp) * 100;
  return Math.round(((xp - currentLevelXp) / (nextLevelXp - currentLevelXp)) * 100);
}

export function getPriorityColor(priority: string): string {
  switch (priority) {
    case 'high':
      return 'bg-red-50 border-red-200 text-red-800';
    case 'medium':
      return 'bg-yellow-50 border-yellow-200 text-yellow-800';
    case 'low':
      return 'bg-green-50 border-green-200 text-green-800';
    default:
      return 'bg-gray-50 border-gray-200 text-gray-800';
  }
}

export function getCategoryColor(category: string): string {
  switch (category.toLowerCase()) {
    case 'work':
      return 'bg-blue-100 text-blue-800';
    case 'personal':
      return 'bg-purple-100 text-purple-800';
    case 'health':
      return 'bg-green-100 text-green-800';
    case 'learning':
      return 'bg-orange-100 text-orange-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

export function getCategoryIcon(category: string): string {
  switch (category.toLowerCase()) {
    case 'work':
      return 'fas fa-briefcase';
    case 'personal':
      return 'fas fa-user';
    case 'health':
      return 'fas fa-heart';
    case 'learning':
      return 'fas fa-book';
    default:
      return 'fas fa-tasks';
  }
}
