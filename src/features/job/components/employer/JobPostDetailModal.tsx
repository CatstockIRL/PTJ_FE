import React from "react";
import { Modal, Button } from "antd";
import { JobDetailView } from "./JobDetailView";
import type { JobPostView } from "../../jobTypes";

interface Props {
  jobPost: JobPostView | null;
  visible: boolean;
  onClose: () => void;
}

const JobPostDetailModal: React.FC<Props> = ({ jobPost, visible, onClose }) => {
  return (
    <Modal
      title={jobPost?.title || "Chi tiết công việc"}
      open={visible}
      onCancel={onClose}
      footer={[
        <Button key="close" onClick={onClose}>
          Đóng
        </Button>,
      ]}
      width={900}
    >
      {jobPost && <JobDetailView job={jobPost} />}
    </Modal>
  );
};

export { JobPostDetailModal };
