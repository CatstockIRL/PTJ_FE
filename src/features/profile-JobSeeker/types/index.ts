// DTO từ backend
export interface JobSeekerProfileDto {
    profileId: number;
    userId: number;
    fullName: string | null;
    gender: string | null;
    birthYear: number | null;
    profilePicture: string | null;
    contactPhone: string | null;
    location: string;
    provinceId?: number;
    districtId?: number;
    wardId?: number;
}

export interface JobSeekerProfileUpdateDto {
    fullName?: string | null;
    gender?: string | null;
    birthYear?: number | null;
    contactPhone?: string | null;
    provinceId?: number;
    districtId?: number;
    wardId?: number;
    fullLocation?: string | null;
    imageFile?: File | null;
}

