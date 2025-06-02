"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { 
  LayoutDashboard, 
  MenuIcon, 
  ShoppingBag, 
  Settings, 
  LogOut, 
  Users, 
  BarChart,
  ChefHat,
  UtensilsCrossed,
  Receipt,
  UserCircle,
  LineChart,
  Cog
} from "lucide-react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { useAuth } from "@/app/providers"
import Cookies from "js-cookie"

export function RestaurantSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { setUser, setToken } = useAuth()

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

  const routes = [
    {
      name: "Dashboard",
      href: "/restaurant/dashboard",
      icon: LayoutDashboard,
      description: "Overview of your restaurant"
    },
    {
      name: "Menu Management",
      href: "/restaurant/menu",
      icon: UtensilsCrossed,
      description: "Manage your menu items"
    },
    {
      name: "Orders",
      href: "/restaurant/orders",
      icon: Receipt,
      description: "View and manage orders"
    },
    {
      name: "Customers",
      href: "/restaurant/customers",
      icon: UserCircle,
      description: "Customer information"
    },
    {
      name: "Analytics",
      href: "/restaurant/analytics",
      icon: LineChart,
      description: "Business insights"
    },
    {
      name: "Settings",
      href: "/restaurant/settings",
      icon: Cog,
      description: "Restaurant settings"
    },
  ]

  return (
    <div className="hidden border-r bg-orange-50/50 md:block w-72">
      <div className="flex h-full flex-col gap-2 p-4">
        <div className="py-4 px-2">
          <div className="flex items-center gap-3 mb-2">
            <div className="relative w-10 h-10">
              <Image
                src="/images/restaurant/logo.png"
                alt="Restaurant Logo"
                fill
                className="object-contain"
              />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight text-orange-900">Yummybunch</h2>
              <p className="text-xs text-orange-600">Restaurant Portal</p>
            </div>
          </div>
        </div>
        <div className="flex-1">
          <nav className="grid gap-2 px-2 py-4">
            {routes.map((route) => (
              <Link
                key={route.href}
                href={route.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all hover:bg-orange-100/80 group",
                  pathname === route.href
                    ? "bg-orange-100 text-orange-900 font-semibold"
                    : "text-orange-700 hover:text-orange-900"
                )}
              >
                <div className={cn(
                  "p-1.5 rounded-md",
                  pathname === route.href
                    ? "bg-orange-200"
                    : "bg-orange-100/50 group-hover:bg-orange-200"
                )}>
                  <route.icon className="h-4 w-4" />
                </div>
                <div>
                  <div className="font-medium">{route.name}</div>
                  <div className="text-xs text-orange-600">{route.description}</div>
                </div>
              </Link>
            ))}
          </nav>
        </div>
        <div className="mt-auto">
          <Button
            variant="outline"
            className="w-full justify-start gap-2 text-orange-800 border-orange-200 hover:bg-orange-100 hover:text-orange-900 hover:border-orange-300"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>
    </div>
  )
}
