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
import { UtensilsCrossed, Menu, Bell } from "lucide-react"
// import { signOut, useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Cookies from "js-cookie"
import { useContext, useEffect } from "react"
import { AuthContext } from "@/app/providers"

export function RestaurantHeader() {
  const { user,token,setUser,setToken,loading } = useContext(AuthContext);
  const router = useRouter()

  const handleLogout = async () => {
    // Clear auth context
    setUser(null)
    setToken(null)
    // Clear cookies
    Cookies.remove('token')
    Cookies.remove('user')
    // Redirect to home
    router.push('/')
  }
useEffect(()=>{
  console.log("Loader state:", loading)
  if(!loading){
    console.log("User in the restaurant", user)
    console.log("Token in the restaurant", token)
  }
  },[user,token,loading])
  return (
    <header className="sticky top-0 z-10 flex h-16 items-center border-b bg-background px-4 md:px-6">
      <div className="flex items-center gap-4 md:hidden">
        <Button variant="outline" size="icon" className="shrink-0">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle navigation menu</span>
        </Button>
        <Link href="/" className="flex items-center gap-2 font-bold text-xl">
          <UtensilsCrossed className="h-6 w-6" />
          <span>Yummybunch</span>
        </Link>
      </div>
      <div className="hidden md:flex md:items-center md:gap-2">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl">
          <UtensilsCrossed className="h-6 w-6" />
          <span>Yummybunch</span>
        </Link>
      </div>
      <div className="ml-auto flex items-center gap-4">
        <Button variant="outline" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
            3
          </span>
          <span className="sr-only">Notifications</span>
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarImage src="/images/restaurant/logo.svg" alt="Restaurant" />
                <AvatarFallback>{user?.name?.charAt(0) || 'R'}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user?.name || 'Restaurant'}</p>
                <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>Log out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
