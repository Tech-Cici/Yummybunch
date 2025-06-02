import { NextResponse } from 'next/server';
import { apiClient } from '@/lib/api-client';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password, phoneNumber, restaurantName, address, phone } = body;

    // Validate required fields
    if (!name || !email || !password || !phoneNumber || !restaurantName || !address || !phone) {
      return NextResponse.json(
        { error: 'All fields are required for restaurant registration' },
        { status: 400 }
      );
    }

    const userData = {
      name,
      email,
      password,
      phoneNumber,
      role: 'restaurant',
      restaurant: {
        name: restaurantName,
        address,
        phone
      }
    };

    const response = await apiClient.register(userData, '/auth/register/restaurant');

    if (response.error) {
      return NextResponse.json(
        { error: response.error },
        { status: response.status }
      );
    }

    return NextResponse.json(
      { message: 'Restaurant created successfully' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Restaurant registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 