import type { MaintenanceCategoryType } from '../constants/categories';

export interface CostRule {
  id: string;
  officeId: string;
  category: MaintenanceCategoryType;
  /** نسبة المالك — Owner's share percentage (0-100) */
  ownerSharePercent: number;
  /** نسبة المستأجر — Tenant's share percentage (0-100) */
  tenantSharePercent: number;
  /** الحد الأقصى — Max amount before escalation (SAR) */
  maxAmountSar?: number;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CostCalculation {
  requestId: string;
  totalCost: number;
  ownerShare: number;
  tenantShare: number;
  currency: 'SAR';
  ruleId: string;
  calculatedAt: Date;
}
