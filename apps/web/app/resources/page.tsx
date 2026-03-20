'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Landmark, Wrench, Users, ExternalLink, Sprout, Home, Globe } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { cn } from '@/lib/cn';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.04, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 260, damping: 22 } },
};

type Category = 'all' | 'government' | 'tools' | 'providers';

const categoryTabs: { key: Category; label: string; icon: React.ElementType }[] = [
  { key: 'all', label: 'الكل', icon: Globe },
  { key: 'government', label: 'حكومية وتنظيمية', icon: Landmark },
  { key: 'tools', label: 'أدوات مفيدة', icon: Wrench },
  { key: 'providers', label: 'لمقدمي الخدمات', icon: Users },
];

const categoryColors: Record<string, { bg: string; icon: string; border: string }> = {
  government: {
    bg: 'bg-blue-50 dark:bg-blue-900/20',
    icon: 'text-blue-500',
    border: 'border-blue-100 dark:border-blue-800',
  },
  tools: {
    bg: 'bg-amber-50 dark:bg-amber-900/20',
    icon: 'text-amber-500',
    border: 'border-amber-100 dark:border-amber-800',
  },
  providers: {
    bg: 'bg-emerald-50 dark:bg-emerald-900/20',
    icon: 'text-emerald-500',
    border: 'border-emerald-100 dark:border-emerald-800',
  },
};

const categoryIcons: Record<string, React.ElementType> = {
  government: Landmark,
  tools: Wrench,
  providers: Users,
};

export default function ResourcesPage() {
  const [activeCategory, setActiveCategory] = useState<Category>('all');

  const { data: resources, isLoading } = trpc.resources.list.useQuery(
    activeCategory === 'all' ? {} : { category: activeCategory },
  );

  // Group resources by category for the "all" view
  const groupedResources =
    activeCategory === 'all'
      ? {
          government: resources?.filter((r) => r.category === 'government') ?? [],
          tools: resources?.filter((r) => r.category === 'tools') ?? [],
          providers: resources?.filter((r) => r.category === 'providers') ?? [],
        }
      : null;

  const categoryLabels: Record<string, string> = {
    government: 'منصات حكومية وتنظيمية',
    tools: 'أدوات ومنصات مفيدة',
    providers: 'لمقدمي الخدمات',
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Navbar */}
      <nav className="fixed end-0 start-0 top-0 z-50 border-b border-gray-200/50 bg-white/80 backdrop-blur-xl dark:border-gray-800 dark:bg-gray-900/80">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-3">
            <div className="from-brand-500 to-brand-600 flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br">
              <Sprout className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold dark:text-white">فسيل</span>
          </Link>
          <Link
            href="/"
            className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            <Home className="h-4 w-4" />
            الرئيسية
          </Link>
        </div>
      </nav>

      <div className="mx-auto max-w-6xl px-4 pb-20 pt-24 sm:px-6">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 text-center"
        >
          <div className="from-brand-500 to-brand-600 mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br">
            <Globe className="h-7 w-7 text-white" />
          </div>
          <h1 className="mb-2 text-2xl font-bold text-gray-900 sm:text-3xl dark:text-white">
            الموارد والمنصات
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            روابط مفيدة للمنصات الحكومية وأدوات إدارة العقارات في المملكة العربية السعودية
          </p>
        </motion.div>

        {/* Category Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8 flex flex-wrap justify-center gap-2"
        >
          {categoryTabs.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveCategory(key)}
              className={cn(
                'flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-xs font-medium transition-all sm:text-sm',
                activeCategory === key
                  ? 'bg-brand-500 shadow-brand-500/20 text-white shadow-md'
                  : 'bg-white text-gray-600 shadow-sm hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700',
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </motion.div>

        {/* Loading */}
        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <div className="border-brand-200 border-t-brand-500 h-8 w-8 animate-spin rounded-full border-4" />
          </div>
        )}

        {/* Resources Grid */}
        {!isLoading && activeCategory === 'all' && groupedResources && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-10"
          >
            {Object.entries(groupedResources).map(([cat, items]) => {
              if (items.length === 0) return null;
              const CatIcon = categoryIcons[cat] ?? Globe;
              const colors = categoryColors[cat] ?? categoryColors.government;
              return (
                <motion.div key={cat} variants={itemVariants}>
                  <div className="mb-4 flex items-center gap-2">
                    <div
                      className={cn(
                        'flex h-8 w-8 items-center justify-center rounded-lg',
                        colors.bg,
                      )}
                    >
                      <CatIcon className={cn('h-4 w-4', colors.icon)} />
                    </div>
                    <h2 className="text-base font-bold text-gray-900 dark:text-white">
                      {categoryLabels[cat]}
                    </h2>
                  </div>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {items.map((resource) => (
                      <ResourceCard key={resource.id} resource={resource} />
                    ))}
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}

        {!isLoading && activeCategory !== 'all' && resources && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3"
          >
            {resources.map((resource) => (
              <ResourceCard key={resource.id} resource={resource} />
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}

function ResourceCard({
  resource,
}: {
  resource: {
    id: string;
    nameAr: string;
    nameEn: string;
    url: string;
    descriptionAr: string;
    category: string;
  };
}) {
  const colors = categoryColors[resource.category] ?? categoryColors.government;
  const CatIcon = categoryIcons[resource.category] ?? Globe;

  return (
    <motion.a
      href={resource.url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`زيارة موقع ${resource.nameAr} (يفتح في نافذة جديدة)`}
      variants={itemVariants}
      whileHover={{ y: -3, boxShadow: '0 8px 30px rgba(0,0,0,0.08)' }}
      className={cn(
        'group flex flex-col rounded-2xl border bg-white p-5 shadow-sm transition-all dark:bg-gray-800',
        colors.border,
      )}
    >
      <div className="mb-3 flex items-start justify-between">
        <div className={cn('flex h-11 w-11 items-center justify-center rounded-xl', colors.bg)}>
          <CatIcon className={cn('h-5 w-5', colors.icon)} />
        </div>
        <ExternalLink className="group-hover:text-brand-500 h-4 w-4 text-gray-300 transition-colors dark:text-gray-600" />
      </div>
      <h3 className="mb-0.5 text-sm font-bold text-gray-900 dark:text-white">{resource.nameAr}</h3>
      <p className="mb-0.5 text-[10px] font-medium text-gray-400 dark:text-gray-500">
        {resource.nameEn}
      </p>
      <p className="mt-1 flex-1 text-xs leading-relaxed text-gray-500 dark:text-gray-400">
        {resource.descriptionAr}
      </p>
      <div className="text-brand-600 dark:text-brand-400 mt-3 flex items-center gap-1.5">
        <span className="text-xs font-medium">زيارة الموقع</span>
        <ExternalLink className="h-3 w-3" />
      </div>
    </motion.a>
  );
}
