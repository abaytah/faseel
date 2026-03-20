'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated, getUserRole, getRoles, setTokens, getDashboardPath } from '@/lib/auth';
import { trpc } from '@/lib/trpc';

interface AuthGuardProps {
  children: React.ReactNode;
  allowedRole: string;
}

function mapDbRoleToSession(dbRole: string): string {
  switch (dbRole) {
    case 'OFFICE_ADMIN':
      return 'office';
    case 'OWNER':
      return 'owner';
    case 'TENANT':
      return 'tenant';
    case 'SERVICE_PROVIDER':
      return 'provider';
    default:
      return 'tenant';
  }
}

export function AuthGuard({ children, allowedRole }: AuthGuardProps) {
  const router = useRouter();
  const [checked, setChecked] = useState(false);
  const [authorized, setAuthorized] = useState(false);
  const [needsSwitch, setNeedsSwitch] = useState(false);

  const switchRole = trpc.auth.switchRole.useMutation({
    onSuccess: (data) => {
      setTokens(data.accessToken, localStorage.getItem('faseel-refresh-token') ?? '');
      setAuthorized(true);
      setChecked(true);
      setNeedsSwitch(false);
    },
    onError: () => {
      // If switch fails, redirect to role-select
      router.replace('/role-select');
    },
  });

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace('/login');
      return;
    }

    const role = getUserRole();
    if (role === allowedRole) {
      setAuthorized(true);
      setChecked(true);
      return;
    }

    // Role mismatch: check if user has this role stored
    const storedRoles = getRoles();
    const hasRole = storedRoles.some((r) => mapDbRoleToSession(r.role) === allowedRole);

    if (hasRole) {
      // User has the role, auto-switch
      const matchingRole = storedRoles.find((r) => mapDbRoleToSession(r.role) === allowedRole);
      if (matchingRole && !needsSwitch) {
        setNeedsSwitch(true);
        switchRole.mutate({
          role: allowedRole as 'tenant' | 'office' | 'provider' | 'owner',
          officeId: matchingRole.officeId ?? undefined,
        });
      }
    } else {
      // User does not have this role, go to role-select
      router.replace('/role-select');
    }
  }, [router, allowedRole, needsSwitch]);

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
