
"use client";

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label'; // Keep if used outside form, otherwise FormLabel is preferred
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useCart } from '@/hooks/use-cart';
import { useRouter, useSearchParams } from 'next/navigation'; // useSearchParams for redirect
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, CreditCard, Lock, ShoppingBag, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';

const shippingSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  address: z.string().min(5, "Address is required"),
  city: z.string().min(2, "City is required"),
  postalCode: z.string().min(4, "Postal code is required"),
  country: z.string().min(2, "Country is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
});

const paymentSchema = z.object({
  cardNumber: z.string().regex(/^\d{16}$/, "Invalid card number (must be 16 digits)"),
  expiryDate: z.string().regex(/^(0[1-9]|1[0-2])\/\d{2}$/, "Invalid expiry date (MM/YY)"),
  cvv: z.string().regex(/^\d{3,4}$/, "Invalid CVV (must be 3 or 4 digits)"),
});

type ShippingFormData = z.infer<typeof shippingSchema>;
type PaymentFormData = z.infer<typeof paymentSchema>;

function CheckoutPageContent() {
  const { cartItems, getCartTotal, clearCart } = useCart();
  const router = useRouter();
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient && !authLoading) {
      if (!user) {
        toast({ title: "Authentication Required", description: "Please log in to proceed to checkout.", variant: "default" });
        router.replace('/login?redirect=/checkout');
      } else if (cartItems.length === 0) {
        router.replace('/cart');
        toast({ title: "Your cart is empty", description: "Please add items to your cart before checkout." });
      }
    }
  }, [isClient, user, authLoading, cartItems, router, toast]);
  
  const shippingForm = useForm<ShippingFormData>({
    resolver: zodResolver(shippingSchema),
    defaultValues: { fullName: '', address: '', city: '', postalCode: '', country: '', email: user?.email || '' },
  });

  const paymentForm = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: { cardNumber: '', expiryDate: '', cvv: '' },
  });

  // Populate email from user if available
   useEffect(() => {
    if (user?.email && !shippingForm.getValues('email')) {
      shippingForm.setValue('email', user.email);
    }
    if (user?.displayName && !shippingForm.getValues('fullName')) {
       shippingForm.setValue('fullName', user.displayName);
    }
  }, [user, shippingForm]);


  const handlePlaceOrder = async () => {
    // Trigger both forms validation
    const isShippingValid = await shippingForm.trigger();
    const isPaymentValid = await paymentForm.trigger();

    if (!isShippingValid) {
      toast({title: "Shipping Info Incomplete", description:"Please fill all required shipping fields.", variant: "destructive"});
      return;
    }
    if (!isPaymentValid) {
      toast({title: "Payment Info Incomplete", description:"Please fill all required payment fields.", variant: "destructive"});
      return;
    }

    // All forms are valid, proceed with order
    console.log("Shipping Data:", shippingForm.getValues());
    console.log("Payment Data:", paymentForm.getValues());
    
    toast({
      title: "Order Placed!",
      description: "Thank you for your purchase. Your order is being processed.",
      variant: "default", 
    });
    clearCart();
    router.push('/'); 
  };


  if (authLoading || !isClient) {
     return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }
  
  if (!user || cartItems.length === 0) {
    // This case should ideally be handled by the useEffect redirect,
    // but as a fallback or during brief state transitions:
    return (
      <div className="text-center py-12">
        <ShoppingBag className="mx-auto h-24 w-24 text-muted-foreground mb-6" />
        <h1 className="text-3xl font-headline font-bold mb-4">Verifying Information...</h1>
        <p className="text-muted-foreground mb-8">Please wait or ensure you are logged in and have items in your cart.</p>
         <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary mb-6" />
        <Button asChild size="lg" variant="outline" onClick={() => router.push(user ? '/cart' : '/login?redirect=/checkout')}>
          {user ? 'Go to Cart' : 'Login'}
        </Button>
      </div>
    );
  }


  return (
    <div className="max-w-4xl mx-auto">
      <Button variant="outline" onClick={() => router.push('/cart')} className="mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Cart
      </Button>
      <h1 className="text-3xl md:text-4xl font-headline font-bold mb-8 text-center">Checkout</h1>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-8">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl font-headline">Shipping Information</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...shippingForm}>
                <form className="space-y-6"> {/* No onSubmit here, handled by main button */}
                  <FormField
                    control={shippingForm.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="John Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={shippingForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="you@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={shippingForm.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Street Address</FormLabel>
                        <FormControl>
                          <Input placeholder="123 Main St" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      control={shippingForm.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>City</FormLabel>
                          <FormControl>
                            <Input placeholder="Anytown" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={shippingForm.control}
                      name="postalCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Postal Code</FormLabel>
                          <FormControl>
                            <Input placeholder="12345" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={shippingForm.control}
                    name="country"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Country</FormLabel>
                        <FormControl>
                          <Input placeholder="United States" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </form>
              </Form>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl font-headline flex items-center">
                <CreditCard className="mr-3 h-6 w-6" /> Payment Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...paymentForm}>
                <form className="space-y-6"> {/* No onSubmit here */}
                  <FormField
                    control={paymentForm.control}
                    name="cardNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Card Number</FormLabel>
                        <FormControl>
                          <Input placeholder="•••• •••• •••• ••••" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={paymentForm.control}
                      name="expiryDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Expiry Date</FormLabel>
                          <FormControl>
                            <Input placeholder="MM/YY" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={paymentForm.control}
                      name="cvv"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>CVV</FormLabel>
                          <FormControl>
                            <Input placeholder="123" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-1">
          <Card className="shadow-lg sticky top-24">
            <CardHeader>
              <CardTitle className="text-2xl font-headline">Your Order</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {cartItems.map(item => (
                <div key={item.id} className="flex justify-between items-center text-sm">
                  <div className="flex items-center">
                    <div className="relative w-10 h-10 rounded overflow-hidden border mr-2">
                      <Image src={item.imageUrl} alt={item.name} fill className="object-cover" data-ai-hint="product item" />
                    </div>
                    <span>{item.name} (x{item.quantity})</span>
                  </div>
                  <span>${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
              <Separator />
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>${getCartTotal().toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span>Free</span>
              </div>
              <Separator />
              <div className="flex justify-between text-xl font-bold">
                <span>Total</span>
                <span>${getCartTotal().toFixed(2)}</span>
              </div>
            </CardContent>
            <CardFooter className="flex-col space-y-3">
              <Button 
                size="lg" 
                className="w-full" 
                onClick={handlePlaceOrder}
              >
                <Lock className="mr-2 h-5 w-5" /> Place Order
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                By placing your order, you agree to our Terms & Conditions.
              </p>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  // Suspense is required by Next.js when using useSearchParams in a page component
  // or a component rendered by it.
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-[calc(100vh-200px)]"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>}>
      <CheckoutPageContent />
    </Suspense>
  );
}
