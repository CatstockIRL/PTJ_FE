import React, { useState, useEffect, useMemo } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  Button,
  Select,
  Table,
  Tag,
  Space,
  message,
  Modal,
  Input,
  Row,
  Col,
  List,
  Progress,
  Avatar,
  Typography,
  Tooltip,
} from "antd";
import type { TableProps, TableColumnsType } from "antd";
import {
  PlusOutlined,
  SyncOutlined,
  MoneyCollectOutlined,
  AppstoreOutlined,
  BulbOutlined,
  EnvironmentOutlined,
  PhoneOutlined,
  UserOutlined,
  DeleteOutlined,
  UsergroupAddOutlined,
} from "@ant-design/icons";
import { useAuth } from "../../features/auth/hooks";
import jobPostService from "../../features/job/jobPostService";
import type { JobPostView } from "../../features/job/jobTypes";
import { useCategories } from "../../features/category/hook";
import { useSelector } from "react-redux";
import type { RootState } from "../../app/store";
import { JobPostDetailModal } from "../../features/job/components/employer/JobPostDetailModal";

const { Option } = Select;
const { Search } = Input;
const { Text } = Typography;

const MOCK_API_RESPONSE = {
  success: true,
  total: 3,
  data: [
    {
      employerPostId: 9991,
      title: "Trình Dược Viên Tại Tuyên Quang [Thu Nhập Không Giới Hạn] (Mẫu)",
      location: "Phường Minh Xuân, TP Tuyên Quang, Tuyên Quang",
      matchPercent: 97,
      phoneContact: "0326397621",
      employerName: "Hệ thống (Gợi ý mẫu)",
      createdAt: new Date().toISOString(),
    },
    {
      employerPostId: 9992,
      title: "Trình Dược Viên Tại Điện Biên (Đi làm ngay) (Mẫu)",
      location: "Xã Mường Tùng, Huyện Mường Chà, Điện Biên",
      matchPercent: 82,
      phoneContact: "0326845871",
      employerName: "Hệ thống (Gợi ý mẫu)",
      createdAt: new Date().toISOString(),
    },
    {
      employerPostId: 9993,
      title: "Nhân viên Kinh doanh Dược phẩm - Yên Bái (Mẫu)",
      location: "Xã Lâm Giang, Huyện Văn Yên, Yên Bái",
      matchPercent: 75,
      phoneContact: "0327865284",
      employerName: "Hệ thống (Gợi ý mẫu)",
      createdAt: new Date().toISOString(),
    },
  ],
};

const formatCurrency = (value: number | null | undefined) => {
  if (value == null || value <= 0) return "Thỏa thuận";
  return `${value.toLocaleString("vi-VN")} vnđ`;
};

const EmployerJobsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  useCategories();

  const { categories, status: categoryStatus } = useSelector(
    (state: RootState) => state.category
  );

  const [allJobs, setAllJobs] = useState<JobPostView[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedJob, setSelectedJob] = useState<JobPostView | null>(null);

  const [isSuggestionModalVisible, setIsSuggestionModalVisible] = useState(false);
  const [suggestionList, setSuggestionList] = useState<any[]>([]);
  const [isSuggestionLoading, setIsSuggestionLoading] = useState(false);
  const [currentJobTitle, setCurrentJobTitle] = useState("");

  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
  const [sortInfo, setSortInfo] = useState<{
    field: string;
    order: "asc" | "desc";
  }>({
    field: "createdAt",
    order: "desc",
  });

  const fetchJobs = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const res = await jobPostService.getJobsByUser(user.id);
      if (res.success) {
        setAllJobs(res.data);
      } else {
        message.error("Không thể tải danh sách công việc.");
      }
    } catch (err: any) {
      message.error(err.response?.data?.message || "Lỗi khi tải dữ liệu.");
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchJobs();
  }, [user]);

  const handleShowSuggestions = async (postId: number, jobTitle: string) => {
    setCurrentJobTitle(jobTitle);
    setIsSuggestionModalVisible(true);
    setIsSuggestionLoading(true);
    setSuggestionList([]);

    try {
      const res: any = await jobPostService.getSuggestions(postId);

      if (res && res.success && Array.isArray(res.data) && res.data.length > 0) {
        setSuggestionList(res.data);
      } else {
        setSuggestionList(MOCK_API_RESPONSE.data);
      }
    } catch (error) {
      console.error("Lỗi tải gợi ý, sử dụng dữ liệu mẫu", error);
      setSuggestionList(MOCK_API_RESPONSE.data);
    } finally {
      setIsSuggestionLoading(false);
    }
  };

  const processedJobs = useMemo(() => {
    let filteredData = [...allJobs];

    if (searchTerm) {
      filteredData = filteredData.filter((job) =>
        job.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory) {
      const category = categories.find(
        (c: any) => c.categoryId === selectedCategory
      );
      if (category) {
        filteredData = filteredData.filter(
          (job) => job.categoryName === category.name
        );
      }
    }

    const { field, order } = sortInfo;
    if (field && order) {
      filteredData.sort((a, b) => {
        const valA = a[field as keyof JobPostView] ?? "";
        const valB = b[field as keyof JobPostView] ?? "";

        let compare = 0;
        if (valA > valB) compare = 1;
        if (valA < valB) compare = -1;

        return order === "asc" ? compare : -compare;
      });
    }

    return filteredData;
  }, [allJobs, searchTerm, selectedCategory, sortInfo, categories]);

  const paginatedJobs = useMemo(() => {
    const { current, pageSize } = pagination;
    const startIndex = (current - 1) * pageSize;
    return processedJobs.slice(startIndex, startIndex + pageSize);
  }, [processedJobs, pagination]);

  const handleRefresh = () => {
    fetchJobs();
  };

  const handleEdit = (id: number) => {
    navigate(`/nha-tuyen-dung/sua-tin/${id}`);
  };

  const handleDelete = (id: number) => {
    Modal.confirm({
      title: "Bạn có chắc muốn xóa bài đăng này?",
      content: "Hành động này không thể hoàn tác.",
      okText: "Xác nhận xóa",
      okType: "danger",
      cancelText: "Hủy",
      onOk: async () => {
        try {
          const res = await jobPostService.deleteJobPost(id);
          if (res.success) {
            message.success(res.message);
            fetchJobs();
          } else {
            message.error(res.message);
          }
        } catch (err: any) {
          message.error(err.response?.data?.message || "Xóa thất bại.");
        }
      },
    });
  };

  const handleViewDetails = (id: number) => {
    const jobToView = allJobs.find((job) => job.employerPostId === id);
    if (jobToView) {
      setSelectedJob(jobToView);
      setIsModalVisible(true);
    } else {
      message.error("Không tìm thấy chi tiết công việc.");
    }
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
    setSelectedJob(null);
  };

  const handleTableChange: TableProps<JobPostView>["onChange"] = (
    newPagination,
    filters,
    sorter: any
  ) => {
    setPagination({
      current: newPagination.current || 1,
      pageSize: newPagination.pageSize || 10,
    });

    setSortInfo({
      field: sorter.field || "createdAt",
      order: sorter.order
        ? sorter.order === "ascend"
          ? "asc"
          : "desc"
        : "desc",
    });
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setPagination((prev) => ({ ...prev, current: 1 }));
  };

  const handleCategoryChange = (value: number | null) => {
    setSelectedCategory(value);
    setPagination((prev) => ({ ...prev, current: 1 }));
  };

  const columns: TableColumnsType<JobPostView> = [
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 120,
      sorter: true,
      render: (status: string) => {
        const normalized = status?.toLowerCase();
        if (normalized === "draft") {
          return (
            <Tag color="default" style={{ fontSize: 12, padding: "2px 8px" }}>
              Bản nháp
            </Tag>
          );
        }
        if (normalized === "active") {
          return (
            <Tag color="green" style={{ fontSize: 12, padding: "2px 8px" }}>
              Đang đăng
            </Tag>
          );
        }
        if (normalized === "expired") {
          return (
            <Tag color="red" style={{ fontSize: 12, padding: "2px 8px" }}>
              Hết hạn
            </Tag>
          );
        }
        return (
          <Tag style={{ fontSize: 12, padding: "2px 8px" }}>
            {status || "Khác"}
          </Tag>
        );
      },
    },
    {
      title: "Công việc",
      dataIndex: "title",
      key: "title",
      sorter: true,
      render: (text, record) => (
        <div>
          <a
            onClick={() => handleViewDetails(record.employerPostId)}
            className="font-semibold text-blue-600 hover:underline cursor-pointer"
          >
            {text}
          </a>
          <div className="text-xs text-gray-500">
            {record.location || "(Chưa có địa điểm)"}
          </div>
          <div className="text-xs text-gray-500">
            Cập nhật: {new Date(record.createdAt).toLocaleDateString("vi-VN")}
          </div>
        </div>
      ),
    },
    {
      title: "Ngành nghề",
      dataIndex: "categoryName",
      key: "categoryName",
      sorter: true,
      render: (category) => (
        <Space>
          <AppstoreOutlined /> {category || "N/A"}
        </Space>
      ),
    },
    {
      title: "Lương",
      dataIndex: "salary",
      key: "salary",
      sorter: true,
      render: (salary) => (
        <Space>
          <MoneyCollectOutlined />
          {salary === 0 ? "Thỏa thuận" : formatCurrency(salary)}
        </Space>
      ),
    },
    {
      title: "Hành động",
      key: "action",
      render: (_, record) => (
        <Space size="small" wrap>
          <Tooltip title="Gợi ý công việc">
            <Button
              icon={<BulbOutlined />}
              size="small"
              onClick={() =>
                handleShowSuggestions(record.employerPostId, record.title)
              }
            >
              Gợi ý
            </Button>
          </Tooltip>
          <Tooltip title="Ứng viên & Đã lưu">
            <Button
              icon={<UsergroupAddOutlined />}
              size="small"
              onClick={() => navigate(`/nha-tuyen-dung/ung-vien/${record.employerPostId}`)}
            >
              Ứng viên
            </Button>
          </Tooltip>
          <Button
            type="link"
            size="small"
            className="!px-0"
            onClick={() => handleEdit(record.employerPostId)}
          >
            Sửa
          </Button>
          <Tooltip title="Xóa bài đăng">
            <Button
              danger
              type="text"
              size="small"
              icon={<DeleteOutlined />}
              onClick={() => handleDelete(record.employerPostId)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">
          Công việc của tôi ({allJobs.length})
        </h1>
        <div className="flex gap-2">
          <Button
            type="default"
            icon={<SyncOutlined />}
            size="large"
            onClick={handleRefresh}
            loading={isLoading}
          >
            Làm mới
          </Button>
          <NavLink to="/nha-tuyen-dung/dang-tin">
            <Button type="primary" icon={<PlusOutlined />} size="large">
              Đăng công việc mới
            </Button>
          </NavLink>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 space-y-5">
        <Row gutter={[16, 16]}>
          <Col xs={24} md={12} lg={8}>
            <Search
              placeholder="Tìm kiếm theo tiêu đề công việc..."
              onSearch={handleSearch}
              onChange={(e) => handleSearch(e.target.value)}
              enterButton
              allowClear
              loading={isLoading}
            />
          </Col>
          <Col xs={24} md={12} lg={6}>
            <Select
              placeholder="Lọc theo ngành nghề"
              onChange={handleCategoryChange}
              allowClear
              style={{ width: "100%" }}
              loading={categoryStatus === "loading"}
            >
              {categories.map((cat: any) => (
                <Option key={cat.categoryId} value={cat.categoryId}>
                  {cat.name}
                </Option>
              ))}
            </Select>
          </Col>
        </Row>

        <Table
          rowKey="employerPostId"
          columns={columns}
          dataSource={paginatedJobs}
          loading={isLoading}
          onChange={handleTableChange}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: processedJobs.length,
            showSizeChanger: true,
          }}
        />

        <JobPostDetailModal
          jobPost={selectedJob}
          visible={isModalVisible}
          onClose={handleCloseModal}
        />

        <Modal
          title={
            <div className="flex items-center gap-2">
              <BulbOutlined style={{ color: "#faad14", fontSize: "20px" }} />
              <div>
                <div className="font-bold">Gợi ý phù hợp</div>
                <div className="text-xs text-gray-500 font-normal">
                  Dành cho tin: {currentJobTitle}
                </div>
              </div>
            </div>
          }
          open={isSuggestionModalVisible}
          onCancel={() => setIsSuggestionModalVisible(false)}
          footer={[
            <Button
              key="close"
              onClick={() => setIsSuggestionModalVisible(false)}
            >
              Đóng
            </Button>,
          ]}
          width={700}
          centered
        >
          <List
            loading={isSuggestionLoading}
            itemLayout="vertical"
            dataSource={suggestionList}
            renderItem={(item) => (
              <List.Item
                key={item.employerPostId}
                className="hover:bg-gray-50 transition-colors border-b last:border-0 p-4"
                extra={
                  <div className="flex flex-col items-center justify-center pl-4 border-l">
                    <Progress
                      type="circle"
                      percent={item.matchPercent}
                      width={60}
                      strokeColor={
                        item.matchPercent >= 80
                          ? "#52c41a"
                          : item.matchPercent >= 50
                          ? "#faad14"
                          : "#ff4d4f"
                      }
                      format={(percent) => (
                        <span className="text-sm font-bold">{percent}%</span>
                      )}
                    />
                    <span className="text-xs text-gray-500 mt-1">
                      Độ phù hợp
                    </span>
                  </div>
                }
              >
                <List.Item.Meta
                  avatar={
                    <Avatar
                      icon={<UserOutlined />}
                      style={{ backgroundColor: "#1890ff" }}
                    />
                  }
                  title={
                    <a
                      href="#"
                      className="text-base font-semibold text-blue-700 hover:underline"
                    >
                      {item.title}
                    </a>
                  }
                  description={
                    <div className="space-y-1 mt-1">
                      <div className="flex items-start gap-2 text-gray-600 text-sm">
                        <EnvironmentOutlined className="mt-1 shrink-0" />
                        <span>{item.location || "Chưa cập nhật địa điểm"}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600 text-sm">
                        <PhoneOutlined />
                        <span>
                          Liên hệ: <Text strong copyable>{item.phoneContact || "N/A"}</Text>
                        </span>
                      </div>
                      <div className="text-xs text-gray-400 mt-2">
                        Đăng bởi: {item.employerName} • {" "}
                        {item.createdAt
                          ? new Date(item.createdAt).toLocaleDateString("vi-VN")
                          : ""}
                      </div>
                    </div>
                  }
                />
              </List.Item>
            )}
          />
        </Modal>
      </div>
    </div>
  );
};

export default EmployerJobsPage;
