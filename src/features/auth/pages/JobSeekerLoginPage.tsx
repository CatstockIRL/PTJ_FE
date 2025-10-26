import React, { useState } from 'react';
import { Button, Input, Checkbox, Form, message } from 'antd';
import { GoogleOutlined, LinkedinOutlined } from '@ant-design/icons';
import loginImage from '../../../assets/ImageFormLoginJobSeeker.jpg';

const JobSeekerLoginPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);

  // Hàm xử lý khi submit form thành công
  const onFinish = (values: any) => {
    setLoading(true);
    console.log('Đăng nhập với thông tin:', values);
    // Giả lập gọi API để đăng nhập
    setTimeout(() => {
      setLoading(false);
      message.success('Đăng nhập thành công!');
      // Trong ứng dụng thực tế, bạn sẽ chuyển hướng người dùng hoặc cập nhật state quản lý authentication tại đây
    }, 1500);
  };

  // Hàm xử lý khi submit form thất bại
  const onFinishFailed = (errorInfo: any) => {
    console.log('Lỗi đăng nhập:', errorInfo);
    message.error('Vui lòng kiểm tra lại thông tin đăng nhập!');
  };

  return (
    <div className="min-h-screen flex font-sans bg-gray-50">
      {/* Phần bên trái */}
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

      {/* Phần bên phải (Form đăng nhập) */}
      <div className="w-full lg:w-1/2 bg-blue-600 flex flex-col justify-center items-center p-8">
        <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Người tìm việc đăng nhập</h2>
          <Form
            name="jobseeker_login"
            initialValues={{ remember: true }}
            onFinish={onFinish}
            onFinishFailed={onFinishFailed}
            autoComplete="off"
            layout="vertical"
          >
            <Form.Item
              name="email"
              rules={[{ required: true, type: 'email', message: 'Vui lòng nhập email hợp lệ!' }]}
            >
              <Input size="large" placeholder="Email" />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
            >
              <Input size="large" placeholder="Mật khẩu" type={passwordVisible ? 'text' : 'password'} />
            </Form.Item>

            <div className='flex justify-between items-center mb-4'>
                <Checkbox checked={passwordVisible} onChange={(e) => setPasswordVisible(e.target.checked)}>Hiển thị mật khẩu</Checkbox>
                <a href="#" className="text-sm text-blue-600 hover:underline">
                    Quên mật khẩu?
                </a>
            </div>

            <Form.Item>
              <Button type="primary" htmlType="submit" size="large" className="w-full" loading={loading}>
                Đăng nhập
              </Button>
            </Form.Item>
          </Form>

          <div className="relative flex py-5 items-center">
            <div className="flex-grow border-t border-gray-300"></div>
            <span className="flex-shrink mx-4 text-gray-400">Hoặc</span>
            <div className="flex-grow border-t border-gray-300"></div>
          </div>

          <div className="space-y-3">
            <Button icon={<GoogleOutlined className='text-red-500' />} size="large" className="w-full">
              Đăng nhập với Google
            </Button>
            <Button icon={<LinkedinOutlined className='text-teal-500'  />} size="large" className="w-full">
              Đăng nhập với LinkedIn
            </Button>
          </div>

          <p className="text-center mt-6 text-sm">
            Chưa có tài khoản?{' '}
            <a href="#" className="text-blue-600 hover:underline font-semibold">
              Đăng ký
            </a>
          </p>
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

export default JobSeekerLoginPage;
