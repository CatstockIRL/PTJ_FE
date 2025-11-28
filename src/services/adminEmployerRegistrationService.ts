import axios from 'axios';
import type {
  EmployerRegistrationRequest,
  EmployerRegistrationDetail,
  PagedResult,
  EmployerRegistrationFilters,
  RejectEmployerRegistrationDto
} from '../types/adminEmployerRegistration';

const API_BASE_URL = 'https://localhost:7100';
const BASE_URL = `${API_BASE_URL}/api/admin/employer-registrations`;

// Hàm helper để lấy token
const getAccessToken = (): string | null => {
  return sessionStorage.getItem('accessToken');
};

// Tạo axios instance với auth header
const createAuthHeaders = () => {
  const token = getAccessToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

/**
 * Service để quản lý phê duyệt hồ sơ đăng ký nhà tuyển dụng
 */
const adminEmployerRegistrationService = {
  /**
   * Lấy danh sách hồ sơ đăng ký employer
   */
  async getRequests(
    filters: EmployerRegistrationFilters = {}
  ): Promise<PagedResult<EmployerRegistrationRequest>> {
    const params = new URLSearchParams();
    
    if (filters.status && filters.status !== 'all') params.append('status', filters.status);
    if (filters.keyword) params.append('keyword', filters.keyword);
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.pageSize) params.append('pageSize', filters.pageSize.toString());

    const response = await axios.get<PagedResult<EmployerRegistrationRequest>>(
      `${BASE_URL}?${params.toString()}`,
      {
        headers: createAuthHeaders(),
        withCredentials: true
      }
    );
    return response.data;
  },

  /**
   * Lấy chi tiết một hồ sơ đăng ký
   */
  async getDetail(requestId: number): Promise<EmployerRegistrationDetail> {
    const response = await axios.get<EmployerRegistrationDetail>(
      `${BASE_URL}/${requestId}`,
      {
        headers: createAuthHeaders(),
        withCredentials: true
      }
    );
    return response.data;
  },

  /**
   * Phê duyệt hồ sơ đăng ký
   */
  async approve(requestId: number): Promise<{ message: string }> {
    const response = await axios.post<{ message: string }>(
      `${BASE_URL}/${requestId}/approve`,
      {},
      {
        headers: createAuthHeaders(),
        withCredentials: true
      }
    );
    return response.data;
  },

  /**
   * Từ chối hồ sơ đăng ký
   */
  async reject(
    requestId: number,
    data: RejectEmployerRegistrationDto
  ): Promise<{ message: string }> {
    const response = await axios.post<{ message: string }>(
      `${BASE_URL}/${requestId}/reject`,
      data,
      {
        headers: createAuthHeaders(),
        withCredentials: true
      }
    );
    return response.data;
  }
};

export default adminEmployerRegistrationService;
