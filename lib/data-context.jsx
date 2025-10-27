import React, { createContext, useContext, useState, useEffect } from 'react';
import { mockBusinessProfiles, mockFreelancerProfiles, mockFundingRequests, mockJobs, mockJobApplications, mockPayments, mockReviews } from './mock-data';
import { generateId, generateTransactionId } from './currency';

const DataContext = createContext(undefined);

export function DataProvider({ children }) {
  const [businessProfiles, setBusinessProfiles] = useState([]);
  const [freelancerProfiles, setFreelancerProfiles] = useState([]);
  const [fundingRequests, setFundingRequests] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [jobApplications, setJobApplications] = useState([]);
  const [payments, setPayments] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);

  // Initialize data from localStorage or mock data
  useEffect(() => {
    // Batch all localStorage operations together
    const loadData = (key, mockData) => {
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
    const withdrawalsData = loadData('withdrawals', []);

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
  const getBusinessProfile = (userId) => {
    return businessProfiles.find((p) => p.userId === userId);
  };

  const updateBusinessProfile = (userId, updates) => {
    setBusinessProfiles((prev) =>
      prev.map((p) => (p.userId === userId ? { ...p, ...updates } : p))
    );
  };

  const createBusinessProfile = (profile) => {
    setBusinessProfiles((prev) => [...prev, profile]);
  };

  // Freelancer Profile functions
  const getFreelancerProfile = (userId) => {
    return freelancerProfiles.find((p) => p.userId === userId);
  };

  const updateFreelancerProfile = (userId, updates) => {
    setFreelancerProfiles((prev) =>
      prev.map((p) => (p.userId === userId ? { ...p, ...updates } : p))
    );
  };

  const createFreelancerProfile = (profile) => {
    setFreelancerProfiles((prev) => [...prev, profile]);
  };

  // Funding Request functions
  const createFundingRequest = (request) => {
    const newRequest = {
      ...request,
      id: generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setFundingRequests((prev) => [...prev, newRequest]);
  };

  const updateFundingRequest = (id, updates) => {
    setFundingRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...updates, updatedAt: new Date().toISOString() } : r))
    );
  };

  // Job functions
  const createJob = (job) => {
    const newJob = {
      ...job,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    setJobs((prev) => [...prev, newJob]);
  };

  const updateJob = (id, updates) => {
    setJobs((prev) => prev.map((j) => (j.id === id ? { ...j, ...updates } : j)));
  };

  // Job Application functions
  const createJobApplication = (application) => {
    const newApplication = {
      ...application,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    setJobApplications((prev) => [...prev, newApplication]);
  };

  const updateJobApplication = (id, updates) => {
    setJobApplications((prev) => prev.map((a) => (a.id === id ? { ...a, ...updates } : a)));
  };

  // Payment functions
  const createPayment = (payment) => {
    const newPayment = {
      ...payment,
      id: generateId(),
      transactionId: generateTransactionId(),
      createdAt: new Date().toISOString(),
    };
    setPayments((prev) => [...prev, newPayment]);
  };

  // Review functions
  const createReview = (review) => {
    const newReview = {
      ...review,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    setReviews((prev) => [...prev, newReview]);
  };

  // Withdrawal functions
  const createWithdrawal = (withdrawal) => {
    const newWithdrawal = {
      ...withdrawal,
      id: generateId(),
      transactionId: generateTransactionId(),
      createdAt: new Date().toISOString(),
    };
    setWithdrawals((prev) => [...prev, newWithdrawal]);
  };

  // Freelancer Document functions
  const uploadFreelancerDocument = (userId, document) => {
    setFreelancerProfiles((prev) =>
      prev.map((p) =>
        p.userId === userId
          ? {
              ...p,
              documents: [
                ...p.documents,
                {
                  ...document,
                  id: generateId(),
                  uploadedAt: new Date().toISOString(),
                  verified: false,
                },
              ],
            }
          : p
      )
    );
  };

  const deleteFreelancerDocument = (userId, documentId) => {
    setFreelancerProfiles((prev) =>
      prev.map((p) =>
        p.userId === userId
          ? {
              ...p,
              documents: p.documents.filter((d) => d.id !== documentId),
            }
          : p
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

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
