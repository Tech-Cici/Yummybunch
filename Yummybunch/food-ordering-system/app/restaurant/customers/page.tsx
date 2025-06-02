"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RestaurantSidebar } from "@/components/restaurant-sidebar"
import { RestaurantHeader } from "@/components/restaurant-header"
import { useAuth } from "@/app/providers"
import { Badge } from "@/components/ui/badge"

interface Customer {
  id: number;
  name: string;
  email: string;
  phoneNumber: string;
  address: string;
  deliveryInstructions: string;
  deliveryPreferences: string;
  loyaltyPoints: number;
}

export default function CustomersPage() {
  const { user, token } = useAuth();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [restaurantData, setRestaurantData] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!user || !token) {
          throw new Error("User not authenticated");
        }

        // First fetch restaurant data
        const restaurantResponse = await fetch("http://localhost:8080/api/restaurants/me", {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
        });

        if (!restaurantResponse.ok) {
          throw new Error("Failed to fetch restaurant data");
        }

        const restaurantData = await restaurantResponse.json();
        setRestaurantData(restaurantData);

        // Then fetch customers
        const customersResponse = await fetch(`http://localhost:8080/api/restaurants/${restaurantData.id}/customers`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
        });

        if (!customersResponse.ok) {
          throw new Error("Failed to fetch customers");
        }

        const customersData = await customersResponse.json();
        setCustomers(customersData);
      } catch (err) {
        console.error("Error fetching customers:", err);
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, token]);

  return (
    <div className="flex h-screen">
      <RestaurantSidebar />
      <div className="flex-1 flex flex-col">
        <RestaurantHeader />
        <main className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold mb-6">Customers</h1>
            
            {loading ? (
              <div>Loading customers...</div>
            ) : error ? (
              <div className="text-red-500">Error: {error}</div>
            ) : customers.length === 0 ? (
              <div>No customers found.</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {customers.map((customer) => (
                  <Card key={customer.id} className="bg-orange-50 border-orange-200">
                    <CardHeader>
                      <CardTitle>{customer.name}</CardTitle>
                      <CardDescription>{customer.email}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div>
                          <span className="font-semibold">Phone:</span> {customer.phoneNumber}
                        </div>
                        <div>
                          <span className="font-semibold">Address:</span> {customer.address}
                        </div>
                        {customer.deliveryInstructions && (
                          <div>
                            <span className="font-semibold">Delivery Instructions:</span> {customer.deliveryInstructions}
                          </div>
                        )}
                        {customer.deliveryPreferences && (
                          <div>
                            <span className="font-semibold">Delivery Preferences:</span> {customer.deliveryPreferences}
                          </div>
                        )}
                        <div>
                          <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                            {customer.loyaltyPoints} Loyalty Points
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
} 