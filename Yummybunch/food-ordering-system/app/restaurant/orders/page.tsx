"use client"

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Clock, MapPin, Phone, User } from "lucide-react"
import Cookies from 'js-cookie'
import { RestaurantSidebar } from "@/components/restaurant-sidebar"
import { RestaurantHeader } from "@/components/restaurant-header"

interface Order {
    id: number;
    customer: {
        id: number;
        name: string;
        phoneNumber: string;
        address: string;
    };
    items: Array<{
        id: number;
        name: string;
        quantity: number;
        price: number;
        specialInstructions?: string;
    }>;
    totalAmount: number;
    status: 'PENDING' | 'PREPARING' | 'READY' | 'DELIVERED' | 'CANCELLED';
    orderTime: string;
    estimatedDeliveryTime: string;
    deliveryAddress: string;
    specialInstructions: string;
}

export default function RestaurantOrdersPage(): JSX.Element {
    const router = useRouter();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState('pending');

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const token = Cookies.get('token');
                if (!token) {
                    router.push('/auth/login');
                    return;
                }

                const response = await fetch('http://localhost:8080/api/restaurants/orders', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch orders');
                }

                const data = await response.json();
                setOrders(data);
            } catch (err) {
                setError('Failed to load orders');
                console.error('Error fetching orders:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, [router]);

    const updateOrderStatus = async (orderId: number, newStatus: Order['status']) => {
        try {
            const token = Cookies.get('token');
            if (!token) {
                router.push('/auth/login');
                return;
            }

            const response = await fetch(`http://localhost:8080/api/orders/${orderId}/status`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ status: newStatus }),
            });

            if (!response.ok) {
                throw new Error('Failed to update order status');
            }

            // Update the order status in the local state
            setOrders(orders.map(order => 
                order.id === orderId ? { ...order, status: newStatus } : order
            ));
        } catch (err) {
            console.error('Error updating order status:', err);
            alert('Failed to update order status');
        }
    };

    const getStatusColor = (status: Order['status']) => {
        switch (status) {
            case 'PENDING':
                return 'bg-yellow-100 text-yellow-800';
            case 'PREPARING':
                return 'bg-blue-100 text-blue-800';
            case 'READY':
                return 'bg-green-100 text-green-800';
            case 'DELIVERED':
                return 'bg-gray-100 text-gray-800';
            case 'CANCELLED':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const filteredOrders = orders.filter(order => {
        switch (activeTab) {
            case 'pending':
                return order.status === 'PENDING';
            case 'preparing':
                return order.status === 'PREPARING';
            case 'ready':
                return order.status === 'READY';
            case 'delivered':
                return order.status === 'DELIVERED';
            default:
                return true;
        }
    });

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="text-red-500">{error}</div>
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
                        <h1 className="text-3xl font-bold mb-8">Orders</h1>

                        <Tabs defaultValue="pending" onValueChange={setActiveTab}>
                            <TabsList className="mb-6">
                                <TabsTrigger value="pending">Pending</TabsTrigger>
                                <TabsTrigger value="preparing">Preparing</TabsTrigger>
                                <TabsTrigger value="ready">Ready</TabsTrigger>
                                <TabsTrigger value="delivered">Delivered</TabsTrigger>
                            </TabsList>

                            <TabsContent value={activeTab}>
                                <div className="grid gap-6">
                                    {filteredOrders.length === 0 ? (
                                        <Card>
                                            <CardContent className="p-6 text-center">
                                                <p className="text-gray-500">No orders found</p>
                                            </CardContent>
                                        </Card>
                                    ) : (
                                        filteredOrders.map((order) => (
                                            <Card key={order.id}>
                                                <CardHeader>
                                                    <div className="flex items-center justify-between">
                                                        <CardTitle>Order #{order.id}</CardTitle>
                                                        <Badge className={getStatusColor(order.status)}>
                                                            {order.status}
                                                        </Badge>
                                                    </div>
                                                </CardHeader>
                                                <CardContent>
                                                    <div className="space-y-4">
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                            <div>
                                                                <h3 className="font-semibold mb-2">Customer Details</h3>
                                                                <div className="space-y-2">
                                                                    <div className="flex items-center gap-2">
                                                                        <User className="h-4 w-4 text-gray-500" />
                                                                        <span>{order.customer.name}</span>
                                                                    </div>
                                                                    <div className="flex items-center gap-2">
                                                                        <Phone className="h-4 w-4 text-gray-500" />
                                                                        <span>{order.customer.phoneNumber}</span>
                                                                    </div>
                                                                    <div className="flex items-center gap-2">
                                                                        <MapPin className="h-4 w-4 text-gray-500" />
                                                                        <span>{order.deliveryAddress}</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div>
                                                                <h3 className="font-semibold mb-2">Order Details</h3>
                                                                <div className="space-y-2">
                                                                    <div className="flex items-center gap-2">
                                                                        <Clock className="h-4 w-4 text-gray-500" />
                                                                        <span>Ordered: {new Date(order.orderTime).toLocaleString()}</span>
                                                                    </div>
                                                                    <div className="flex items-center gap-2">
                                                                        <Clock className="h-4 w-4 text-gray-500" />
                                                                        <span>Estimated Delivery: {order.estimatedDeliveryTime}</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div>
                                                            <h3 className="font-semibold mb-2">Items</h3>
                                                            <div className="space-y-4">
                                                                {order.items.map((item) => (
                                                                    <div key={item.id} className="border-b pb-2">
                                                                        <div className="flex justify-between items-start">
                                                                            <div className="flex-1">
                                                                                <div className="font-medium text-lg">{item.name}</div>
                                                                                <div className="text-gray-500">
                                                                                    Quantity: {item.quantity ?? 0}
                                                                                    {item.specialInstructions && (
                                                                                        <div className="mt-1 text-sm text-gray-600">
                                                                                            <span className="font-medium">Special Instructions:</span> {item.specialInstructions}
                                                                                        </div>
                                                                                    )}
                                                                                </div>
                                                                            </div>
                                                                            <div className="ml-4 text-right">
                                                                                <div className="font-medium">${((item.price ?? 0) * (item.quantity ?? 0)).toFixed(2)}</div>
                                                                                <div className="text-sm text-gray-500">${(item.price ?? 0).toFixed(2)} each</div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                                <div className="border-t pt-2 mt-2">
                                                                    <div className="flex justify-between font-semibold">
                                                                        <span>Total</span>
                                                                        <span>${(order.totalAmount ?? 0).toFixed(2)}</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {order.specialInstructions && (
                                                            <div>
                                                                <h3 className="font-semibold mb-2">Special Instructions</h3>
                                                                <p className="text-gray-600">{order.specialInstructions}</p>
                                                            </div>
                                                        )}

                                                        <div className="flex gap-2">
                                                            {order.status === 'PENDING' && (
                                                                <Button onClick={() => updateOrderStatus(order.id, 'PREPARING')}>
                                                                    Start Preparing
                                                                </Button>
                                                            )}
                                                            {order.status === 'PREPARING' && (
                                                                <Button onClick={() => updateOrderStatus(order.id, 'READY')}>
                                                                    Mark as Ready
                                                                </Button>
                                                            )}
                                                            {order.status === 'READY' && (
                                                                <Button onClick={() => updateOrderStatus(order.id, 'DELIVERED')}>
                                                                    Mark as Delivered
                                                                </Button>
                                                            )}
                                                            {order.status !== 'DELIVERED' && order.status !== 'CANCELLED' && (
                                                                <Button 
                                                                    variant="destructive" 
                                                                    onClick={() => updateOrderStatus(order.id, 'CANCELLED')}
                                                                >
                                                                    Cancel Order
                                                                </Button>
                                                            )}
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))
                                    )}
                                </div>
                            </TabsContent>
                        </Tabs>
                    </div>
                </main>
            </div>
        </div>
    );
} 