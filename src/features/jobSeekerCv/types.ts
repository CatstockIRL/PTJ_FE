export interface JobSeekerCv {
  cvid: number;
  jobSeekerId: number;
  cvTitle: string;
  skillSummary: string | null;
  skills: string | null;
  preferredJobType: string | null;
  preferredLocationName: string | null;
  contactPhone: string | null;
  provinceId?: number | null;
  districtId?: number | null;
  wardId?: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface JobSeekerCvPayload {
  cvTitle: string;
  skillSummary?: string | null;
  skills?: string | null;
  preferredJobType?: string | null;
  provinceId: number;
  districtId: number;
  wardId: number;
  contactPhone?: string | null;
}
