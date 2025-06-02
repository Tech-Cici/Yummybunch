'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from '@/app/providers';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { RestaurantSidebar } from "@/components/restaurant-sidebar"
import { RestaurantHeader } from "@/components/restaurant-header"

interface AnalyticsData {
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  ordersByStatus: { status: string; count: number }[];
  revenueByDay: { date: string; revenue: number }[];
  topItems: { name: string; quantity: number }[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export default function AnalyticsPage() {
  const { token, user, loading: authLoading } = useAuth();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        if (!token) {
          throw new Error('No authentication token found');
        }

        const response = await fetch('http://localhost:8080/api/restaurants/analytics', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.status === 401) {
          throw new Error('Session expired. Please log in again.');
        }

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch analytics data');
        }

        const analyticsData = await response.json();
        setData(analyticsData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load analytics');
        if (err instanceof Error && err.message.includes('Session expired')) {
          window.location.href = '/auth/login';
        }
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) {
      if (token && user?.role === 'RESTAURANT') {
        fetchAnalytics();
      } else {
        setLoading(false);
        if (!token) {
          setError('Please log in to view analytics');
        } else if (user?.role !== 'RESTAURANT') {
          setError('Access denied. Restaurant access required.');
        }
      }
    }
  }, [token, user, authLoading]);

  if (authLoading || loading) {
    return (
      <div className="flex h-screen">
        <RestaurantSidebar />
        <div className="flex-1 flex flex-col">
          <RestaurantHeader />
          <main className="flex-1 overflow-y-auto">
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-600"></div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen">
        <RestaurantSidebar />
        <div className="flex-1 flex flex-col">
          <RestaurantHeader />
          <main className="flex-1 overflow-y-auto">
            <div className="flex items-center justify-center h-full">
              <div className="text-red-500">{error}</div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex h-screen">
        <RestaurantSidebar />
        <div className="flex-1 flex flex-col">
          <RestaurantHeader />
          <main className="flex-1 overflow-y-auto">
            <div className="flex items-center justify-center h-full">
              <div className="text-gray-500">No analytics data available</div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen">
      <RestaurantSidebar />
      <div className="flex-1 flex flex-col">
        <RestaurantHeader />
        <main className="flex-1 overflow-y-auto bg-orange-50/50">
          <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8 text-orange-900">Analytics Dashboard</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card className="bg-white/80 backdrop-blur-sm border-orange-200 hover:shadow-lg transition-shadow">
                <CardHeader className="border-b border-orange-100">
                  <CardTitle className="text-orange-700">Total Orders</CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <p className="text-4xl font-bold text-orange-600">{data.totalOrders}</p>
                  <p className="text-sm text-orange-500 mt-2">All-time orders</p>
                </CardContent>
              </Card>
              
              <Card className="bg-white/80 backdrop-blur-sm border-orange-200 hover:shadow-lg transition-shadow">
                <CardHeader className="border-b border-orange-100">
                  <CardTitle className="text-orange-700">Total Revenue</CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <p className="text-4xl font-bold text-green-600">${data.totalRevenue.toFixed(2)}</p>
                  <p className="text-sm text-green-500 mt-2">Total earnings</p>
                </CardContent>
              </Card>
              
              <Card className="bg-white/80 backdrop-blur-sm border-orange-200 hover:shadow-lg transition-shadow">
                <CardHeader className="border-b border-orange-100">
                  <CardTitle className="text-orange-700">Average Order Value</CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <p className="text-4xl font-bold text-amber-600">${data.averageOrderValue.toFixed(2)}</p>
                  <p className="text-sm text-amber-500 mt-2">Per order</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-white/80 backdrop-blur-sm border-orange-200 hover:shadow-lg transition-shadow">
                <CardHeader className="border-b border-orange-100">
                  <CardTitle className="text-orange-700">Revenue by Day</CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={data.revenueByDay}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                        <XAxis dataKey="date" stroke="#6b7280" />
                        <YAxis stroke="#6b7280" />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'rgba(255, 255, 255, 0.9)',
                            border: '1px solid #f3f4f6',
                            borderRadius: '8px',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                          }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="revenue" 
                          stroke="#f97316" 
                          strokeWidth={2}
                          dot={{ fill: '#f97316', strokeWidth: 2 }}
                          activeDot={{ r: 6, fill: '#f97316' }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-sm border-orange-200 hover:shadow-lg transition-shadow">
                <CardHeader className="border-b border-orange-100">
                  <CardTitle className="text-orange-700">Orders by Status</CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={data.ordersByStatus}
                          dataKey="count"
                          nameKey="status"
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {data.ordersByStatus.map((entry, index) => (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={COLORS[index % COLORS.length]}
                              stroke="#fff"
                              strokeWidth={2}
                            />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'rgba(255, 255, 255, 0.9)',
                            border: '1px solid #f3f4f6',
                            borderRadius: '8px',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card className="md:col-span-2 bg-white/80 backdrop-blur-sm border-orange-200 hover:shadow-lg transition-shadow">
                <CardHeader className="border-b border-orange-100">
                  <CardTitle className="text-orange-700">Top Selling Items</CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={data.topItems}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                        <XAxis dataKey="name" stroke="#6b7280" />
                        <YAxis stroke="#6b7280" />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'rgba(255, 255, 255, 0.9)',
                            border: '1px solid #f3f4f6',
                            borderRadius: '8px',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                          }}
                        />
                        <Bar 
                          dataKey="quantity" 
                          fill="#f97316"
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
} 