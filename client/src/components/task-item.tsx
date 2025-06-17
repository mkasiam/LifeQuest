import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getCategoryColor, getCategoryIcon, getPriorityColor } from "@/lib/utils";
import type { Task } from "@shared/schema";

interface TaskItemProps {
  task: Task;
  onComplete: () => void;
  onDelete: () => void;
  isCompletingTask: boolean;
  isDeletingTask: boolean;
}

export default function TaskItem({ 
  task, 
  onComplete, 
  onDelete, 
  isCompletingTask, 
  isDeletingTask 
}: TaskItemProps) {
  const formatTime = (time: string | null) => {
    if (!time) return null;
    return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatCompletedTime = (completedAt: Date | null) => {
    if (!completedAt) return null;
    return new Date(completedAt).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const priorityBadgeClass = task.priority === 'high' 
    ? 'bg-red-100 text-red-800 border-red-200' 
    : task.priority === 'medium'
    ? 'bg-yellow-100 text-yellow-800 border-yellow-200'
    : 'bg-green-100 text-green-800 border-green-200';

  const containerClass = task.completed
    ? 'flex items-center space-x-4 p-4 bg-green-50 border border-green-200 rounded-lg opacity-75'
    : task.priority === 'high'
    ? 'flex items-center space-x-4 p-4 bg-red-50 border border-red-200 rounded-lg'
    : 'flex items-center space-x-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors';

  return (
    <div className={containerClass}>
      <button
        onClick={onComplete}
        disabled={task.completed || isCompletingTask}
        className={`w-5 h-5 border-2 rounded transition-colors ${
          task.completed
            ? 'bg-green-500 border-green-500'
            : task.priority === 'high'
            ? 'border-red-500 hover:bg-red-500 group'
            : 'border-gray-300 hover:border-primary hover:bg-primary group'
        }`}
      >
        {task.completed ? (
          <i className="fas fa-check text-white text-xs"></i>
        ) : (
          <i className="fas fa-check text-white text-xs opacity-0 group-hover:opacity-100"></i>
        )}
      </button>

      <div className="flex-1">
        <h4 className={`font-medium text-gray-900 ${task.completed ? 'line-through' : ''}`}>
          {task.title}
        </h4>
        <div className="flex items-center flex-wrap gap-2 mt-1">
          {task.completed ? (
            <Badge className="bg-green-100 text-green-800 border-green-200">
              <i className="fas fa-check-circle mr-1"></i>
              Completed {task.completedOnTime ? '(On Time!)' : ''}
            </Badge>
          ) : (
            <Badge className={priorityBadgeClass}>
              {task.priority === 'high' && <i className="fas fa-exclamation-triangle mr-1"></i>}
              {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)} Priority
            </Badge>
          )}
          
          <Badge className={getCategoryColor(task.category)}>
            <i className={`${getCategoryIcon(task.category)} mr-1`}></i>
            {task.category.charAt(0).toUpperCase() + task.category.slice(1)}
          </Badge>

          {task.estimatedTime && (
            <Badge variant="outline" className="text-blue-600 border-blue-200">
              <i className="fas fa-clock mr-1"></i>
              {task.estimatedTime}m
            </Badge>
          )}

          <div className="flex items-center space-x-3 text-sm">
            {task.completed && task.completedAt ? (
              <span className="text-gray-500">
                Completed at {formatCompletedTime(task.completedAt)}
              </span>
            ) : task.dueTime ? (
              <span className="text-gray-500">
                Due: {formatTime(task.dueTime)}
              </span>
            ) : null}

            <span className={`font-medium ${
              task.completed ? 'text-green-600' : 'text-gray-500'
            }`}>
              {task.completed ? '+' : ''}{task.xpReward} XP
            </span>

            {task.completed && task.completedOnTime && (
              <span className="text-amber-600 font-medium">
                <i className="fas fa-gem mr-1"></i>
                +{task.gemReward} Gem{task.gemReward !== 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>

        {/* External Links */}
        {task.externalLinks && (
          <div className="mt-2 flex flex-wrap gap-2">
            {task.externalLinks.split(',').map((link, index) => {
              const trimmedLink = link.trim();
              if (!trimmedLink) return null;
              
              const isYouTube = trimmedLink.includes('youtube.com') || trimmedLink.includes('youtu.be');
              
              return (
                <a
                  key={index}
                  href={trimmedLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-1 text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded hover:bg-blue-100 transition-colors"
                >
                  <i className={`fas ${isYouTube ? 'fa-video' : 'fa-external-link-alt'}`}></i>
                  <span>{isYouTube ? 'YouTube' : 'Link'} {index + 1}</span>
                </a>
              );
            })}
          </div>
        )}
      </div>

      <div className="flex items-center space-x-2">
        <Button
          variant="ghost"
          size="sm"
          className="text-gray-400 hover:text-gray-600"
          disabled={isDeletingTask}
        >
          <i className="fas fa-edit"></i>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="text-gray-400 hover:text-red-500"
          onClick={onDelete}
          disabled={isDeletingTask}
        >
          <i className="fas fa-trash"></i>
        </Button>
      </div>
    </div>
  );
}
