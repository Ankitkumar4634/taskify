'use client';

import { SignInViewPage } from '@/sections/auth/view';
import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function Page() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    console.log('Session Status:', status);
    console.log('Session Data:', session);
    if (status === 'authenticated') {
      setTimeout(() => {
        router.push('/dashboard');
      }, 1000);
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="flex h-screen items-center justify-center bg-muted text-white">
        <Loader2 className="h-16 w-16 animate-spin" />
        <p className="text-xl font-semibold">
          Checking authentication status...
        </p>
      </div>
    );
  }

  if (status === 'authenticated') {
    return (
      <div className="flex h-screen items-center justify-center bg-muted text-white">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-16 w-16 animate-spin" />
          <p className="text-xl font-semibold">
            Redirecting you to your dashboard...
          </p>
        </div>
      </div>
    );
  }

  return <SignInViewPage />;
}
