import { db } from './index';
import {
  offices,
  subscriptionPlans,
  subscriptions,
  users,
  userRoles,
  buildings,
  units,
  maintenanceRequests,
  statusLog,
  costRules,
  announcements,
  serviceProviders,
  providerOfficeLinks,
} from './schema';

async function seed() {
  console.log('Seeding Faseel database...');

  // ──────────────────────────────────────────────
  // Clear existing data (reverse FK order)
  // ──────────────────────────────────────────────
  console.log('Clearing existing data...');
  await db.delete(statusLog);
  await db.delete(providerOfficeLinks);
  await db.delete(serviceProviders);
  await db.delete(announcements);
  await db.delete(costRules);
  await db.delete(maintenanceRequests);
  await db.delete(units);
  await db.delete(buildings);
  await db.delete(subscriptions);
  await db.delete(subscriptionPlans);
  await db.delete(userRoles);
  await db.delete(users);
  await db.delete(offices);

  // ──────────────────────────────────────────────
  // 1. Office
  // ──────────────────────────────────────────────
  console.log('Creating office...');
  const [office] = await db
    .insert(offices)
    .values({
      nameAr: 'مكتب الأمانة العقارية',
      nameEn: 'Al Amana Real Estate Office',
      crNumber: '4030567890',
      phone: '+966126543210',
      email: 'info@alamana-re.sa',
      city: 'جدة',
      address: 'حي الروضة، شارع التحلية، جدة، المملكة العربية السعودية',
    })
    .returning();

  // ──────────────────────────────────────────────
  // 2. Users
  // ──────────────────────────────────────────────
  console.log('Creating users...');
  const [adminUser] = await db
    .insert(users)
    .values({
      nameAr: 'عبدالرحمن الحربي',
      nameEn: 'Abdulrahman Al-Harbi',
      phone: '+966501234567',
      email: 'abdulrahman@alamana-re.sa',
    })
    .returning();

  const [tenantUser] = await db
    .insert(users)
    .values({
      nameAr: 'فهد المطيري',
      nameEn: 'Fahad Al-Mutairi',
      phone: '+966509876543',
      email: 'fahad.mutairi@gmail.com',
    })
    .returning();

  const [providerUser] = await db
    .insert(users)
    .values({
      nameAr: 'أحمد الزهراني',
      nameEn: 'Ahmed Al-Zahrani',
      phone: '+966507654321',
      email: 'ahmed.zahrani@fixsa.com',
    })
    .returning();

  const [ownerUser] = await db
    .insert(users)
    .values({
      nameAr: 'سارة القحطاني',
      nameEn: 'Sarah Al-Qahtani',
      phone: '+966508765432',
      email: 'sarah.qahtani@outlook.sa',
    })
    .returning();

  // ──────────────────────────────────────────────
  // 3. User Roles
  // ──────────────────────────────────────────────
  console.log('Assigning roles...');
  await db.insert(userRoles).values([
    { userId: adminUser.id, role: 'OFFICE_ADMIN', officeId: office.id },
    { userId: tenantUser.id, role: 'TENANT', officeId: office.id },
    { userId: providerUser.id, role: 'SERVICE_PROVIDER', officeId: office.id },
    { userId: ownerUser.id, role: 'OWNER', officeId: office.id },
  ]);

  // ──────────────────────────────────────────────
  // 4. Buildings
  // ──────────────────────────────────────────────
  console.log('Creating buildings...');
  const [building1] = await db
    .insert(buildings)
    .values({
      officeId: office.id,
      ownerId: ownerUser.id,
      nameAr: 'برج النخيل السكني',
      nameEn: 'Al Nakheel Residential Tower',
      city: 'جدة',
      district: 'حي الشاطئ',
      address: 'شارع الأمير سلطان، حي الشاطئ، جدة',
      type: 'RESIDENTIAL',
      totalUnits: 24,
      floors: 12,
      yearBuilt: 2019,
      latitude: '21.5433',
      longitude: '39.1728',
    })
    .returning();

  const [building2] = await db
    .insert(buildings)
    .values({
      officeId: office.id,
      ownerId: ownerUser.id,
      nameAr: 'مجمع الواحة',
      nameEn: 'Al Waha Complex',
      city: 'جدة',
      district: 'حي الصفا',
      address: 'شارع فلسطين، حي الصفا، جدة',
      type: 'RESIDENTIAL',
      totalUnits: 16,
      floors: 4,
      yearBuilt: 2021,
      latitude: '21.5567',
      longitude: '39.1845',
    })
    .returning();

  // ──────────────────────────────────────────────
  // 5. Units
  // ──────────────────────────────────────────────
  console.log('Creating units...');

  // Building 1: 12 floors, 2 units per floor = 24 units
  const building1Units = [];
  for (let floor = 1; floor <= 12; floor++) {
    for (let unit = 1; unit <= 2; unit++) {
      const unitNumber = `${floor}0${unit}`;
      const isOccupied = Math.random() > 0.3;
      building1Units.push({
        buildingId: building1.id,
        unitNumber,
        floor,
        status: isOccupied ? ('OCCUPIED' as const) : ('VACANT' as const),
        bedrooms: floor <= 4 ? 2 : floor <= 8 ? 3 : 4,
        bathrooms: floor <= 4 ? 2 : floor <= 8 ? 3 : 3,
        areaSqm: floor <= 4 ? '95' : floor <= 8 ? '130' : '180',
        monthlyRent: floor <= 4 ? 350000 : floor <= 8 ? 500000 : 750000, // halalas
        tenantId: unitNumber === '301' ? tenantUser.id : undefined,
      });
    }
  }

  // Make sure unit 301 is occupied (tenant's unit)
  const tenantUnitIdx = building1Units.findIndex((u) => u.unitNumber === '301');
  if (tenantUnitIdx !== -1) {
    building1Units[tenantUnitIdx].status = 'OCCUPIED';
  }

  const insertedBuilding1Units = await db.insert(units).values(building1Units).returning();

  // Building 2: 4 floors, 4 units per floor = 16 units
  const building2Units = [];
  for (let floor = 1; floor <= 4; floor++) {
    for (let unit = 1; unit <= 4; unit++) {
      const unitNumber = `${floor}0${unit}`;
      const isOccupied = Math.random() > 0.4;
      building2Units.push({
        buildingId: building2.id,
        unitNumber,
        floor,
        status: isOccupied ? ('OCCUPIED' as const) : ('VACANT' as const),
        bedrooms: unit <= 2 ? 2 : 3,
        bathrooms: 2,
        areaSqm: unit <= 2 ? '85' : '110',
        monthlyRent: unit <= 2 ? 280000 : 380000, // halalas
      });
    }
  }

  await db.insert(units).values(building2Units).returning();

  // Get tenant's unit for maintenance requests
  const tenantUnit = insertedBuilding1Units.find((u) => u.unitNumber === '301')!;

  // ──────────────────────────────────────────────
  // 6. Service Provider profile
  // ──────────────────────────────────────────────
  console.log('Creating service provider profile...');
  const [provider] = await db
    .insert(serviceProviders)
    .values({
      userId: providerUser.id,
      specialties: ['PLUMBING', 'HVAC'],
      rating: '4.7',
      totalJobs: 156,
      completedJobs: 148,
      bio: 'فني سباكة وتكييف معتمد، خبرة أكثر من ١٠ سنوات في جدة',
    })
    .returning();

  await db.insert(providerOfficeLinks).values({
    providerId: provider.id,
    officeId: office.id,
    status: 'active',
  });

  // ──────────────────────────────────────────────
  // 7. Maintenance Requests
  // ──────────────────────────────────────────────
  console.log('Creating maintenance requests...');

  // Request 1: SUBMITTED (plumbing leak)
  const [request1] = await db
    .insert(maintenanceRequests)
    .values({
      officeId: office.id,
      buildingId: building1.id,
      unitId: tenantUnit.id,
      tenantId: tenantUser.id,
      category: 'PLUMBING',
      status: 'SUBMITTED',
      priority: 'HIGH',
      titleAr: 'تسريب مياه في المطبخ',
      titleEn: 'Kitchen water leak',
      descriptionAr:
        'يوجد تسريب مياه تحت حوض المطبخ. المياه تتسرب ببطء وتسبب رطوبة في الخزانة السفلية.',
      descriptionEn:
        'Water leak under the kitchen sink. Water is slowly leaking and causing moisture in the lower cabinet.',
      estimatedCost: 50000, // 500 SAR in halalas
      costResponsibility: 'OWNER',
    })
    .returning();

  await db.insert(statusLog).values({
    requestId: request1.id,
    fromStatus: null,
    toStatus: 'SUBMITTED',
    changedBy: tenantUser.id,
    note: 'تم إرسال طلب الصيانة من المستأجر',
  });

  // Request 2: IN_PROGRESS (AC not working)
  const [request2] = await db
    .insert(maintenanceRequests)
    .values({
      officeId: office.id,
      buildingId: building1.id,
      unitId: tenantUnit.id,
      tenantId: tenantUser.id,
      assignedProviderId: providerUser.id,
      category: 'HVAC',
      status: 'IN_PROGRESS',
      priority: 'URGENT',
      titleAr: 'المكيف لا يعمل',
      titleEn: 'AC unit not working',
      descriptionAr:
        'المكيف في غرفة المعيشة لا يبرد. يصدر صوت عالي عند التشغيل ثم يتوقف بعد دقائق.',
      descriptionEn:
        'Living room AC is not cooling. Makes a loud noise when turned on then stops after a few minutes.',
      estimatedCost: 120000, // 1200 SAR
      costResponsibility: 'SHARED',
      scheduledDate: new Date('2026-03-22T10:00:00'),
    })
    .returning();

  await db.insert(statusLog).values([
    {
      requestId: request2.id,
      fromStatus: null,
      toStatus: 'SUBMITTED',
      changedBy: tenantUser.id,
      note: 'تم إرسال طلب صيانة التكييف',
    },
    {
      requestId: request2.id,
      fromStatus: 'SUBMITTED',
      toStatus: 'REVIEWED',
      changedBy: adminUser.id,
      note: 'تمت مراجعة الطلب وتحديد الأولوية كعاجل',
    },
    {
      requestId: request2.id,
      fromStatus: 'REVIEWED',
      toStatus: 'ASSIGNED',
      changedBy: adminUser.id,
      note: 'تم تعيين الفني أحمد الزهراني',
    },
    {
      requestId: request2.id,
      fromStatus: 'ASSIGNED',
      toStatus: 'IN_PROGRESS',
      changedBy: providerUser.id,
      note: 'تم البدء بالعمل، يحتاج قطعة غيار للضاغط',
    },
  ]);

  // Request 3: COMPLETED (electrical issue with rating)
  const [request3] = await db
    .insert(maintenanceRequests)
    .values({
      officeId: office.id,
      buildingId: building1.id,
      unitId: tenantUnit.id,
      tenantId: tenantUser.id,
      assignedProviderId: providerUser.id,
      category: 'ELECTRICAL',
      status: 'COMPLETED',
      priority: 'MEDIUM',
      titleAr: 'عطل في القواطع الكهربائية',
      titleEn: 'Circuit breaker malfunction',
      descriptionAr: 'القاطع الكهربائي في لوحة التوزيع يفصل بشكل متكرر عند تشغيل أكثر من جهاز.',
      descriptionEn:
        'Circuit breaker in the distribution panel trips repeatedly when multiple appliances are running.',
      estimatedCost: 80000, // 800 SAR
      actualCost: 75000, // 750 SAR
      costResponsibility: 'OWNER',
      tenantRating: 5,
      tenantFeedback: 'خدمة ممتازة، الفني محترف وسريع. شكرا جزيلا!',
      completedAt: new Date('2026-03-15T14:30:00'),
    })
    .returning();

  await db.insert(statusLog).values([
    {
      requestId: request3.id,
      fromStatus: null,
      toStatus: 'SUBMITTED',
      changedBy: tenantUser.id,
      note: 'تم الإبلاغ عن مشكلة كهربائية',
    },
    {
      requestId: request3.id,
      fromStatus: 'SUBMITTED',
      toStatus: 'ASSIGNED',
      changedBy: adminUser.id,
      note: 'تم تعيين الفني مباشرة',
    },
    {
      requestId: request3.id,
      fromStatus: 'ASSIGNED',
      toStatus: 'IN_PROGRESS',
      changedBy: providerUser.id,
      note: 'جاري فحص لوحة التوزيع',
    },
    {
      requestId: request3.id,
      fromStatus: 'IN_PROGRESS',
      toStatus: 'COMPLETED',
      changedBy: providerUser.id,
      note: 'تم استبدال القاطع المعطل وفحص جميع القواطع الأخرى',
    },
  ]);

  // ──────────────────────────────────────────────
  // 8. Cost Rules
  // ──────────────────────────────────────────────
  console.log('Creating cost rules...');
  await db.insert(costRules).values([
    {
      officeId: office.id,
      category: 'PLUMBING',
      ownerSharePercent: 80,
      tenantSharePercent: 20,
      description: 'أعمال السباكة: المالك يتحمل ٨٠٪ والمستأجر ٢٠٪ حسب نظام الإيجار',
    },
    {
      officeId: office.id,
      category: 'ELECTRICAL',
      ownerSharePercent: 100,
      tenantSharePercent: 0,
      description: 'الأعمال الكهربائية: المالك يتحمل التكلفة كاملة (بنية تحتية)',
    },
    {
      officeId: office.id,
      category: 'HVAC',
      ownerSharePercent: 70,
      tenantSharePercent: 30,
      description: 'أعمال التكييف: المالك ٧٠٪ والمستأجر ٣٠٪ (صيانة دورية على المستأجر)',
    },
    {
      officeId: office.id,
      category: 'COSMETIC',
      ownerSharePercent: 0,
      tenantSharePercent: 100,
      description: 'الأعمال التجميلية: المستأجر يتحمل التكلفة كاملة',
    },
  ]);

  // ──────────────────────────────────────────────
  // 9. Subscription Plan
  // ──────────────────────────────────────────────
  console.log('Creating subscription plan...');
  const [growthPlan] = await db
    .insert(subscriptionPlans)
    .values({
      nameAr: 'خطة النمو',
      nameEn: 'Growth',
      roleType: 'office',
      maxBuildings: 5,
      maxUnits: 75,
      maxAdmins: 3,
      priceSar: 14900, // 149 SAR in halalas
    })
    .returning();

  await db.insert(subscriptions).values({
    officeId: office.id,
    userId: adminUser.id,
    planId: growthPlan.id,
    status: 'ACTIVE',
    currentPeriodStart: new Date('2026-03-01'),
    currentPeriodEnd: new Date('2026-04-01'),
  });

  // ──────────────────────────────────────────────
  // 10. Announcement
  // ──────────────────────────────────────────────
  console.log('Creating announcement...');
  await db.insert(announcements).values({
    officeId: office.id,
    buildingId: building1.id,
    titleAr: 'صيانة المصاعد يوم الخميس',
    titleEn: 'Elevator maintenance on Thursday',
    bodyAr:
      'نود إبلاغكم بأنه سيتم إجراء صيانة دورية للمصاعد يوم الخميس القادم من الساعة ٩ صباحاً حتى ٢ ظهراً. يرجى استخدام السلالم خلال هذه الفترة. نعتذر عن أي إزعاج.',
    bodyEn:
      'We would like to inform you that routine elevator maintenance will be conducted next Thursday from 9 AM to 2 PM. Please use the stairs during this period. We apologize for any inconvenience.',
    type: 'maintenance',
  });

  console.log('Seeding complete!');
  console.log(`  - 1 office: ${office.nameAr}`);
  console.log(`  - 4 users (admin, tenant, provider, owner)`);
  console.log(`  - 2 buildings: ${building1.nameAr}, ${building2.nameAr}`);
  console.log(`  - ${building1Units.length + building2Units.length} units total`);
  console.log(`  - 3 maintenance requests (SUBMITTED, IN_PROGRESS, COMPLETED)`);
  console.log(`  - 4 cost rules`);
  console.log(`  - 1 subscription plan (Growth)`);
  console.log(`  - 1 announcement`);
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
