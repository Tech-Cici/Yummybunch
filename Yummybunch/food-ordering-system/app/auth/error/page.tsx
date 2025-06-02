'use client';

import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from 'next/navigation';

export default function AuthError() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');
  const router = useRouter();

  const getErrorMessage = (error: string | null) => {
    switch (error) {
      case 'Configuration':
        return 'There was a problem with the server configuration.';
      case 'AccessDenied':
        return 'You do not have permission to sign in.';
      case 'Verification':
        return 'The verification link is no longer valid.';
      default:
        return 'An error occurred during authentication.';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center text-red-600">Authentication Error</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-center text-gray-600">
            {getErrorMessage(error)}
          </p>
          <div className="flex justify-center space-x-4">
            <Button
              variant="outline"
              onClick={() => router.push('/auth/login')}
            >
              Try Again
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push('/')}
            >
              Go Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 