import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Table,
  message,
  Typography,
  Tag,
  Button,
  Tooltip,
  Modal,
  Input,
  Tabs,
  Dropdown,
  Spin,
  Empty,
} from "antd";
import {
  ArrowLeftOutlined,
  HeartOutlined,
  HeartFilled,
  CheckCircleOutlined,
  CloseCircleOutlined,
  DeleteOutlined,
  StarOutlined,
  DownOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import type { TableColumnsType } from "antd";
import { jobApplicationService } from "../jobApplicationService";
import { jobSeekerPostService } from "../../candidate/services";
import jobSeekerCvService from "../../jobSeekerCv/services";
import { useAuth } from "../../auth/hooks";
import type { JobApplicationResultDto } from "../../applyJob-jobSeeker/type";
import type { ShortlistedCandidateDto } from "../../candidate/type";
import type { JobSeekerCv } from "../../jobSeekerCv/types";
import RatingModal from "../../../components/RatingModal";
import reportService from "../../report/reportService";
import type { PostReportType } from "../../report/types";

const { Title } = Typography;
const { TextArea } = Input;

type StatusAction = "Accepted" | "Rejected" | "Interviewing";

const STATUS_LABELS: Record<
  StatusAction,
  { label: string; className: string; successMessage: string; modalTitle: string }
> = {
  Accepted: {
    label: "Đã duyệt",
    className: "text-green-600 ml-1",
    successMessage: "Đã duyệt hồ sơ.",
    modalTitle: "Duyệt hồ sơ",
  },
  Rejected: {
    label: "Đã từ chối",
    className: "text-red-600 ml-1",
    successMessage: "Đã từ chối hồ sơ.",
    modalTitle: "Từ chối hồ sơ",
  },
  Interviewing: {
    label: "Chờ phỏng vấn",
    className: "text-blue-600 ml-1",
    successMessage: "Đã chuyển sang trạng thái chờ phỏng vấn.",
    modalTitle: "Chuyển sang chờ phỏng vấn",
  },
};

const APPROVAL_OPTIONS: { key: StatusAction; label: string; icon: React.ReactNode }[] =
  [
    {
      key: "Accepted",
      label: "Duyệt hồ sơ",
      icon: <CheckCircleOutlined style={{ color: "#16a34a" }} />,
    },
    {
      key: "Rejected",
      label: "Từ chối hồ sơ",
      icon: <CloseCircleOutlined style={{ color: "#dc2626" }} />,
    },
    {
      key: "Interviewing",
      label: "Chờ phỏng vấn",
      icon: <StarOutlined style={{ color: "#2563eb" }} />,
    },
  ];

const CandidateListPage: React.FC = () => {
  const navigate = useNavigate();
  const { employerPostId } = useParams<{ employerPostId: string }>();
  const { user } = useAuth();

  const [applications, setApplications] = useState<JobApplicationResultDto[]>([]);
  const [savedList, setSavedList] = useState<ShortlistedCandidateDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [postTitle, setPostTitle] = useState("");

  const [statusModal, setStatusModal] = useState({
    visible: false,
    id: 0,
    currentNote: "",
    targetStatus: "Accepted" as StatusAction,
    newNote: "",
  });

  const [cvModal, setCvModal] = useState<{
    visible: boolean;
    loading: boolean;
    cv: JobSeekerCv | null;
    error: string | null;
  }>({
    visible: false,
    loading: false,
    cv: null,
    error: null,
  });

  const [ratingModal, setRatingModal] = useState<{
    visible: boolean;
    rateeId: number;
    submissionId: number;
    rateeName: string;
  }>({
    visible: false,
    rateeId: 0,
    submissionId: 0,
    rateeName: "",
  });

  const [reportModal, setReportModal] = useState<{
    visible: boolean;
    postId: number | null;
    subjectName: string;
    reason: string;
    submitting: boolean;
    postType: PostReportType;
  }>({
    visible: false,
    postId: null,
    subjectName: "",
    reason: "",
    submitting: false,
    postType: "JobSeekerPost",
  });

  // ⭐ NEW: modal hiển thị đầy đủ mô tả / ghi chú
  const [descriptionModal, setDescriptionModal] = useState<{
    visible: boolean;
    title: string;
    content: string;
  }>({
    visible: false,
    title: "",
    content: "",
  });

  const savedIdSet = new Set(savedList.map((s) => s.jobSeekerId));

  const getCvIdFromRecord = (
    record: Partial<JobApplicationResultDto & ShortlistedCandidateDto>
  ): number | null => {
    return record.cvId ?? record.selectedCvId ?? (record as any)?.cvid ?? null;
  };

  const getSkillTags = (skills?: string | null) => {
    if (!skills) return [];
    return skills
      .split(/[,;\n]/)
      .map((skill) => skill.trim())
      .filter(Boolean);
  };

  const formatDateOnly = (value?: string | null) => {
    if (!value) return "Chưa cập nhật";
    try {
      return new Date(value).toLocaleDateString("vi-VN");
    } catch {
      return value;
    }
  };

  const handleViewCv = useCallback(async (cvId?: number | null) => {
    if (!cvId) {
      message.info("Ứng viên này chưa đính kèm CV.");
      return;
    }
    setCvModal({ visible: true, loading: true, cv: null, error: null });
    try {
      const cv = await jobSeekerCvService.fetchCvForEmployer(cvId);
      setCvModal({ visible: true, loading: false, cv, error: null });
    } catch {
      setCvModal({
        visible: true,
        loading: false,
        cv: null,
        error: "Không thể tải CV. Vui lòng thử lại sau.",
      });
    }
  }, []);

  const openReportModal = (
    postId: number | undefined | null,
    subjectName: string
  ) => {
    if (!postId) {
      message.warning("Ứng viên chưa có bài đăng để báo cáo.");
      return;
    }
    setReportModal({
      visible: true,
      postId,
      subjectName,
      reason: "",
      submitting: false,
      postType: "JobSeekerPost",
    });
  };

  const handleSubmitReport = async () => {
    if (!reportModal.postId) {
      return;
    }
    const reason = reportModal.reason.trim();
    if (!reason) {
      message.warning("Vui lòng nhập lý do báo cáo.");
      return;
    }
    setReportModal((prev) => ({ ...prev, submitting: true }));
    try {
      await reportService.reportPost({
        postId: reportModal.postId,
        postType: reportModal.postType,
        reason,
      });
      message.success("Đã gửi báo cáo tới quản trị viên.");
      setReportModal({
        visible: false,
        postId: null,
        subjectName: "",
        reason: "",
        submitting: false,
        postType: "JobSeekerPost",
      });
    } catch (error: any) {
      message.error(
        error?.response?.data?.message ||
          "Gửi báo cáo thất bại. Vui lòng thử lại."
      );
      setReportModal((prev) => ({ ...prev, submitting: false }));
    }
  };

  useEffect(() => {
    if (!employerPostId) {
      message.error("Không tìm thấy ID bài đăng.");
      setIsLoading(false);
      return;
    }
    const postId = parseInt(employerPostId, 10);
    fetchAll(postId);
  }, [employerPostId]);

  const fetchAll = async (postId: number) => {
    setIsLoading(true);
    try {
      const [applicationsRes, savedRes] = await Promise.all([
        jobApplicationService.getApplicationsByPost(postId),
        jobSeekerPostService.getShortlistedCandidates(postId),
      ]);

      if (applicationsRes.success) {
        setApplications(applicationsRes.data);
        const titleFromApplicants =
          (applicationsRes.data[0] as any)?.postTitle || "";
        setPostTitle(titleFromApplicants);
      } else {
        message.error("Tải danh sách ứng viên thất bại.");
      }

      if (savedRes.success) {
        setSavedList(savedRes.data);
        const fallbackTitle = (savedRes.data[0] as any)?.postTitle || "";
        if (!postTitle && fallbackTitle) {
          setPostTitle(fallbackTitle);
        }
      }
    } catch (err: any) {
      message.error(err?.response?.data?.message || "Lỗi khi tải dữ liệu.");
    }
    setIsLoading(false);
  };

  const handleToggleSave = async (record: JobApplicationResultDto) => {
    if (!user || !employerPostId) {
      message.warning("Vui lòng đăng nhập để thao tác.");
      return;
    }
    const postId = parseInt(employerPostId, 10);
    const dto = {
      employerId: user.id,
      jobSeekerId: record.jobSeekerId,
      employerPostId: postId,
    };
    const isSaved = savedIdSet.has(record.jobSeekerId);
    try {
      if (isSaved) {
        const res = await jobSeekerPostService.unsaveCandidate(dto);
        if (res?.success || res) {
          message.success("Đã bỏ lưu ứng viên.");
          setSavedList((prev) =>
            prev.filter((s) => s.jobSeekerId !== record.jobSeekerId)
          );
        }
      } else {
        const res = await jobSeekerPostService.saveCandidate(dto);
        if (res?.success || res) {
          message.success("Đã lưu hồ sơ ứng viên.");
          setSavedList((prev) => [
            ...prev,
            {
              jobSeekerId: record.jobSeekerId,
              jobSeekerName: record.username,
              addedAt: new Date().toISOString(),
              note: record.notes,
              postTitle: postTitle,
            } as ShortlistedCandidateDto,
          ]);
        }
      }
    } catch (err) {
      message.error("Thao tác thất bại.");
    }
  };

  const openStatusModal = (
    record: JobApplicationResultDto,
    status: StatusAction
  ) => {
    setStatusModal({
      visible: true,
      id: record.candidateListId,
      currentNote: record.notes || "",
      targetStatus: status,
      newNote: "",
    });
  };

  const handleSubmitStatus = async () => {
    const { id, targetStatus, newNote, currentNote } = statusModal;
    if (!id) return;
    const finalNote = newNote.trim() !== "" ? newNote : currentNote;
    try {
      const res = await jobApplicationService.updateStatus(
        id,
        targetStatus,
        finalNote
      );
      if (res.success) {
        message.success(STATUS_LABELS[targetStatus].successMessage);
        setStatusModal({ ...statusModal, visible: false });
        if (employerPostId) fetchAll(parseInt(employerPostId, 10));
      } else {
        message.error(res.message || "Cập nhật trạng thái thất bại.");
      }
    } catch (err) {
      message.error("Lỗi hệ thống.");
    }
  };

  const renderStatusTag = (status?: string) => {
    const s = status?.toLowerCase();
    if (s === "accepted") return <Tag color="success">Đã duyệt</Tag>;
    if (s === "rejected") return <Tag color="error">Đã từ chối</Tag>;
    if (s === "interviewing") return <Tag color="blue">Chờ phỏng vấn</Tag>;
    if (s === "pending") return <Tag color="processing">Chờ duyệt</Tag>;
    return <Tag>Chưa xem</Tag>;
  };

  // ⭐ Helper cắt bớt mô tả/ghi chú + nút Xem thêm
  const renderClampedText = (
    text: string | undefined | null,
    titleForModal: string
  ) => {
    const content = (text || "").trim();
    if (!content) {
      return <span className="text-gray-400 italic text-xs">Không có</span>;
    }

    const MAX_LEN = 60;
    const isLong = content.length > MAX_LEN;
    const display = isLong ? `${content.slice(0, MAX_LEN)}...` : content;

    return (
      <div
        className="flex items-center gap-1 max-w-xs"
        style={{ wordBreak: "break-word" }}
      >
        <span className="text-gray-500 italic text-xs">{display}</span>
        {isLong && (
          <Button
            type="link"
            size="small"
            onClick={() =>
              setDescriptionModal({
                visible: true,
                title: titleForModal,
                content: content,
              })
            }
          >
            Xem thêm
          </Button>
        )}
      </div>
    );
  };

  const applicantColumns: TableColumnsType<JobApplicationResultDto> = [
    {
      title: "",
      key: "save",
      width: 50,
      fixed: "left",
      align: "center",
      render: (_, record) => {
        const isSaved = savedIdSet.has(record.jobSeekerId);
        return (
          <Tooltip title={isSaved ? "Bỏ lưu" : "Lưu hồ sơ"}>
            <Button
              type="text"
              shape="circle"
              icon={
                isSaved ? (
                  <HeartFilled style={{ color: "hotpink", fontSize: 18 }} />
                ) : (
                  <HeartOutlined style={{ color: "gray", fontSize: 18 }} />
                )
              }
              onClick={() => handleToggleSave(record)}
            />
          </Tooltip>
        );
      },
    },
    {
      title: "Tên ứng viên",
      dataIndex: "username",
      key: "username",
      width: 220,
      fixed: "left",
      render: (text: string, record) => {
        const canReport = Boolean(record.jobSeekerPostId);
        return (
          <div className="flex items-center gap-2">
            <div className="min-w-0">
              <div className="font-medium truncate max-w-[180px]">
                {text}
              </div>
              <div className="text-xs text-gray-500 truncate max-w-[180px]">
                {record.username}
              </div>
            </div>
            <Tooltip
              title={
                canReport
                  ? "Báo cáo bài đăng của ứng viên"
                  : "Ứng viên chưa có bài đăng để báo cáo"
              }
            >
              <Button
                type="text"
                shape="circle"
                icon={
                  <ExclamationCircleOutlined
                    style={{
                      color: canReport ? "#dc2626" : "#d1d5db",
                      fontSize: 18,
                    }}
                  />
                }
                onClick={() =>
                  canReport &&
                  openReportModal(record.jobSeekerPostId, record.username || "")
                }
                disabled={!canReport}
                aria-label="Báo cáo ứng viên"
              />
            </Tooltip>
          </div>
        );
      },
    },
    {
      title: "Ngày nộp",
      dataIndex: "applicationDate",
      key: "applicationDate",
      width: 110,
      render: (date: string) =>
        date ? new Date(date).toLocaleDateString("vi-VN") : "-",
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: renderStatusTag,
    },
    {
      title: "Ghi chú",
      dataIndex: "notes",
      key: "notes",
      width: 260,
      // ⭐ dùng renderer cắt bớt + Xem thêm
      render: (text, record) =>
        renderClampedText(text, `Ghi chú - ${record.username || "Ứng viên"}`),
    },
    {
      title: "Xét duyệt",
      key: "approval",
      width: 150,
      render: (_, record) => {
        return (
          <Dropdown
            trigger={["click"]}
            menu={{
              items: APPROVAL_OPTIONS.map((option) => ({
                key: option.key,
                label: (
                  <span className="flex items-center gap-2">
                    {option.icon}
                    {option.label}
                  </span>
                ),
                disabled:
                  record.status?.toLowerCase() === option.key.toLowerCase(),
              })),
              onClick: ({ key }) =>
                openStatusModal(record, key as StatusAction),
            }}
          >
            <Button
              size="small"
              type="default"
              className="flex items-center gap-1"
            >
              <span>Chọn trạng thái</span>
              <DownOutlined />
            </Button>
          </Dropdown>
        );
      },
    },
    {
      title: "Đánh giá",
      key: "rating",
      width: 90,
      render: (_, record) => {
        const currentStatus = record.status?.toLowerCase();
        if (currentStatus !== "accepted" && currentStatus !== "completed") {
          return null;
        }
        return (
          <Tooltip title="Đánh giá ứng viên">
            <Button
              type="text"
              icon={
                <StarOutlined style={{ color: "#faad14", fontSize: 18 }} />
              }
              onClick={() =>
                setRatingModal({
                  visible: true,
                  rateeId: record.jobSeekerId,
                  submissionId: record.candidateListId,
                  rateeName: record.username || "",
                })
              }
            />
          </Tooltip>
        );
      },
    },
    {
      title: "CV",
      key: "profile",
      width: 80,
      fixed: "right",
      render: (_, record) => (
        <Button
          type="link"
          onClick={() => handleViewCv(getCvIdFromRecord(record))}
        >
          Xem CV
        </Button>
      ),
    },
  ];

  const savedColumns: TableColumnsType<ShortlistedCandidateDto> = [
    {
      title: "",
      key: "delete",
      width: 50,
      fixed: "left",
      align: "center",
      render: (_, record) => (
        <Tooltip title="Bỏ lưu">
          <Button
            type="text"
            danger
            shape="circle"
            icon={<DeleteOutlined />}
            onClick={async () => {
              if (!user || !employerPostId) return;
              try {
                await jobSeekerPostService.unsaveCandidate({
                  employerId: user.id,
                  jobSeekerId: record.jobSeekerId,
                  employerPostId: parseInt(employerPostId, 10),
                });
                message.success("Đã bỏ lưu.");
                setSavedList((prev) =>
                  prev.filter((s) => s.jobSeekerId !== record.jobSeekerId)
                );
              } catch {
                message.error("Không thể bỏ lưu.");
              }
            }}
          />
        </Tooltip>
      ),
    },
    {
      title: "Ứng viên",
      dataIndex: "jobSeekerName",
      key: "jobSeekerName",
      width: 220,
      render: (text, record) => {
        const canReport = Boolean(record.jobSeekerPostId);
        return (
          <div className="flex items-center gap-2">
            <div className="min-w-0">
              <div className="font-medium truncate max-w-[180px]">
                {text}
              </div>
              <div className="text-xs text-gray-500 truncate max-w-[180px]">
                {record.jobSeekerName}
              </div>
            </div>
            <Tooltip
              title={
                canReport
                  ? "Báo cáo bài đăng của ứng viên"
                  : "Ứng viên chưa có bài đăng để báo cáo"
              }
            >
              <Button
                type="text"
                shape="circle"
                icon={
                  <ExclamationCircleOutlined
                    style={{
                      color: canReport ? "#dc2626" : "#d1d5db",
                      fontSize: 18,
                    }}
                  />
                }
                onClick={() =>
                  canReport &&
                  openReportModal(
                    record.jobSeekerPostId,
                    record.jobSeekerName || "Ứng viên"
                  )
                }
                disabled={!canReport}
                aria-label="Báo cáo ứng viên"
              />
            </Tooltip>
          </div>
        );
      },
    },
    {
      title: "Ghi chú",
      dataIndex: "note",
      key: "note",
      width: 260,
      render: (text, record) =>
        renderClampedText(text, `Ghi chú đã lưu - ${record.jobSeekerName}`),
    },
    {
      title: "Ngày lưu",
      dataIndex: "addedAt",
      key: "addedAt",
      width: 110,
      render: (date: string) =>
        date ? new Date(date).toLocaleDateString("vi-VN") : "-",
    },
    {
      title: "CV",
      key: "profile",
      width: 80,
      fixed: "right",
      render: (_, record) => (
        <Button
          type="link"
          onClick={() => handleViewCv(getCvIdFromRecord(record))}
        >
          Xem CV
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <Title level={2} className="mb-0">
            Danh sách ứng viên
          </Title>
          {postTitle && (
            <div className="text-gray-500 mt-1">
              Tin tuyển dụng: {postTitle}
            </div>
          )}
        </div>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}>
          Quay lại
        </Button>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <Tabs
          items={[
            {
              key: "applicants",
              label: `Ứng viên (${applications.length})`,
              children: (
                <div className="overflow-x-auto">
                  <Table
                    rowKey="candidateListId"
                    dataSource={applications}
                    columns={applicantColumns}
                    loading={isLoading}
                    pagination={{ pageSize: 10 }}
                    tableLayout="fixed"
                    scroll={{ x: 1100 }} // ⭐ đủ để không tràn viền, có thanh scroll ngang nếu thiếu
                  />
                </div>
              ),
            },
            {
              key: "saved",
              label: `Đã lưu (${savedList.length})`,
              children: (
                <div className="overflow-x-auto">
                  <Table
                    rowKey={(record) =>
                      `${record.jobSeekerId}-${record.addedAt}`
                    }
                    dataSource={savedList}
                    columns={savedColumns}
                    loading={isLoading}
                    pagination={{ pageSize: 10 }}
                    tableLayout="fixed"
                    scroll={{ x: 900 }}
                  />
                </div>
              ),
            },
          ]}
        />
      </div>

      {/* Modal đổi trạng thái */}
      <Modal
        title={STATUS_LABELS[statusModal.targetStatus].modalTitle}
        open={statusModal.visible}
        onOk={handleSubmitStatus}
        onCancel={() => setStatusModal({ ...statusModal, visible: false })}
        okText="Xác nhận"
        cancelText="Hủy"
        okButtonProps={{ danger: statusModal.targetStatus === "Rejected" }}
      >
        <div className="space-y-4">
          <p>
            Bạn xác nhận chuyển trạng thái sang
            <strong className={STATUS_LABELS[statusModal.targetStatus].className}>
              {STATUS_LABELS[statusModal.targetStatus].label}
            </strong>
            ?
          </p>

          {statusModal.currentNote && (
            <div className="bg-gray-50 p-2 rounded text-sm text-gray-600 border">
              <strong>Ghi chú hiện tại:</strong> {statusModal.currentNote}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ghi chú mới (để trống sẽ giữ nguyên ghi chú cũ):
            </label>
            <TextArea
              rows={3}
              placeholder="Nhập ghi chú..."
              value={statusModal.newNote}
              onChange={(e) =>
                setStatusModal({ ...statusModal, newNote: e.target.value })
              }
            />
          </div>
        </div>
      </Modal>

      {/* Modal CV */}
      <Modal
        title={cvModal.cv?.cvTitle || "CV ứng viên"}
        open={cvModal.visible}
        footer={null}
        onCancel={() =>
          setCvModal({ visible: false, loading: false, cv: null, error: null })
        }
        width={800}
      >
        {cvModal.loading ? (
          <div className="flex justify-center py-10">
            <Spin tip="Đang tải CV..." />
          </div>
        ) : cvModal.error ? (
          <p className="text-red-500">{cvModal.error}</p>
        ) : cvModal.cv ? (
          <div className="space-y-4">
            {/* ... phần CV giữ nguyên ... */}
          </div>
        ) : (
          <Empty description="Không có dữ liệu CV." />
        )}
      </Modal>

      {/* Modal xem đầy đủ mô tả / ghi chú */}
      <Modal
        title={descriptionModal.title || "Chi tiết"}
        open={descriptionModal.visible}
        footer={null}
        onCancel={() =>
          setDescriptionModal({ visible: false, title: "", content: "" })
        }
      >
        <p style={{ whiteSpace: "pre-wrap" }}>{descriptionModal.content}</p>
      </Modal>

      <RatingModal
        visible={ratingModal.visible}
        onCancel={() => setRatingModal({ ...ratingModal, visible: false })}
        onSuccess={() => setRatingModal({ ...ratingModal, visible: false })}
        rateeId={ratingModal.rateeId}
        submissionId={ratingModal.submissionId}
        rateeName={ratingModal.rateeName}
      />

      <Modal
        title={`Báo cáo ứng viên ${
          reportModal.subjectName ? `- ${reportModal.subjectName}` : ""
        }`}
        open={reportModal.visible}
        onCancel={() =>
          setReportModal((prev) => ({
            ...prev,
            visible: false,
            submitting: false,
          }))
        }
        onOk={handleSubmitReport}
        okText="Gửi báo cáo"
        cancelText="Hủy"
        confirmLoading={reportModal.submitting}
      >
        <p className="text-sm text-gray-600 mb-3">
          Hãy mô tả ngắn gọn lý do bạn muốn báo cáo bài đăng tìm việc này. Thông
          tin sẽ được gửi tới quản trị viên để xử lý.
        </p>
        <TextArea
          rows={4}
          value={reportModal.reason}
          onChange={(e) =>
            setReportModal((prev) => ({ ...prev, reason: e.target.value }))
          }
          placeholder="Ví dụ: Bài đăng có nội dung không phù hợp..."
        />
      </Modal>
    </div>
  );
};

export default CandidateListPage;
