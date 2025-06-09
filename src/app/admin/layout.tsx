
"use client";

import type { ReactNode } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2, Shield, LayoutDashboard, Package, Users, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { user, isAdmin, loading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  console.log('[AdminLayout] Auth State:', { loading, userId: user?.uid, isAdmin });

  useEffect(() => {
    console.log('[AdminLayout Effect] Running effect. Auth State:', { loading, userId: user?.uid, isAdmin });
    if (!loading) {
      if (!user) {
        console.log('[AdminLayout Effect] No user, redirecting to login.');
        router.replace('/login?redirect=/admin');
      } else if (!isAdmin) {
        console.log('[AdminLayout Effect] User is not admin, redirecting to home.');
        toast({
          title: "Access Denied",
          description: "You do not have permission to access the admin panel.",
          variant: "destructive",
        });
        router.replace('/');
      } else {
        console.log('[AdminLayout Effect] User is admin, proceeding.');
      }
    }
  }, [user, isAdmin, loading, router, toast]);

  if (loading) {
    console.log('[AdminLayout] Rendering loader: Auth loading.');
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-lg text-muted-foreground">Verifying access (auth loading)...</p>
      </div>
    );
  }

  if (!user) {
    console.log('[AdminLayout] Rendering loader: No user (should be redirected by effect).');
     return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-lg text-muted-foreground">Verifying access (no user)...</p>
      </div>
    );
  }

  if (!isAdmin) {
    console.log('[AdminLayout] Rendering loader: User not admin (should be redirected by effect).');
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-lg text-muted-foreground">Verifying access (not admin)...</p>
      </div>
    );
  }

  // If we reach here, user is authenticated and is an admin
  console.log('[AdminLayout] Rendering Admin Panel UI.');
  return (
    <div className="flex min-h-screen bg-muted/40">
      <aside className="w-64 bg-background border-r p-4 flex flex-col gap-4">
        <div className="flex items-center gap-2 px-2 py-4 border-b mb-4">
          <Shield className="h-8 w-8 text-primary" />
          <h1 className="text-xl font-headline font-bold">Admin Panel</h1>
        </div>
        <nav className="flex flex-col gap-2">
          <Button variant="ghost" className="justify-start" asChild>
            <Link href="/admin">
              <LayoutDashboard className="mr-2 h-4 w-4" /> Dashboard
            </Link>
          </Button>
          <Button variant="ghost" className="justify-start" asChild>
            <Link href="/admin/products">
              <Package className="mr-2 h-4 w-4" /> Products
            </Link>
          </Button>
          {/* Add more admin links here as needed, e.g., Users, Orders, Settings */}
          {/* <Button variant="ghost" className="justify-start" asChild>
            <Link href="/admin/users">
              <Users className="mr-2 h-4 w-4" /> Users
            </Link>
          </Button>
          <Button variant="ghost" className="justify-start" asChild>
            <Link href="/admin/settings">
              <Settings className="mr-2 h-4 w-4" /> Settings
            </Link>
          </Button> */}
        </nav>
        <div className="mt-auto">
          <Button variant="outline" className="w-full" asChild>
             <Link href="/">Back to Shop</Link>
          </Button>
        </div>
      </aside>
      <main className="flex-grow p-6 overflow-auto">
        {children}
      </main>
    </div>
  );
}
