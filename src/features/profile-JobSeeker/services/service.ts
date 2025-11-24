import baseService from '../../../services/baseService';
import type { JobSeekerProfileDto, JobSeekerProfileUpdateDto } from '../types';

const API_URL_ME = '/JobSeekerProfile/me';
const API_URL_UPDATE = '/JobSeekerProfile/update';

export const getJobSeekerProfile = async (): Promise<JobSeekerProfileDto> => {
  try {
    const response = await baseService.get<JobSeekerProfileDto>(API_URL_ME);
    return response;
  } catch (error) {
    console.error('Lỗi khi tải hồ sơ Job Seeker:', error);
    throw error;
  }
};


export const updateJobSeekerProfile = async (profileData: JobSeekerProfileUpdateDto): Promise<string> => {
  try {
    const formData = new FormData();

    formData.append('FullName', profileData.fullName || '');
    formData.append('Gender', profileData.gender || '');
    formData.append('BirthYear', profileData.birthYear?.toString() || '');
    formData.append('ContactPhone', profileData.contactPhone || '');
    formData.append('ProvinceId', profileData.provinceId?.toString() || '0');
    formData.append('DistrictId', profileData.districtId?.toString() || '0');
    formData.append('WardId', profileData.wardId?.toString() || '0');
    formData.append('FullLocation', profileData.fullLocation || '');
    
    if (profileData.imageFile) {
      formData.append('ImageFile', profileData.imageFile);
    }

    const response = await baseService.put<string>(API_URL_UPDATE, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response;
  } catch (error) {
    console.error('Lỗi khi cập nhật hồ sơ Job Seeker:', error);
    throw error;
  }
};
