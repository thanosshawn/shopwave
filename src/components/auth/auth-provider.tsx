
"use client";

import type { User } from 'firebase/auth';
import { onAuthStateChanged, signOut as firebaseSignOut, getIdTokenResult } from 'firebase/auth';
import type { ReactNode } from 'react';
import React, { createContext, useEffect, useState } from 'react';
import { auth } from '@/lib/firebase/config';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import type { AuthContextType } from '@/lib/types'; // Import updated type


export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const idTokenResult = await getIdTokenResult(currentUser);
          setIsAdmin(idTokenResult.claims.isAdmin === true);
        } catch (error) {
          console.error("Error getting ID token result:", error);
          setIsAdmin(false); // Default to not admin on error
        }
      } else {
        setIsAdmin(false);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const logout = async () => {
    setLoading(true);
    setIsAdmin(false); // Reset admin status on logout
    try {
      await firebaseSignOut(auth);
      toast({ title: 'Logged Out', description: 'You have been successfully logged out.' });
      router.push('/'); 
    } catch (error) {
      console.error('Error signing out: ', error);
      toast({ title: 'Logout Error', description: 'Failed to log out. Please try again.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Skeleton className="h-12 w-12 rounded-full bg-primary/20 mb-4" />
        <Skeleton className="h-4 w-32 bg-muted" />
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, isAdmin, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
