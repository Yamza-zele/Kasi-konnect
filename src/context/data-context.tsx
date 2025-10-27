import React, { createContext, useContext, useState, useEffect } from 'react';
import { mockBusinessProfiles, mockFreelancerProfiles, mockFundingRequests, mockJobs, mockJobApplications, mockPayments, mockReviews, mockWithdrawals } from '../../lib/mock-data';
import { generateId, generateTransactionId } from '../utils/currency';
import {
  BusinessProfile,
  FreelancerProfile,
  FundingRequest,
  Job,
  JobApplication,
  Payment,
  Review,
  Withdrawal,
  BusinessDocument
} from '../../lib/types';

interface DataContextType {
  businessProfiles: BusinessProfile[];
  getBusinessProfile: (userId: string) => BusinessProfile | undefined;
  updateBusinessProfile: (userId: string, updates: Partial<BusinessProfile>) => void;
  createBusinessProfile: (profile: BusinessProfile) => void;
  uploadBusinessDocument: (userId: string, document: Omit<BusinessDocument, 'id' | 'uploadedAt' | 'verified'>) => void;
  deleteBusinessDocument: (userId: string, documentId: string) => void;
  freelancerProfiles: FreelancerProfile[];
  getFreelancerProfile: (userId: string) => FreelancerProfile | undefined;
  updateFreelancerProfile: (userId: string, updates: Partial<FreelancerProfile>) => void;
  createFreelancerProfile: (profile: FreelancerProfile) => void;
  uploadFreelancerDocument: (userId: string, document: Omit<BusinessDocument, 'id' | 'uploadedAt' | 'verified'>) => void;
  deleteFreelancerDocument: (userId: string, documentId: string) => void;
  fundingRequests: FundingRequest[];
  createFundingRequest: (request: Omit<FundingRequest, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateFundingRequest: (id: string, updates: Partial<FundingRequest>) => void;
  jobs: Job[];
  createJob: (job: Omit<Job, 'id' | 'createdAt'>) => void;
  updateJob: (id: string, updates: Partial<Job>) => void;
  jobApplications: JobApplication[];
  createJobApplication: (application: Omit<JobApplication, 'id' | 'createdAt'>) => void;
  updateJobApplication: (id: string, updates: Partial<JobApplication>) => void;
  payments: Payment[];
  createPayment: (payment: Omit<Payment, 'id' | 'transactionId' | 'createdAt'>) => void;
  reviews: Review[];
  createReview: (review: Omit<Review, 'id' | 'createdAt'>) => void;
  withdrawals: Withdrawal[];
  createWithdrawal: (withdrawal: Omit<Withdrawal, 'id' | 'transactionId' | 'createdAt'>) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [businessProfiles, setBusinessProfiles] = useState<BusinessProfile[]>([]);
  const [freelancerProfiles, setFreelancerProfiles] = useState<FreelancerProfile[]>([]);
  const [fundingRequests, setFundingRequests] = useState<FundingRequest[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [jobApplications, setJobApplications] = useState<JobApplication[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);

  // Initialize data from localStorage or mock data
  useEffect(() => {
    // Batch all localStorage operations together
    const loadData = (key: string, mockData: any) => {
      const stored = localStorage.getItem(`kasi-konnect-${key}`);
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch (e) {
          console.error(`Error parsing ${key}:`, e);
          return mockData;
        }
      }
      return mockData;
    };

    // Load all data at once to reduce repaints
    const businessProfilesData = loadData('business-profiles', mockBusinessProfiles);
    const freelancerProfilesData = loadData('freelancer-profiles', mockFreelancerProfiles);
    const fundingRequestsData = loadData('funding-requests', mockFundingRequests);
    const jobsData = loadData('jobs', mockJobs);
    const jobApplicationsData = loadData('job-applications', mockJobApplications);
    const paymentsData = loadData('payments', mockPayments);
    const reviewsData = loadData('reviews', mockReviews);
    const withdrawalsData = loadData('withdrawals', mockWithdrawals);

    // Set all state at once
    setBusinessProfiles(businessProfilesData);
    setFreelancerProfiles(freelancerProfilesData);
    setFundingRequests(fundingRequestsData);
    setJobs(jobsData);
    setJobApplications(jobApplicationsData);
    setPayments(paymentsData);
    setReviews(reviewsData);
    setWithdrawals(withdrawalsData);

    // Only save to localStorage if we used mock data (first time)
    if (!localStorage.getItem('kasi-konnect-business-profiles')) {
      localStorage.setItem('kasi-konnect-business-profiles', JSON.stringify(businessProfilesData));
      localStorage.setItem('kasi-konnect-freelancer-profiles', JSON.stringify(freelancerProfilesData));
      localStorage.setItem('kasi-konnect-funding-requests', JSON.stringify(fundingRequestsData));
      localStorage.setItem('kasi-konnect-jobs', JSON.stringify(jobsData));
      localStorage.setItem('kasi-konnect-job-applications', JSON.stringify(jobApplicationsData));
      localStorage.setItem('kasi-konnect-payments', JSON.stringify(paymentsData));
      localStorage.setItem('kasi-konnect-reviews', JSON.stringify(reviewsData));
      localStorage.setItem('kasi-konnect-withdrawals', JSON.stringify(withdrawalsData));
    }
  }, []);

  // Debounced save to localStorage - only save after 300ms of no changes
  useEffect(() => {
    const timer = setTimeout(() => {
      localStorage.setItem('kasi-konnect-business-profiles', JSON.stringify(businessProfiles));
    }, 300);
    return () => clearTimeout(timer);
  }, [businessProfiles]);

  useEffect(() => {
    const timer = setTimeout(() => {
      localStorage.setItem('kasi-konnect-freelancer-profiles', JSON.stringify(freelancerProfiles));
    }, 300);
    return () => clearTimeout(timer);
  }, [freelancerProfiles]);

  useEffect(() => {
    const timer = setTimeout(() => {
      localStorage.setItem('kasi-konnect-funding-requests', JSON.stringify(fundingRequests));
    }, 300);
    return () => clearTimeout(timer);
  }, [fundingRequests]);

  useEffect(() => {
    const timer = setTimeout(() => {
      localStorage.setItem('kasi-konnect-jobs', JSON.stringify(jobs));
    }, 300);
    return () => clearTimeout(timer);
  }, [jobs]);

  useEffect(() => {
    const timer = setTimeout(() => {
      localStorage.setItem('kasi-konnect-job-applications', JSON.stringify(jobApplications));
    }, 300);
    return () => clearTimeout(timer);
  }, [jobApplications]);

  useEffect(() => {
    const timer = setTimeout(() => {
      localStorage.setItem('kasi-konnect-payments', JSON.stringify(payments));
    }, 300);
    return () => clearTimeout(timer);
  }, [payments]);

  useEffect(() => {
    const timer = setTimeout(() => {
      localStorage.setItem('kasi-konnect-reviews', JSON.stringify(reviews));
    }, 300);
    return () => clearTimeout(timer);
  }, [reviews]);

  useEffect(() => {
    const timer = setTimeout(() => {
      localStorage.setItem('kasi-konnect-withdrawals', JSON.stringify(withdrawals));
    }, 300);
    return () => clearTimeout(timer);
  }, [withdrawals]);

  // Business Profile functions
  const getBusinessProfile = (userId: string): BusinessProfile | undefined => {
    return businessProfiles.find((p) => p.userId === userId);
  };

  const updateBusinessProfile = (userId: string, updates: Partial<BusinessProfile>): void => {
    setBusinessProfiles((prev) =>
      prev.map((p) => (p.userId === userId ? { ...p, ...updates } : p))
    );
  };

  const createBusinessProfile = (profile: BusinessProfile): void => {
    setBusinessProfiles((prev) => [...prev, profile]);
  };

  // Freelancer Profile functions
  const getFreelancerProfile = (userId: string): FreelancerProfile | undefined => {
    return freelancerProfiles.find((p) => p.userId === userId);
  };

  const updateFreelancerProfile = (userId: string, updates: Partial<FreelancerProfile>): void => {
    setFreelancerProfiles((prev) =>
      prev.map((p) => (p.userId === userId ? { ...p, ...updates } : p))
    );
  };

  const createFreelancerProfile = (profile: FreelancerProfile): void => {
    setFreelancerProfiles((prev) => [...prev, profile]);
  };

  // Funding Request functions
  const createFundingRequest = (request: Omit<FundingRequest, 'id' | 'createdAt' | 'updatedAt'>): void => {
    const newRequest: FundingRequest = {
      ...request,
      id: generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setFundingRequests((prev) => [...prev, newRequest]);
  };

  const updateFundingRequest = (id: string, updates: Partial<FundingRequest>): void => {
    setFundingRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...updates, updatedAt: new Date().toISOString() } : r))
    );
  };

  // Job functions
  const createJob = (job: Omit<Job, 'id' | 'createdAt'>): void => {
    const newJob: Job = {
      ...job,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    setJobs((prev) => [...prev, newJob]);
  };

  const updateJob = (id: string, updates: Partial<Job>): void => {
    setJobs((prev) => prev.map((j) => (j.id === id ? { ...j, ...updates } : j)));
  };

  // Job Application functions
  const createJobApplication = (application: Omit<JobApplication, 'id' | 'createdAt'>): void => {
    const newApplication: JobApplication = {
      ...application,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    setJobApplications((prev) => [...prev, newApplication]);
  };

  const updateJobApplication = (id: string, updates: Partial<JobApplication>): void => {
    setJobApplications((prev) => prev.map((a) => (a.id === id ? { ...a, ...updates } : a)));
  };

  // Payment functions
  const createPayment = (payment: Omit<Payment, 'id' | 'transactionId' | 'createdAt'>): void => {
    const newPayment: Payment = {
      ...payment,
      id: generateId(),
      transactionId: generateTransactionId(),
      createdAt: new Date().toISOString(),
    };
    setPayments((prev) => [...prev, newPayment]);
  };

  // Review functions
  const createReview = (review: Omit<Review, 'id' | 'createdAt'>): void => {
    const newReview: Review = {
      ...review,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    setReviews((prev) => [...prev, newReview]);
  };

  // Withdrawal functions
  const createWithdrawal = (withdrawal: Omit<Withdrawal, 'id' | 'transactionId' | 'createdAt'>): void => {
    const newWithdrawal: Withdrawal = {
      ...withdrawal,
      id: generateId(),
      transactionId: generateTransactionId(),
      createdAt: new Date().toISOString(),
    };
    setWithdrawals((prev) => [...prev, newWithdrawal]);
  };

  // Document upload functions
  const uploadBusinessDocument = (userId: string, document: Omit<BusinessDocument, 'id' | 'uploadedAt' | 'verified'>): void => {
    const newDocument: BusinessDocument = {
      ...document,
      id: generateId(),
      uploadedAt: new Date().toISOString(),
      verified: false,
    };
    setBusinessProfiles((prev) =>
      prev.map((profile) =>
        profile.userId === userId
          ? { ...profile, documents: [...(profile.documents || []), newDocument] }
          : profile
      )
    );
  };

  const deleteBusinessDocument = (userId: string, documentId: string): void => {
    setBusinessProfiles((prev) =>
      prev.map((profile) =>
        profile.userId === userId
          ? { ...profile, documents: (profile.documents || []).filter((doc) => doc.id !== documentId) }
          : profile
      )
    );
  };

  const uploadFreelancerDocument = (userId: string, document: Omit<BusinessDocument, 'id' | 'uploadedAt' | 'verified'>): void => {
    const newDocument: BusinessDocument = {
      ...document,
      id: generateId(),
      uploadedAt: new Date().toISOString(),
      verified: false,
    };
    setFreelancerProfiles((prev) =>
      prev.map((profile) =>
        profile.userId === userId
          ? { ...profile, documents: [...(profile.documents || []), newDocument] }
          : profile
      )
    );
  };

  const deleteFreelancerDocument = (userId: string, documentId: string): void => {
    setFreelancerProfiles((prev) =>
      prev.map((profile) =>
        profile.userId === userId
          ? { ...profile, documents: (profile.documents || []).filter((doc) => doc.id !== documentId) }
          : profile
      )
    );
  };

  return (
    <DataContext.Provider
      value={{
        businessProfiles,
        getBusinessProfile,
        updateBusinessProfile,
        createBusinessProfile,
        uploadBusinessDocument,
        deleteBusinessDocument,
        freelancerProfiles,
        getFreelancerProfile,
        updateFreelancerProfile,
        createFreelancerProfile,
        uploadFreelancerDocument,
        deleteFreelancerDocument,
        fundingRequests,
        createFundingRequest,
        updateFundingRequest,
        jobs,
        createJob,
        updateJob,
        jobApplications,
        createJobApplication,
        updateJobApplication,
        payments,
        createPayment,
        reviews,
        createReview,
        withdrawals,
        createWithdrawal,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData(): DataContextType {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
