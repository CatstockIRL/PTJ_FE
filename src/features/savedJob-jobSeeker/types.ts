import type { Job } from "../../types";

// Kiểu dữ liệu cho một công việc đã lưu
// Kế thừa từ kiểu Job và thêm thông tin về ngày lưu
export interface SavedJob extends Job {
  savedAt: string; // Ngày công việc được lưu
}

export interface BackendSavedJob {
  employerPostId: number;
  title: string;
  location: string;
  employerName: string;
  addedAt: string;
}

export interface GetSavedJobsResponse {
  success: boolean;
  total: number;
  data: BackendSavedJob[];
}
