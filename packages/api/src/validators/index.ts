import { z } from 'zod';

// ─── Phone & Auth ───────────────────────────────────────────

/**
 * Saudi phone number validation.
 * Accepts +966XXXXXXXXX format (9 digits after country code).
 */
export const phoneSchema = z
  .string()
  .regex(/^\+966[0-9]{9}$/, {
    message:
      'رقم الهاتف يجب أن يبدأ بـ +966 ويتبعه 9 أرقام | Phone must start with +966 followed by 9 digits',
  });

/**
 * OTP code: exactly 6 digits.
 */
export const otpSchema = z
  .string()
  .regex(/^[0-9]{6}$/, {
    message: 'رمز التحقق يجب أن يكون 6 أرقام | OTP must be exactly 6 digits',
  });

// ─── Buildings ──────────────────────────────────────────────

export const buildingCreateSchema = z.object({
  officeId: z.string().uuid({ message: 'معرف المكتب غير صالح | Invalid office ID' }),
  nameAr: z
    .string()
    .min(1, { message: 'اسم المبنى بالعربية مطلوب | Arabic building name is required' })
    .max(255),
  nameEn: z.string().max(255).optional(),
  city: z.string().max(100).optional(),
  district: z.string().max(100).optional(),
  address: z.string().optional(),
  type: z.enum(['RESIDENTIAL', 'COMMERCIAL', 'MIXED']).default('RESIDENTIAL'),
  totalUnits: z
    .number()
    .int()
    .min(1, { message: 'عدد الوحدات يجب أن يكون 1 على الأقل | Must have at least 1 unit' }),
  floors: z.number().int().min(1).optional(),
  yearBuilt: z.number().int().min(1900).max(2100).optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  imageUrl: z.string().url().optional(),
});

export const buildingUpdateSchema = z.object({
  id: z.string().uuid({ message: 'معرف المبنى غير صالح | Invalid building ID' }),
  nameAr: z.string().min(1).max(255).optional(),
  nameEn: z.string().max(255).optional(),
  city: z.string().max(100).optional(),
  district: z.string().max(100).optional(),
  address: z.string().optional(),
  type: z.enum(['RESIDENTIAL', 'COMMERCIAL', 'MIXED']).optional(),
  totalUnits: z.number().int().min(1).optional(),
  floors: z.number().int().min(1).optional(),
  yearBuilt: z.number().int().min(1900).max(2100).optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  imageUrl: z.string().url().optional(),
});

// ─── Units ──────────────────────────────────────────────────

export const unitCreateSchema = z.object({
  buildingId: z.string().uuid({ message: 'معرف المبنى غير صالح | Invalid building ID' }),
  unitNumber: z.string().min(1, { message: 'رقم الوحدة مطلوب | Unit number is required' }).max(50),
  floor: z.number().int().optional(),
  bedrooms: z.number().int().min(0).optional(),
  bathrooms: z.number().int().min(0).optional(),
  areaSqm: z
    .number()
    .positive({ message: 'المساحة يجب أن تكون رقماً موجباً | Area must be positive' })
    .optional(),
  monthlyRent: z.number().int().min(0).optional(),
  status: z.enum(['OCCUPIED', 'VACANT', 'MAINTENANCE']).default('VACANT'),
});

export const unitUpdateSchema = z.object({
  id: z.string().uuid({ message: 'معرف الوحدة غير صالح | Invalid unit ID' }),
  unitNumber: z.string().min(1).max(50).optional(),
  floor: z.number().int().optional(),
  bedrooms: z.number().int().min(0).optional(),
  bathrooms: z.number().int().min(0).optional(),
  areaSqm: z.number().positive().optional(),
  monthlyRent: z.number().int().min(0).optional(),
  status: z.enum(['OCCUPIED', 'VACANT', 'MAINTENANCE']).optional(),
});

// ─── Maintenance Requests ───────────────────────────────────

export const requestCreateSchema = z.object({
  unitId: z.string().uuid({ message: 'معرف الوحدة غير صالح | Invalid unit ID' }),
  category: z.enum(
    [
      'PLUMBING',
      'ELECTRICAL',
      'HVAC',
      'STRUCTURAL',
      'APPLIANCE',
      'COSMETIC',
      'PAINTING',
      'CARPENTRY',
      'PEST_CONTROL',
      'ELEVATOR',
      'SECURITY',
      'CLEANING',
      'OTHER',
    ],
    { message: 'الفئة غير صالحة | Invalid category' },
  ),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
  titleAr: z
    .string()
    .min(1, { message: 'عنوان الطلب بالعربية مطلوب | Arabic title is required' })
    .max(255),
  titleEn: z.string().max(255).optional(),
  descriptionAr: z
    .string()
    .min(1, { message: 'وصف الطلب بالعربية مطلوب | Arabic description is required' })
    .max(2000),
  descriptionEn: z.string().max(2000).optional(),
  attachmentUrls: z.array(z.string().url()).max(10).optional(),
});

// ─── Announcements ──────────────────────────────────────────

export const announcementCreateSchema = z.object({
  officeId: z.string().uuid({ message: 'معرف المكتب غير صالح | Invalid office ID' }),
  buildingId: z.string().uuid().optional(),
  titleAr: z
    .string()
    .min(1, { message: 'عنوان الإعلان بالعربية مطلوب | Arabic title is required' })
    .max(255),
  titleEn: z.string().max(255).optional(),
  bodyAr: z
    .string()
    .min(1, { message: 'نص الإعلان بالعربية مطلوب | Arabic body is required' })
    .max(5000),
  bodyEn: z.string().max(5000).optional(),
  type: z.enum(['general', 'maintenance', 'payment', 'emergency']).default('general'),
  notifyTenants: z.boolean().default(true),
});

// ─── Uploads ────────────────────────────────────────────────

export const presignedUrlSchema = z.object({
  entityType: z.enum(['building', 'unit', 'request', 'announcement', 'avatar'], {
    message: 'نوع الكيان غير صالح | Invalid entity type',
  }),
  entityId: z.string().uuid({ message: 'معرف الكيان غير صالح | Invalid entity ID' }),
  contentType: z
    .string()
    .regex(/^(image\/(jpeg|png|webp|heic)|video\/(mp4|quicktime)|application\/pdf)$/, {
      message: 'نوع الملف غير مدعوم | Unsupported file type',
    }),
  fileName: z.string().min(1).max(255),
});

// ─── Notifications ──────────────────────────────────────────

export const notificationListSchema = z.object({
  unreadOnly: z.boolean().default(false),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(50).default(20),
});

// ─── Pagination ─────────────────────────────────────────────

export const paginationSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(50).default(20),
});
