import baseService from '../../../services/baseService';

export interface AdminDashboardOverview {
  totalAccounts: number;
  totalPosts: number;
  pendingReports: number;
}

export interface ManagementSummaryResponse {
  total: number;
  pending?: number;
  active?: number;
  inactive?: number;
}

const adminDashboardService = {
  async getOverview(): Promise<AdminDashboardOverview> {
    const response = await baseService
      .get<Partial<Record<string, number>>>('/admin/statistics')
      .catch(() => undefined);

    return {
      totalAccounts: Number(
        response?.totalAccounts ?? response?.totalUsers ?? response?.users ?? 0
      ),
      totalPosts: Number(
        response?.totalPosts ?? response?.totalJobPosts ?? response?.posts ?? 0
      ),
      pendingReports: Number(
        response?.pendingReports ?? response?.pendingReportCount ?? response?.reports ?? 0
      ),
    };
  },

  async getManagementSummary(endpoint: string): Promise<ManagementSummaryResponse> {
    return await baseService.get<ManagementSummaryResponse>(endpoint);
  }
};

export default adminDashboardService;
