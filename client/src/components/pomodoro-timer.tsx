import { useState, useEffect, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import type { Task } from "@shared/schema";

interface PomodoroTimerProps {
  task?: Task;
  onSessionComplete?: () => void;
}

const TIMER_DURATIONS = {
  pomodoro: 25,
  shortBreak: 5,
  longBreak: 15,
  custom: 45,
};

type TimerType = keyof typeof TIMER_DURATIONS;

export default function PomodoroTimer({ task, onSessionComplete }: PomodoroTimerProps) {
  const { toast } = useToast();
  const [timerType, setTimerType] = useState<TimerType>("pomodoro");
  const [timeLeft, setTimeLeft] = useState(TIMER_DURATIONS.pomodoro * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionId, setSessionId] = useState<number | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize audio for timer completion
  useEffect(() => {
    audioRef.current = new Audio();
    audioRef.current.src = "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhCSmu3O/BdygLKoXQ9NuJOAgVabzuzKNRBgA=";
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const startSessionMutation = useMutation({
    mutationFn: async (duration: number) => {
      const response = await apiRequest("POST", "/api/pomodoro", {
        duration,
        taskId: task?.id || null,
      });
      return response.json();
    },
    onSuccess: (session) => {
      setSessionId(session.id);
    },
  });

  const completeSessionMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("POST", `/api/pomodoro/${id}/complete`);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Pomodoro session completed!",
        description: `Great job! You've earned bonus XP for completing a ${timerType} session.`,
      });
      onSessionComplete?.();
      setSessionId(null);
    },
  });

  useEffect(() => {
    setTimeLeft(TIMER_DURATIONS[timerType] * 60);
  }, [timerType]);

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            // Play completion sound
            if (audioRef.current) {
              audioRef.current.play().catch(() => {
                // Audio play failed, ignore
              });
            }
            
            // Complete the session if it was started
            if (sessionId) {
              completeSessionMutation.mutate(sessionId);
            }
            
            toast({
              title: "Timer completed!",
              description: `Your ${timerType} session is finished. Great work!`,
            });
            
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, timeLeft, sessionId, timerType, completeSessionMutation, toast]);

  const startTimer = () => {
    setIsRunning(true);
    if (!sessionId) {
      startSessionMutation.mutate(TIMER_DURATIONS[timerType]);
    }
  };

  const pauseTimer = () => {
    setIsRunning(false);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(TIMER_DURATIONS[timerType] * 60);
    setSessionId(null);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimerColor = (): string => {
    switch (timerType) {
      case 'pomodoro':
        return 'text-red-600';
      case 'shortBreak':
        return 'text-green-600';
      case 'longBreak':
        return 'text-blue-600';
      case 'custom':
        return 'text-purple-600';
      default:
        return 'text-gray-600';
    }
  };

  const getTimerBadgeColor = (): string => {
    switch (timerType) {
      case 'pomodoro':
        return 'bg-red-100 text-red-800';
      case 'shortBreak':
        return 'bg-green-100 text-green-800';
      case 'longBreak':
        return 'bg-blue-100 text-blue-800';
      case 'custom':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const progress = ((TIMER_DURATIONS[timerType] * 60 - timeLeft) / (TIMER_DURATIONS[timerType] * 60)) * 100;

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center space-x-2">
          <i className="fas fa-clock text-primary"></i>
          <span>Pomodoro Timer</span>
        </CardTitle>
        {task && (
          <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
            <i className="fas fa-tasks"></i>
            <span>Working on: {task.title}</span>
          </div>
        )}
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Timer Type Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Timer Type</label>
          <Select 
            value={timerType} 
            onValueChange={(value: TimerType) => {
              if (!isRunning) {
                setTimerType(value);
              }
            }}
            disabled={isRunning}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pomodoro">Pomodoro (25 min)</SelectItem>
              <SelectItem value="shortBreak">Short Break (5 min)</SelectItem>
              <SelectItem value="longBreak">Long Break (15 min)</SelectItem>
              <SelectItem value="custom">Custom (45 min)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Timer Display */}
        <div className="text-center space-y-4">
          <Badge className={getTimerBadgeColor()}>
            {timerType === 'pomodoro' && 'Focus Session'}
            {timerType === 'shortBreak' && 'Short Break'}
            {timerType === 'longBreak' && 'Long Break'}
            {timerType === 'custom' && 'Custom Session'}
          </Badge>
          
          <div className={`text-6xl font-mono font-bold ${getTimerColor()}`}>
            {formatTime(timeLeft)}
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-1000 ${
                timerType === 'pomodoro' ? 'bg-red-500' :
                timerType === 'shortBreak' ? 'bg-green-500' :
                timerType === 'longBreak' ? 'bg-blue-500' : 'bg-purple-500'
              }`}
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Timer Controls */}
        <div className="flex space-x-3">
          {!isRunning ? (
            <Button
              onClick={startTimer}
              className="flex-1 bg-primary hover:bg-primary/90"
              disabled={timeLeft === 0}
            >
              <i className="fas fa-play mr-2"></i>
              Start
            </Button>
          ) : (
            <Button
              onClick={pauseTimer}
              variant="outline"
              className="flex-1"
            >
              <i className="fas fa-pause mr-2"></i>
              Pause
            </Button>
          )}
          
          <Button
            onClick={resetTimer}
            variant="outline"
            className="flex-1"
          >
            <i className="fas fa-redo mr-2"></i>
            Reset
          </Button>
        </div>

        {/* Session Info */}
        {sessionId && (
          <div className="text-center text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
            <i className="fas fa-circle text-green-500 mr-1"></i>
            Session active - You'll earn bonus XP when completed!
          </div>
        )}
      </CardContent>
    </Card>
  );
}