import React from "react";
import EmployerRegistrationManagement from "./components/EmployerRegistrationManagement";
import AdminSectionHeader from "./components/AdminSectionHeader";

const AdminEmployerRegistrationPage: React.FC = () => {
  return (
    <>
      <AdminSectionHeader
        title="Phê duyệt nhà tuyển dụng"
        description="Xem xét và phê duyệt hồ sơ đăng ký nhà tuyển dụng mới vào hệ thống."
        gradient="from-purple-600 via-pink-500 to-red-500"
      />
      <EmployerRegistrationManagement />
    </>
  );
};

export default AdminEmployerRegistrationPage;
