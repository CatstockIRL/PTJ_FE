import React, { useEffect, useState } from "react";
import { StatCard } from "../../components/employer/StatCard";
import {
  CheckCircleOutlined,
  FileTextOutlined,
  RightOutlined,
  UsergroupAddOutlined,
} from "@ant-design/icons";
import { Spin, Typography, Empty, Button } from "antd";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../features/auth/hooks";
import jobPostService from "../../features/job/jobPostService";
import type { JobPostView } from "../../features/job/jobTypes";
import { JobPostDetailModal } from "../../features/job/components/employer/JobPostDetailModal";

const { Text } = Typography;

const EmployerDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [activeJobs, setActiveJobs] = useState<JobPostView[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(true);

  // Không cần state recentApps nữa vì sẽ dùng activeJobs để điều hướng xem ứng viên
  const [selectedJob, setSelectedJob] = useState<JobPostView | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  useEffect(() => {
    if (!user?.id) return;

    const fetchJobs = async () => {
      setLoadingJobs(true);
      try {
        const res = await jobPostService.getJobsByUser(user.id);
        if (res.success && res.data) {
          // Lọc các công việc đang Active
          const active = res.data.filter(
            (job) => job.status.toLowerCase() === "active"
          );
          setActiveJobs(active);
        }
      } catch (error) {
        console.error("Lỗi khi tải danh sách công việc:", error);
      } finally {
        setLoadingJobs(false);
      }
    };

    fetchJobs();
  }, [user]);

  // Hàm xử lý khi click vào item trong phần "Đơn ứng tuyển gần đây"
  const handleNavigateToCandidates = (employerPostId: number) => {
    navigate(`/nha-tuyen-dung/ung-vien/${employerPostId}`);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">My CareerLink</h1>
      
      {/* --- THỐNG KÊ --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        <StatCard
          title="Việc đang kích hoạt"
          value={loadingJobs ? <Spin size="small" /> : activeJobs.length}
          icon={<CheckCircleOutlined />}
        />
        {/* Tạm thời hiển thị số lượng job active đại diện cho khả năng có đơn ứng tuyển */}
        <StatCard
          title="Vị trí đang tuyển"
          value={loadingJobs ? <Spin size="small" /> : activeJobs.length}
          icon={<FileTextOutlined />}
        />
      </div>

      {/* --- PHẦN 1: DANH SÁCH ĐỂ XEM ỨNG VIÊN (Thay thế Đơn ứng tuyển gần đây) --- */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">
            Xem ứng viên theo công việc
          </h2>
          <span className="text-xs text-gray-400 font-normal">
            (Chọn công việc để duyệt hồ sơ)
          </span>
        </div>

        {loadingJobs ? (
          <div className="text-center text-gray-500 py-10">
            <Spin />
          </div>
        ) : activeJobs.length === 0 ? (
          <div className="text-center py-8">
            <Empty description="Chưa có công việc nào đang kích hoạt" />
          </div>
        ) : (
          <div className="space-y-3">
            {/* Lấy tối đa 5 công việc active để hiển thị */}
            {activeJobs.slice(0, 5).map((job) => (
              <div
                key={job.employerPostId}
                onClick={() => handleNavigateToCandidates(job.employerPostId)}
                className="group p-4 border rounded-lg hover:border-blue-400 hover:shadow-md hover:bg-blue-50 transition-all cursor-pointer flex justify-between items-center"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Text strong className="text-base group-hover:text-blue-700">
                      {job.title}
                    </Text>
                  </div>
                  <Text type="secondary" className="block text-sm mt-1">
                    {job.location || "Chưa cập nhật địa điểm"}
                  </Text>
                  <div className="text-xs text-gray-400 mt-1">
                    Đăng ngày: {new Date(job.createdAt).toLocaleDateString("vi-VN")}
                  </div>
                </div>
                
                <div className="flex items-center gap-2 text-blue-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                  <span>Xem ứng viên</span>
                  <UsergroupAddOutlined />
                </div>
              </div>
            ))}
            
            {activeJobs.length > 5 && (
               <div className="text-center mt-2">
                 <Button type="link" onClick={() => navigate("/nha-tuyen-dung/cong-viec")}>
                   Xem tất cả công việc
                 </Button>
               </div>
            )}
          </div>
        )}
      </div>

      {/* --- PHẦN 2: CÔNG VIỆC ĐANG KÍCH HOẠT (Xem chi tiết Job) --- */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-lg font-semibold text-gray-900">
            Chi tiết công việc đang kích hoạt
          </h2>

          <button
            onClick={() => navigate("/nha-tuyen-dung/cong-viec")}
            className="text-sm text-blue-600 hover:text-blue-700 hover:underline transition"
          >
            Quản lý tất cả {loadingJobs ? "(...)" : `(${activeJobs.length})`} →
          </button>
        </div>

        {loadingJobs ? (
          <div className="flex justify-center py-10 text-gray-500">
            <Spin />
          </div>
        ) : activeJobs.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            <p>Không có công việc nào đang được kích hoạt</p>
          </div>
        ) : (
          <div className="space-y-3">
            {activeJobs.slice(0, 3).map((job) => (
              <div
                key={job.employerPostId}
                className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow transition-all cursor-pointer"
                onClick={() => {
                  setSelectedJob(job);
                  setIsModalVisible(true);
                }}
                role="button"
                tabIndex={0}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-blue-600 text-base">
                      {job.title}
                    </p>
                    <p className="text-gray-500 text-sm mt-1">
                      {job.location || "Chưa cập nhật địa điểm"}
                    </p>
                  </div>
                  <RightOutlined className="text-gray-300" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <JobPostDetailModal
        jobPost={selectedJob}
        visible={isModalVisible}
        onClose={() => {
          setIsModalVisible(false);
          setSelectedJob(null);
        }}
      />
    </div>
  );
};

export default EmployerDashboard;