import React, { useEffect, useState } from "react";
import { Card, List, Spin, message } from "antd";
import { CalendarOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useAppSelector } from "../../../app/hooks";
import followService, { type EmployerFollowDto } from "../followService";
import defaultLogo from "../../../assets/no-logo.png";

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
        const mappedItems: EmployerFollowDto[] = (data || []).map((item: any) => ({
          employerId: item.employerId ?? item.EmployerID ?? item.employerID ?? item.id,
          employerName: item.employerName ?? item.EmployerName ?? "Nhà tuyển dụng",
          followDate: item.followDate ?? item.FollowDate ?? item.followedAt ?? item.followedDate,
          logoUrl:
            item.logoUrl ??
            item.logo ??
            item.employerLogoUrl ??
            item.avatarUrl ??
            item.logoUrlSmall ??
            item.logo_path,
        }));
        setItems(mappedItems);
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
    <div className="space-y-3">
      <Card className="border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold text-slate-900">Danh sách theo dõi</h1>
          <p className="text-sm text-slate-600">
            Danh sách các nhà tuyển dụng bạn đang theo dõi để nhận thông tin tuyển dụng mới.
          </p>
          <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-3 py-1 text-sm font-semibold text-slate-700">
            Tổng: <span className="text-slate-900 font-bold">{items.length}</span>
          </span>
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
                      <img
                        src={item.logoUrl || defaultLogo}
                        alt={item.employerName}
                        className="h-12 w-12 rounded-full object-cover border border-slate-100 shadow-sm"
                        onError={(e) => {
                          e.currentTarget.src = defaultLogo;
                        }}
                      />
                    }
                    title={
                      <span className="font-semibold text-gray-900">{item.employerName}</span>
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
                  <span className="rounded-full border border-slate-200 px-3 py-1 text-sm text-slate-600">
                    Nhân sự
                  </span>
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
