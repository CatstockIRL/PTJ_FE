import React, { useCallback, useEffect, useState } from "react";
import {
  Card,
  Typography,
  Table,
  Tag,
  Space,
  Button,
  Input,
  Select,
  message,
  Drawer,
  Modal,
  Form,
} from "antd";
import type { ColumnsType, TablePaginationConfig } from "antd/es/table";
import {
  ReloadOutlined,
  SearchOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import adminEmployerRegistrationService from "../../../services/adminEmployerRegistrationService";
import type {
  EmployerRegistrationRequest,
  EmployerRegistrationDetail,
} from "../../../types/adminEmployerRegistration";

const { Option } = Select;
const { TextArea } = Input;

type FilterState = {
  status: string;
  keyword: string;
};

const statusOptions = [
  { label: "Tất cả trạng thái", value: "all" },
  { label: "Chờ duyệt", value: "Pending" },
  { label: "Đã duyệt", value: "Approved" },
  { label: "Đã từ chối", value: "Rejected" },
];

const DetailFieldBox: React.FC<{ label: string; value?: React.ReactNode }> = ({
  label,
  value,
}) => (
  <div className="flex flex-col gap-1">
    <span className="text-sm font-semibold text-gray-600">{label}</span>
    <div className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-800 min-h-[42px] flex items-center">
      {value ?? <span className="text-gray-400 italic">Chưa cập nhật</span>}
    </div>
  </div>
);

const EmployerRegistrationManagement: React.FC = () => {
  const [requests, setRequests] = useState<EmployerRegistrationRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    status: "all",
    keyword: "",
  });
  const [pagination, setPagination] = useState<TablePaginationConfig>({
    current: 1,
    pageSize: 10,
    total: 0,
    showSizeChanger: true,
  });

  // Detail drawer states
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [selectedRequest, setSelectedRequest] =
    useState<EmployerRegistrationDetail | null>(null);

  // Reject modal states
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectForm] = Form.useForm();
  const [actionLoading, setActionLoading] = useState(false);

  const fetchRequests = useCallback(
    async (
      page = pagination.current ?? 1,
      pageSize = pagination.pageSize ?? 10
    ) => {
      setLoading(true);
      try {
        const response = await adminEmployerRegistrationService.getRequests({
          status: filters.status !== "all" ? filters.status : undefined,
          keyword: filters.keyword.trim() || undefined,
          page,
          pageSize,
        });
        setRequests(response.data);
        setPagination((prev) => ({
          ...prev,
          current: page,
          pageSize,
          total: response.totalRecords,
        }));
      } catch (error) {
        console.error("Failed to load employer registrations", error);
        message.error("Không thể tải danh sách hồ sơ đăng ký");
      } finally {
        setLoading(false);
      }
    },
    [filters, pagination.current, pagination.pageSize]
  );

  useEffect(() => {
    void fetchRequests();
  }, [fetchRequests]);

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPagination((prev) => ({ ...prev, current: 1 }));
  };

  const handleTableChange = (newPagination: TablePaginationConfig) => {
    setPagination((prev) => ({
      ...prev,
      current: newPagination.current,
      pageSize: newPagination.pageSize,
    }));
  };

  const openDetail = async (requestId: number) => {
    setDetailOpen(true);
    setDetailLoading(true);
    try {
      const detail = await adminEmployerRegistrationService.getDetail(
        requestId
      );
      setSelectedRequest(detail);
    } catch (error) {
      console.error("Failed to fetch request detail", error);
      message.error("Không thể tải chi tiết hồ sơ");
      setDetailOpen(false);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleApprove = async (requestId: number) => {
    Modal.confirm({
      title: "Xác nhận phê duyệt",
      content: "Bạn có chắc chắn muốn phê duyệt hồ sơ này?",
      okText: "Phê duyệt",
      cancelText: "Hủy",
      onOk: async () => {
        setActionLoading(true);
        try {
          await adminEmployerRegistrationService.approve(requestId);
          message.success("Đã phê duyệt hồ sơ thành công");
          await fetchRequests();
          if (selectedRequest?.requestId === requestId) {
            const detail = await adminEmployerRegistrationService.getDetail(
              requestId
            );
            setSelectedRequest(detail);
          }
        } catch (error: any) {
          console.error("Failed to approve request", error);
          message.error(
            error?.response?.data?.message || "Không thể phê duyệt hồ sơ"
          );
        } finally {
          setActionLoading(false);
        }
      },
    });
  };

  const handleReject = (requestId: number) => {
    setRejectModalOpen(true);
    rejectForm.setFieldsValue({ requestId });
  };

  const handleRejectSubmit = async () => {
    try {
      const values = await rejectForm.validateFields();
      setActionLoading(true);
      await adminEmployerRegistrationService.reject(values.requestId, {
        reason: values.reason,
      });
      message.success("Đã từ chối hồ sơ");
      setRejectModalOpen(false);
      rejectForm.resetFields();
      await fetchRequests();
      if (selectedRequest?.requestId === values.requestId) {
        const detail = await adminEmployerRegistrationService.getDetail(
          values.requestId
        );
        setSelectedRequest(detail);
      }
    } catch (error: any) {
      if (error?.errorFields) return; // Validation error
      console.error("Failed to reject request", error);
      message.error(
        error?.response?.data?.message || "Không thể từ chối hồ sơ"
      );
    } finally {
      setActionLoading(false);
    }
  };

  const columns: ColumnsType<EmployerRegistrationRequest> = [
    {
      title: "Tên công ty",
      dataIndex: "companyName",
      key: "companyName",
      render: (text, record) => (
        <Button
          type="link"
          onClick={() => openDetail(record.requestId)}
          className="p-0"
        >
          {text}
        </Button>
      ),
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Số điện thoại",
      dataIndex: "contactPhone",
      key: "contactPhone",
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (value: string) => {
        const colorMap: Record<string, string> = {
          Pending: "orange",
          Approved: "green",
          Rejected: "red",
        };
        const labelMap: Record<string, string> = {
          Pending: "Chờ duyệt",
          Approved: "Đã duyệt",
          Rejected: "Đã từ chối",
        };
        return <Tag color={colorMap[value]}>{labelMap[value] || value}</Tag>;
      },
      width: 130,
    },
    {
      title: "Ngày đăng ký",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (value: string) =>
        new Date(value).toLocaleString("vi-VN", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
      width: 180,
    },
    {
      title: "Hành động",
      key: "actions",
      fixed: "right",
      width: 200,
      render: (_, record) => (
        <Space>
          <Button
            icon={<EyeOutlined />}
            size="small"
            onClick={() => openDetail(record.requestId)}
          >
            Chi tiết
          </Button>
          {record.status === "Pending" && (
            <>
              <Button
                icon={<CheckCircleOutlined />}
                size="small"
                type="primary"
                onClick={() => handleApprove(record.requestId)}
                loading={actionLoading}
              >
                Duyệt
              </Button>
              <Button
                icon={<CloseCircleOutlined />}
                size="small"
                danger
                onClick={() => handleReject(record.requestId)}
                loading={actionLoading}
              >
                Từ chối
              </Button>
            </>
          )}
        </Space>
      ),
    },
  ];

  return (
    <>
      <Card
        bordered={false}
        className="shadow-sm mb-4 border-0 bg-white/90 backdrop-blur-lg"
        styles={{ body: { padding: 20 } }}
      >
        <Space direction="vertical" size="middle" className="w-full">
          <Input
            prefix={<SearchOutlined />}
            placeholder="Tìm theo tên công ty, email..."
            allowClear
            value={filters.keyword}
            onChange={(e) => handleFilterChange("keyword", e.target.value)}
          />
          <Space size="middle" wrap>
            <Select
              value={filters.status}
              onChange={(value) => handleFilterChange("status", value)}
              style={{ minWidth: 200 }}
            >
              {statusOptions.map((option) => (
                <Option key={option.value} value={option.value}>
                  {option.label}
                </Option>
              ))}
            </Select>
            <Button
              icon={<ReloadOutlined />}
              onClick={() => fetchRequests()}
              loading={loading}
            >
              Tải lại
            </Button>
          </Space>
        </Space>
      </Card>

      <Card bordered={false} className="shadow-sm">
        <Table
          rowKey="requestId"
          loading={loading}
          dataSource={requests}
          columns={columns}
          pagination={pagination}
          scroll={{ x: 1000 }}
          onChange={handleTableChange}
        />
      </Card>

      {/* Detail Drawer */}
      <Drawer
        title="Chi tiết hồ sơ đăng ký"
        placement="right"
        width={640}
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
      >
        {detailLoading ? (
          <p>Đang tải...</p>
        ) : selectedRequest ? (
          <Space direction="vertical" size="large" className="w-full">
            <div className="grid grid-cols-1 gap-4">
              <DetailFieldBox
                label="Tên công ty"
                value={selectedRequest.companyName}
              />
              <DetailFieldBox label="Email" value={selectedRequest.email} />
              <DetailFieldBox
                label="Username"
                value={selectedRequest.username}
              />
              <DetailFieldBox
                label="Số điện thoại"
                value={selectedRequest.contactPhone}
              />
              <DetailFieldBox
                label="Email liên hệ"
                value={selectedRequest.contactEmail}
              />
              <DetailFieldBox
                label="Người liên hệ"
                value={selectedRequest.contactPerson}
              />
              <DetailFieldBox label="Website" value={selectedRequest.website} />
              <DetailFieldBox label="Địa chỉ" value={selectedRequest.address} />
              <DetailFieldBox
                label="Mô tả công ty"
                value={selectedRequest.companyDescription}
              />
              <DetailFieldBox
                label="Trạng thái"
                value={
                  <Tag
                    color={
                      selectedRequest.status === "Pending"
                        ? "orange"
                        : selectedRequest.status === "Approved"
                        ? "green"
                        : "red"
                    }
                  >
                    {selectedRequest.status === "Pending"
                      ? "Chờ duyệt"
                      : selectedRequest.status === "Approved"
                      ? "Đã duyệt"
                      : "Đã từ chối"}
                  </Tag>
                }
              />
              {selectedRequest.adminNote && (
                <DetailFieldBox
                  label="Ghi chú của Admin"
                  value={selectedRequest.adminNote}
                />
              )}
              <DetailFieldBox
                label="Ngày đăng ký"
                value={new Date(selectedRequest.createdAt).toLocaleString(
                  "vi-VN"
                )}
              />
              {selectedRequest.reviewedAt && (
                <DetailFieldBox
                  label="Ngày xét duyệt"
                  value={new Date(selectedRequest.reviewedAt).toLocaleString(
                    "vi-VN"
                  )}
                />
              )}
            </div>

            {selectedRequest.status === "Pending" && (
              <Space className="w-full justify-end">
                <Button
                  type="primary"
                  icon={<CheckCircleOutlined />}
                  onClick={() => handleApprove(selectedRequest.requestId)}
                  loading={actionLoading}
                >
                  Phê duyệt
                </Button>
                <Button
                  danger
                  icon={<CloseCircleOutlined />}
                  onClick={() => handleReject(selectedRequest.requestId)}
                  loading={actionLoading}
                >
                  Từ chối
                </Button>
              </Space>
            )}
          </Space>
        ) : (
          <p>Không có dữ liệu.</p>
        )}
      </Drawer>

      {/* Reject Modal */}
      <Modal
        title="Từ chối hồ sơ"
        open={rejectModalOpen}
        onOk={handleRejectSubmit}
        onCancel={() => {
          setRejectModalOpen(false);
          rejectForm.resetFields();
        }}
        confirmLoading={actionLoading}
        okText="Xác nhận từ chối"
        cancelText="Hủy"
      >
        <Form form={rejectForm} layout="vertical">
          <Form.Item name="requestId" hidden>
            <Input />
          </Form.Item>
          <Form.Item
            name="reason"
            label="Lý do từ chối"
            rules={[
              { required: true, message: "Vui lòng nhập lý do từ chối" },
              { max: 2000, message: "Lý do không được vượt quá 2000 ký tự" },
            ]}
          >
            <TextArea
              rows={4}
              placeholder="Nhập lý do từ chối hồ sơ..."
              maxLength={2000}
              showCount
            />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default EmployerRegistrationManagement;
