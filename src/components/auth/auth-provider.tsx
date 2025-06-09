
"use client";

import type { User } from 'firebase/auth';
import { onAuthStateChanged, signOut as firebaseSignOut, getIdTokenResult } from 'firebase/auth';
import type { ReactNode } from 'react';
import React, { createContext, useEffect, useState } from 'react';
import { auth } from '@/lib/firebase/config';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import type { AuthContextType } from '@/lib/types';

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [loading, setLoading] = useState(true); // Start with loading true
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      console.log('[AuthProvider] onAuthStateChanged triggered. currentUser UID:', currentUser?.uid || 'No user');
      setUser(currentUser);
      if (currentUser) {
        try {
          const idTokenResult = await getIdTokenResult(currentUser);
          console.log('[AuthProvider] User claims:', idTokenResult.claims);
          setIsAdmin(idTokenResult.claims.isAdmin === true);
        } catch (error) {
          console.error("[AuthProvider] Error getting ID token result:", error);
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(false);
      }
      console.log('[AuthProvider] Setting loading to false. User:', currentUser?.uid, 'IsAdmin:', isAdmin);
      setLoading(false);
    });
    return () => unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const logout = async () => {
    setLoading(true);
    setIsAdmin(false);
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

  // If loading, show a consistent skeleton on both server and client
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
