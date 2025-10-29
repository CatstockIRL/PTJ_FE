import React, { useState } from 'react';
import { Button, Input, Checkbox, Form, message } from 'antd';
import { GoogleOutlined, LinkedinOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const LoginForm: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const navigate = useNavigate();

  // Hàm xử lý khi submit form đăng nhập
  const onLoginFinish = (values: any) => {
    setLoading(true);
    console.log('Đăng nhập với thông tin:', values);
    setTimeout(() => {
      setLoading(false);
      message.success('Đăng nhập thành công!');
      // TODO: Chuyển hướng người dùng đến trang dashboard sau khi đăng nhập thành công
      // navigate('/dashboard');
    }, 1500);
  };

  // Hàm xử lý khi submit form thất bại
  const onFinishFailed = (errorInfo: any) => {
    console.log('Lỗi:', errorInfo);
    message.error('Vui lòng kiểm tra lại thông tin!');
  };

  return (
    <div className="w-full bg-white p-8 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
        Người tìm việc đăng nhập
      </h2>
      <Form
        name="jobseeker_login"
        initialValues={{ remember: true }}
        onFinish={onLoginFinish}
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
          <Input
            size="large"
            placeholder="Mật khẩu"
            type={passwordVisible ? 'text' : 'password'}
          />
        </Form.Item>

        <div className="flex justify-between items-center mb-4">
          <Checkbox
            checked={passwordVisible}
            onChange={(e) => setPasswordVisible(e.target.checked)}
          >
            Hiển thị mật khẩu
          </Checkbox>
          <a href="#" className="text-sm text-blue-600 hover:underline">
            Quên mật khẩu?
          </a>
        </div>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            size="large"
            className="w-full"
            loading={loading}
          >
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
        <Button icon={<GoogleOutlined className="text-red-500" />} size="large" className="w-full">
          Đăng nhập với Google
        </Button>
        <Button icon={<LinkedinOutlined className="text-teal-500" />} size="large" className="w-full">
          Đăng nhập với LinkedIn
        </Button>
      </div>

      <p className="text-center mt-6 text-sm">
        Chưa có tài khoản?{' '}
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            // Giả sử route cho trang đăng ký là '/register'
            navigate('/register');
          }}
          className="text-blue-600 hover:underline font-semibold"
        >
          Đăng ký
        </a>
      </p>
    </div>
  );
};

export default LoginForm;
