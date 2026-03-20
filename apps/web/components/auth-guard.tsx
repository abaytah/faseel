'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated, getUserRole } from '@/lib/auth';

interface AuthGuardProps {
  children: React.ReactNode;
  allowedRole: string;
}

export function AuthGuard({ children, allowedRole }: AuthGuardProps) {
  const router = useRouter();
  const [checked, setChecked] = useState(false);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace('/login');
      return;
    }

    const role = getUserRole();
    if (role !== allowedRole) {
      router.replace('/login');
      return;
    }

    setAuthorized(true);
    setChecked(true);
  }, [router, allowedRole]);

  if (!checked || !authorized) {
    return (
      <div className="flex min-h-screen items-center justify-center" dir="rtl">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600" />
          <p className="mt-4 text-sm text-gray-500">جاري التحقق...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
