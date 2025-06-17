import { useState, useEffect } from 'react';
import { User as FirebaseUser, onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import type { User } from '@shared/schema';

export function useAuth() {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const queryClient = useQueryClient();

  // Query to get user data from our database
  const { data: user } = useQuery({
    queryKey: ['/api/user'],
    queryFn: async () => {
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
    enabled: !!firebaseUser,
  });

  const login = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      // User state will be updated via onAuthStateChanged
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      queryClient.clear(); // Clear all cached data on logout
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
      setLoading(false);
      
      if (!user) {
        queryClient.clear(); // Clear cached data when user signs out
      }
    });

    return unsubscribe;
  }, [queryClient]);

  return {
    user,
    firebaseUser,
    login,
    logout,
    loading,
    isAuthenticated: !!firebaseUser,
  };
}