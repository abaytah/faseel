'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated, getUserRole, getRoles, setTokens, getDashboardPath } from '@/lib/auth';
import { trpc } from '@/lib/trpc';
import { Home, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface AuthGuardProps {
  children: React.ReactNode;
  allowedRole: string;
}

const ROLE_LABELS: Record<string, string> = {
  office: 'مكتب عقاري',
  tenant: 'مستأجر',
  owner: 'مالك',
  provider: 'مزود خدمة',
};

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
  const [noAccess, setNoAccess] = useState(false);
  const [needsSwitch, setNeedsSwitch] = useState(false);

  const switchRole = trpc.auth.switchRole.useMutation({
    onSuccess: (data) => {
      setTokens(data.accessToken, localStorage.getItem('faseel-refresh-token') ?? '');
      setAuthorized(true);
      setChecked(true);
      setNeedsSwitch(false);
    },
    onError: () => {
      setNoAccess(true);
      setChecked(true);
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
      const matchingRole = storedRoles.find((r) => mapDbRoleToSession(r.role) === allowedRole);
      if (matchingRole && !needsSwitch) {
        setNeedsSwitch(true);
        switchRole.mutate({
          role: allowedRole as 'tenant' | 'office' | 'provider' | 'owner',
          officeId: matchingRole.officeId ?? undefined,
        });
      }
    } else {
      // User does NOT have this role - show access denied
      setNoAccess(true);
      setChecked(true);
    }
  }, [router, allowedRole, needsSwitch]);

  // User doesn't have the required role - show clear message
  if (noAccess) {
    const currentRole = getUserRole();
    const currentDashboard = getDashboardPath(currentRole ?? 'tenant');

    return (
      <div className="flex min-h-screen items-center justify-center px-4" dir="rtl">
        <div className="w-full max-w-md text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-100">
            <Home className="h-8 w-8 text-amber-600" />
          </div>
          <h1 className="mb-3 text-xl font-bold">لا يمكنك الوصول لهذه البوابة</h1>
          <p className="mb-2 text-sm text-gray-500">
            هذه البوابة مخصصة لـ{' '}
            <span className="font-semibold text-gray-700">
              {ROLE_LABELS[allowedRole] ?? allowedRole}
            </span>
          </p>
          <p className="mb-8 text-sm text-gray-500">
            أنت مسجل حالياً كـ{' '}
            <span className="font-semibold text-gray-700">
              {ROLE_LABELS[currentRole ?? ''] ?? 'مستخدم'}
            </span>
          </p>

          <div className="space-y-3">
            <Link
              href={currentDashboard}
              className="bg-brand-500 hover:bg-brand-600 flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-white transition-colors"
            >
              <span>الذهاب للوحتي</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/"
              className="block text-sm text-gray-500 transition-colors hover:text-gray-700"
            >
              العودة للرئيسية
            </Link>
          </div>
        </div>
      </div>
    );
  }

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
