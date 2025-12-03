export type PostReportType = "EmployerPost" | "JobSeekerPost";

export interface CreatePostReportPayload {
  postId: number;
  affectedPostType?: PostReportType;
  reportType: string;
  reason: string;
}

export interface ReportPostResponse {
  message: string;
  reportId: number;
}

export interface SystemReportCreatePayload {
  title: string;
  description: string;
}

export interface SystemReportResponse {
  message: string;
}
