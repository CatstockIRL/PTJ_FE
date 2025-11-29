// Định nghĩa kiểu dữ liệu cho request body khi nộp đơn
import type { SalaryTypeCode } from "../../utils/salary";

export interface ApplyJobPayload {
  jobSeekerId: number;
  employerPostId: number;
  cvid: number;
  note?: string;
}

// Định nghĩa kiểu dữ liệu cho response từ API lấy danh sách công việc đã ứng tuyển
export interface JobApplicationResultDto {
    candidateListId: number;
    jobSeekerId: number;
    jobSeekerPostId?: number;
    cvId?: number | null;
    selectedCvId?: number | null;
    cvid?: number | null;
    username: string;
    status: string;
    applicationDate: string;
    notes: string;
    employerPostId: number;
    postTitle: string;
    categoryName: string;
    employerName: string;
    location: string;
    salaryMin?: number | null;
    salaryMax?: number | null;
    salaryType?: SalaryTypeCode | null;
    salaryDisplay?: string | null;
    workHours: string;
    phoneContact: string;
    employerId: number;
    companyLogo?: string | null;
  }

// Định nghĩa kiểu dữ liệu cho response của API
export interface AppliedJobsResponse {
  success: boolean;
  total: number;
  data: JobApplicationResultDto[];
}

export interface ApplicationSimpleDto {
  submissionId: number;
  jobSeekerId: number;
  username: string;
  postId: number;
  postTitle: string;
  status: string;
  appliedAt: string;
}

export interface ApplicationSummaryDto {
  pendingTotal: number;
  reviewedTotal: number;
  pendingApplications: ApplicationSimpleDto[];
  reviewedApplications: ApplicationSimpleDto[];
}

export interface ApplicationSummaryResponse {
  success: boolean;
  data: ApplicationSummaryDto;
}
