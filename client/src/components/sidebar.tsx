import { Link, useLocation } from "wouter";
import { calculateXpProgress, calculateXpForNextLevel } from "@/lib/utils";
import type { User, Achievement } from "@shared/schema";

interface SidebarProps {
  user?: User;
  achievements?: Achievement[];
}

export default function Sidebar({ user, achievements = [] }: SidebarProps) {
  const [location] = useLocation();
  
  const navItems = [
    { path: "/", label: "Dashboard", icon: "fas fa-home" },
    { path: "/tasks", label: "All Tasks", icon: "fas fa-tasks" },
    { path: "/calendar", label: "Calendar", icon: "fas fa-calendar-alt" },
    { path: "/achievements", label: "Achievements", icon: "fas fa-trophy" },
    { path: "/analytics", label: "Analytics", icon: "fas fa-chart-line" },
    { path: "/settings", label: "Settings", icon: "fas fa-cog" },
  ];

  const xpProgress = user ? calculateXpProgress(user.xp) : 0;
  const nextLevelXp = user ? calculateXpForNextLevel(user.xp) : 100;

  return (
    <aside className="w-64 bg-white border-r border-gray-200 fixed h-full overflow-y-auto">
      <div className="p-6">
        {/* Logo */}
        <div className="flex items-center space-x-3 mb-8">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <i className="fas fa-gamepad text-white text-lg"></i>
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">LifeQuest</h1>
            <p className="text-sm text-gray-500">Level up your life</p>
          </div>
        </div>

        {/* User Stats */}
        {user && (
          <div className="bg-gradient-to-r from-primary to-primary/80 rounded-xl p-4 mb-6 text-white">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm opacity-90">Current Level</span>
              <span className="text-lg font-bold">{user.level}</span>
            </div>
            <div className="w-full bg-primary/70 rounded-full h-2 mb-2">
              <div 
                className="bg-white h-2 rounded-full transition-all duration-300" 
                style={{ width: `${xpProgress}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-xs opacity-90 mb-3">
              <span>{user.xp} XP</span>
              <span>{nextLevelXp} XP</span>
            </div>
            
            {/* Gems Display */}
            <div className="flex items-center justify-center space-x-2 bg-white/20 rounded-lg py-2">
              <i className="fas fa-gem text-amber-300"></i>
              <span className="font-semibold">{user.gems} Gems</span>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="space-y-2">
          {navItems.map((item) => {
            const isActive = location === item.path;
            return (
              <Link key={item.path} href={item.path}>
                <a className={`flex items-center space-x-3 px-4 py-3 rounded-lg font-medium transition-colors ${
                  isActive 
                    ? "text-primary bg-primary/10" 
                    : "text-gray-600 hover:bg-gray-100"
                }`}>
                  <i className={item.icon}></i>
                  <span>{item.label}</span>
                </a>
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
