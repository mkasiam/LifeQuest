import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { useLocation } from 'wouter';
import { FcGoogle } from 'react-icons/fc';
import { Loader2 } from 'lucide-react';

export default function Login() {
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const [, setLocation] = useLocation();

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      await login();
      setLocation('/');
    } catch (error) {
      console.error('Login failed:', error);
      // Error handling could include toast notifications here
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Welcome to LifeQuest</CardTitle>
          <CardDescription>
            Transform your goals into an epic adventure. Sign in to start your quest!
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2"
            variant="outline"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <FcGoogle className="h-5 w-5" />
            )}
            {loading ? 'Signing in...' : 'Continue with Google'}
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or try demo mode
              </span>
            </div>
          </div>

          <Button
            onClick={() => setLocation('/')}
            className="w-full"
            variant="secondary"
          >
            Enter Demo Mode
          </Button>
          
          <div className="mt-6 text-center text-sm text-muted-foreground">
            <p>
              Create goals, track progress, and earn rewards as you level up your life!
            </p>
            <p className="mt-2 text-xs">
              Demo mode lets you explore the app without signing in
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}