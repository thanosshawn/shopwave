import Link from 'next/link';
import { ShoppingBag, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SearchBar } from '@/components/ui/search-bar';
import { CartIcon } from '@/components/cart/cart-icon';

export default function Header() {
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

        <nav className="flex items-center space-x-2 sm:space-x-4">
          <Button variant="ghost" size="sm" asChild className="hidden sm:inline-flex">
            <Link href="/">Home</Link>
          </Button>
          {/* Add more nav links here if needed, e.g., /products */}
          <CartIcon />
          <Button variant="ghost" size="icon" aria-label="User account">
            <User className="h-5 w-5" />
          </Button>
        </nav>
      </div>
      <div className="md:hidden p-4 border-t">
        <SearchBar />
      </div>
    </header>
  );
}
