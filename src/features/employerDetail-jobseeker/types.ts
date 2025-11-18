import { Job } from "../../types";

export interface EmployerPublicProfile {
    displayName: string;
    description: string;
    avatarUrl: string;
    website: string;
    contactPhone: string;
    contactEmail: string;
    location: string;
    role: string;
}

export interface EmployerDetailState {
    profile: EmployerPublicProfile | null;
    jobs: Job[];
    loading: boolean;
    error: string | null;
}
