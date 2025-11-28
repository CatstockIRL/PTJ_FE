import baseService from "../../services/baseService";

export interface EmployerFollowDto {
  employerId: number;
  employerName: string;
  followDate: string;
  avatarUrl?: string;
  logo?: string;
}

const followService = {
  async follow(employerId: number, jobSeekerId: number) {
    return baseService.post(`/Follow/${employerId}`, null, {
      params: { jobSeekerId },
    });
  },

  async unfollow(employerId: number, jobSeekerId: number) {
    return baseService.del(`/Follow/${employerId}`, {
      params: { jobSeekerId },
    });
  },

  async checkFollow(employerId: number, jobSeekerId: number) {
    const res = await baseService.get<{ isFollowing: boolean }>(
      `/Follow/check/${employerId}`,
      { params: { jobSeekerId } }
    );
    return res.isFollowing;
  },

  async getFollowedEmployers(jobSeekerId: number) {
    return baseService.get<EmployerFollowDto[]>(`/Follow/list`, {
      params: { jobSeekerId },
    });
  },
};

export default followService;
