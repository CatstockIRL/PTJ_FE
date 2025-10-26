import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../features/auth/hooks';
import { ROLES } from '../../constants/roles';
import { Button, Dropdown } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import  LogoWeb from '../../assets/LogoWeb2.png'

export const Header: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();

  const renderNavLinks = () => {
    if (!user) {
      return (
        <>
          <NavLink to="/" className="text-gray-600 hover:text-blue-600">Ngành nghề/Địa điểm</NavLink>
          <NavLink to="/viec-lam" className="text-gray-600 hover:text-blue-600">Việc làm</NavLink>
        </>
      );
    }

    switch (user.role) {
      case ROLES.ADMIN:
        return (
          <>
            <NavLink to="/admin/dashboard" className="text-gray-600 hover:text-blue-600">Dashboard</NavLink>
            <NavLink to="/admin/users" className="text-gray-600 hover:text-blue-600">Quản lý người dùng</NavLink>
          </>
        );
      case ROLES.EMPLOYER:
        return (
          <>
            <NavLink to="/nha-tuyen-dung" className="text-gray-600 hover:text-blue-600">Trang nhà tuyển dụng</NavLink>
            <NavLink to="/nha-tuyen-dung/dang-tin" className="text-gray-600 hover:text-blue-600">Đăng tin tuyển dụng</NavLink>
          </>
        );
      default :
        return (
          <>
            <NavLink to="/" className="text-gray-600 hover:text-blue-600">Trang chủ</NavLink>
            <NavLink to="/viec-lam" className="text-gray-600 hover:text-blue-600">Việc làm</NavLink>
            <NavLink to="/ho-so" className="text-gray-600 hover:text-blue-600">Hồ sơ của tôi</NavLink>
          </>
        );
    }
  };

  const menuItems = [
    {
      key: '1',
      label: (
        <NavLink to="/login">Đăng nhập</NavLink>
      )
    },
    {
      key: '2',
      label: (
        <NavLink to="/register">Đăng ký</NavLink>
      )
    }
  ];

  return (
    <header className="bg-transparent shadow-md flex items-center justify-between py-1">
      {/* 2. Khối 1: Logo*/}
      <div className="flex-shrink-0 pl-6">
        <img src={LogoWeb} alt="Part-Time Job Finder Logo" className="h-14" />
      </div>

      {/* 3. Khối 2: NavLinks*/}
      <div className="flex-1 flex justify-center">
        <nav className="hidden md:flex space-x-6">
          {renderNavLinks()}
        </nav>
      </div>

      {/* 4. Khối 3: Auth*/}
      <div className="flex items-center pr-6">
        {user ? (
          <span>Chào, {user.name}</span>
        ) : (
          <div className="flex items-center space-x-2">
            <Dropdown menu={{ items: menuItems }} placement="bottomRight">
              <Button type="default" icon={<UserOutlined />}>
                Đăng ký
              </Button>
            </Dropdown>
            <div className="border-l border-gray-300 h-6"></div>
            {location.pathname.startsWith('/nha-tuyen-dung') ? (
              <NavLink to="/" className="text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
                Cho người tìm việc
              </NavLink>
            ) : (
              <NavLink to="/nha-tuyen-dung" className="text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
                Nhà tuyển dụng
              </NavLink>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;