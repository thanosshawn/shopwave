
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

// !!! IMPORTANT: Change this to your desired admin email address !!!
// For better security in a real application, this should come from an environment variable.
const ADMIN_EMAIL = "admin@example.com";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [loading, setLoading] = useState(true); 
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      console.log('[AuthProvider] onAuthStateChanged triggered. currentUser UID:', currentUser?.uid || 'No user');
      setUser(currentUser);

      if (currentUser) {
        console.log(`[AuthProvider] Current user email: ${currentUser.email}`);
        if (currentUser.email === ADMIN_EMAIL) {
          console.log('[AuthProvider] User is admin based on email match with:', ADMIN_EMAIL);
          setIsAdmin(true);
        } else {
          console.log('[AuthProvider] User is NOT admin. Email mismatch. User email:', currentUser.email, 'Required admin email:', ADMIN_EMAIL);
          setIsAdmin(false);
        }
      } else {
        console.log('[AuthProvider] No current user, setting isAdmin to false.');
        setIsAdmin(false);
      }
      
      console.log('[AuthProvider] Setting loading to false. User:', currentUser?.uid, 'IsAdmin:', isAdmin); // Note: isAdmin here might log the value from the previous render cycle due to closure. The setIsAdmin call above is what matters for the next render.
      setLoading(false);
    });
    return () => unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // isAdmin removed from deps as it's set within this effect

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
