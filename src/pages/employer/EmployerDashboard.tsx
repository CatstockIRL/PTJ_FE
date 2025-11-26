import React, { useEffect, useState } from "react";
import { Spin, Tag, Button } from "antd";
import {
  ArrowRightOutlined,
  BarChartOutlined,
  CheckCircleOutlined,
  FileTextOutlined,
  PlusOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../features/auth/hooks";
import jobPostService from "../../features/job/jobPostService";
import type { JobPostView } from "../../features/job/jobTypes";
import { JobPostDetailModal } from "../../features/job/components/employer/JobPostDetailModal";

const EmployerDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [activeJobs, setActiveJobs] = useState<JobPostView[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(true);

  const [recentApps] = useState<any[]>([]);
  const [loadingApps, setLoadingApps] = useState(true);
  const [selectedJob, setSelectedJob] = useState<JobPostView | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  useEffect(() => {
    if (!user?.id) return;

    const fetchJobs = async () => {
      setLoadingJobs(true);
      try {
        const res = await jobPostService.getJobsByUser(user.id);
        if (res.success && res.data) {
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

    const fetchApps = async () => {
      setLoadingApps(true);
      // TODO: replace with real service when available
      setLoadingApps(false);
    };

    fetchJobs();
    fetchApps();
  }, [user]);

  const statCards = [
    { label: "Công việc đang chạy", value: activeJobs.length, icon: <CheckCircleOutlined /> },
    { label: "Ứng viên mới", value: loadingApps ? "…" : recentApps.length, icon: <UserOutlined /> },
    { label: "Chiến dịch tuyển dụng", value: "Sắp ra mắt", icon: <BarChartOutlined /> },
  ];

  const renderJobCard = (job: JobPostView) => (
    <div
      key={job.employerPostId}
      className="p-4 bg-white border border-gray-200 rounded-xl hover:shadow-md hover:border-blue-200 transition cursor-pointer"
      onClick={() => {
        setSelectedJob(job);
        setIsModalVisible(true);
      }}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          setSelectedJob(job);
          setIsModalVisible(true);
        }
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Tag color="blue">Đang hoạt động</Tag>
            {job.salary ? (
              <Tag color="default" className="text-gray-700">
                {job.salary.toLocaleString("vi-VN")} VND
              </Tag>
            ) : (
              <Tag color="default">Thỏa thuận</Tag>
            )}
          </div>
          <p className="text-base font-semibold text-gray-900 leading-tight">
            {job.title}
          </p>
          <p className="text-sm text-gray-600">
            {job.location || "Chưa cập nhật địa điểm"}
          </p>
          <p className="text-xs text-gray-500">
            Cập nhật: {job.createdAt ? new Date(job.createdAt).toLocaleDateString("vi-VN") : "N/A"}
          </p>
        </div>
        <ArrowRightOutlined className="text-gray-400" />
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-sky-500 via-blue-500 to-indigo-600 text-white rounded-2xl shadow-lg p-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-2">
            <p className="text-xs font-semibold tracking-wide uppercase text-white/80">
              PTJ FOR BUSINESS
            </p>
            <h1 className="text-2xl md:text-3xl font-bold leading-tight">
              Đăng tin tuyển dụng miễn phí, tìm CV ứng viên nhanh hơn
            </h1>
            <p className="text-sm text-white/80 max-w-2xl">
              Tiếp cận kho ứng viên chất lượng, quản lý chiến dịch tuyển dụng và theo dõi CV trong một giao diện đồng nhất.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <Button
                type="primary"
                icon={<PlusOutlined />}
                className="bg-white text-blue-600 hover:text-blue-700"
                onClick={() => navigate("/nha-tuyen-dung/cong-viec/tao-moi")}
              >
                Đăng tin ngay
              </Button>
              <Button
                ghost
                className="text-white border-white hover:bg-white hover:text-blue-600"
                onClick={() => navigate("/nha-tuyen-dung/cong-viec")}
              >
                Quản lý tin tuyển dụng
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full md:w-auto">
            {statCards.map((card) => (
              <div
                key={card.label}
                className="bg-white/15 rounded-xl px-4 py-3 backdrop-blur text-center"
              >
                <div className="text-sm text-white/80">{card.label}</div>
                <div className="text-2xl font-bold mt-1 flex items-center justify-center gap-2">
                  {card.icon}
                  <span>{card.value}</span>
                </div>
                <p className="text-xs text-white/70 mt-1">
                  {card.label === "Chiến dịch tuyển dụng" ? "Mới" : "Cập nhật gần đây"}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              Bài tuyển dụng đang hoạt động
            </h2>
            <div className="flex items-center gap-2">
              <Button
                type="primary"
                size="middle"
                icon={<PlusOutlined />}
                onClick={() => navigate("/nha-tuyen-dung/cong-viec/tao-moi")}
              >
                Tạo bài đăng tuyển mới
              </Button>
            </div>
          </div>

          {loadingJobs ? (
            <div className="flex justify-center py-10 text-gray-500">
              <Spin />
            </div>
          ) : activeJobs.length === 0 ? (
            <div className="text-center py-10 text-gray-500 bg-white rounded-xl border border-dashed">
              Chưa có bài đăng nào đang hoạt động.
            </div>
          ) : (
            <div className="space-y-3">
              {activeJobs.slice(0, 5).map(renderJobCard)}
              {activeJobs.length > 5 && (
                <div className="text-center pt-2">
                  <Button
                    type="link"
                    onClick={() => navigate("/nha-tuyen-dung/cong-viec")}
                  >
                    Xem thêm {activeJobs.length - 5} bài khác
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4 min-h-[360px]">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-gray-900">Ứng viên mới</h3>
            <FileTextOutlined className="text-gray-400" />
          </div>
          {loadingApps ? (
            <div className="flex justify-center py-10 text-gray-500">
              <Spin />
            </div>
          ) : recentApps.length === 0 ? (
            <p className="text-gray-500 text-sm">Chưa có ứng viên mới.</p>
          ) : (
            <div className="space-y-3">
              {recentApps.slice(0, 3).map((app) => (
                <div key={app.id} className="p-3 rounded-lg bg-gray-50">
                  <p className="font-medium text-gray-900">{app.candidateName}</p>
                  <p className="text-sm text-gray-600">Ứng tuyển: {app.jobTitle}</p>
                </div>
              ))}
            </div>
          )}
        </div>
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
