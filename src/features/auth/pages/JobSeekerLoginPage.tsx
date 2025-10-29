import React from 'react';
import { useLocation } from 'react-router-dom';
import loginImage from '../../../assets/ImageFormLoginJobSeeker.jpg';
import LoginForm from '../components/LoginForm';
import RegisterForm from '../components/RegisterForm';

// --- Component Trang Xác thực chính ---
const JobSeekerAuthPage: React.FC = () => {
  const location = useLocation();
  // Kiểm tra URL để quyết định trạng thái "lật" của form.
  // Ví dụ: /login -> isRegisterView = false, /register -> isRegisterView = true
  const isRegisterView = location.pathname.includes('register');

  return (
    <div className="min-h-screen flex font-sans bg-gray-50">
      {/* Phần bên trái với ảnh và tiêu đề */}
      <div className="w-1/2 bg-white hidden lg:flex flex-col justify-center items-center p-20 relative">
        <img src={loginImage} alt="Decorative" className="w-full object-cover mb-8 rounded-lg" />
        <div>
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Xây dựng <span className="text-blue-600">Sự nghiệp</span>
          </h1>
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            <span className="text-blue-600">thành công</span> cùng
          </h1>
          <h1 className="text-4xl font-bold text-gray-800">
            Job Finder
          </h1>
        </div>
      </div>

      {/* Phần bên phải chứa form lật */}
      <div className="w-full lg:w-1/2 bg-blue-600 flex flex-col justify-center items-center p-8">
        <div className="w-full max-w-md" style={{ perspective: '1000px' }}>
          <div
            style={{
              position: 'relative',
              width: '100%',
              transformStyle: 'preserve-3d',
              transition: 'transform 0.6s',
              transform: isRegisterView ? 'rotateY(180deg)' : 'rotateY(0deg)',
            }}
          >
            {/* Form Đăng nhập (Mặt trước) */}
            <div
              style={{
                backfaceVisibility: 'hidden',
                position: isRegisterView ? 'absolute' : 'relative',
                width: '100%',
                top: 0,
                left: 0,
              }}
            >
              <LoginForm />
            </div>

            {/* Form Đăng ký (Mặt sau) */}
            <div
              style={{
                backfaceVisibility: 'hidden',
                position: isRegisterView ? 'relative' : 'absolute',
                width: '100%',
                top: 0,
                left: 0,
                transform: 'rotateY(180deg)',
              }}
            >
              <RegisterForm />
            </div>
          </div>
        </div>

        <p className="text-center mt-8 text-white text-sm">
          Bạn là nhà tuyển dụng?{' '}
          <a href="#" className="font-semibold hover:underline text-white">
            Đăng nhập
          </a>
        </p>
      </div>
    </div>
  );
};

export default JobSeekerAuthPage;