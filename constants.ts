import { Audit, AuditStatus, Notification, User, Finding, FindingLevel, FindingStatus, UserRole, CAR } from './types';

export const mockUsers: User[] = [
  { id: 1, name: 'Sreyas', role: UserRole.Auditor, department: 'Quality', avatarUrl: 'https://i.pravatar.cc/150?u=sreyas' },
  { id: 2, name: 'John Doe', role: UserRole.Auditee, department: 'Engineering', avatarUrl: 'https://i.pravatar.cc/150?u=john' },
  { id: 3, name: 'Jane Smith', role: UserRole.Auditee, department: 'Training', avatarUrl: 'https://i.pravatar.cc/150?u=jane' },
  { id: 4, name: 'Mike Ross', role: UserRole.Auditee, department: 'Flight Ops', avatarUrl: 'https://i.pravatar.cc/150?u=mike' },
];

export const mockAudits: Audit[] = [
  {
    id: 'AR/2025/021',
    title: 'CAR-147 Compliance Audit',
    department: 'Engineering',
    auditorId: 1,
    auditeeId: 2,
    date: '2025-10-15',
    status: AuditStatus.CARPending,
  },
  {
    id: 'AR/2025/020',
    title: 'Safety Management System Review',
    department: 'Safety',
    auditorId: 1,
    auditeeId: 4,
    date: '2025-10-12',
    status: AuditStatus.Completed,
  },
  {
    id: 'AR/2025/019',
    title: 'Training Procedures Audit',
    department: 'Training',
    auditorId: 1,
    auditeeId: 3,
    date: '2025-09-28',
    status: AuditStatus.Overdue,
  },
];

export const mockFindings: Finding[] = [
    {
        id: 'OCT25-001',
        auditId: 'AR/2025/021',
        referenceDoc: 'CAR-147',
        referencePara: '147.A.100',
        level: FindingLevel.LEVEL2,
        description: 'Training records for technician A. Anderson were incomplete.',
        deadline: '2025-11-14',
        status: FindingStatus.Open,
    },
    {
        id: 'OCT25-002',
        auditId: 'AR/2025/021',
        referenceDoc: 'EASA Part-147',
        referencePara: '147.A.105(f)',
        level: FindingLevel.LEVEL1,
        description: 'The examination environment did not meet the required standards for security and distraction-free conditions.',
        deadline: '2025-10-22',
        status: FindingStatus.CARSubmitted,
        carId: 'CAR-I-001'
    },
    {
        id: 'SEP25-005',
        auditId: 'AR/2025/019',
        referenceDoc: 'Training Manual',
        referencePara: '5.2.3',
        level: FindingLevel.LEVEL2,
        description: 'The procedure for recurrent training scheduling is not being consistently followed.',
        deadline: '2025-10-28',
        status: FindingStatus.Open,
    },
     {
        id: 'OCT25-003',
        auditId: 'AR/2025/020',
        referenceDoc: 'SMS Manual',
        referencePara: '2.1.1',
        level: FindingLevel.OBSERVATION,
        description: 'Safety meeting minutes could be more detailed to better track action items.',
        status: FindingStatus.Closed,
    },
];

export const mockCars: CAR[] = [
    {
        id: 'CAR-I-001',
        findingId: 'OCT25-002',
        auditId: 'AR/2025/021',
        submittedById: 2,
        submissionDate: '2025-10-20',
        rootCause: 'The designated examination room was temporarily unavailable due to maintenance, and the alternate location was not properly vetted for compliance.',
        correctiveAction: 'A secondary, pre-approved examination room has been established and added to the official facility list. A new procedure requires formal verification of room suitability 24 hours prior to any exam.',
        evidence: 'Updated facility manual (doc #FM-002), photos of new room, memo to all instructors.',
        proposedClosureDate: '2025-10-25',
        status: 'Pending Review',
    }
]


export const mockNotifications: Notification[] = [
    {
        id: 1,
        type: 'CAR_DUE',
        message: 'CAR for AR/2025/019 is overdue by 3 days.',
        time: '1h ago',
    },
    {
        id: 2,
        type: 'AUDIT_UPCOMING',
        message: 'Audit AR/2025/022 for Maintenance is scheduled for tomorrow.',
        time: '5h ago',
    },
    {
        id: 3,
        type: 'CAR_SUBMITTED',
        message: 'New CAR submitted for AR/2025/021 by Engineering Dept.',
        time: '1 day ago',
    },
    {
        id: 4,
        type: 'FINDING_DUE',
        message: 'Finding OCT25-003 is approaching its deadline (3 days).',
        time: '2 days ago',
    },
];