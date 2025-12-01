
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { mockAudits, mockFindings, mockUsers, mockCars } from '../constants';
import { User, Audit, Finding, CAR, UserRole, FindingStatus, AuditStatus, FindingLevel, AuditType, ExtensionStatus } from '../types';

interface AppContextType {
  currentUser: User | null;
  currentPage: string;
  audits: Audit[];
  findings: Finding[];
  cars: CAR[];
  users: User[];
  theme: 'light' | 'dark';
  login: (userId: number) => void;
  logout: () => void;
  setCurrentPage: (page: string) => void;
  toggleTheme: () => void;
  addAudit: (auditData: Omit<Audit, 'id' | 'auditorId'>, findingsData: Omit<Finding, 'id' | 'auditId' | 'deadline' | 'status'>[]) => void;
  updateAudit: (auditId: string, auditData: Partial<Audit>, findingsData: Finding[]) => void;
  submitCar: (carData: Omit<CAR, 'id' | 'submittedById' | 'submissionDate' | 'status' | 'auditId'>) => void;
  reviewCar: (carId: string, decision: 'Approved' | 'Rejected', remarks: string, rootCauseRemarks?: string, correctiveActionRemarks?: string) => void;
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

  const toggleTheme = () => {
      setTheme(prev => prev === 'light' ? 'dark' : 'light');
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
          // If external and user provided custom ID, use it. Otherwise generate one.
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

      // Update Audit
      setAudits(prev => prev.map(a => a.id === auditId ? { ...a, ...auditData } : a));

      // Update Findings:
      // Strategy: Remove all old findings for this audit and re-add the new list. 
      // NOTE: This assumes we are in Draft/Editing mode where no CARs exist yet.
      
      setFindings(prev => {
          const otherFindings = prev.filter(f => f.auditId !== auditId);
          
          const month = new Date(auditData.date || new Date().toISOString()).toLocaleString('en-US', { month: 'short' }).toUpperCase();
          const yearShort = new Date(auditData.date || new Date().toISOString()).getFullYear().toString().slice(-2);

          const updatedFindings = findingsData.map((f, index) => {
             // Generate ID if it's a new temporary finding
             const id = f.id || `${month}${yearShort}-${String(prev.length + index + 1).padStart(3, '0')}`;
             
             return {
                 ...f,
                 id: id,
                 auditId: auditId,
                 // Recalculate deadline if we are finalizing (not Draft)
                 deadline: auditData.status !== AuditStatus.Draft ? calculateDeadline(f.level, auditData.date || new Date().toISOString()) : undefined,
                 status: FindingStatus.Open // Ensure status is Open if finalizing
             };
          });
          
          return [...otherFindings, ...updatedFindings];
      });
  };

  const submitCar = (carData: Omit<CAR, 'id' | 'submittedById' | 'submissionDate' | 'status' | 'auditId'>) => {
      if(!currentUser) return;
      
      const findingToUpdate = findings.find(f => f.id === carData.findingId);
      if(!findingToUpdate) return;
      
      const newCarId = `CAR-I-${String(cars.length + 1).padStart(3, '0')}`;
      const newCar: CAR = {
          ...carData,
          id: newCarId,
          auditId: findingToUpdate.auditId,
          submittedById: currentUser.id,
          submissionDate: new Date().toISOString().split('T')[0],
          status: 'Pending Review',
      };

      setCars(prev => [...prev, newCar]);
      setFindings(prev => prev.map(f => f.id === carData.findingId ? {...f, status: FindingStatus.CARSubmitted, carId: newCarId} : f));
  };

  const reviewCar = (carId: string, decision: 'Approved' | 'Rejected', remarks: string, rootCauseRemarks?: string, correctiveActionRemarks?: string) => {
      if(!currentUser || currentUser.role !== UserRole.Auditor) return;
      
      const carToUpdate = cars.find(c => c.id === carId);
      if(!carToUpdate) return;

      const newCarStatus = decision;
      const newFindingStatus = decision === 'Approved' ? FindingStatus.Closed : FindingStatus.Rejected;

      setCars(prev => prev.map(c => c.id === carId ? {
          ...c, 
          status: newCarStatus, 
          auditorRemarks: remarks, 
          rootCauseRemarks: rootCauseRemarks,
          correctiveActionRemarks: correctiveActionRemarks,
          reviewedById: currentUser.id, 
          reviewDate: new Date().toISOString().split('T')[0]
      } : c));
      
      setFindings(prev => prev.map(f => f.id === carToUpdate.findingId ? {...f, status: newFindingStatus} : f));

      // Check if audit is complete
      const auditToUpdate = audits.find(a => a.id === carToUpdate.auditId);
      if (auditToUpdate) {
        const relatedFindings = findings.filter(f => f.auditId === auditToUpdate.id);
        const allClosed = relatedFindings.every(f => f.id === carToUpdate.findingId ? newFindingStatus === FindingStatus.Closed : f.status === FindingStatus.Closed);
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
    login,
    logout,
    setCurrentPage,
    toggleTheme,
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
