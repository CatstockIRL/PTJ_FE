import React from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../features/auth/hooks';
import { Button, Dropdown, Avatar, Badge, message } from 'antd';
import {
  UserOutlined,
  BellOutlined,
  DownOutlined,
  LogoutOutlined,
  MenuOutlined,
  SearchOutlined,
  BankOutlined,
  BookOutlined,
  HeartOutlined,
  SendOutlined,
  FileDoneOutlined,
  TeamOutlined,
  LockOutlined,
} from '@ant-design/icons';
import { FaBriefcase } from 'react-icons/fa';
import { ROLES } from '../../constants/roles';
import { useDispatch } from 'react-redux';
import { logout } from '../../features/auth/slice';
import { removeAccessToken } from '../../services/baseService';
import type { User } from '../../features/auth/types';
import LogoImage from '../../assets/logo.png';

const LogoWhite = LogoImage;
const LogoColor = LogoImage;

interface HeaderProps {
  onToggleSidebar: () => void;
}

const jobSeekerNavLinks = [
  { icon: <FileDoneOutlined />, text: 'Viec da dang', path: '/quan-ly-bai-dang' },
  { icon: <HeartOutlined />, text: 'Viec da luu', path: '/viec-lam-da-luu' },
  { icon: <SendOutlined />, text: 'Viec da ung tuyen', path: '/viec-da-ung-tuyen' },
  { icon: <BellOutlined />, text: 'Thong bao viec lam', path: '/thong-bao-viec-lam' },
];

const accountNavLinks = [{ icon: <LockOutlined />, text: 'Doi mat khau', path: '/doi-mat-khau' }];

const mainNavLinks = [
  { icon: <SearchOutlined />, text: 'Danh sach viec lam', path: '/viec-lam' },
  { icon: <TeamOutlined />, text: 'Bai dang tim viec', path: '/danh-sach-bai-dang-tim-viec' },
  { icon: <BankOutlined />, text: 'Nha tuyen dung', path: '/employer' },
  { icon: <BookOutlined />, text: 'Cam nang viec lam', path: '/cam-nang' },
  { icon: <UserOutlined />, text: 'Cho nguoi tim viec', children: jobSeekerNavLinks },
];

const GuestDropdown = () => (
  <div className="p-4 bg-white shadow-md rounded-lg" style={{ minWidth: '450px' }}>
    <div className="flex justify-end items-center mb-4">
      <NavLink to="/login" className="mr-3">
        <Button type="primary" className="w-full">
          Dang nhap
        </Button>
      </NavLink>
      <NavLink to="/register" className="mr-3">
        <Button className="w-full">Dang ky</Button>
      </NavLink>
    </div>
    <ul className="pt-2">
      {accountNavLinks.map((link) => (
        <li key={link.path} className="mb-2">
          <NavLink to={link.path} className="flex items-center text-gray-700 hover:text-blue-600">
            {link.icon}
            <span className="ml-2">{link.text}</span>
          </NavLink>
        </li>
      ))}
    </ul>
  </div>
);

interface UserDropdownProps {
  user: User;
  onLogout: () => void;
}

const UserDropdown: React.FC<UserDropdownProps> = ({ user, onLogout }) => (
  <div className="p-4 bg-white shadow-md rounded-lg" style={{ minWidth: '450px' }}>
    <div className="flex border-b pb-3 mb-3">
      <div className="w-full">
        <ul>
          {accountNavLinks.map((link) => (
            <li key={link.path} className="mb-2">
              <NavLink to={link.path} className="flex items-center text-gray-700 hover:text-blue-600">
                {link.icon}
                <span className="ml-2">{link.text}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </div>
    </div>
    <div className="pt-1">
      <div className="flex items-center justify-between mb-2">
        <NavLink to="/tai-khoan">
          <div className="flex items-center">
            <Avatar icon={<UserOutlined />} src={user.avatar} />
            <span className="ml-2 font-semibold">{user.username}</span>
          </div>
        </NavLink>
      </div>
      <Button danger onClick={onLogout} icon={<LogoutOutlined />} className="w-full">
        Dang xuat
      </Button>
    </div>
  </div>
);

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  const { user } = useAuth();
  const location = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isJobSeeker = !!user && user.roles.includes(ROLES.JOB_SEEKER);

  const handleLogout = () => {
    dispatch(logout());
    removeAccessToken();
    navigate('/');
    message.success('Dang xuat thanh cong!');
  };

  if (user && (user.roles.includes(ROLES.EMPLOYER) || user.roles.includes(ROLES.ADMIN))) {
    const userDropdownItems = [
      { key: '1', label: <NavLink to="/nha-tuyen-dung/ho-so">Ho so cua toi</NavLink> },
      { key: '2', label: 'Dang xuat', icon: <LogoutOutlined />, danger: true, onClick: handleLogout },
    ];

    return (
      <header
        className="bg-blue-900 text-white shadow-md py-4 px-6 flex items-center justify-between sticky top-0 z-10"
        style={{ height: '68px' }}
      >
        <div className="flex items-center">
          <Button
            type="text"
            icon={<MenuOutlined className="text-white text-lg" />}
            onClick={onToggleSidebar}
            className="mr-3"
          />
          <img src={LogoWhite} alt="Logo" className="h-8 mr-4" />
        </div>
        <div className="flex items-center space-x-5">
          <Badge count={0} size="small">
            <BellOutlined className="text-xl text-white" />
          </Badge>

          <Dropdown menu={{ items: userDropdownItems }} placement="bottomRight" arrow>
            <a onClick={(e) => e.preventDefault()} className="flex items-center space-x-2 text-white hover:text-gray-200">
              <Avatar size="small" icon={<UserOutlined />} className="bg-blue-600" />
              <span className="font-medium">{user.username}</span>
              <DownOutlined style={{ fontSize: '10px' }} />
            </a>
          </Dropdown>

          <div className="border-l border-blue-700 h-6" />

          <NavLink to="/" className="text-white hover:text-gray-200 text-sm font-medium">
            Cho Nguoi tim viec
          </NavLink>
        </div>
      </header>
    );
  }

  // Header cho Job Seeker va Guest
  return (
    <header
      className="bg-white shadow-md py-4 px-6 flex items-center justify-between sticky top-0 z-10"
      style={{ height: '68px' }}
    >
      <div className="flex items-center flex-1 min-w-0">
        <div className="flex items-center space-x-3">
          <NavLink to="/">
            <img src={LogoColor} alt="Logo" className="h-10" />
          </NavLink>
          <span className="w-2 h-2 rounded-full bg-gray-300" aria-hidden />
        </div>

        <nav className="hidden md:flex items-center space-x-5 ml-4">
          {mainNavLinks.map((link) =>
            link.children ? (
              !isJobSeeker ? null : (
              <div key={link.text} className="relative group">
                <button className="flex items-center text-gray-600 hover:text-blue-600 text-sm font-medium">
                  {link.icon}
                  <span className="ml-2">{link.text}</span>
                  <DownOutlined className="ml-1 text-[10px]" />
                </button>
                <div className="absolute left-0 mt-3 w-64 rounded-lg bg-white shadow-lg border border-gray-200 py-2 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition">
                  {link.children.map((child) => (
                    <NavLink
                      key={child.path}
                      to={child.path}
                      className="flex items-center px-4 py-2 text-gray-700 hover:text-blue-600 hover:bg-gray-50 text-sm"
                    >
                      {child.icon}
                      <span className="ml-2">{child.text}</span>
                    </NavLink>
                  ))}
                </div>
              </div>
              )
            ) : (
              <NavLink
                key={link.path}
                to={link.path}
                className="flex items-center text-gray-600 hover:text-blue-600 text-sm font-medium"
              >
                {link.icon}
                <span className="ml-2">{link.text}</span>
              </NavLink>
            )
          )}
        </nav>
      </div>

      <div className="flex items-center space-x-3">
        <Badge count={0} size="small">
          <BellOutlined className="text-xl" />
        </Badge>
        <Dropdown
          popupRender={() => (user ? <UserDropdown user={user} onLogout={handleLogout} /> : <GuestDropdown />)}
          placement="bottomRight"
          trigger={['hover']}
        >
          <a onClick={(e) => e.preventDefault()} className="flex items-center space-x-2 text-gray-600">
            {user ? (
              <Avatar size="large" icon={<UserOutlined />} src={user.avatar} />
            ) : (
              <UserOutlined className="text-2xl" />
            )}
            <span className="font-medium">{user ? user.username : 'Dang nhap'}</span>
            <DownOutlined style={{ fontSize: '10px' }} />
          </a>
        </Dropdown>

        <div className="border-l border-gray-300 h-6" />

        {location.pathname.startsWith('/nha-tuyen-dung') ? (
          <NavLink to="/" className="text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
            Cho nguoi tim viec
          </NavLink>
        ) : (
          <NavLink to="/nha-tuyen-dung" className="text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
            Nha tuyen dung
          </NavLink>
        )}
      </div>
    </header>
  );
};

export default Header;
