import baseService from "../../services/baseService";
import type { JobPostView } from "../job/jobTypes";

type ProvinceMatchApiRaw =
  | JobPostView[]
  | {
      employers?: JobPostView[];
      jobSeekers?: unknown;
    };

export interface SalarySearchDto {
  minSalary?: number | null;
  maxSalary?: number | null;
  negotiable?: boolean;
  includeNegotiable?: boolean;
}

const normalizeEmployerPosts = (payload: ProvinceMatchApiRaw): JobPostView[] => {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (payload && Array.isArray(payload.employers)) {
    return payload.employers;
  }

  return [];
};

const searchJobsByProvince = async (provinceId: number): Promise<JobPostView[]> => {
  const response = await baseService.get<ProvinceMatchApiRaw>("/Match/search-by-province", {
    params: { provinceId },
  });

  return normalizeEmployerPosts(response);
};

const searchJobsBySalary = async (dto: SalarySearchDto): Promise<JobPostView[]> => {
  const response = await baseService.post<JobPostView[] | { employers: JobPostView[] }>(
    "/Match/search-by-salary",
    dto
  );
  return normalizeEmployerPosts(response);
};

const matchService = {
  searchJobsByProvince,
  searchJobsBySalary,
};

export default matchService;
