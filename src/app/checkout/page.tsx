
"use client";

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useCart } from '@/hooks/use-cart';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, CreditCard, Lock, ShoppingBag, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { createOrder, getUserProfile, updateUserProfile } from '@/lib/firebase/services';
import type { Order, OrderItem, UserProfile } from '@/lib/types';

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
  const { cartItems, getCartTotal, clearCart, loadingCart } = useCart();
  const router = useRouter();
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();
  const [isClient, setIsClient] = useState(false);
  const [isProcessingOrder, setIsProcessingOrder] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const shippingForm = useForm<ShippingFormData>({
    resolver: zodResolver(shippingSchema),
    defaultValues: { fullName: '', address: '', city: '', postalCode: '', country: '', email: user?.email || '' },
  });

  const paymentForm = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: { cardNumber: '', expiryDate: '', cvv: '' },
  });
  
  // Pre-fill form with user data from Firebase Auth and Firestore profile
  useEffect(() => {
    if (user && isClient) {
      shippingForm.setValue('email', user.email || '');
      shippingForm.setValue('fullName', user.displayName || '');
      
      getUserProfile(user.uid).then(profile => {
        if (profile) {
          if (profile.address) shippingForm.setValue('address', profile.address);
          if (profile.city) shippingForm.setValue('city', profile.city);
          if (profile.postalCode) shippingForm.setValue('postalCode', profile.postalCode);
          if (profile.country) shippingForm.setValue('country', profile.country);
        }
      });
    }
  }, [user, isClient, shippingForm]);

  useEffect(() => {
    if (isClient && !authLoading && !loadingCart) {
      if (!user) {
        toast({ title: "Authentication Required", description: "Please log in to proceed to checkout.", variant: "default" });
        router.replace('/login?redirect=/checkout');
      } else if (cartItems.length === 0) {
        router.replace('/cart');
        toast({ title: "Your cart is empty", description: "Please add items to your cart before checkout." });
      }
    }
  }, [isClient, user, authLoading, cartItems, router, toast, loadingCart]);


  const handlePlaceOrder = async () => {
    if (!user) {
      toast({ title: "Not Logged In", description: "Please log in to place an order.", variant: "destructive" });
      router.push('/login?redirect=/checkout');
      return;
    }

    const isShippingValid = await shippingForm.trigger();
    const isPaymentValid = await paymentForm.trigger();

    if (!isShippingValid || !isPaymentValid) {
      toast({title: "Information Incomplete", description:"Please fill all required fields.", variant: "destructive"});
      return;
    }

    setIsProcessingOrder(true);
    const shippingData = shippingForm.getValues();
    // const paymentData = paymentForm.getValues(); // Payment data not sent to backend in this example

    const orderItems: OrderItem[] = cartItems.map(item => ({
      productId: item.id,
      name: item.name,
      quantity: item.quantity,
      price: item.price,
      imageUrl: item.imageUrl,
    }));

    const orderPayload: Omit<Order, 'id' | 'createdAt' | 'userId'> = {
      items: orderItems,
      totalAmount: getCartTotal(),
      shippingAddress: shippingData,
      status: 'pending', 
    };

    try {
      await createOrder(user.uid, orderPayload);
      
      // Optionally save shipping address to user profile if changed
      const userProfile = await getUserProfile(user.uid);
      const profileUpdates: Partial<UserProfile> = {};
      if (userProfile?.address !== shippingData.address) profileUpdates.address = shippingData.address;
      if (userProfile?.city !== shippingData.city) profileUpdates.city = shippingData.city;
      if (userProfile?.country !== shippingData.country) profileUpdates.country = shippingData.country;
      if (userProfile?.postalCode !== shippingData.postalCode) profileUpdates.postalCode = shippingData.postalCode;
      if (Object.keys(profileUpdates).length > 0) {
        await updateUserProfile(user.uid, profileUpdates);
      }

      await clearCart();
      toast({
        title: "Order Placed!",
        description: "Thank you for your purchase. Your order is being processed.",
        variant: "default", 
      });
      router.push('/orders'); 
    } catch (error) {
      console.error("Error placing order:", error);
      toast({ title: "Order Error", description: "There was an issue placing your order. Please try again.", variant: "destructive" });
    } finally {
      setIsProcessingOrder(false);
    }
  };

  if (authLoading || loadingCart || !isClient) {
     return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }
  
  if (!user || (cartItems.length === 0 && isClient && !loadingCart)) {
    return (
      <div className="text-center py-12">
        <ShoppingBag className="mx-auto h-24 w-24 text-muted-foreground mb-6" />
        <h1 className="text-3xl font-headline font-bold mb-4">
          { !user ? "Please Login" : "Your Cart is Empty" }
        </h1>
        <p className="text-muted-foreground mb-8">
          { !user ? "You need to be logged in to checkout." : "Add some items to your cart first."}
        </p>
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
                <form className="space-y-6">
                  <FormField control={shippingForm.control} name="fullName" render={({ field }) => ( <FormItem> <FormLabel>Full Name</FormLabel> <FormControl> <Input placeholder="John Doe" {...field} /> </FormControl> <FormMessage /> </FormItem> )} />
                  <FormField control={shippingForm.control} name="email" render={({ field }) => ( <FormItem> <FormLabel>Email Address</FormLabel> <FormControl> <Input type="email" placeholder="you@example.com" {...field} /> </FormControl> <FormMessage /> </FormItem> )} />
                  <FormField control={shippingForm.control} name="address" render={({ field }) => ( <FormItem> <FormLabel>Street Address</FormLabel> <FormControl> <Input placeholder="123 Main St" {...field} /> </FormControl> <FormMessage /> </FormItem> )} />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField control={shippingForm.control} name="city" render={({ field }) => ( <FormItem> <FormLabel>City</FormLabel> <FormControl> <Input placeholder="Anytown" {...field} /> </FormControl> <FormMessage /> </FormItem> )} />
                    <FormField control={shippingForm.control} name="postalCode" render={({ field }) => ( <FormItem> <FormLabel>Postal Code</FormLabel> <FormControl> <Input placeholder="12345" {...field} /> </FormControl> <FormMessage /> </FormItem> )} />
                  </div>
                  <FormField control={shippingForm.control} name="country" render={({ field }) => ( <FormItem> <FormLabel>Country</FormLabel> <FormControl> <Input placeholder="United States" {...field} /> </FormControl> <FormMessage /> </FormItem> )} />
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
                <form className="space-y-6">
                  <FormField control={paymentForm.control} name="cardNumber" render={({ field }) => ( <FormItem> <FormLabel>Card Number</FormLabel> <FormControl> <Input placeholder="•••• •••• •••• ••••" {...field} /> </FormControl> <FormMessage /> </FormItem> )} />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField control={paymentForm.control} name="expiryDate" render={({ field }) => ( <FormItem> <FormLabel>Expiry Date</FormLabel> <FormControl> <Input placeholder="MM/YY" {...field} /> </FormControl> <FormMessage /> </FormItem> )} />
                    <FormField control={paymentForm.control} name="cvv" render={({ field }) => ( <FormItem> <FormLabel>CVV</FormLabel> <FormControl> <Input placeholder="123" {...field} /> </FormControl> <FormMessage /> </FormItem> )} />
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
              <Button size="lg" className="w-full" onClick={handlePlaceOrder} disabled={isProcessingOrder || cartItems.length === 0}>
                {isProcessingOrder ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Lock className="mr-2 h-5 w-5" />}
                {isProcessingOrder ? 'Processing...' : 'Place Order'}
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
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-[calc(100vh-200px)]"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>}>
      <CheckoutPageContent />
    </Suspense>
  );
}
