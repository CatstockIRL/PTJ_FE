import React, { useEffect, useState } from "react";
import { Card, Tabs, Avatar, Rate, Tag, Skeleton, List } from "antd";
import { UserOutlined } from "@ant-design/icons";
import ProfileDetails from "../components/ProfileDetails";
import ProfileOverview from "../components/ProfileOverview";
import { useJobSeekerProfile } from "../hooks/useJobSeekerProfile";
import { useAuth } from "../../auth/hooks";
import ratingService from "../../../services/ratingService";
import type { Rating } from "../../../types/profile";

const JobSeekerProfilePage: React.FC = () => {
  const { profile, loading, error } = useJobSeekerProfile();
  const { user } = useAuth();

  const email = user?.username ? `${user.username}@gmail.com` : undefined;
  const displayName = profile?.fullName || user?.username || "Ứng viên";
  const avatarSrc = profile?.profilePicture || undefined;
  const locationText = profile?.location || "Chưa cập nhật địa chỉ";
  const [averageRating, setAverageRating] = useState(0);
  const [ratingCount, setRatingCount] = useState(0);
  const [ratings, setRatings] = useState<Rating[]>([]);

  useEffect(() => {
    const userId = profile?.userId || (user as any)?.id;
    if (!userId) return;
    const fetchRatings = async () => {
      try {
        const [avg, list] = await Promise.all([
          ratingService.getAverageRatingForUser(userId),
          ratingService.getRatingsForUser(userId),
        ]);
        setAverageRating(Number(avg) || 0);
        setRatingCount(list.length);
        setRatings(list || []);
      } catch {
        setAverageRating(0);
        setRatingCount(0);
        setRatings([]);
      }
    };
    void fetchRatings();
  }, [profile?.userId, user]);

  const tabItems = [
    {
      key: "overview",
      label: "Tổng quan",
      children: <ProfileOverview profile={profile} loading={loading} email={email} />,
    },
    {
      key: "edit",
      label: "Chỉnh sửa hồ sơ",
      children: <ProfileDetails profile={profile} loading={loading} error={error} />,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 pb-12 text-slate-800">
      <div className="container mx-auto py-8 px-4 space-y-6">
        <Card className="rounded-2xl shadow-lg border border-blue-50" bodyStyle={{ padding: 20 }}>
          <div className="flex flex-col items-center gap-3 text-center sm:flex-row sm:items-center sm:text-left">
            {loading ? (
              <Skeleton.Avatar active size={96} />
            ) : (
              <Avatar src={avatarSrc} size={96} icon={<UserOutlined />} className="shadow-md" />
            )}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-bold text-slate-900 truncate">{displayName}</h1>
                <Tag color="blue" className="rounded-full px-3 py-1">
                  Ứng viên
                </Tag>
              </div>
              <div className="mt-1 text-sm text-slate-600 truncate">{locationText}</div>
              <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-600">
                <div className="flex items-center gap-1">
                  <Rate disabled allowHalf value={averageRating} className="text-xs" />
                  <span className="text-slate-500">
                    {averageRating.toFixed(1)} ({ratingCount})
                  </span>
                </div>
                <Tag color="green" className="rounded-full px-3 py-1">
                  Tài khoản đã xác thực
                </Tag>
              </div>
            </div>
          </div>
        </Card>

        <Card className="rounded-2xl shadow-lg" bodyStyle={{ padding: 20 }}>
          <Tabs defaultActiveKey="overview" items={tabItems} />
        </Card>

        <Card className="rounded-2xl shadow-lg" title="Đánh giá">
          {ratings.length === 0 ? (
            <div className="text-center text-slate-500 py-6">Chưa có đánh giá</div>
          ) : (
            <List
              dataSource={ratings}
              renderItem={(item) => (
                <List.Item className="flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <div className="font-semibold text-slate-800">{item.raterName || "Người dùng"}</div>
                    <Rate disabled allowHalf value={item.ratingValue} className="text-sm" />
                  </div>
                  <div className="text-sm text-slate-600">{item.comment || "Không có nhận xét"}</div>
                  <div className="text-xs text-slate-400">
                    {new Date(item.createdAt).toLocaleString("vi-VN")}
                  </div>
                </List.Item>
              )}
            />
          )}
        </Card>
      </div>
    </div>
  );
};

export default JobSeekerProfilePage;
