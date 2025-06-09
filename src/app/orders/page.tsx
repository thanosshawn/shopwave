
"use client";

import { useEffect, useState, Suspense } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { getUserOrders } from '@/lib/firebase/services';
import type { Order } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Loader2, ShoppingBag, PackageSearch } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { format } from 'date-fns';


function OrdersPageContent() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient && !authLoading) {
      if (!user) {
        router.replace('/login?redirect=/orders');
      } else {
        setIsLoadingOrders(true);
        getUserOrders(user.uid)
          .then(userOrders => {
            setOrders(userOrders);
          })
          .catch(error => {
            console.error("Error fetching orders:", error);
            // Potentially show a toast message
          })
          .finally(() => {
            setIsLoadingOrders(false);
          });
      }
    }
  }, [isClient, user, authLoading, router]);

  if (authLoading || !isClient || (!user && !authLoading)) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }
  
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl md:text-4xl font-headline font-bold mb-8 text-center">Your Orders</h1>
      
      {isLoadingOrders ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-12">
          <PackageSearch className="mx-auto h-24 w-24 text-muted-foreground mb-6" />
          <h2 className="text-2xl font-semibold mb-3">No Orders Yet</h2>
          <p className="text-muted-foreground mb-6">You haven't placed any orders. Start shopping to see them here!</p>
          <Button asChild>
            <Link href="/">Start Shopping</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map(order => (
            <Card key={order.id} className="shadow-lg">
              <CardHeader className="flex flex-row justify-between items-start">
                <div>
                  <CardTitle className="text-xl">Order #{order.id?.substring(0, 8)}...</CardTitle>
                  <CardDescription>
                    Placed on: {order.createdAt ? format(order.createdAt.toDate(), 'PPP') : 'N/A'}
                  </CardDescription>
                </div>
                <div className="text-right">
                    <p className="text-lg font-semibold">${order.totalAmount.toFixed(2)}</p>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 
                      order.status === 'shipped' ? 'bg-blue-100 text-blue-700' :
                      order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                </div>
              </CardHeader>
              <CardContent>
                <p className="font-medium mb-2 text-sm">Items:</p>
                <ul className="space-y-3">
                  {order.items.map(item => (
                    <li key={item.productId} className="flex items-center justify-between text-sm">
                      <div className="flex items-center">
                        <div className="relative w-12 h-12 rounded border mr-3 overflow-hidden">
                           <Image src={item.imageUrl || "https://placehold.co/100x100.png"} alt={item.name} fill className="object-cover" data-ai-hint="order item" />
                        </div>
                        <div>
                            <span className="font-medium">{item.name}</span> (x{item.quantity})
                            <p className="text-xs text-muted-foreground">${item.price.toFixed(2)} each</p>
                        </div>
                      </div>
                      <span className="font-medium">${(item.price * item.quantity).toFixed(2)}</span>
                    </li>
                  ))}
                </ul>
                <Separator className="my-4" />
                 <div className="text-sm">
                    <p className="font-medium">Shipping To:</p>
                    <p>{order.shippingAddress.fullName}</p>
                    <p>{order.shippingAddress.address}</p>
                    <p>{order.shippingAddress.city}, {order.shippingAddress.postalCode}</p>
                    <p>{order.shippingAddress.country}</p>
                 </div>
              </CardContent>
              {/* <CardFooter>
                 <Button variant="outline" size="sm">View Order Details</Button>
              </CardFooter> */}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}


export default function OrdersPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-[calc(100vh-200px)]"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>}>
      <OrdersPageContent />
    </Suspense>
  );
}
