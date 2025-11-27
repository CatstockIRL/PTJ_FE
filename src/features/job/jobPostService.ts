// fileName: jobPostService.ts
import baseService from '../../services/baseService';
import type {
  ApplicationActionResponse,
  DeleteJobResponse,
  EmployerPostDto,
  JobApplicationUpdateDto,
  JobPostResponse,
  PaginatedJobResponse,
  UpdateJobResponse,
  JobSuggestionResponse,
} from './jobTypes';

const buildFormData = (data: EmployerPostDto): FormData => {
  const formData = new FormData();
  
  Object.entries(data).forEach(([key, value]) => {
    if (value === null || value === undefined) return;

    if (key === 'images' && Array.isArray(value)) {
      // Xử lý mảng File
      value.forEach((file: File) => {
        formData.append('Images', file);
      });
    } else if (key === 'deleteImageIds' && Array.isArray(value)) {
      // Xử lý mảng ID cần xóa
      value.forEach((id: number) => {
        formData.append('DeleteImageIds', id.toString());
      });
    } else {
      // Các trường thông thường
      formData.append(key, value.toString());
    }
  });

  return formData;
};

export const createJobPost = async (data: EmployerPostDto): Promise<JobPostResponse> => {
  const formData = buildFormData(data);
  return await baseService.post<JobPostResponse>('/EmployerPost/create', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const getJobsByUser = async (userID: number): Promise<PaginatedJobResponse> => {
  return await baseService.get<PaginatedJobResponse>(`/EmployerPost/by-user/${userID}`);
};

export const getJobById = async (id: number): Promise<JobPostResponse> => {
  return await baseService.get<JobPostResponse>(`/EmployerPost/${id}`);
};

// --- CẬP NHẬT QUAN TRỌNG: Dùng FormData cho Update ---
export const updateJobPost = async (id: number, data: EmployerPostDto): Promise<UpdateJobResponse> => {
  const formData = buildFormData(data);
  // Lưu ý: baseService.put thường gửi JSON. Nếu baseService của bạn hỗ trợ tham số thứ 3 là config (giống axios), hãy thêm header.
  // Nếu baseService tự động detect FormData thì tốt, nếu không bạn cần check lại baseService.
  // Giả sử baseService wrap axios:
  return await baseService.put<UpdateJobResponse>(`/EmployerPost/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const deleteJobPost = async (id: number): Promise<DeleteJobResponse> => {
  return await baseService.del<DeleteJobResponse>(`/EmployerPost/${id}`);
};

export const getAllJobs = async (): Promise<PaginatedJobResponse> => {
  return await baseService.get<PaginatedJobResponse>('/EmployerPost/all');
};

export const updateStatus = async (id: number, status: 'Accepted' | 'Rejected', note: string = ''): Promise<ApplicationActionResponse> => {
  const payload: JobApplicationUpdateDto = { status, note };
  return await baseService.put<ApplicationActionResponse>(`/JobApplication/${id}/status`, payload);
};

export const getJobSuggestions = async (postId: number): Promise<JobSuggestionResponse> => {
  return await baseService.get<JobSuggestionResponse>(`/EmployerPost/${postId}/suggestions`);
};

export const getSuggestions = async (postId: number): Promise<JobSuggestionResponse> => {
  return getJobSuggestions(postId);
};

export const jobPostService = {
  createJobPost,
  getJobsByUser,
  updateJobPost,
  deleteJobPost,
  getJobById,
  getAllJobs,
  updateStatus,
  getJobSuggestions,
  getSuggestions,
};

export default jobPostService;