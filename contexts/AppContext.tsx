
import React, { createContext, useState, useContext, ReactNode } from 'react';
import { mockAudits, mockFindings, mockUsers, mockCars } from '../constants';
import { User, Audit, Finding, CAR, UserRole, FindingStatus, AuditStatus, FindingLevel, AuditType, ExtensionStatus } from '../types';

interface AppContextType {
  currentUser: User | null;
  currentPage: string;
  audits: Audit[];
  findings: Finding[];
  cars: CAR[];
  users: User[];
  login: (userId: number) => void;
  logout: () => void;
  setCurrentPage: (page: string) => void;
  addAudit: (auditData: Omit<Audit, 'id' | 'auditorId'>, findingsData: Omit<Finding, 'id' | 'auditId' | 'deadline' | 'status'>[]) => void;
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
          
          let deadline: string | undefined = undefined;
          
          // Logic for deadlines
          const getDeadline = (days: number): string => {
              const date = new Date(auditData.date);
              date.setDate(date.getDate() + days);
              return date.toISOString().split('T')[0];
          };

          switch(f.level) {
              case FindingLevel.LEVEL1:
                  deadline = getDeadline(7);
                  break;
              case FindingLevel.LEVEL2:
                  deadline = getDeadline(30);
                  break;
              case FindingLevel.LEVEL3:
                  deadline = getDeadline(60);
                  break;
              default:
                  deadline = undefined;
          }

          return {
              ...(f as Finding),
              id: autoId,
              customId: auditData.type === AuditType.External ? f.customId : undefined,
              auditId: newAuditRef,
              status: FindingStatus.Open,
              deadline: deadline,
              extensionStatus: ExtensionStatus.None,
          };
      });

      setAudits(prev => [...prev, newAudit]);
      setFindings(prev => [...prev, ...newFindings]);
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
    login,
    logout,
    setCurrentPage,
    addAudit,
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
