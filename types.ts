
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

export enum AuditType {
  Internal = 'Internal',
  External = 'External',
}

export enum Location {
    GURUGRAM_1 = 'Gurugram 1',
    GURUGRAM_2 = 'Gurugram 2',
    HYDERABAD = 'Hyderabad',
    MUMBAI_PLANNING = 'Mumbai (Planning)',
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
  carId?: string;
  
  // Extension Logic
  extensionStatus?: ExtensionStatus;
  extensionReason?: string;
  requestedDeadline?: string;
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

export interface CAR {
  id: string; // CAR-I-001
  findingId: string;
  auditId: string;
  submittedById: number;
  submissionDate: string;
  rootCause: string;
  correctiveAction: string;
  evidence: string;
  attachments?: Attachment[]; // Evidence files
  proposedClosureDate: string;
  status: 'Pending Review' | 'Approved' | 'Rejected';
  auditorRemarks?: string;
  rootCauseRemarks?: string;
  correctiveActionRemarks?: string;
  reviewDate?: string;
  reviewedById?: number;
}

export interface Notification {
    id: number;
    type: 'CAR_DUE' | 'AUDIT_UPCOMING' | 'CAR_SUBMITTED' | 'FINDING_DUE' | 'EXTENSION_REQUEST';
    message: string;
    time: string;
}
