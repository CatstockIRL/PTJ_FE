import baseService from "../../services/baseService";
import type {
  CreatePostReportPayload,
  ReportPostResponse,
} from "./types";

const reportService = {
  async reportPost(payload: CreatePostReportPayload) {
    return await baseService.post<ReportPostResponse>(
      "/reports/post",
      payload
    );
  },
};

export default reportService;
