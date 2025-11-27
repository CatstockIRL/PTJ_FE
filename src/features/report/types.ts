export type PostReportType = "EmployerPost" | "JobSeekerPost";

export interface CreatePostReportPayload {
  postId: number;
  postType: PostReportType;
  reason: string;
}

export interface ReportPostResponse {
  message: string;
  reportId: number;
}
