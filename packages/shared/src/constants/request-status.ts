export const RequestStatus = {
  /** تم التقديم — Request submitted by tenant */
  SUBMITTED: 'SUBMITTED',
  /** تمت المراجعة — Reviewed by office admin */
  REVIEWED: 'REVIEWED',
  /** تم التعيين — Assigned to service provider */
  ASSIGNED: 'ASSIGNED',
  /** قيد التنفيذ — Work in progress */
  IN_PROGRESS: 'IN_PROGRESS',
  /** مكتمل — Work completed */
  COMPLETED: 'COMPLETED',
  /** ملغي — Request cancelled */
  CANCELLED: 'CANCELLED',
} as const;

export type RequestStatusType = (typeof RequestStatus)[keyof typeof RequestStatus];

export const STATUS_LABELS_AR: Record<RequestStatusType, string> = {
  SUBMITTED: 'تم التقديم',
  REVIEWED: 'تمت المراجعة',
  ASSIGNED: 'تم التعيين',
  IN_PROGRESS: 'قيد التنفيذ',
  COMPLETED: 'مكتمل',
  CANCELLED: 'ملغي',
};

export const STATUS_LABELS_EN: Record<RequestStatusType, string> = {
  SUBMITTED: 'Submitted',
  REVIEWED: 'Reviewed',
  ASSIGNED: 'Assigned',
  IN_PROGRESS: 'In Progress',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
};

/** Valid status transitions */
export const STATUS_TRANSITIONS: Record<RequestStatusType, RequestStatusType[]> = {
  SUBMITTED: ['REVIEWED', 'CANCELLED'],
  REVIEWED: ['ASSIGNED', 'CANCELLED'],
  ASSIGNED: ['IN_PROGRESS', 'CANCELLED'],
  IN_PROGRESS: ['COMPLETED', 'CANCELLED'],
  COMPLETED: [],
  CANCELLED: [],
};
