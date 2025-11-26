import React, { useEffect, useState } from "react";
import { Card, List, Tag, Spin, message } from "antd";
import { UserOutlined, CalendarOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useAppSelector } from "../../../app/hooks";
import followService, { type EmployerFollowDto } from "../followService";

const FollowedEmployersPage: React.FC = () => {
  const navigate = useNavigate();
  const userId = useAppSelector((state) => state.auth.user?.id);
  const [items, setItems] = useState<EmployerFollowDto[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!userId) return;
      setLoading(true);
      try {
        const data = await followService.getFollowedEmployers(userId);
        setItems(
          (data || []).map((item: any) => ({
            employerId:
              item.employerId ?? item.EmployerID ?? item.employerID ?? item.id,
            employerName:
              item.employerName ?? item.EmployerName ?? "Nhà tuyển dụng",
            followDate:
              item.followDate ??
              item.FollowDate ??
              item.followedAt ??
              item.followedDate,
          }))
        );
      } catch (err: any) {
        message.error("Không thể tải danh sách theo dõi.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [userId]);

  if (!userId) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-200">
        Vui lòng đăng nhập để xem danh sách nhà tuyển dụng theo dõi.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="bg-gradient-to-r from-sky-600 to-blue-700 text-white shadow-lg border-none rounded-2xl">
        <div className="space-y-1">
            <p className="text-sm uppercase tracking-[0.35em] text-white/80">
            Nhà tuyển dụng
          </p>
          <h1 className="text-2xl font-bold leading-tight">
            Danh sách theo dõi
          </h1>
          <p className="text-white/85">
            Xem nhanh các nhà tuyển dụng bạn đang theo dõi để cập nhật cơ hội mới.
          </p>
          <div className="flex gap-2 flex-wrap">
            <span className="px-3 py-1 rounded-md bg-white/15 border border-white/20 text-sm font-semibold">
              Tổng: <strong>{items.length}</strong>
            </span>
          </div>
        </div>
      </Card>

      <Card className="shadow-sm border border-gray-200">
        <Spin spinning={loading}>
          {items.length === 0 && !loading ? (
            <div className="text-center text-gray-500 py-10">
              Bạn chưa theo dõi nhà tuyển dụng nào.
            </div>
          ) : (
            <List
              itemLayout="horizontal"
              dataSource={items}
              renderItem={(item) => (
                <List.Item
                  className="hover:bg-gray-50 transition cursor-pointer"
                  onClick={() =>
                    item.employerId &&
                    navigate(`/nha-tuyen-dung/chi-tiet/${item.employerId}`)
                  }
                >
                  <List.Item.Meta
                    avatar={
                      <div className="h-12 w-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center text-lg font-semibold">
                        {(item.employerName || "NTD").charAt(0).toUpperCase()}
                      </div>
                    }
                    title={
                      <span className="font-semibold text-gray-900">
                        {item.employerName}
                      </span>
                    }
                    description={
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <CalendarOutlined />
                        <span>
                          Theo dõi từ:{" "}
                          {item.followDate
                            ? new Date(item.followDate).toLocaleDateString("vi-VN")
                            : "N/A"}
                        </span>
                      </div>
                    }
                  />
                  <div>
                    <Tag icon={<UserOutlined />} color="blue">
                      Nhà tuyển dụng
                    </Tag>
                  </div>
                </List.Item>
              )}
            />
          )}
        </Spin>
      </Card>
    </div>
  );
};

export default FollowedEmployersPage;
