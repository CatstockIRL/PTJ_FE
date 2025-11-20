import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import { Avatar, Menu, type MenuProps } from "antd";
import {
  HomeOutlined,
  FileTextOutlined,
  SearchOutlined,
  ReadOutlined,
  SettingOutlined,
  QuestionCircleOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { useAuth } from "../../features/auth/hooks";
import { ROLES } from "../../constants/roles";

type MenuItem = Required<MenuProps>["items"][number];

function getItem(
  label: React.ReactNode,
  key: string,
  icon?: React.ReactNode,
  children?: MenuItem[]
): MenuItem {
  return { key, icon, children, label } as MenuItem;
}

interface SidebarProps {
  isOpen: boolean;
}

export const EmployerSidebar: React.FC<SidebarProps> = ({ isOpen }) => {
  const { user } = useAuth();
  const location = useLocation();

  const employerItems: MenuItem[] = [
    getItem(
      <NavLink to="/nha-tuyen-dung/dashboard">Thông tin</NavLink>,
      "/nha-tuyen-dung/dashboard",
      <HomeOutlined />
    ),
    getItem("Công việc", "sub-cong-viec", <FileTextOutlined />, [
      getItem(
        <NavLink to="/nha-tuyen-dung/cong-viec">Bài đăng của tôi</NavLink>,
        "/nha-tuyen-dung/cong-viec"
      ),
      getItem(
        <NavLink to="/nha-tuyen-dung/dang-tin">Đăng bài</NavLink>,
        "/nha-tuyen-dung/dang-tin"
      )
    ]),
    getItem(
      <NavLink to="/nha-tuyen-dung/cam-nang">Cẩm nang tuyển dụng</NavLink>,
      "/nha-tuyen-dung/cam-nang",
      <ReadOutlined />
    ),
  ];

  const getMenuItems = (): MenuItem[] => {
    if (!user) return [];

    if (user.roles.includes(ROLES.EMPLOYER)) {
      return employerItems;
    }

    return [];
  };

  const defaultOpenKey = employerItems.find(
    (item) =>
      item &&
      "children" in item &&
      Array.isArray(item.children) &&
      item.children.some((child) => child && child.key === location.pathname)
  )?.key as string;

  return (
    <aside
      className={`bg-white shadow-md flex flex-col flex-shrink-0 sticky top-[68px]
    h-[calc(100vh-68px)] transition-all duration-300
    ${isOpen ? "w-64" : "w-20"}`}
    >
      <div className="flex-1 overflow-y-auto">
        <Menu
          mode="inline"
          theme="light"
          inlineCollapsed={!isOpen}
          items={getMenuItems()}
          selectedKeys={[location.pathname]}
          defaultOpenKeys={[defaultOpenKey || ""]}
          className="h-full border-r-0"
        />
      </div>

      {user && (
        <div className="p-4 flex-shrink-0 border-top border-gray-200">
          <div
            className={`flex items-center space-x-3 ${
              !isOpen ? "justify-center" : ""
            }`}
          >
            <Avatar size={40} icon={<UserOutlined />} className="bg-blue-600">
              {user.username.charAt(0).toUpperCase()}
            </Avatar>

            {isOpen && (
              <div>
                <div className="font-semibold text-sm text-gray-800">
                  {user.username}
                </div>
                <div className="text-xs text-gray-500">{user.email}</div>
              </div>
            )}
          </div>
        </div>
      )}
    </aside>
  );
};
