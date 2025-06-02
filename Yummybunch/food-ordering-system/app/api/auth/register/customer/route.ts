import { NextResponse } from 'next/server';
import { apiClient } from '@/lib/api-client';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password, phoneNumber } = body;

    // Validate required fields
    if (!name || !email || !password || !phoneNumber) {
      return NextResponse.json(
        { error: 'All fields are required for customer registration' },
        { status: 400 }
      );
    }

    const userData = {
      name,
      email,
      password,
      phoneNumber,
      role: 'customer'
    };

    const response = await apiClient.register(userData, '/api/v1/auth/register/customer');

    if (response.error) {
      return NextResponse.json(
        { error: response.error },
        { status: response.status }
      );
    }

    return NextResponse.json(
      { message: 'Customer created successfully' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Customer registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 