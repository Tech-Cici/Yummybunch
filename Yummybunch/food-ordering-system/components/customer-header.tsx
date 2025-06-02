"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { UtensilsCrossed, User, ShoppingBag, Heart, Settings, LogOut } from "lucide-react"
import { useRouter } from "next/navigation"
import { useAuth } from '@/app/providers'
import Cookies from 'js-cookie'

export function CustomerHeader() {
  const { user, setUser, setToken } = useAuth()
  const router = useRouter()

  const handleLogout = () => {
    // Clear auth context
    setUser(null)
    setToken(null)
    
    // Clear cookies
    Cookies.remove('token')
    Cookies.remove('user')
    
    // Redirect to home
    router.push('/')
  }

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center border-b bg-background px-4 md:px-6">
      <Link href="/" className="flex items-center gap-2 font-bold text-xl">
        <UtensilsCrossed className="h-6 w-6" />
        <span>Yummybunch</span>
      </Link>
      <nav className="hidden md:ml-auto md:flex md:items-center md:gap-6">
        <Link href="/customer/restaurants" className="text-sm font-medium">
          Restaurants
        </Link>
        <Link href="/customer/orders" className="text-sm font-medium">
          My Orders
        </Link>
        <Link href="/customer/favorites" className="text-sm font-medium">
          Favorites
        </Link>
      </nav>
      <div className="ml-auto flex items-center gap-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarImage src="/placeholder.svg?height=32&width=32" alt="User" />
                <AvatarFallback>{user?.email?.charAt(0)?.toUpperCase() || 'U'}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user?.email || 'User'}</p>
                <p className="text-xs leading-none text-muted-foreground">{user?.role || 'Customer'}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <ShoppingBag className="mr-2 h-4 w-4" />
              <span>Orders</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Heart className="mr-2 h-4 w-4" />
              <span>Favorites</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
