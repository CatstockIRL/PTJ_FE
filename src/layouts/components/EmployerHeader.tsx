import React, { useEffect } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../features/auth/hooks";
import { Button, Dropdown, Avatar, message } from "antd";
import {
  UserOutlined,
  DownOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
} from "@ant-design/icons";
import { ROLES } from "../../constants/roles";
import { logout } from "../../features/auth/slice";
import { removeAccessToken } from "../../services/baseService";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { fetchEmployerProfile } from "../../features/employer/slice/profileSlice";

const LogoWhite = "/vite.svg";

interface EmployerHeaderProps {
  onToggleSidebar?: () => void;
}

export const EmployerHeader: React.FC<EmployerHeaderProps> = ({
  onToggleSidebar,
}) => {
  const { user } = useAuth();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const employerProfile = useAppSelector((state) => state.profile.profile);
  const employerProfileLoading = useAppSelector((state) => state.profile.loading);
  const employerProfileError = useAppSelector((state) => state.profile.error);
  const isAdminRoute = location.pathname.startsWith("/admin");
  const shouldLoadEmployerProfile =
    !!user && user.roles.includes(ROLES.EMPLOYER) && !isAdminRoute;

  useEffect(() => {
    if (
      shouldLoadEmployerProfile &&
      !employerProfile &&
      !employerProfileLoading &&
      !employerProfileError
    ) {
      dispatch(fetchEmployerProfile());
    }
  }, [
    dispatch,
    employerProfile,
    employerProfileError,
    employerProfileLoading,
    shouldLoadEmployerProfile,
  ]);

  const fallbackAvatar = (user as any)?.avatarUrl || user?.avatar || undefined;
  const avatarSrc = employerProfile?.avatarUrl || fallbackAvatar;
  const displayName =
    employerProfile?.displayName ||
    employerProfile?.contactName ||
    employerProfile?.username ||
    (user as any)?.fullName ||
    user?.username;

  const handleLogout = () => {
    dispatch(logout());
    removeAccessToken();
    navigate("/login");
    message.success("ÄÄƒng xuáº¥t thÃ nh cÃ´ng!");
  };

  const dropdownItems = [
    ...(location.pathname.startsWith("/admin") || !user?.roles.includes(ROLES.EMPLOYER)
      ? []
      : [
          {
            key: "profile",
            label: <NavLink to="/nha-tuyen-dung/ho-so">Hồ sơ của tôi</NavLink>,
          },
        ]),
    {
      key: "change-password",
      label: <NavLink to="/nha-tuyen-dung/doi-mat-khau">Đổi mật khẩu</NavLink>,
    },
    {
      key: "logout",
      label: "Đăng xuất",
      icon: <LogoutOutlined />,
      danger: true,
      onClick: handleLogout,
    },
  ];

  return (
    <header
      className="bg-blue-900 text-white shadow-md py-4 px-6 flex items-center justify-between sticky top-0 z-10"
      style={{ height: "68px" }}
    >
      <div className="flex items-center gap-3">
        {onToggleSidebar && (
          <Button
            type="text"
            icon={<MenuFoldOutlined style={{ color: "white", fontSize: 18 }} />}
            onClick={onToggleSidebar}
          />
        )}

        <img src={LogoWhite} alt="Logo" className="h-8 mr-2" />
        <NavLink
          to="/nha-tuyen-dung/dashboard"
          className="text-white hover:text-gray-200 text-sm font-medium"
        >
          Trang chá»§
        </NavLink>
      </div>

      <div className="flex items-center space-x-5">

        {/* USER DROPDOWN */}
        {user &&
        (user.roles.includes(ROLES.EMPLOYER) ||
          user.roles.includes(ROLES.ADMIN)) ? (
          <Dropdown menu={{ items: dropdownItems }} placement="bottomRight" arrow>
            <a
              onClick={(e) => e.preventDefault()}
              className="flex items-center space-x-2 text-white hover:text-gray-200"
            >
              <Avatar
                size="small"
                src={avatarSrc}
                icon={!avatarSrc ? <UserOutlined /> : undefined}
                className="bg-blue-600"
              >
                {!avatarSrc && displayName ? displayName.charAt(0).toUpperCase() : null}
              </Avatar>
              <span className="font-medium">{displayName}</span>
              <DownOutlined style={{ fontSize: "10px" }} />
            </a>
          </Dropdown>
        ) : (
          <div className="flex items-center space-x-4">
            <NavLink
              to="/login"
              className="text-white hover:text-gray-200 text-sm font-medium"
            >
              ÄÄƒng nháº­p
            </NavLink>
            <NavLink
              to="/nha-tuyen-dung/register"
              className="text-white hover:text-gray-200 text-sm font-medium"
            >
              ÄÄƒng kÃ½
            </NavLink>
          </div>
        )}

        <div className="border-l border-blue-700 h-6"></div>

        {location.pathname.startsWith("/nha-tuyen-dung") ? (
          <NavLink
            to="/login"
            className="text-gray-200 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
          >
            Cho ngÆ°á»i tÃ¬m viá»‡c
          </NavLink>
        ) : (
          <NavLink
            to="/nha-tuyen-dung"
            className="text-gray-200 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
          >
            NhÃ  tuyá»ƒn dá»¥ng
          </NavLink>
        )}
      </div>
    </header>
  );
};

export default EmployerHeader;

