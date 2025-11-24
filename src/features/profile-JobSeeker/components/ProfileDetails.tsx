import React from "react";
import {
  Typography,
  Avatar,
  Spin,
  Alert,
  Button,
  Upload,
  message,
  Card,
} from "antd";
import {
  UserOutlined,
  UploadOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import ProfileField from "./ProfileField";
import LocationEditField from "./LocationEditField";
import { useAuth } from "../../auth/hooks";
import { useDispatch } from "react-redux";
import { updateJobSeekerProfile } from "../slice/profileSlice";
import type { AppDispatch } from "../../../app/store";
import type { JobSeekerProfileDto, JobSeekerProfileUpdateDto } from "../types";

const { Title, Paragraph } = Typography;

interface ProfileDetailsProps {
  profile: JobSeekerProfileDto | null;
  loading: boolean;
  error: string | null;
}

const ProfileDetails: React.FC<ProfileDetailsProps> = ({
  profile,
  loading,
  error,
}) => {
  const { user } = useAuth();
  const dispatch: AppDispatch = useDispatch();

  const handleSaveField = async (
    field: keyof JobSeekerProfileUpdateDto,
    value: any
  ) => {
    if (!profile) return;

    const profileData: JobSeekerProfileUpdateDto = {
      fullName: profile.fullName,
      gender: profile.gender,
      birthYear: profile.birthYear,
      contactPhone: profile.contactPhone,
      fullLocation: profile.location,
      [field]: value,
    };

    try {
      await dispatch(updateJobSeekerProfile(profileData)).unwrap();
      message.success("Cập nhật hồ sơ thành công!");
    } catch (err) {
      message.error("Cập nhật hồ sơ thất bại!");
    }
  };

  const handleImageUpload = async (file: File) => {
    if (!profile) return false;

    const profileData: JobSeekerProfileUpdateDto = {
      fullName: profile.fullName,
      gender: profile.gender,
      birthYear: profile.birthYear,
      contactPhone: profile.contactPhone,
      fullLocation: profile.location,
      imageFile: file,
    };

    try {
      await dispatch(updateJobSeekerProfile(profileData)).unwrap();
      message.success("Cập nhật ảnh thành công!");
    } catch (err) {
      message.error("Cập nhật ảnh thất bại!");
    }
    return false;
  };

  const handleSaveLocation = async (data: {
    provinceId: number;
    districtId: number;
    wardId: number;
    location: string;
  }) => {
    if (!profile) return;

    const profileData: JobSeekerProfileUpdateDto = {
      fullName: profile.fullName,
      gender: profile.gender,
      birthYear: profile.birthYear,
      contactPhone: profile.contactPhone,
      provinceId: data.provinceId,
      districtId: data.districtId,
      wardId: data.wardId,
      fullLocation: data.location,
    };

    try {
      await dispatch(updateJobSeekerProfile(profileData)).unwrap();
      message.success("Cập nhật địa chỉ thành công!");
    } catch (err) {
      message.error("Cập nhật địa chỉ thất bại!");
    }
  };

  if (error) {
    return <Alert message="Lỗi" description={error} type="error" showIcon />;
  }

  if (!profile) {
    return (
      <Card className="shadow-md">
        <Alert message="Không tìm thấy hồ sơ" type="warning" showIcon />
      </Card>
    );
  }

  return (
    <Spin spinning={loading} tip="Đang cập nhật..." className="w-full">
      <div className="space-y-6">
        <Card className="shadow-md">
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <Avatar
              size={84}
              src={profile.profilePicture}
              icon={<UserOutlined />}
            />
            <div className="flex-1 w-full">
              <Title level={4} className="mb-1">
                Tài khoản
              </Title>
              <Paragraph type="secondary" className="mb-1">
                Hãy cập nhật thông tin mới nhất. Thông tin dưới đây sẽ được điền
                khi bạn tạo hồ sơ.
              </Paragraph>
              <Paragraph type="secondary" style={{ fontSize: "12px" }}>
                (JPEG/PNG/GIF, dưới 1MB)
              </Paragraph>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <Upload beforeUpload={handleImageUpload} showUploadList={false}>
                <Button icon={<UploadOutlined />}>Đổi ảnh</Button>
              </Upload>
              <Button icon={<DeleteOutlined />} danger>
                Xóa tài khoản
              </Button>
            </div>
          </div>
        </Card>

        <div className="grid gap-6">
          <Card title="Thông tin cá nhân" className="shadow-md">
            <ProfileField
              label="Họ và tên"
              value={profile.fullName}
              onSave={(value) => handleSaveField("fullName", value)}
            />
            <ProfileField label="Email" value={user?.username + "@gmail.com"} />
            <ProfileField
              label="Giới tính"
              value={profile.gender}
              onSave={(value) => handleSaveField("gender", value)}
            />
            <ProfileField
              label="Năm sinh"
              value={profile.birthYear}
              onSave={(value) => handleSaveField("birthYear", Number(value))}
            />
            <ProfileField
              label="Số điện thoại"
              value={profile.contactPhone}
              onSave={(value) => handleSaveField("contactPhone", value)}
            />
            <LocationEditField
              label="Địa chỉ"
              provinceId={profile.provinceId}
              districtId={profile.districtId}
              wardId={profile.wardId}
              fullLocation={profile.location}
              onSave={handleSaveLocation}
            />
          </Card>
        </div>
      </div>
    </Spin>
  );
};

export default ProfileDetails;
