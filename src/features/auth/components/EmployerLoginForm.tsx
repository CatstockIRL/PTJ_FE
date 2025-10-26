import React from 'react';
import { Button, Input, Checkbox } from 'antd';

export const EmployerLoginForm: React.FC = () => {
  return (
    <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
      <h3 className="text-lg font-bold text-center mb-4">Nhà tuyển dụng đăng nhập</h3>
      <form className="space-y-4">
        <div>
          <Input size="large" placeholder="Email" />
        </div>
        <div>
          <Input.Password size="large" placeholder="Mật khẩu" />
        </div>
        <div>
          <Checkbox>Hiển thị mật khẩu</Checkbox>
        </div>
        <Button type="primary" size="large" htmlType="submit" className="w-full">
          Đăng nhập
        </Button>
        <div className="flex justify-between text-sm">
          <a href="#" className="text-blue-600 hover:underline">
            Quên mật khẩu
          </a>
          <a href="#" className="text-blue-600 hover:underline">
            Đăng ký
          </a>
        </div>
      </form>
    </div>
  );
};