'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Home, Building2, User, Wrench, Crown, Loader2 } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { getRoles, setTokens, isAuthenticated, getDashboardPath } from '@/lib/auth';

const roleConfig: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  TENANT: {
    label: 'مستأجر',
    icon: User,
    color: 'from-blue-500 to-blue-600',
  },
  OFFICE_ADMIN: {
    label: 'مكتب عقاري',
    icon: Building2,
    color: 'from-emerald-500 to-emerald-600',
  },
  OWNER: {
    label: 'مالك',
    icon: Crown,
    color: 'from-amber-500 to-amber-600',
  },
  SERVICE_PROVIDER: {
    label: 'مزود خدمة',
    icon: Wrench,
    color: 'from-purple-500 to-purple-600',
  },
};

function mapDbRoleToSession(dbRole: string): 'tenant' | 'office' | 'provider' | 'owner' {
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

export default function RoleSelectPage() {
  const router = useRouter();
  const roles = getRoles();

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace('/login');
      return;
    }

    // If single role or no roles, skip to dashboard
    if (roles.length <= 1) {
      const sessionRole = roles[0] ? mapDbRoleToSession(roles[0].role) : 'tenant';
      router.replace(getDashboardPath(sessionRole));
    }
  }, [router, roles.length]);

  const switchRole = trpc.auth.switchRole.useMutation({
    onSuccess: (data) => {
      setTokens(data.accessToken, localStorage.getItem('faseel-refresh-token') ?? '');
      try {
        const payload = JSON.parse(atob(data.accessToken.split('.')[1]!));
        const newRole = payload.role as string;
        router.push(getDashboardPath(newRole));
      } catch {
        router.push('/');
      }
    },
  });

  const handleRoleSelect = (role: string, officeId: string | null) => {
    const sessionRole = mapDbRoleToSession(role);
    switchRole.mutate({
      role: sessionRole,
      officeId: officeId ?? undefined,
    });
  };

  if (roles.length <= 1) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="text-brand-500 h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, type: 'spring', stiffness: 200, damping: 15 }}
          className="from-brand-500 to-brand-600 shadow-card mx-auto mb-8 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br"
        >
          <Home className="h-8 w-8 text-white" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-8 text-center"
        >
          <h1 className="mb-2 text-2xl font-bold">اختر دورك</h1>
          <p className="text-sm text-[var(--muted-foreground)]">
            لديك أكثر من دور، اختر الدور الذي تريد الدخول به
          </p>
        </motion.div>

        <div className="grid gap-3">
          {roles.map((r, index) => {
            const config = roleConfig[r.role] ?? {
              label: r.role,
              icon: User,
              color: 'from-gray-500 to-gray-600',
            };
            const Icon = config.icon;

            return (
              <motion.button
                key={r.role + (r.officeId ?? '')}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                onClick={() => handleRoleSelect(r.role, r.officeId)}
                disabled={switchRole.isPending}
                className="hover:border-brand-300 group flex items-center gap-4 rounded-2xl border-2 border-[var(--border)] bg-[var(--background)] p-5 text-start transition-all hover:shadow-lg disabled:opacity-50"
              >
                <div
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${config.color} shadow-lg`}
                >
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-base font-bold">{config.label}</p>
                  {r.officeId && (
                    <p className="text-xs text-[var(--muted-foreground)]">مكتب مرتبط</p>
                  )}
                </div>
                {switchRole.isPending && (
                  <Loader2 className="h-5 w-5 animate-spin text-[var(--muted-foreground)]" />
                )}
              </motion.button>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
