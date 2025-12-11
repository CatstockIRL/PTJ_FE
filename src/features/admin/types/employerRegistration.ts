export type AdminEmployerRegStatus = 'Pending' | 'Approved' | 'Rejected';

export interface AdminEmployerRegListItem {
  requestId: number;
  email: string;
  username: string;
  companyName: string;
  contactPhone: string;
  status: AdminEmployerRegStatus;
  createdAt: string;
}

export interface AdminEmployerRegDetail extends AdminEmployerRegListItem {
  companyDescription?: string | null;
  contactPerson?: string | null;
  contactEmail?: string | null;
  website?: string | null;
  address?: string | null;
  adminNote?: string | null;
  reviewedAt?: string | null;
}

export interface GoogleEmployerRegList {
  id: number;
  displayName: string;
  email: string;
  pictureUrl?: string | null;
  status: string;
  createdAt: string;
}

export interface GoogleEmployerRegDetail extends GoogleEmployerRegList {
  reviewedAt?: string | null;
  adminNote?: string | null;
}
