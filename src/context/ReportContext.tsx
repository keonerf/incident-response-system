import React, { createContext, useContext, useState, ReactNode } from 'react';
import { VerificationState, IncidentCategory } from '@/types/incident';

interface SubmittedReport {
  report_id: string;
  category: IncidentCategory;
  reported_time: string;
  location_label: string;
  verification_state: VerificationState;
}

interface ReportContextType {
  submittedReport: SubmittedReport | null;
  setSubmittedReport: (report: SubmittedReport | null) => void;
}

const ReportContext = createContext<ReportContextType | undefined>(undefined);

export function ReportProvider({ children }: { children: ReactNode }) {
  const [submittedReport, setSubmittedReport] = useState<SubmittedReport | null>(null);

  return (
    <ReportContext.Provider value={{ submittedReport, setSubmittedReport }}>
      {children}
    </ReportContext.Provider>
  );
}

export function useReport() {
  const context = useContext(ReportContext);
  if (context === undefined) {
    throw new Error('useReport must be used within a ReportProvider');
  }
  return context;
}
