
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { mockAudits, mockFindings, mockUsers, mockCars } from '../constants';
import { User, Audit, Finding, CAR, UserRole, FindingStatus, AuditStatus, FindingLevel, AuditType, ExtensionStatus, Notification } from '../types';

interface AppContextType {
  currentUser: User | null;
  currentPage: string;
  audits: Audit[];
  findings: Finding[];
  cars: CAR[];
  users: User[];
  theme: 'light' | 'dark';
  notifications: Notification[];
  isNotificationDrawerOpen: boolean;
  login: (userId: number) => void;
  logout: () => void;
  setCurrentPage: (page: string) => void;
  toggleTheme: () => void;
  toggleNotificationDrawer: () => void;
  addAudit: (auditData: Omit<Audit, 'id' | 'auditorId'>, findingsData: Omit<Finding, 'id' | 'auditId' | 'deadline' | 'status'>[]) => void;
  updateAudit: (auditId: string, auditData: Partial<Audit>, findingsData: Finding[]) => void;
  submitCar: (carData: Omit<CAR, 'id' | 'submittedById' | 'submissionDate' | 'status' | 'auditId' | 'carNumber'>, extensionRequest?: { date: string, reason: string }) => void;
  reviewCar: (carId: string, remarks: string, rootCauseRemarks: string | undefined, correctiveActionRemarks: string | undefined, closeFinding: boolean) => void;
  requestExtension: (findingId: string, requestedDate: string, reason: string) => void;
  processExtension: (findingId: string, decision: 'Approved' | 'Rejected') => void;
  addUser: (userData: Omit<User, 'id' | 'avatarUrl'>) => void;
  updateUser: (userData: User) => void;
  deleteUser: (userId: number) => void;
  updateCurrentUserDetails: (details: Partial<Pick<User, 'name' | 'department'>>) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [audits, setAudits] = useState<Audit[]>(mockAudits);
  const [findings, setFindings] = useState<Finding[]>(mockFindings);
  const [cars, setCars] = useState<CAR[]>(mockCars);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isNotificationDrawerOpen, setIsNotificationDrawerOpen] = useState(false);
  
  // Theme State
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
      if (typeof window !== 'undefined') {
          return (localStorage.getItem('theme') as 'light' | 'dark') || 'light';
      }
      return 'light';
  });

  useEffect(() => {
      const root = window.document.documentElement;
      if (theme === 'dark') {
          root.classList.add('dark');
      } else {
          root.classList.remove('dark');
      }
      localStorage.setItem('theme', theme);
  }, [theme]);

  // Generate Notifications Logic
  useEffect(() => {
    if (!currentUser) return;

    const generatedNotifications: Notification[] = [];
    const now = new Date();
    now.setHours(0, 0, 0, 0); 

    const daysBetween = (date1: Date, date2: Date) => {
        const oneDay = 1000 * 60 * 60 * 24;
        const d1 = new Date(date1);
        d1.setHours(0,0,0,0);
        const d2 = new Date(date2);
        d2.setHours(0,0,0,0);
        const diffInTime = d2.getTime() - d1.getTime();
        return Math.ceil(diffInTime / oneDay);
    };
    
    // 1. CARs submitted for review (Auditor)
    if (currentUser.role === UserRole.Auditor) {
        cars.forEach(car => {
            const audit = audits.find(a => a.id === car.auditId);
            if (car.status === 'Pending Review' && audit?.auditorId === currentUser.id) {
                generatedNotifications.push({
                    id: generatedNotifications.length + 1,
                    type: 'CAR_SUBMITTED',
                    message: `CAR ${car.carNumber} submitted for ${car.findingId}.`,
                    time: 'Just now'
                });
            }
        });
        // Extension Requests
        findings.forEach(finding => {
            const audit = audits.find(a => a.id === finding.auditId);
            if (finding.extensionStatus === ExtensionStatus.Pending && audit?.auditorId === currentUser.id) {
                generatedNotifications.push({
                        id: generatedNotifications.length + 1,
                        type: 'EXTENSION_REQUEST',
                        message: `Extension requested for Finding ${finding.customId || finding.id}.`,
                        time: 'Just now'
                });
            }
        });
    }
    
    // 2. Upcoming Audits
    audits.forEach(audit => {
        const auditDate = new Date(audit.date);
        const daysUntil = daysBetween(now, auditDate);
        if (daysUntil >= 0 && daysUntil <= 7) {
                if ((currentUser.role === UserRole.Auditor && currentUser.id === audit.auditorId) || (currentUser.role === UserRole.Auditee && currentUser.id === audit.auditeeId)) {
                generatedNotifications.push({
                    id: generatedNotifications.length + 1,
                    type: 'AUDIT_UPCOMING',
                    message: `Audit ${audit.id} is scheduled in ${daysUntil} day(s).`,
                    time: 'Just now'
                });
            }
        }
    });

    // 3. Findings deadlines (Auditee)
    if (currentUser.role === UserRole.Auditee) {
        // Deadlines
        findings.forEach(finding => {
            const audit = audits.find(a => a.id === finding.auditId);
            if (!finding.deadline || !audit || audit.auditeeId !== currentUser.id) return;
            
            if (finding.status === 'Open' || finding.status === 'Rejected') {
                const deadlineDate = new Date(finding.deadline);
                const daysUntil = daysBetween(now, deadlineDate);

                if (daysUntil < 0) {
                    generatedNotifications.push({
                        id: generatedNotifications.length + 1,
                        type: 'CAR_DUE',
                        message: `Action for finding ${finding.customId || finding.id} is overdue by ${Math.abs(daysUntil)} day(s). Please submit update immediately.`,
                        time: 'Just now'
                    });
                } else if (daysUntil >= 0 && daysUntil <= 3) {
                    generatedNotifications.push({
                        id: generatedNotifications.length + 1,
                        type: 'FINDING_DUE',
                        message: `Action for finding ${finding.customId || finding.id} is due ${daysUntil === 0 ? 'today' : `in ${daysUntil} day(s)`}.`,
                        time: 'Just now'
                    });
                }
            }
        });
    }

    setNotifications(generatedNotifications);
  }, [currentUser, audits, findings, cars]);

  const toggleTheme = () => {
      setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const toggleNotificationDrawer = () => {
      setIsNotificationDrawerOpen(prev => !prev);
  };

  const login = (userId: number) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      setCurrentUser(user);
      setCurrentPage('dashboard');
    }
  };

  const logout = () => {
    setCurrentUser(null);
    setCurrentPage('login');
  };
  
  const calculateDeadline = (level: FindingLevel, baseDate: string): string | undefined => {
      const date = new Date(baseDate);
      
      switch(level) {
          case FindingLevel.LEVEL1:
              date.setDate(date.getDate() + 7);
              return date.toISOString().split('T')[0];
          case FindingLevel.LEVEL2:
              date.setDate(date.getDate() + 30);
              return date.toISOString().split('T')[0];
          case FindingLevel.LEVEL3:
              date.setDate(date.getDate() + 60);
              return date.toISOString().split('T')[0];
          default:
              return undefined;
      }
  };

  const addAudit = (auditData: Omit<Audit, 'id' | 'auditorId'>, newFindingsData: Omit<Finding, 'id' | 'auditId' | 'deadline' | 'status'>[]) => {
      if(!currentUser || currentUser.role !== UserRole.Auditor) return;

      const year = new Date(auditData.date).getFullYear();
      const prefix = auditData.type === AuditType.External ? 'EXT' : 'AR';
      const newAuditRef = `${prefix}/${year}/${String(audits.length + 1).padStart(3, '0')}`;
      
      const newAudit: Audit = {
          ...auditData,
          id: newAuditRef,
          auditorId: currentUser.id,
      };
      
      const month = new Date(auditData.date).toLocaleString('en-US', { month: 'short' }).toUpperCase();
      const yearShort = new Date(auditData.date).getFullYear().toString().slice(-2);
      
      const newFindings: Finding[] = newFindingsData.map((f, index) => {
          const autoId = `${month}${yearShort}-${String(findings.length + index + 1).padStart(3, '0')}`;
          
          return {
              ...(f as Finding),
              id: autoId,
              customId: auditData.type === AuditType.External ? f.customId : undefined,
              auditId: newAuditRef,
              status: FindingStatus.Open,
              deadline: auditData.status !== AuditStatus.Draft ? calculateDeadline(f.level, auditData.date) : undefined,
              extensionStatus: ExtensionStatus.None,
          };
      });

      setAudits(prev => [...prev, newAudit]);
      setFindings(prev => [...prev, ...newFindings]);
  };

  const updateAudit = (auditId: string, auditData: Partial<Audit>, findingsData: Finding[]) => {
      if(!currentUser || currentUser.role !== UserRole.Auditor) return;

      setAudits(prev => prev.map(a => a.id === auditId ? { ...a, ...auditData } : a));

      setFindings(prev => {
          const otherFindings = prev.filter(f => f.auditId !== auditId);
          
          const month = new Date(auditData.date || new Date().toISOString()).toLocaleString('en-US', { month: 'short' }).toUpperCase();
          const yearShort = new Date(auditData.date || new Date().toISOString()).getFullYear().toString().slice(-2);

          const updatedFindings = findingsData.map((f, index) => {
             const id = f.id || `${month}${yearShort}-${String(prev.length + index + 1).padStart(3, '0')}`;
             
             return {
                 ...f,
                 id: id,
                 auditId: auditId,
                 deadline: auditData.status !== AuditStatus.Draft ? calculateDeadline(f.level, auditData.date || new Date().toISOString()) : undefined,
                 status: FindingStatus.Open
             };
          });
          
          return [...otherFindings, ...updatedFindings];
      });
  };

  const submitCar = (carData: Omit<CAR, 'id' | 'submittedById' | 'submissionDate' | 'status' | 'auditId' | 'carNumber'>, extensionRequest?: { date: string, reason: string }) => {
      if(!currentUser) return;
      
      const findingToUpdate = findings.find(f => f.id === carData.findingId);
      if(!findingToUpdate) return;

      // Calculate next CAR number for this finding
      const existingCars = cars.filter(c => c.findingId === carData.findingId);
      const nextCarNumber = existingCars.length + 1;
      
      const newCarId = `CAR-I-${String(cars.length + 1).padStart(3, '0')}`;
      const newCar: CAR = {
          ...carData,
          id: newCarId,
          auditId: findingToUpdate.auditId,
          carNumber: nextCarNumber,
          submittedById: currentUser.id,
          submissionDate: new Date().toISOString().split('T')[0],
          status: 'Pending Review',
      };

      setCars(prev => [...prev, newCar]);

      // Update finding status to indicate activity, and handle extension if present
      setFindings(prev => prev.map(f => {
          if (f.id === carData.findingId) {
              return {
                  ...f, 
                  status: FindingStatus.CARSubmitted, // Or 'UnderReview'
                  // If extension requested
                  ...(extensionRequest ? {
                      extensionStatus: ExtensionStatus.Pending,
                      requestedDeadline: extensionRequest.date,
                      extensionReason: extensionRequest.reason
                  } : {})
              };
          }
          return f;
      }));
  };

  const reviewCar = (carId: string, remarks: string, rootCauseRemarks: string | undefined, correctiveActionRemarks: string | undefined, closeFinding: boolean) => {
      if(!currentUser || currentUser.role !== UserRole.Auditor) return;
      
      const carToUpdate = cars.find(c => c.id === carId);
      if(!carToUpdate) return;

      // 1. Mark the CAR itself as Reviewed
      setCars(prev => prev.map(c => c.id === carId ? {
          ...c, 
          status: 'Reviewed', 
          auditorRemarks: remarks, 
          rootCauseRemarks: rootCauseRemarks,
          correctiveActionRemarks: correctiveActionRemarks,
          reviewedById: currentUser.id, 
          reviewDate: new Date().toISOString().split('T')[0]
      } : c));
      
      // 2. Decide fate of the Finding
      const newFindingStatus = closeFinding ? FindingStatus.Closed : FindingStatus.Open;

      setFindings(prev => prev.map(f => f.id === carToUpdate.findingId ? {...f, status: newFindingStatus} : f));

      // 3. Check if Audit is complete
      const auditToUpdate = audits.find(a => a.id === carToUpdate.auditId);
      if (auditToUpdate && closeFinding) {
        const relatedFindings = findings.filter(f => f.auditId === auditToUpdate.id);
        const allClosed = relatedFindings.every(f => f.id === carToUpdate.findingId ? true : f.status === FindingStatus.Closed);
        if(allClosed) {
            setAudits(prev => prev.map(a => a.id === auditToUpdate.id ? {...a, status: AuditStatus.Completed} : a));
        }
      }
  };

  const requestExtension = (findingId: string, requestedDate: string, reason: string) => {
      setFindings(prev => prev.map(f => f.id === findingId ? {
          ...f,
          extensionStatus: ExtensionStatus.Pending,
          requestedDeadline: requestedDate,
          extensionReason: reason
      } : f));
  };

  const processExtension = (findingId: string, decision: 'Approved' | 'Rejected') => {
      setFindings(prev => prev.map(f => {
          if (f.id !== findingId) return f;
          
          if (decision === 'Approved') {
              return {
                  ...f,
                  deadline: f.requestedDeadline,
                  extensionStatus: ExtensionStatus.Approved
              };
          } else {
              return {
                  ...f,
                  extensionStatus: ExtensionStatus.Rejected
              };
          }
      }));
  };

  const addUser = (userData: Omit<User, 'id' | 'avatarUrl'>) => {
      if (!currentUser || currentUser.role !== UserRole.Auditor) return;
      const newUser: User = {
          id: Math.max(0, ...users.map(u => u.id)) + 1,
          ...userData,
          avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.name)}&background=random&color=fff`,
      };
      setUsers(prev => [...prev, newUser]);
  };

  const updateUser = (userData: User) => {
      if (!currentUser || currentUser.role !== UserRole.Auditor) return;
      const oldUser = users.find(u => u.id === userData.id);
      let newAvatarUrl = userData.avatarUrl;
      if (oldUser && oldUser.name !== userData.name) {
          newAvatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.name)}&background=random&color=fff`;
      }
      setUsers(prev => prev.map(u => u.id === userData.id ? {...userData, avatarUrl: newAvatarUrl} : u));
  };
  
  const deleteUser = (userId: number) => {
      if (!currentUser || currentUser.role !== UserRole.Auditor) return;
      if (currentUser.id === userId) {
          alert("You cannot delete your own account.");
          return;
      }
      setUsers(prev => prev.filter(u => u.id !== userId));
  };

  const updateCurrentUserDetails = (details: Partial<Pick<User, 'name' | 'department'>>) => {
      if (!currentUser) return;
      let newAvatarUrl = currentUser.avatarUrl;
      if (details.name && details.name !== currentUser.name) {
          newAvatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(details.name)}&background=random&color=fff`;
      }
      const updatedUser = { ...currentUser, ...details, avatarUrl: newAvatarUrl };
      setCurrentUser(updatedUser);
      setUsers(prev => prev.map(u => u.id === currentUser.id ? updatedUser : u));
  };


  const value = {
    currentUser,
    currentPage,
    audits,
    findings,
    cars,
    users,
    theme,
    notifications,
    isNotificationDrawerOpen,
    login,
    logout,
    setCurrentPage,
    toggleTheme,
    toggleNotificationDrawer,
    addAudit,
    updateAudit,
    submitCar,
    reviewCar,
    requestExtension,
    processExtension,
    addUser,
    updateUser,
    deleteUser,
    updateCurrentUserDetails,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
