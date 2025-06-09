
"use client";

import Link from 'next/link';
import { ShoppingBag, User, LogOut, LogIn, Loader2, Shield, Store } from 'lucide-react'; // Added Store for Used Products
import { Button } from '@/components/ui/button';
import { SearchBar } from '@/components/ui/search-bar';
import { CartIcon } from '@/components/cart/cart-icon';
import { useAuth } from '@/hooks/use-auth';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function Header() {
  const { user, isAdmin, loading, logout } = useAuth(); // Added isAdmin

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center space-x-2">
          <ShoppingBag className="h-7 w-7 text-primary" />
          <span className="font-headline text-2xl font-bold text-primary">ShopWave</span>
        </Link>
        
        <div className="hidden md:flex flex-1 justify-center px-8">
          <SearchBar />
        </div>

        <nav className="flex items-center space-x-1 sm:space-x-2">
          <Button variant="ghost" size="sm" asChild className="hidden sm:inline-flex">
            <Link href="/">Home</Link>
          </Button>
          <Button variant="ghost" size="sm" asChild className="hidden sm:inline-flex">
            <Link href="/used-products">Used Products</Link>
          </Button>
          <CartIcon />
          {loading ? (
            <Button variant="ghost" size="icon" disabled>
              <Loader2 className="h-5 w-5 animate-spin" />
            </Button>
          ) : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="User account actions">
                  {user.photoURL ? (
                    <img src={user.photoURL} alt="User avatar" className="h-6 w-6 rounded-full" />
                  ) : (
                    <User className="h-5 w-5" />
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <p className="font-medium">{user.displayName || "My Account"}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile">
                    <User className="mr-2 h-4 w-4" /> Profile
                  </Link> 
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/orders">
                    <ShoppingBag className="mr-2 h-4 w-4" /> Orders
                  </Link>
                </DropdownMenuItem>
                {isAdmin && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/admin">
                        <Shield className="mr-2 h-4 w-4" /> Admin Panel
                      </Link>
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10">
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button variant="ghost" size="sm" asChild aria-label="Login">
              <Link href="/login">
                <LogIn className="mr-1 h-4 w-4 sm:mr-2" /> <span className="hidden sm:inline">Login</span>
              </Link>
            </Button>
          )}
        </nav>
      </div>
      <div className="md:hidden p-4 border-t flex items-center justify-between">
        <SearchBar />
         <Button variant="ghost" size="sm" asChild className="sm:hidden">
            <Link href="/used-products"><Store className="mr-2 h-4 w-4" /> Used</Link>
          </Button>
      </div>
    </header>
  );
}
