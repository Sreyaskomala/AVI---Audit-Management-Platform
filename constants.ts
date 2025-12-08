
import { Audit, AuditStatus, User, Finding, FindingLevel, FindingStatus, UserRole, CAR, AuditType, Location } from './types';

export const FSTD_OPTIONS = ['FSTD 1', 'FSTD 2', 'FSTD 3 (Demo)'];

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
    additionalDates: ['2025-10-16'],
    reportDate: '2025-10-18',
    status: AuditStatus.CARPending,
    type: AuditType.Internal,
    location: Location.LOCATION_1,
    fstdId: 'FSTD 1',
  },
  {
    id: 'AR/2025/020',
    title: 'Safety Management System Review',
    department: 'Safety',
    auditorId: 1,
    auditeeId: 4,
    date: '2025-10-12',
    reportDate: '2025-10-12',
    status: AuditStatus.Completed,
    type: AuditType.Internal,
    location: Location.LOCATION_2,
  },
  {
    id: 'AR/2025/019',
    title: 'Training Procedures Audit',
    department: 'Training',
    auditorId: 1,
    auditeeId: 3,
    date: '2025-09-28',
    reportDate: '2025-09-30',
    status: AuditStatus.Overdue,
    type: AuditType.Internal,
    location: Location.LOCATION_3,
  },
  {
    id: 'EXT/2025/001',
    title: 'CAA Annual Surveillance',
    department: 'Engineering',
    auditorId: 1, 
    auditeeId: 2, 
    date: '2025-10-01',
    additionalDates: ['2025-10-02', '2025-10-03'],
    reportDate: '2025-10-05',
    status: AuditStatus.CARPending,
    type: AuditType.External,
    externalEntity: 'Civil Aviation Authority',
    location: Location.LOCATION_1,
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
        description: 'The examination environment did not meet the required standards.',
        deadline: '2025-10-22',
        status: FindingStatus.CARSubmitted,
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
    {
        id: 'EXT-001',
        customId: 'EXT-CAA-2025-44', // Custom External ID
        auditId: 'EXT/2025/001',
        referenceDoc: 'CAA Regs',
        referencePara: 'Part 145.A.50',
        level: FindingLevel.LEVEL2,
        description: 'Tool calibration records were missing for Torque Wrench S/N 12345.',
        deadline: '2025-11-01',
        status: FindingStatus.Open,
        attachments: [
            { name: 'calibration_log.pdf', type: 'document', url: '#' },
            { name: 'wrench_photo.jpg', type: 'image', url: '#' }
        ]
    }
];

export const mockCars: CAR[] = [
    {
        id: 'CAR-I-001',
        findingId: 'OCT25-002',
        auditId: 'AR/2025/021',
        carNumber: 1,
        submittedById: 2,
        submissionDate: '2025-10-20',
        rootCause: 'The designated examination room was temporarily unavailable due to maintenance.',
        correctiveAction: 'A secondary, pre-approved examination room has been established.',
        evidence: 'Updated facility manual (doc #FM-002), photos of new room.',
        attachments: [{ name: 'new_room_photo.jpg', type: 'image', url: '#' }],
        proposedClosureDate: '2025-10-25',
        status: 'Pending Review',
    }
];
