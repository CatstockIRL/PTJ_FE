import baseService from '../../../services/baseService';
import {
  type AdminEmployerRegDetail,
  type AdminEmployerRegListItem,
  type AdminEmployerRegStatus,
} from '../types/employerRegistration';
import { adaptPagedResult, type PagedResult, type RawPagedResponse } from './pagedResultHelper';

type RegFilters = {
  status?: AdminEmployerRegStatus | 'All';
  keyword?: string;
  page?: number;
  pageSize?: number;
};

const buildQuery = (filters: RegFilters = {}) => {
  const params = new URLSearchParams();
  if (filters.status && filters.status !== 'All') {
    params.append('status', filters.status);
  }
  if (filters.keyword) {
    params.append('keyword', filters.keyword.trim());
  }
  params.append('page', String(filters.page ?? 1));
  params.append('pageSize', String(filters.pageSize ?? 10));
  const query = params.toString();
  return query ? `?${query}` : '';
};

const adminEmployerRegistrationService = {
  async getRequests(filters: RegFilters = {}): Promise<PagedResult<AdminEmployerRegListItem>> {
    const response = await baseService.get<RawPagedResponse<AdminEmployerRegListItem>>(
      `/admin/employer-registrations${buildQuery(filters)}`
    );
    return adaptPagedResult<AdminEmployerRegListItem>(response);
  },

  async getDetail(id: number): Promise<AdminEmployerRegDetail> {
    return await baseService.get<AdminEmployerRegDetail>(`/admin/employer-registrations/${id}`);
  },

  async approve(id: number): Promise<void> {
    await baseService.post(`/admin/employer-registrations/${id}/approve`);
  },

  async reject(id: number, reason: string): Promise<void> {
    await baseService.post(`/admin/employer-registrations/${id}/reject`, { reason });
  },
};

export default adminEmployerRegistrationService;
