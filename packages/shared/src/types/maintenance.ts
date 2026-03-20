import type { MaintenanceCategoryType } from '../constants/categories';
import type { RequestStatusType } from '../constants/request-status';

export interface MaintenanceRequest {
  id: string;
  unitId: string;
  buildingId: string;
  tenantId: string;
  officeId: string;
  assignedProviderId?: string;
  category: MaintenanceCategoryType;
  status: RequestStatusType;
  titleAr: string;
  titleEn?: string;
  descriptionAr: string;
  descriptionEn?: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  attachments: RequestAttachment[];
  statusLog: StatusLogEntry[];
  estimatedCost?: number;
  actualCost?: number;
  tenantRating?: number;
  tenantFeedback?: string;
  scheduledDate?: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface RequestAttachment {
  id: string;
  requestId: string;
  url: string;
  type: 'IMAGE' | 'VIDEO' | 'DOCUMENT';
  caption?: string;
  uploadedBy: string;
  createdAt: Date;
}

export interface StatusLogEntry {
  id: string;
  requestId: string;
  fromStatus: RequestStatusType | null;
  toStatus: RequestStatusType;
  changedBy: string;
  note?: string;
  createdAt: Date;
}
