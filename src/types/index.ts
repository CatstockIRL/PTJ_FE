export interface Job {
  id: string;
  title: string;
  description: string;
  company: string;
  location: string;
  salary: string;
  updatedAt: string;
  companyLogo: string;
  isHot: boolean;
}

export interface JobCategory {
  id: string;
  name: string;
  count: number;
  icon: string;
}

export interface Employer {
  id: string;
  name: string;
  jobsCount: number;
  location: string;
  logo: string;
  backgroundImage: string; // Thêm trường ảnh background
  jobDescription: string; // Thêm trường mô tả công việc đang tuyển
}

export interface DataHomepage {
  featuredJobs: Job[];
  jobCategories: JobCategory[];
  topEmployers: Employer[]; // Thêm trường topEmployers
}