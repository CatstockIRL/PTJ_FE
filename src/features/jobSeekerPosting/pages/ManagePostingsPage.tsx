import React, { useEffect, useMemo } from "react";
import {
  Button,
  Spin,
  Alert,
  Popconfirm,
  message,
  Empty,
  Tag,
} from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useAuth } from "../../auth/hooks";
import type { AppDispatch, RootState } from "../../../app/store";
import { fetchPostsByUserId } from "../slice/managePostSlice";
import { deletePosting, resetPostStatus } from "../slice/slice";
import { format } from "date-fns";

const ManagePostingsPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useAuth();
  const { posts, loading, error } = useSelector(
    (state: RootState) => state.jobSeekerPosting.manage
  );
  const {
    loading: isDeleting,
    success: deleteSuccess,
    error: deleteError,
  } = useSelector(
    (state: RootState) => state.jobSeekerPosting.create.delete
  );

  useEffect(() => {
    if (user) {
      dispatch(fetchPostsByUserId(user.id));
    }
  }, [dispatch, user]);

  useEffect(() => {
    if (deleteSuccess) {
      message.success("X├│a b├ái ─æ─âng th├ánh c├┤ng");
      dispatch(resetPostStatus());
      if (user) {
        dispatch(fetchPostsByUserId(user.id));
      }
    }
    if (deleteError) {
      message.error(`X├│a thß║Ñt bß║íi: ${deleteError}`);
      dispatch(resetPostStatus());
    }
  }, [deleteSuccess, deleteError, dispatch, user]);

  const stats = useMemo(() => {
    const total = posts.length;
    const active = posts.filter((p) => p.status === "Active").length;
    const expired = posts.filter((p) => p.status !== "Active").length;
    return { total, active, expired };
  }, [posts]);

  const statusTag = (status: string) => {
    const isActive = status === "Active";
    return (
      <Tag color={isActive ? "green" : "red"} className="px-3 py-1 text-xs">
        {isActive ? "─Éang hoß║ít ─æß╗Öng" : "Hß║┐t hß║ín"}
      </Tag>
    );
  };

  return (
    <div className="bg-slate-50 min-h-screen">
      <div className="relative overflow-hidden bg-gradient-to-r from-sky-600 via-emerald-600 to-emerald-500 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.08),transparent_35%),radial-gradient(circle_at_80%_10%,rgba(255,255,255,0.08),transparent_30%)]" />
        <div className="relative max-w-6xl mx-auto px-6 py-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-widest text-emerald-100">
              Quß║ún l├╜ b├ái ─æ─âng
            </p>
            <h1 className="text-3xl md:text-4xl font-bold leading-tight">
              Hß╗ô s╞í t├¼m viß╗çc cß╗ºa bß║ín
            </h1>
            <p className="text-emerald-50 mt-2 max-w-2xl">
              Cß║¡p nhß║¡t, sß╗¡a v├á quß║ún l├╜ c├íc b├ái ─æ─âng t├¼m viß╗çc cß╗ºa bß║ín trong mß╗Öt
              giao diß╗çn gß╗ìn g├áng.
            </p>
            <div className="flex flex-wrap gap-3 mt-4 text-sm">
              <span className="px-3 py-2 rounded-xl bg-white/10 border border-white/20">
                Tß╗òng b├ái ─æ─âng: <strong>{stats.total}</strong>
              </span>
              <span className="px-3 py-2 rounded-xl bg-white/10 border border-white/20">
                ─Éang hoß║ít ─æß╗Öng: <strong>{stats.active}</strong>
              </span>
              <span className="px-3 py-2 rounded-xl bg-white/10 border border-white/20">
                Hß║┐t hß║ín: <strong>{stats.expired}</strong>
              </span>
            </div>
          </div>
          <Link to="/tao-bai-dang-tim-viec">
            <Button
              type="primary"
              icon={<PlusOutlined />}
              size="large"
              className="bg-white text-emerald-600 hover:bg-emerald-50 border-none shadow-lg"
            >
              Tß║ío b├ái ─æ─âng mß╗¢i
            </Button>
          </Link>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6">
          {loading || isDeleting ? (
            <div className="py-12 flex justify-center">
              <Spin size="large" />
            </div>
          ) : error ? (
            <Alert message="Lß╗ùi" description={error} type="error" showIcon />
          ) : posts.length === 0 ? (
            <div className="py-12 flex flex-col items-center gap-4">
              <Empty description="Ch╞░a c├│ b├ái ─æ─âng n├áo" />
              <Link to="/tao-bai-dang-tim-viec">
                <Button type="primary" icon={<PlusOutlined />}>
                  Tß║ío b├ái ─æ─âng ─æß║ºu ti├¬n
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {posts.map((item) => (
                <div
                  key={item.jobSeekerPostId}
                  className="flex flex-col sm:flex-row sm:items-start gap-4 p-4 rounded-xl border border-slate-100 hover:border-emerald-200 hover:shadow-md transition"
                >
                  <div className="flex-1 space-y-2">
                    <Link
                      to={`/xem-bai-dang-tim-viec/${item.jobSeekerPostId}`}
                      className="text-lg font-semibold text-slate-900 hover:text-emerald-600"
                    >
                      {item.title}
                    </Link>
                    <p className="text-sm text-slate-500">
                      Ng├áy tß║ío:{" "}
                      {format(new Date(item.createdAt), "dd/MM/yyyy HH:mm")}
                    </p>
                    <div className="flex items-center gap-2">
                      {statusTag(item.status)}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link to={`/xem-bai-dang-tim-viec/${item.jobSeekerPostId}`}>
                      <Button type="default">Chi tiết</Button>
                    </Link>
                    <Link to={`/sua-bai-dang-tim-viec/${item.jobSeekerPostId}`}>
                      <Button icon={<EditOutlined />} type="default">
                        Sß╗¡a
                      </Button>
                    </Link>
                    <Popconfirm
                      title="X├│a b├ái ─æ─âng?"
                      description="Bß║ín chß║»c chß║»n muß╗æn x├│a b├ái ─æ─âng n├áy?"
                      onConfirm={() =>
                        dispatch(deletePosting(item.jobSeekerPostId))
                      }
                      okText="X├│a"
                      cancelText="Hß╗ºy"
                    >
                      <Button icon={<DeleteOutlined />} danger>
                        X├│a
                      </Button>
                    </Popconfirm>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManagePostingsPage;
