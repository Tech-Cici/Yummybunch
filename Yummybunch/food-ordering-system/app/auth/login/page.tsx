"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { UtensilsCrossed } from "lucide-react"
import Cookies from 'js-cookie'
import Image from "next/image"

export default function LoginPage() {
  const router = useRouter()
  const [userType, setUserType] = useState("customer")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const form = e.target as HTMLFormElement
    const email = form.querySelector('input[type="email"]')?.value
    const password = form.querySelector('input[type="password"]')?.value

    try {
      const response = await fetch('http://localhost:8080/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          role: userType.toUpperCase()
        }),
      })

      if (response.ok) {
        const data = await response.json()
        // Store token in cookie with proper options
        Cookies.set('token', data.token, { 
          expires: 7, // Expires in 7 days
          path: '/',
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict'
        })
        Cookies.set('user', JSON.stringify(data.user), { 
          expires: 7,
          path: '/',
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict'
        })
        
        // Redirect based on role
        if (data.user.role === 'ADMIN') {
          router.push('/admin')
        } else if (data.user.role === 'RESTAURANT') {
          router.push('/restaurant/dashboard')
        } else {
          router.push('/customer/dashboard')
        }
      } else {
        const error = await response.text()
        alert(error)
      }
    } catch (error) {
      console.error('Login error:', error)
      alert('Login failed. Please try again.')
    }
  }

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
          <h2 className="text-4xl font-bold mb-4">Welcome to Yummybunch</h2>
          <p className="text-xl text-center max-w-md">
            Your favorite local restaurants delivered to your doorstep
          </p>
        </div>
      </div>

      {/* Right side - Login Form */}
      <div className="w-full lg:w-1/2 flex flex-col">
        <div className="flex h-16 items-center border-b px-4 md:px-6">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl">
            <UtensilsCrossed className="h-6 w-6 text-orange-500" />
            <span>Yummybunch</span>
          </Link>
        </div>
        <div className="flex flex-1 flex-col items-center justify-center px-4 py-12">
          <div className="mx-auto w-full max-w-md space-y-6">
            <div className="space-y-2 text-center">
              <h1 className="text-3xl font-bold">Welcome Back!</h1>
              <p className="text-gray-500 dark:text-gray-400">Sign in to continue your food journey</p>
            </div>
            <Tabs defaultValue="customer" className="w-full" onValueChange={setUserType}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="customer">Customer</TabsTrigger>
                <TabsTrigger value="restaurant">Restaurant</TabsTrigger>
                <TabsTrigger value="admin">Admin</TabsTrigger>
              </TabsList>
              <TabsContent value="customer">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="customer-email">Email</Label>
                    <Input 
                      id="customer-email" 
                      type="email" 
                      placeholder="john@example.com" 
                      required 
                      className="border-orange-200 focus:border-orange-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="customer-password">Password</Label>
                      <Link
                        href="/auth/reset-password"
                        className="text-sm text-orange-600 hover:text-orange-700 transition-colors"
                      >
                        Forgot password?
                      </Link>
                    </div>
                    <Input 
                      id="customer-password" 
                      type="password" 
                      required 
                      className="border-orange-200 focus:border-orange-500"
                    />
                  </div>
                  <Button type="submit" className="w-full bg-orange-500 hover:bg-orange-600">
                    Sign In
                  </Button>
                </form>
              </TabsContent>
              <TabsContent value="restaurant">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="restaurant-email">Email</Label>
                    <Input 
                      id="restaurant-email" 
                      type="email" 
                      placeholder="restaurant@example.com" 
                      required 
                      className="border-orange-200 focus:border-orange-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="restaurant-password">Password</Label>
                      <Link
                        href="/auth/reset-password"
                        className="text-sm text-orange-600 hover:text-orange-700 transition-colors"
                      >
                        Forgot password?
                      </Link>
                    </div>
                    <Input 
                      id="restaurant-password" 
                      type="password" 
                      required 
                      className="border-orange-200 focus:border-orange-500"
                    />
                  </div>
                  <Button type="submit" className="w-full bg-orange-500 hover:bg-orange-600">
                    Sign In
                  </Button>
                </form>
              </TabsContent>
              <TabsContent value="admin">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="admin-email">Email</Label>
                    <Input 
                      id="admin-email" 
                      type="email" 
                      placeholder="admin@example.com" 
                      required 
                      className="border-orange-200 focus:border-orange-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="admin-password">Password</Label>
                      <Link
                        href="/auth/reset-password"
                        className="text-sm text-orange-600 hover:text-orange-700 transition-colors"
                      >
                        Forgot password?
                      </Link>
                    </div>
                    <Input 
                      id="admin-password" 
                      type="password" 
                      required 
                      className="border-orange-200 focus:border-orange-500"
                    />
                  </div>
                  <Button type="submit" className="w-full bg-orange-500 hover:bg-orange-600">
                    Sign In
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
            <div className="text-center text-sm">
              Don&apos;t have an account?{" "}
              <Link href="/auth/signup" className="text-orange-600 hover:text-orange-700 transition-colors">
                Sign up
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
