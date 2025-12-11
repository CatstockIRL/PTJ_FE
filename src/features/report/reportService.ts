import baseService from "../../services/baseService";
import type {
  CreatePostReportPayload,
  ReportPostResponse,
  SystemReportCreatePayload,
  SystemReportResponse,
} from "./types";

const reportService = {
  async reportPost(payload: CreatePostReportPayload) {
    return await baseService.post<ReportPostResponse>("/reports/post", payload);
  },
  async createSystemReport(payload: SystemReportCreatePayload) {
    return await baseService.post<SystemReportResponse>(
      "/system-reports",
      payload
    );
  },
};

export default reportService;
