import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, UtensilsCrossed, Store, ShoppingBag, Clock, Star, MapPin } from "lucide-react"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-orange-50 to-white">
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container flex h-16 items-center justify-between px-4 md:px-6">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl text-orange-600 hover:text-orange-700 transition-colors">
            <UtensilsCrossed className="h-6 w-6" />
            <span>Yummybunch</span>
          </Link>
          <nav className="hidden md:flex gap-6">
            <Link href="/" className="font-medium text-gray-600 hover:text-orange-600 transition-colors">
              Home
            </Link>
            <Link href="/restaurants" className="font-medium text-gray-600 hover:text-orange-600 transition-colors">
              Restaurants
            </Link>
            <Link href="/about" className="font-medium text-gray-600 hover:text-orange-600 transition-colors">
              About
            </Link>
            <Link href="/contact" className="font-medium text-gray-600 hover:text-orange-600 transition-colors">
              Contact
            </Link>
          </nav>
          <div className="flex gap-4">
            <Link href="/auth/login">
              <Button variant="outline" className="hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200 transition-colors">
                Log in
              </Button>
            </Link>
            <Link href="/auth/signup">
              <Button className="bg-orange-600 hover:bg-orange-700 transition-colors">
                Sign up
              </Button>
            </Link>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-r from-orange-50 via-amber-50 to-orange-50">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                    Delicious Food, Delivered to Your Door
                  </h1>
                  <p className="max-w-[600px] text-gray-600 md:text-xl">
                    Order from your favorite local restaurants with just a few clicks. Fast delivery, great prices, and
                    amazing food.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Link href="/restaurants">
                    <Button size="lg" className="gap-1 bg-orange-600 hover:bg-orange-700 transition-colors">
                      Order Now <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href="/restaurant/register">
                    <Button size="lg" variant="outline" className="hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200 transition-colors">
                      Register Your Restaurant
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="relative">
                <img
                  src="/images/home/food-delivery.jpg"
                  alt="Food delivery illustration"
                  className="mx-auto aspect-video overflow-hidden rounded-2xl object-cover shadow-2xl sm:w-full lg:order-last transform hover:scale-105 transition-transform duration-300"
                  width={550}
                  height={550}
                />
                <div className="absolute -bottom-4 -left-4 bg-white p-4 rounded-xl shadow-lg">
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-orange-600" />
                    <span className="font-medium">30 min delivery</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                  How It Works
                </h2>
                <p className="max-w-[900px] text-gray-600 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Our platform connects hungry customers with amazing restaurants. Here's how it works.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-3 lg:gap-12">
              <div className="flex flex-col justify-center space-y-4 text-center group hover:transform hover:scale-105 transition-all duration-300">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-orange-100 group-hover:bg-orange-200 transition-colors">
                  <Store className="h-10 w-10 text-orange-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-800">Find Restaurants</h3>
                <p className="text-gray-600">
                  Browse through our curated list of local restaurants and discover new favorites.
                </p>
              </div>
              <div className="flex flex-col justify-center space-y-4 text-center group hover:transform hover:scale-105 transition-all duration-300">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-orange-100 group-hover:bg-orange-200 transition-colors">
                  <ShoppingBag className="h-10 w-10 text-orange-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-800">Place Your Order</h3>
                <p className="text-gray-600">
                  Select your favorite dishes, customize your order, and check out securely.
                </p>
              </div>
              <div className="flex flex-col justify-center space-y-4 text-center group hover:transform hover:scale-105 transition-all duration-300">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-orange-100 group-hover:bg-orange-200 transition-colors">
                  <UtensilsCrossed className="h-10 w-10 text-orange-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-800">Enjoy Your Meal</h3>
                <p className="text-gray-600">
                  Track your order in real-time and enjoy delicious food delivered right to your door.
                </p>
              </div>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-b from-orange-50 to-white">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                  Featured Restaurants
                </h2>
                <p className="max-w-[900px] text-gray-600 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Discover top-rated restaurants in your area.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Link
                  href={`/restaurant/${i}`}
                  key={i}
                  className="group relative overflow-hidden rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105"
                >
                  <div className="relative">
                    <img
                      src={`/images/restaurant/restaurant-${i}.jpg`}
                      alt={`Restaurant ${i}`}
                      className="h-48 w-full object-cover transition-transform duration-300 group-hover:scale-110"
                      width={400}
                      height={300}
                    />
                    <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-sm font-medium text-orange-600">
                      <Clock className="h-4 w-4 inline-block mr-1" />
                      30-45 min
                    </div>
                  </div>
                  <div className="p-4 bg-white">
                    <h3 className="text-lg font-bold text-gray-800">Restaurant {i}</h3>
                    <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                      <MapPin className="h-4 w-4 text-orange-600" />
                      <span>2.5 km away</span>
                    </div>
                    <div className="mt-2 flex items-center text-sm">
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                        <span className="ml-1 font-medium">4.5</span>
                      </div>
                      <span className="mx-2 text-gray-300">•</span>
                      <span className="text-gray-500">(120+ reviews)</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            <div className="flex justify-center">
              <Link href="/restaurants">
                <Button variant="outline" size="lg" className="hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200 transition-colors">
                  View All Restaurants
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
      <footer className="border-t bg-white/80 backdrop-blur-sm py-6 md:py-8">
        <div className="container flex flex-col gap-4 px-4 md:flex-row md:items-center md:gap-8 md:px-6">
          <div className="flex items-center gap-2 font-bold text-orange-600">
            <UtensilsCrossed className="h-6 w-6" />
            <span>Yummybunch</span>
          </div>
          <nav className="flex gap-4 md:gap-6 md:ml-auto">
            <Link href="#" className="text-sm font-medium text-gray-600 hover:text-orange-600 transition-colors">
              Terms of Service
            </Link>
            <Link href="#" className="text-sm font-medium text-gray-600 hover:text-orange-600 transition-colors">
              Privacy Policy
            </Link>
            <Link href="#" className="text-sm font-medium text-gray-600 hover:text-orange-600 transition-colors">
              Contact
            </Link>
          </nav>
          <div className="md:ml-auto md:text-right">
            <p className="text-sm text-gray-500">© 2024 Yummybunch. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
