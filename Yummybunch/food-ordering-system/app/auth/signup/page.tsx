'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useAuth } from '@/app/providers';
import Image from "next/image"
import { UtensilsCrossed } from "lucide-react"

export interface RegisterResponse{
    token: string;
    user: {
        id: string;
        name: string;
        email: string;
        phoneNumber: string;
        role: string;
        restaurant?: {
            name: string;
            address: string;
            phone: string;
        };
    };
    message : string;
    error?: string;
}

export default function SignUp() {
  const router = useRouter();
  const { setUser, setToken, updateCookies } = useAuth();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    role: 'customer',
    name: '', // This will be used for restaurant name only
    phoneNumber: '',
    location: '', // For restaurant only
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }
   
    try {
      let response;
      const endpoint = formData.role === 'restaurant' 
        ? 'http://localhost:8080/api/auth/register/restaurant'
        : 'http://localhost:8080/api/auth/register/customer';

      // Prepare the request body
      const requestBody = {
        name: formData.role === 'restaurant' ? formData.name : formData.name,
        email: formData.email,
        password: formData.password,
        phoneNumber: formData.phoneNumber,
        role: formData.role === 'restaurant' ? 'RESTAURANT_OWNER' : 'CUSTOMER'
      };

      // Add restaurant-specific fields if registering as a restaurant
      if (formData.role === 'restaurant') {
        Object.assign(requestBody, {
          location: formData.location,
          address: formData.location
        });
      }

      console.log('Sending registration request:', requestBody);

      response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const rawResponse = await response.text();
      console.log('Raw registration response:', rawResponse);

      if (!response.ok) {
        throw new Error(rawResponse || 'Registration failed');
      }

      try {
        const data = JSON.parse(rawResponse);
        console.log('Parsed registration data:', data);

        if (!data.token || !data.user) {
          throw new Error('Invalid registration response format');
        }

        // Update auth context
        setToken(data.token);
        setUser(data.user);
        updateCookies(data.token, data.user);
        
        setSuccess('Registration successful! Redirecting...');
        
        // Wait a moment before redirecting to ensure cookies are set
        setTimeout(() => {
          // Redirect based on role
          if (formData.role === 'restaurant') {
            router.replace('/restaurant/dashboard');
          } else {
            router.replace('/customer/dashboard');
          }
        }, 1000);
      } catch (e) {
        console.error('Error parsing registration response:', e);
        throw new Error('Invalid response format from server');
      }
    } catch (error) {
      console.error('Registration error:', error);
      setError(error instanceof Error ? error.message : 'An error occurred during registration');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left side - Background Image */}
      <div className="hidden lg:block lg:w-1/2 relative">
        <div className="absolute inset-0 bg-black/50 z-10" />
        <Image
          src="/images/home/food-delivery.jpg"
          alt="Food background"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-white p-8">
          <h2 className="text-4xl font-bold mb-4">Delicious moments, delivered</h2>
          <p className="text-xl text-center max-w-md">
            Join Yummybunch and start your food journey today!
          </p>
        </div>
      </div>
      {/* Right side - Signup Form */}
      <div className="w-full lg:w-1/2 flex flex-col">
        <div className="flex h-16 items-center border-b px-4 md:px-6">
          <div className="flex items-center gap-2 font-bold text-xl">
            <div className="relative w-8 h-8">
              <Image
                src="/images/restaurant/logo.png"
                alt="Yummybunch Logo"
                fill
                className="object-contain"
              />
            </div>
            <span className="text-orange-600">Yummybunch</span>
            <UtensilsCrossed className="h-6 w-6 text-orange-500 ml-2" />
          </div>
        </div>
        <div className="flex flex-1 flex-col items-center justify-center px-4 py-12">
          <div className="mx-auto w-full max-w-md space-y-6">
            <div className="space-y-2 text-center">
              <h1 className="text-3xl font-bold text-orange-700 flex items-center justify-center gap-2">
                <UtensilsCrossed className="h-7 w-7 text-orange-500" />
                Create Your Yummybunch Account
              </h1>
              <p className="text-gray-500 dark:text-gray-400">Sign up to order from your favorite local restaurants or manage your own!</p>
            </div>
            <Card className="w-full shadow-none border-none">
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="name">{formData.role === 'restaurant' ? 'Restaurant Name' : 'Full Name'}</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      placeholder={formData.role === 'restaurant' ? "Enter your restaurant name" : "Enter your full name"}
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                      placeholder="Enter your email"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phoneNumber">Phone Number</Label>
                    <Input
                      id="phoneNumber"
                      type="tel"
                      value={formData.phoneNumber}
                      onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                      required
                      placeholder="Enter your phone number"
                    />
                  </div>
                  {formData.role === 'restaurant' && (
                    <div>
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        required
                        placeholder="Enter your restaurant's full address (e.g., '123 Main Street, Kicukiro, Kigali')"
                      />
                    </div>
                  )}
                  <div>
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required
                      placeholder="Create a password"
                    />
                  </div>
                  <div>
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      required
                      placeholder="Confirm your password"
                    />
                  </div>

                  <div>
                    <Label>I want to</Label>
                    <RadioGroup
                      value={formData.role}
                      onValueChange={(value) => setFormData({ ...formData, role: value })}
                      className="flex gap-4 mt-2"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="customer" id="customer" />
                        <Label htmlFor="customer">Order Food</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="restaurant" id="restaurant" />
                        <Label htmlFor="restaurant">Manage Restaurant</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  {error && (
                    <div className="text-red-500 text-sm">{error}</div>
                  )}
                  {success && (
                    <div className="text-green-500 text-sm">{success}</div>
                  )}
                  <Button type="submit" className="w-full bg-orange-500 hover:bg-orange-600" disabled={loading}>
                    {loading ? 'Creating account...' : 'Create Account'}
                  </Button>
                </form>
                <div className="mt-4 text-center">
                  <p className="text-sm text-gray-600">
                    Already have an account?{' '}
                    <Button variant="link" className="p-0 text-orange-600 hover:text-orange-700" onClick={() => router.push('/auth/login')}>
                      Sign in
                    </Button>
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
} 