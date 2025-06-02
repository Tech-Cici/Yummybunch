import { NextResponse } from 'next/server';
import { apiClient } from '@/lib/api-client';
import { useRouter } from 'next/navigation';

export async function POST(request: Request) {
  const router=useRouter();
  try {
    const body = await request.json();
    const { name, email, password, role, restaurantName, address, phone } = body;

    // Validate required fields based on role
    if (role === 'restaurant' && (!restaurantName || !address || !phone)) {
      return NextResponse.json(
        { error: 'Restaurant name, address, and phone are required for restaurant registration' },
        { status: 400 }
      );
    }

    const userData = {
      name,
      email,
      password,
      phoneNumber: body.phoneNumber,
      role,
      ...(role === 'restaurant' && {
        restaurant: {
          name: restaurantName,
          address,
          phone,
        },
      }),
    };

    // Use different API endpoints based on role
    const endpoint = role === 'restaurant' ? 'api/auth/register/restaurant' : 'api/auth/register/customer';
    const response = await apiClient.register(userData, endpoint);

    if (response.error) {
      return NextResponse.json(
        { error: response.error },
        { status: response.status }
      );
    }

    router.push('/app/customer/dashboard')

    

    return NextResponse.json(
      { message: 'User created successfully' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 