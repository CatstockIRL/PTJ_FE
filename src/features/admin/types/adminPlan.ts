export type AdminPlan = {
  planId: number;
  planName: string;
  price: number;
  maxPosts?: number;
  durationDays?: number | null;
  createdAt?: string;
  updatedAt?: string;
};

export type AdminPlanPayload = {
  planName: string;
  price: number;
  maxPosts?: number;
  durationDays?: number | null;
};

export type AdminSubscriptionHistory = {
  subscriptionId: number;
  userId?: number;
  userName?: string;
  userEmail?: string;
  planId?: number;
  planName?: string;
  price?: number;
  remainingPosts?: number;
  status?: string;
  startDate?: string;
  endDate?: string;
};

export type AdminTransactionHistory = {
  transactionId: number;
  userId?: number;
  userName?: string;
  userEmail?: string;
  planId?: number;
  planName?: string;
  amount?: number;
  status?: string;
  payOsorderCode?: string;
  createdAt?: string;
  paidAt?: string;
  qrCodeUrl?: string;
  qrExpiredAt?: string;
};
