export type UserRole = 'business' | 'freelancer' | 'municipal' | 'client';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  verified: boolean;
  createdAt: string;
  avatar?: string;
}

export interface BusinessDocument {
  id: string;
  name: string;
  type: string;
  url: string;
  uploadedAt: string;
  verified: boolean;
}

export interface BusinessProfile {
  userId: string;
  companyName: string;
  industry: string;
  description: string;
  location: string;
  contactEmail: string;
  contactPhone: string;
  logo?: string;
  documents: BusinessDocument[];
  registrationNumber?: string;
  taxNumber?: string;
  businessLicense?: string;
}

export interface FreelancerProfile {
  userId: string;
  bio: string;
  skills: string[];
  hourlyRate: number;
  category: string;
  portfolio: string;
  rating: number;
  reviewCount: number;
  documents: BusinessDocument[];
  idNumber?: string;
  qualifications?: string[];
  certifications?: string[];
}

export interface FundingRequest {
  id: string;
  businessId: string;
  businessName: string;
  amount: number;
  purpose: string;
  description: string;
  status: 'pending' | 'approved' | 'rejected' | 'funded';
  createdAt: string;
  updatedAt: string;
  industry: string;
}

export interface Job {
  id: string;
  businessId: string;
  businessName: string;
  title: string;
  description: string;
  budget: number;
  requiredSkills: string[];
  duration: string;
  deadline: string;
  location: string;
  status: 'open' | 'closed' | 'in-progress' | 'completed';
  createdAt: string;
}

export interface JobApplication {
  id: string;
  jobId: string;
  freelancerId: string;
  freelancerName: string;
  coverLetter: string;
  proposedRate: number;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
}

export interface Payment {
  id: string;
  fromUserId: string;
  toUserId: string;
  amount: number;
  type: 'job-payment' | 'funding' | 'withdrawal';
  status: 'pending' | 'completed' | 'failed';
  transactionId: string;
  createdAt: string;
  description: string;
}

export interface Review {
  id: string;
  freelancerId: string;
  businessId: string;
  businessName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface Withdrawal {
  id: string;
  freelancerId: string;
  amount: number;
  momoNumber: string;
  status: 'pending' | 'completed' | 'failed';
  transactionId: string;
  createdAt: string;
}

export interface ClientProfile {
  userId: string;
  fullName: string;
  location: string;
  phone: string;
  preferences: string[];
  budgetRange: string;
}

export interface ServiceOrder {
  id: string;
  clientId: string;
  freelancerId: string;
  freelancerName: string;
  serviceType: string;
  description: string;
  budget: number;
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  createdAt: string;
  deadline: string;
  requirements: string[];
}


