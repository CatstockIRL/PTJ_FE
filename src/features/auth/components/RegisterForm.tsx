import React, { useState } from 'react';
import { Button, Input, Checkbox, Form, message } from 'antd';
import { GoogleOutlined, LinkedinOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const RegisterForm: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const navigate = useNavigate();

  // Hàm xử lý khi submit form đăng ký
  const onRegisterFinish = (values: any) => {
    setLoading(true);
    console.log('Đăng ký với thông tin:', values);
    setTimeout(() => {
      setLoading(false);
      message.success('Đăng ký thành công! Vui lòng đăng nhập.');
      // Chuyển về trang đăng nhập sau khi đăng ký thành công
      navigate('/login');
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
        Đăng ký tài khoản
      </h2>
      <Form
        name="jobseeker_register"
        onFinish={onRegisterFinish}
        onFinishFailed={onFinishFailed}
        autoComplete="off"
        layout="vertical"
      >
        <Form.Item
          name="fullname"
          rules={[{ required: true, message: 'Vui lòng nhập họ tên!' }]}
        >
          <Input size="large" placeholder="Họ và tên" />
        </Form.Item>

        <Form.Item
          name="email"
          rules={[{ required: true, type: 'email', message: 'Vui lòng nhập email hợp lệ!' }]}
        >
          <Input size="large" placeholder="Email" />
        </Form.Item>

        <Form.Item
          name="password"
          rules={[
            { required: true, message: 'Vui lòng nhập mật khẩu!' },
            { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự!' },
          ]}
        >
          <Input
            size="large"
            placeholder="Mật khẩu"
            type={passwordVisible ? 'text' : 'password'}
          />
        </Form.Item>

        <Form.Item
          name="confirmPassword"
          dependencies={['password']}
          rules={[
            { required: true, message: 'Vui lòng xác nhận mật khẩu!' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('password') === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error('Mật khẩu không khớp!'));
              },
            }),
          ]}
        >
          <Input
            size="large"
            placeholder="Xác nhận mật khẩu"
            type={passwordVisible ? 'text' : 'password'}
          />
        </Form.Item>

        <div className="mb-4">
          <Checkbox
            checked={passwordVisible}
            onChange={(e) => setPasswordVisible(e.target.checked)}
          >
            Hiển thị mật khẩu
          </Checkbox>
        </div>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            size="large"
            className="w-full"
            loading={loading}
          >
            Đăng ký
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
          Đăng ký với Google
        </Button>
        <Button icon={<LinkedinOutlined className="text-teal-500" />} size="large" className="w-full">
          Đăng ký với LinkedIn
        </Button>
      </div>

      <p className="text-center mt-6 text-sm">
        Đã có tài khoản?{' '}
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            // Giả sử route cho trang đăng nhập là '/login'
            navigate('/login');
          }}
          className="text-blue-600 hover:underline font-semibold"
        >
          Đăng nhập
        </a>
      </p>
    </div>
  );
};

export default RegisterForm;
