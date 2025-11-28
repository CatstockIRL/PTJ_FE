// Types cho Employer Registration Approval Feature

export interface EmployerRegistrationRequest {
  requestId: number;
  email: string;
  username: string;
  companyName: string;
  contactPhone: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  createdAt: string;
}

export interface EmployerRegistrationDetail {
  requestId: number;
  email: string;
  username: string;
  companyName: string;
  companyDescription?: string;
  contactPerson?: string;
  contactPhone: string;
  contactEmail?: string;
  website?: string;
  address?: string;
  status: string;
  adminNote?: string;
  createdAt: string;
  reviewedAt?: string;
}

export interface PagedResult<T> {
  data: T[];
  totalRecords: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface EmployerRegistrationFilters {
  status?: string;
  keyword?: string;
  page?: number;
  pageSize?: number;
}

export interface RejectEmployerRegistrationDto {
  reason: string;
}
