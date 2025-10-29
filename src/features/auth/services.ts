import baseService from '../../services/baseService';
import type { LoginResponse } from './types';

/**
 * Gọi API đăng nhập cho người tìm việc.
 * @param credentials - Thông tin email và password từ form.
 * @returns Promise chứa thông tin đăng nhập thành công.
 */
export const loginJobSeeker = (credentials: any): Promise<LoginResponse> => {
  const requestBody = {
    usernameOrEmail: credentials.email, 
    password: credentials.password,
    deviceInfo: 'WebApp' 
  };
  return baseService.post('/Auth/login', requestBody);
};
