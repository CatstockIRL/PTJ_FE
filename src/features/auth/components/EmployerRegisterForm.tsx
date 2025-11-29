import React, { useState } from 'react';
import { Form, Input, Button, Checkbox, Alert, message } from 'antd';
import { UserOutlined, MailOutlined, LockOutlined, PhoneOutlined, LinkOutlined, HomeOutlined } from '@ant-design/icons';
import { registerEmployer } from '../services';
import type { RegisterEmployerPayload } from '../types';
import { useNavigate } from 'react-router-dom';

const phoneRegex = /^0\d{9}$/;

const EmployerRegisterForm: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      const payload: RegisterEmployerPayload = {
        companyName: values.companyName,
        companyDescription: values.companyDescription,
        contactPerson: values.contactPerson,
        contactPhone: values.contactPhone,
        contactEmail: values.contactEmail,
        address: values.address,
        website: values.website,
        email: values.email,
        password: values.password,
      };
      await registerEmployer(payload);
      setSuccess(true);
    } catch (error: any) {
      message.error(
        error.response?.data?.message || 'Khong the dang ky nha tuyen dung, vui long thu lai.'
      );
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center rounded-3xl border border-blue-100 bg-white/90 p-8 text-center shadow-xl">
        <Alert
          type="success"
          message="Dang ky nha tuyen dung thanh cong!"
          description="Kiem tra email de xac minh tai khoan truoc khi dang nhap quan tri."
          showIcon
          className="mb-6 text-left"
        />
        <Button type="primary" size="large" onClick={() => navigate('/login')}>
          Tro ve dang nhap
        </Button>
      </div>
    );
  }

  return (
    <div className="flex h-full w-full flex-col rounded-3xl border border-white/40 bg-gradient-to-br from-cyan-50 via-blue-50 to-emerald-50 p-6 shadow-xl sm:p-8">
      <h3 className="text-center text-2xl font-semibold text-slate-900 mb-6">
        Dang ky nha tuyen dung
      </h3>
      <Form
        layout="vertical"
        autoComplete="off"
        onFinish={handleSubmit}
        name="employer_register_form"
      >
        <Form.Item
          label="Ten cong ty"
          name="companyName"
          rules={[{ required: true, message: 'Vui long nhap ten cong ty.' }]}
        >
          <Input
            size="large"
            placeholder="VD: Cong ty TNHH ABC"
            prefix={<UserOutlined className="text-slate-400" />}
          />
        </Form.Item>

        <Form.Item label="Mo ta cong ty" name="companyDescription">
          <Input.TextArea
            rows={3}
            maxLength={2000}
            placeholder="Gioi thieu ngan gon ve cong ty"
          />
        </Form.Item>

        <Form.Item
          label="Email dang ky"
          name="email"
          rules={[
            { required: true, message: 'Vui long nhap email.' },
            { type: 'email', message: 'Email khong hop le.' },
          ]}
        >
          <Input
            size="large"
            placeholder="Email su dung dang nhap"
            prefix={<MailOutlined className="text-slate-400" />}
          />
        </Form.Item>

        <Form.Item
          label="Mat khau"
          name="password"
          rules={[
            { required: true, message: 'Vui long nhap mat khau.' },
            { min: 6, message: 'Mat khau phai it nhat 6 ky tu.' },
          ]}
        >
          <Input
            size="large"
            placeholder="Mat khau"
            type={passwordVisible ? 'text' : 'password'}
            prefix={<LockOutlined className="text-slate-400" />}
          />
        </Form.Item>

        <Form.Item
          label="Xac nhan mat khau"
          name="confirmPassword"
          dependencies={['password']}
          rules={[
            { required: true, message: 'Vui long xac nhan mat khau.' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('password') === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error('Mat khau khong khop.'));
              },
            }),
          ]}
        >
          <Input
            size="large"
            placeholder="Nhap lai mat khau"
            type={passwordVisible ? 'text' : 'password'}
            prefix={<LockOutlined className="text-slate-400" />}
          />
        </Form.Item>

        <Form.Item label="Nguoi lien he" name="contactPerson">
          <Input
            size="large"
            placeholder="VD: Nguyen Van A"
            prefix={<UserOutlined className="text-slate-400" />}
          />
        </Form.Item>

        <Form.Item
          label="So dien thoai lien he"
          name="contactPhone"
          rules={[
            { required: true, message: 'Vui long nhap so dien thoai lien he.' },
            {
              pattern: phoneRegex,
              message: 'Nhap so dien thoai Viet Nam hop le (10 so bat dau bang 0).',
            },
          ]}
        >
          <Input
            size="large"
            placeholder="VD: 0912345678"
            prefix={<PhoneOutlined className="text-slate-400" />}
          />
        </Form.Item>

        <Form.Item
          label="Email lien he"
          name="contactEmail"
          rules={[{ type: 'email', message: 'Vui long nhap email lien he hop le.' }]}
        >
          <Input
            size="large"
            placeholder="contact@company.com"
            prefix={<MailOutlined className="text-slate-400" />}
          />
        </Form.Item>

        <Form.Item label="Dia chi" name="address">
          <Input
            size="large"
            placeholder="So nha, duong, phuong/xa, quan/huyen, tinh/thanh"
            prefix={<HomeOutlined className="text-slate-400" />}
          />
        </Form.Item>

        <Form.Item
          label="Website (khong bat buoc)"
          name="website"
          rules={[{ type: 'url', message: 'Vui long nhap URL hop le.' }]}
        >
          <Input
            size="large"
            placeholder="https://company.vn"
            prefix={<LinkOutlined className="text-slate-400" />}
          />
        </Form.Item>

        <div className="mb-4">
          <Checkbox
            checked={passwordVisible}
            onChange={(e) => setPasswordVisible(e.target.checked)}
          >
            Hien thi mat khau
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
            Dang ky
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default EmployerRegisterForm;
