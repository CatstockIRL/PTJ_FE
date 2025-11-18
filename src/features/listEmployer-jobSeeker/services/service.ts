import baseService from '../../../services/baseService';
import type { Employer, EmployerFilter, EmployerJobResponse, PaginatedApiResponse, UserApiResponse } from '../types';

const USER_API_URL = 'https://localhost:7100/api/admin/users';
const JOB_API_URL = 'https://localhost:7100/api/EmployerPost/by-user';

const getPlaceholderLogo = (username: string) => {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&background=random&color=fff`;
}

const extractProvince = (fullAddress: string): string => {
    if (!fullAddress) return '';
    const parts = fullAddress.split(',');
    const lastPart = parts[parts.length - 1].trim();
    return lastPart.replace(/^(Tỉnh|Thành phố|TP\.?)\s+/i, '');
}

const getJobDetailsByUserId = async (userId: number): Promise<{ count: number, locations: string[] }> => {
    try {
        const response = await baseService.get<EmployerJobResponse>(`${JOB_API_URL}/${userId}`);
        
        if (!response.data || response.data.length === 0) {
            return { count: 0, locations: [] };
        }

        const uniqueLocations = new Set<string>();
        
        response.data.forEach(job => {
            const province = extractProvince(job.location);
            if (province) {
                uniqueLocations.add(province);
            }
        });

        return { 
            count: response.total || 0, 
            locations: Array.from(uniqueLocations)
        };

    } catch (error) {
        console.warn(`Không tải được job của user ${userId}`, error);
        return { count: 0, locations: [] };
    }
}

export const getEmployers = async (filters: EmployerFilter): Promise<{ employers: Employer[], totalRecords: number }> => {
  try {
    const params = {
        role: 'employer',
        isActive: true,
        isVerified: true,
        keyword: filters.keyword || '',
        page: filters.page || 1,
        pageSize: filters.pageSize || 10
    };

    const response = await baseService.get<PaginatedApiResponse<UserApiResponse>>(USER_API_URL, { params });
    
    const employerPromises = response.data.map(async (user) => {
        const jobDetails = await getJobDetailsByUserId(user.userId);

        return {
            id: user.userId,
            name: user.username,
            logo: user.avatarUrl || getPlaceholderLogo(user.username),
            jobCount: jobDetails.count,     
            locations: jobDetails.locations
        };
    });

    const employers = await Promise.all(employerPromises);

    return {
        employers,
        totalRecords: response.totalRecords
    };

  } catch (error) {
    console.error('Lỗi khi tải danh sách nhà tuyển dụng:', error);
    return { employers: [], totalRecords: 0 };
  }
};

