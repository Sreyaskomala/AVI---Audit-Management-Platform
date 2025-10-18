import React, { createContext, useState, useContext, ReactNode } from 'react';
import { mockAudits, mockFindings, mockUsers, mockCars } from '../constants';
import { User, Audit, Finding, CAR, UserRole, FindingStatus, AuditStatus } from '../types';

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
  reviewCar: (carId: string, decision: 'Approved' | 'Rejected', remarks: string) => void;
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
  };
  
  const addAudit = (auditData: Omit<Audit, 'id' | 'auditorId'>, newFindingsData: Omit<Finding, 'id' | 'auditId' | 'deadline' | 'status'>[]) => {
      if(!currentUser || currentUser.role !== UserRole.Auditor) return;

      const year = new Date(auditData.date).getFullYear();
      const newAuditRef = `AR/${year}/${String(audits.length + 1).padStart(3, '0')}`;
      const newAudit: Audit = {
          ...auditData,
          id: newAuditRef,
          auditorId: currentUser.id,
      };
      
      const month = new Date(auditData.date).toLocaleString('en-US', { month: 'short' }).toUpperCase();
      const yearShort = new Date(auditData.date).getFullYear().toString().slice(-2);
      
      const newFindings: Finding[] = newFindingsData.map((f, index) => {
          const newFindingId = `${month}${yearShort}-${String(findings.length + index + 1).padStart(3, '0')}`;
          const deadline = new Date(auditData.date);
          deadline.setDate(deadline.getDate() + 30); // Default 30 days
          return {
              ...f,
              id: newFindingId,
              auditId: newAuditRef,
              status: FindingStatus.Open,
              deadline: deadline.toISOString().split('T')[0],
          };
      });

      setAudits(prev => [...prev, newAudit]);
      setFindings(prev => [...prev, ...newFindings]);
  };

  const submitCar = (carData: Omit<CAR, 'id' | 'submittedById' | 'submissionDate' | 'status' | 'auditId'>) => {
      if(!currentUser || currentUser.role !== UserRole.Auditee) return;
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

  const reviewCar = (carId: string, decision: 'Approved' | 'Rejected', remarks: string) => {
      if(!currentUser || currentUser.role !== UserRole.Auditor) return;
      
      const carToUpdate = cars.find(c => c.id === carId);
      if(!carToUpdate) return;

      const newCarStatus = decision;
      const newFindingStatus = decision === 'Approved' ? FindingStatus.Closed : FindingStatus.Rejected;

      setCars(prev => prev.map(c => c.id === carId ? {...c, status: newCarStatus, auditorRemarks: remarks, reviewedById: currentUser.id, reviewDate: new Date().toISOString().split('T')[0]} : c));
      setFindings(prev => prev.map(f => f.id === carToUpdate.findingId ? {...f, status: newFindingStatus} : f));

      // If all findings for an audit are closed, update audit status
      const auditToUpdate = audits.find(a => a.id === carToUpdate.auditId);
      if (auditToUpdate) {
        const relatedFindings = findings.filter(f => f.auditId === auditToUpdate.id);
        const allClosed = relatedFindings.every(f => f.id === carToUpdate.findingId ? newFindingStatus === FindingStatus.Closed : f.status === FindingStatus.Closed);
        if(allClosed) {
            setAudits(prev => prev.map(a => a.id === auditToUpdate.id ? {...a, status: AuditStatus.Completed} : a));
        }
      }
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
