
"use client";

import { useEffect, useState, Suspense } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, UserCircle2, Edit3, Save } from 'lucide-react';
import { getUserProfile, updateUserProfile, createUserProfile } from '@/lib/firebase/services';
import type { UserProfile } from '@/lib/types';
import Image from 'next/image';

function ProfilePageContent() {
  const { user, loading: authLoading, logout } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isClient, setIsClient] = useState(false);
  const [profileData, setProfileData] = useState<Partial<UserProfile>>({});
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient && !authLoading) {
      if (!user) {
        router.replace('/login?redirect=/profile');
      } else {
        // Fetch profile data from Firestore
        getUserProfile(user.uid)
          .then((data) => {
            if (data) {
              setProfileData(data);
            } else {
              // If no profile, create a basic one from auth user
              const basicProfile = {
                uid: user.uid,
                email: user.email || '',
                displayName: user.displayName || '',
                photoURL: user.photoURL || '',
              };
              setProfileData(basicProfile);
              createUserProfile(user, basicProfile); // Create in Firestore
            }
          })
          .catch(err => {
            console.error("Error fetching profile:", err);
            toast({ title: "Error", description: "Could not load profile data.", variant: "destructive" });
          });
      }
    }
  }, [isClient, user, authLoading, router, toast]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      await updateUserProfile(user.uid, {
        displayName: profileData.displayName || user.displayName,
        photoURL: profileData.photoURL || user.photoURL, // Basic example
        address: profileData.address,
        city: profileData.city,
        postalCode: profileData.postalCode,
        country: profileData.country,
      });
      toast({ title: "Profile Updated", description: "Your profile has been saved." });
      setIsEditing(false);
    } catch (error) {
      console.error("Error saving profile:", error);
      toast({ title: "Error", description: "Could not save profile.", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  if (authLoading || !isClient || (!user && !authLoading)) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl md:text-4xl font-headline font-bold mb-8 text-center">Your Profile</h1>
      <Card className="shadow-xl">
        <CardHeader className="items-center text-center">
          {profileData.photoURL ? (
            <Image src={profileData.photoURL} alt="User Avatar" width={96} height={96} className="rounded-full mb-4 border-2 border-primary" />
          ) : (
            <UserCircle2 className="w-24 h-24 text-muted-foreground mb-4" />
          )}
          <CardTitle className="text-2xl">{profileData.displayName || user?.displayName || 'User'}</CardTitle>
          <CardDescription>{profileData.email || user?.email}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 p-6">
          <div>
            <Label htmlFor="displayName">Display Name</Label>
            <Input
              id="displayName"
              name="displayName"
              value={profileData.displayName || ''}
              onChange={handleInputChange}
              disabled={!isEditing || isSaving}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" value={profileData.email || ''} disabled className="mt-1 bg-muted/50 cursor-not-allowed" />
          </div>
          <h3 className="text-lg font-semibold pt-4 border-t">Shipping Address</h3>
           <div>
            <Label htmlFor="address">Street Address</Label>
            <Input id="address" name="address" value={profileData.address || ''} onChange={handleInputChange} disabled={!isEditing || isSaving} className="mt-1" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="city">City</Label>
              <Input id="city" name="city" value={profileData.city || ''} onChange={handleInputChange} disabled={!isEditing || isSaving} className="mt-1" />
            </div>
            <div>
              <Label htmlFor="postalCode">Postal Code</Label>
              <Input id="postalCode" name="postalCode" value={profileData.postalCode || ''} onChange={handleInputChange} disabled={!isEditing || isSaving} className="mt-1" />
            </div>
          </div>
          <div>
            <Label htmlFor="country">Country</Label>
            <Input id="country" name="country" value={profileData.country || ''} onChange={handleInputChange} disabled={!isEditing || isSaving} className="mt-1" />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row justify-between gap-3 p-6">
          {isEditing ? (
            <Button onClick={handleSaveProfile} disabled={isSaving} className="w-full sm:w-auto">
              {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Save Profile
            </Button>
          ) : (
            <Button onClick={() => setIsEditing(true)} variant="outline" className="w-full sm:w-auto">
              <Edit3 className="mr-2 h-4 w-4" /> Edit Profile
            </Button>
          )}
          <Button onClick={logout} variant="destructive" className="w-full sm:w-auto">
            Logout
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-[calc(100vh-200px)]"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>}>
      <ProfilePageContent />
    </Suspense>
  )
}
