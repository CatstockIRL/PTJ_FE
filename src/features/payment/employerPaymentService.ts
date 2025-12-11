import baseService from "../../services/baseService";

export interface CreatePaymentLinkPayload {
  planId: number;
}

export interface CreatePaymentLinkResponse {
  success?: boolean;
  message?: string;
  checkoutUrl?: string;
  orderCode?: string | null;
  qrCodeUrl?: string | null;
  expiredAt?: string | null;
  transactionId?: number | null;
}

const createPaymentLink = async (planId: number): Promise<CreatePaymentLinkResponse> => {
  return await baseService.post<CreatePaymentLinkResponse>("/payment/create-link", { planId });
};

export const employerPaymentService = {
  createPaymentLink,
};

export default employerPaymentService;
