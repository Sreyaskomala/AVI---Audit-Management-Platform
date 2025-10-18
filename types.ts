export enum UserRole {
  Auditor = 'Auditor',
  Auditee = 'Auditee',
}

export interface User {
  id: number;
  name: string;
  role: UserRole;
  department: string;
  avatarUrl: string;
}

export enum AuditStatus {
  Scheduled = 'Scheduled',
  InProgress = 'In Progress',
  CARPending = 'CAR Pending',
  Completed = 'Completed',
  Overdue = 'Overdue',
}

export enum FindingLevel {
    Major = 'Major Non-Conformity',
    Minor = 'Minor Non-Conformity',
    Observation = 'Observation',
    OFI = 'Opportunity for Improvement'
}

export enum FindingStatus {
    Open = 'Open',
    CARSubmitted = 'CAR Submitted',
    UnderReview = 'Under Review',
    Closed = 'Closed',
    Rejected = 'Rejected',
}

export interface Finding {
  id: string; // e.g., OCT25-001
  auditId: string;
  referenceDoc: string;
  referencePara: string;
  level: FindingLevel;
  description: string;
  evidence?: string;
  deadline: string;
  status: FindingStatus;
  carId?: string;
}

export interface Audit {
  id: string; // referenceNo
  title: string;
  department: string;
  auditorId: number;
  auditeeId: number;
  date: string;
  status: AuditStatus;
}

export interface CAR {
  id: string; // CAR-I-001
  findingId: string;
  auditId: string;
  submittedById: number;
  submissionDate: string;
  rootCause: string;
  correctiveAction: string;
  evidence: string;
  proposedClosureDate: string;
  status: 'Pending Review' | 'Approved' | 'Rejected';
  auditorRemarks?: string;
  reviewDate?: string;
  reviewedById?: number;
}

export interface Notification {
    id: number;
    type: 'CAR_DUE' | 'AUDIT_UPCOMING' | 'CAR_SUBMITTED' | 'FINDING_DUE';
    message: string;
    time: string;
}
