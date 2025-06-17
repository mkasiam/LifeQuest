import { useState, useEffect } from 'react';
import { User as FirebaseUser, onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import { firebasePromise } from '@/lib/firebase';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { User } from '@shared/schema';

export function useAuth() {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [demoMode, setDemoMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [firebaseInitialized, setFirebaseInitialized] = useState(false);
  const queryClient = useQueryClient();

  // Check for demo mode from localStorage
  useEffect(() => {
    const isDemoMode = localStorage.getItem('lifequest_demo_mode') === 'true';
    if (isDemoMode) {
      setDemoMode(true);
      setLoading(false);
      return;
    }

    // Initialize Firebase
    firebasePromise
      .then(({ auth }) => {
        setFirebaseInitialized(true);
        const unsubscribe = onAuthStateChanged(auth, (user) => {
          setFirebaseUser(user);
          setLoading(false);
          
          if (!user) {
            queryClient.clear();
          }
        });

        return () => unsubscribe();
      })
      .catch((error) => {
        console.error('Firebase initialization failed:', error);
        setLoading(false);
      });
  }, [queryClient]);

  // Query to get user data from our database
  const { data: user } = useQuery({
    queryKey: ['/api/user'],
    queryFn: async () => {
      if (demoMode) {
        // Return demo user data
        const response = await fetch('/api/user?demo=true');
        if (!response.ok) {
          throw new Error('Failed to fetch demo user');
        }
        return response.json() as Promise<User>;
      }
      
      if (!firebaseUser) return null;
      
      const token = await firebaseUser.getIdToken();
      const response = await fetch('/api/user', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch user');
      }
      
      return response.json() as Promise<User>;
    },
    enabled: demoMode || (!!firebaseUser && firebaseInitialized),
  });

  const login = async () => {
    try {
      const { auth, googleProvider } = await firebasePromise;
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const loginDemo = async () => {
    localStorage.setItem('lifequest_demo_mode', 'true');
    setDemoMode(true);
    queryClient.invalidateQueries({ queryKey: ['/api/user'] });
  };

  const logout = async () => {
    try {
      if (demoMode) {
        localStorage.removeItem('lifequest_demo_mode');
        setDemoMode(false);
      } else {
        const { auth } = await firebasePromise;
        await signOut(auth);
      }
      queryClient.clear();
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  return {
    user,
    firebaseUser,
    login,
    loginDemo,
    logout,
    loading: loading || (!firebaseInitialized && !demoMode),
    isAuthenticated: (!!firebaseUser && firebaseInitialized) || demoMode,
    demoMode,
  };
}