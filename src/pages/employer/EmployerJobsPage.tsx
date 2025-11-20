import React, { useState, useEffect, useMemo } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  Button,
  Select,
  Table,
  Tag,
  Space,
  Dropdown,
  message,
  Modal,
  Input,
  Row,
  Col,
  List,
  Progress,
  Avatar,
  Typography,
} from "antd";
import type { TableProps, TableColumnsType } from "antd";
import {
  PlusOutlined,
  MoreOutlined,
  SyncOutlined,
  MoneyCollectOutlined,
  AppstoreOutlined,
  BulbOutlined,
  EnvironmentOutlined,
  PhoneOutlined,
  UserOutlined,
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
      title: "Tr├¼nh D╞░ß╗úc Vi├¬n Tß║íi Tuy├¬n Quang [Thu Nhß║¡p Kh├┤ng Giß╗¢i Hß║ín] (Mß║½u)",
      location: "Ph╞░ß╗¥ng Minh Xu├ón, TP Tuy├¬n Quang, Tuy├¬n Quang",
      matchPercent: 97,
      phoneContact: "0326397621",
      employerName: "Hß╗ç thß╗æng (Gß╗úi ├╜ mß║½u)",
      createdAt: new Date().toISOString(),
    },
    {
      employerPostId: 9992,
      title: "Tr├¼nh D╞░ß╗úc Vi├¬n Tß║íi ─Éiß╗çn Bi├¬n (─Éi l├ám ngay) (Mß║½u)",
      location: "X├ú M╞░ß╗¥ng T├╣ng, Huyß╗çn M╞░ß╗¥ng Ch├á, ─Éiß╗çn Bi├¬n",
      matchPercent: 82,
      phoneContact: "0326845871",
      employerName: "Hß╗ç thß╗æng (Gß╗úi ├╜ mß║½u)",
      createdAt: new Date().toISOString(),
    },
    {
      employerPostId: 9993,
      title: "Nh├ón vi├¬n Kinh doanh D╞░ß╗úc phß║⌐m - Y├¬n B├íi (Mß║½u)",
      location: "X├ú L├óm Giang, Huyß╗çn V─ân Y├¬n, Y├¬n B├íi",
      matchPercent: 75,
      phoneContact: "0327865284",
      employerName: "Hß╗ç thß╗æng (Gß╗úi ├╜ mß║½u)",
      createdAt: new Date().toISOString(),
    },
  ],
};

const formatCurrency = (value: number | null | undefined) => {
  if (value == null || value <= 0) return "Thß╗Åa thuß║¡n";
  return `${value.toLocaleString("vi-VN")} vn─æ`;
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
        message.error("Kh├┤ng thß╗â tß║úi danh s├ích c├┤ng viß╗çc.");
      }
    } catch (err: any) {
      message.error(err.response?.data?.message || "Lß╗ùi khi tß║úi dß╗» liß╗çu.");
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
      console.error("Lß╗ùi tß║úi gß╗úi ├╜, sß╗¡ dß╗Ñng dß╗» liß╗çu mß║½u", error);
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
      title: "Bß║ín c├│ chß║»c muß╗æn x├│a b├ái ─æ─âng n├áy?",
      content: "H├ánh ─æß╗Öng n├áy kh├┤ng thß╗â ho├án t├íc.",
      okText: "X├íc nhß║¡n X├│a",
      okType: "danger",
      cancelText: "Hß╗ºy",
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
          message.error(err.response?.data?.message || "X├│a thß║Ñt bß║íi.");
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
      message.error("Kh├┤ng t├¼m thß║Ñy chi tiß║┐t c├┤ng viß╗çc.");
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
      title: "Trß║íng th├íi",
      dataIndex: "status",
      key: "status",
      sorter: true,
      render: (status: string) => (
        <>
          {status.toLowerCase() === "draft" && <Tag color="grey">Bß║óN Tß║áM</Tag>}
          {status.toLowerCase() === "active" && (
            <Tag color="green">─ÉANG ─É─éNG</Tag>
          )}
          {status.toLowerCase() === "expired" && <Tag color="red">Hß║╛T Hß║áN</Tag>}
          {!["draft", "active", "expired"].includes(status.toLowerCase()) && (
            <Tag>{status.toUpperCase()}</Tag>
          )}
        </>
      ),
    },
    {
      title: "C├┤ng viß╗çc",
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
            {record.location || "(Ch╞░a c├│ ─æß╗ïa ─æiß╗âm)"}
          </div>
          <div className="text-xs text-gray-500">
            Cß║¡p nhß║¡t: {new Date(record.createdAt).toLocaleDateString("vi-VN")}
          </div>
        </div>
      ),
    },
    {
      title: "Ng├ánh nghß╗ü",
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
      title: "L╞░╞íng",
      dataIndex: "salary",
      key: "salary",
      sorter: true,
      render: (salary) => (
        <Space>
          <MoneyCollectOutlined />
          {salary === 0 ? "Thoß║ú thuß║¡n" : formatCurrency(salary)}
        </Space>
      ),
    },
    {
      title: "H├ánh ─æß╗Öng",
      key: "action",
      render: (_, record) => (
        <Space size="small">
          <Button
            icon={<BulbOutlined />}
            size="small"
            className="text-yellow-600 border-yellow-500 hover:!text-yellow-700 hover:!border-yellow-700"
            onClick={() =>
              handleShowSuggestions(record.employerPostId, record.title)
            }
          >
            Gß╗úi ├╜
          </Button>
          <Button
            type="link"
            size="small"
            className="!px-0"
            onClick={() => handleEdit(record.employerPostId)}
          >
            Sß╗¡a
          </Button>
          <Dropdown
            menu={{
              items: [
                {
                  key: "1",
                  label: "Xem ß╗⌐ng vi├¬n (Shortlist)",
                  onClick: () =>
                    navigate(
                      `/nha-tuyen-dung/ung-vien/${record.employerPostId}`
                    ),
                },
                {
                  key: "saved",
                  label: "─É├ú l╞░u (Saved)",
                  onClick: () =>
                    navigate(
                      `/nha-tuyen-dung/da-luu/${record.employerPostId}`
                    ),
                },
                {
                  key: "3",
                  label: "X├│a",
                  danger: true,
                  onClick: () => handleDelete(record.employerPostId),
                },
              ],
            }}
            trigger={["click"]}
          >
            <Button type="text" icon={<MoreOutlined />} />
          </Dropdown>
        </Space>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">
          C├┤ng viß╗çc cß╗ºa t├┤i ({allJobs.length})
        </h1>
        <div className="flex gap-2">
          <Button
            type="default"
            icon={<SyncOutlined />}
            size="large"
            onClick={handleRefresh}
            loading={isLoading}
          >
            L├ám mß╗¢i
          </Button>
          <NavLink to="/nha-tuyen-dung/dang-tin">
            <Button type="primary" icon={<PlusOutlined />} size="large">
              ─É─âng c├┤ng viß╗çc mß╗¢i
            </Button>
          </NavLink>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 space-y-5">
        <Row gutter={[16, 16]}>
          <Col xs={24} md={12} lg={8}>
            <Search
              placeholder="T├¼m kiß║┐m theo ti├¬u ─æß╗ü c├┤ng viß╗çc..."
              onSearch={handleSearch}
              onChange={(e) => handleSearch(e.target.value)}
              enterButton
              allowClear
              loading={isLoading}
            />
          </Col>
          <Col xs={24} md={12} lg={6}>
            <Select
              placeholder="Lß╗ìc theo ng├ánh nghß╗ü"
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
                <div className="font-bold">Gß╗úi ├╜ ph├╣ hß╗úp</div>
                <div className="text-xs text-gray-500 font-normal">
                  D├ánh cho tin: {currentJobTitle}
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
              ─É├│ng
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
                      ─Éß╗Ö ph├╣ hß╗úp
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
                        <span>{item.location || "Ch╞░a cß║¡p nhß║¡t ─æß╗ïa ─æiß╗âm"}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600 text-sm">
                        <PhoneOutlined />
                        <span>
                          Li├¬n hß╗ç:{" "}
                          <Text strong copyable>
                            {item.phoneContact || "N/A"}
                          </Text>
                        </span>
                      </div>
                      <div className="text-xs text-gray-400 mt-2">
                        ─É─âng bß╗ƒi: {item.employerName} ΓÇó{" "}
                        {item.createdAt ? new Date(item.createdAt).toLocaleDateString("vi-VN") : ""}
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
