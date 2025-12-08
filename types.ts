
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
  Draft = 'Draft',
  Scheduled = 'Scheduled',
  InProgress = 'In Progress',
  CARPending = 'CAR Pending',
  Completed = 'Completed',
  Overdue = 'Overdue',
}

export enum AuditType {
  Internal = 'Internal',
  External = 'External',
}

export enum Location {
    LOCATION_1 = 'Location 1',
    LOCATION_2 = 'Location 2',
    LOCATION_3 = 'Location 3',
}

export enum FindingLevel {
    LEVEL1 = 'LEVEL 1',
    LEVEL2 = 'LEVEL 2',
    LEVEL3 = 'LEVEL 3',
    OBSERVATION = 'OBSERVATION',
    RECOMMENDATION = 'RECOMMENDATION OF IMPROVEMENT',
    COMMENT = 'COMMENT',
}

export enum FindingStatus {
    Open = 'Open',
    CARSubmitted = 'CAR Submitted',
    UnderReview = 'Under Review',
    Closed = 'Closed',
    Rejected = 'Rejected',
}

export enum ExtensionStatus {
    None = 'None',
    Pending = 'Pending',
    Approved = 'Approved',
    Rejected = 'Rejected',
}

export interface Attachment {
    name: string;
    url: string; // Base64 or mock URL
    type: 'image' | 'document' | 'video' | 'other';
}

export interface Finding {
  id: string; // Internal generated ID
  customId?: string; // For external audits
  auditId: string;
  referenceDoc: string;
  referencePara: string;
  level: FindingLevel;
  description: string;
  attachments?: Attachment[];
  deadline?: string;
  status: FindingStatus;
  
  // Root Cause Logic - Persists on the finding once set
  rootCause?: string; 

  // Extension Logic
  extensionStatus?: ExtensionStatus;
  extensionReason?: string;
  requestedDeadline?: string;
}

export interface CAR {
  id: string; // CAR-I-001
  findingId: string;
  auditId: string;
  carNumber: number; // 1, 2, 3...
  submittedById: number;
  submissionDate: string;
  
  // Submissions
  rootCause?: string; // Captured here for history, but mainly populates Finding.rootCause
  correctiveAction: string;
  evidence: string;
  attachments?: Attachment[]; // Evidence files
  proposedClosureDate: string;
  
  auditeeStatus: 'Open' | 'Closed'; // Auditee declares if this is just an update (Open) or ready for verification (Closed)

  status: 'Pending Review' | 'Reviewed'; 
  auditorRemarks?: string;
  rootCauseRemarks?: string;
  correctiveActionRemarks?: string;
  reviewDate?: string;
  reviewedById?: number;
}

export interface Audit {
  id: string; // referenceNo
  title: string;
  department: string;
  auditorId: number;
  auditeeId: number;
  date: string; // Main scheduled date
  additionalDates?: string[]; // For multi-day audits
  reportDate?: string; // Date report was generated
  status: AuditStatus;
  type: AuditType;
  externalEntity?: string;
  location?: Location;
  fstdId?: string; // Optional FSTD reference (e.g., FSTD-1)
}

export interface Notification {
    id: number;
    type: 'CAR_DUE' | 'AUDIT_UPCOMING' | 'CAR_SUBMITTED' | 'FINDING_DUE' | 'EXTENSION_REQUEST' | 'CAR_REJECTED';
    message: string;
    time: string;
}
